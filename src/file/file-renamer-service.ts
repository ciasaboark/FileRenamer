import { FileRenameRequest } from "./rename-request"
import log = require('electron-log')
import settings = require('electron-settings');
import { FileRule } from "./file-rule";
import path = require('path');
import fs = require('fs');
import moment = require('moment');


export class FileRenamerService {
    private activeRequests: FileRenameRequest[] = [];
    private completedRequests: FileRenameRequest[] = [];

    private isActive = false;
    private isRunning = false;

    public addRequest(request: FileRenameRequest) {
        this.activeRequests.push(request);
    }

    public getStatus(): FileRenameRequest[] {
        let requests = [...this.activeRequests, ...this.completedRequests];
        return requests;
    }

    public startProcessing() {
        this.isActive = true;
        //start the main loop
        this._mainLoop();
    }

    private async _mainLoop() {
        //don't allow the main loop to run twice
        if (this.isRunning) return;

        this.isRunning = true;
        try {
            while(true) {
                if (!this.isActive) {
                    log.info('File processing stopping by request');
                    this.isRunning = false;
                    return;
                }

                //pull the next file request to process, then sleep for a bit
                if (this.activeRequests.length > 0) {
                    let nextRequest = this.activeRequests[0];
                    await this._processRequest(nextRequest);
                }
                await this._delay(200);
            }
        } catch (err) {
            log.error(`Uncaught error in file processing loop: ${err}`);
            this.isRunning = false;
            this.isActive = false;
        }
    }

    private async _delay(ms: number): Promise<any> {
        return new Promise(async (resolve) => {
            setTimeout(() => {
                resolve(null);
            }, ms);
        });
    }

    private async _processRequest(request: FileRenameRequest): Promise<any> {
        request.status = 'active';

        let rules: FileRule[] = settings.getSync('file-rules') as unknown as FileRule[];
        if (!Array.isArray(rules)) {
            rules = [];
        }

        let matchingRule = this.getRuleMatch(request, rules);
        //TODO have a fallback rule for files that don't match anything?
        try {
            if (matchingRule == null) {
                throw 'Unable to process file.  No matching rules found';
            } else {
                this._processRule(request, matchingRule);
                request.status = 'complete'
            }
        } catch (err) {
            log.error(`Error processing file rule: ${err}`);
            request.status = 'failed';
            request.error = `${err}`;
        } finally {
            //record the completed timestamp
            request.completeTime = new Date();

            //move the request to the completed list
            this.activeRequests = this.activeRequests.filter(r => {return r.id != request.id});
            this.completedRequests.push(request);
        }
    }

    /** Move/copy the file */
    private async _processRule(request: FileRenameRequest, rule: FileRule) {
        let originalPath = path.join(request.originalPath, request.originalFilename);
        let newFileName = await this._getRuleFilename(originalPath, request, rule);
        request.newPath = rule.destinationPath;
        request.newFilename = newFileName;
        let newPath = path.join(request.newPath, request.newFilename);

        fs.copyFileSync(originalPath, newPath);
        //delete the original file if a move was requested
        if (rule.renameType == 'move') {
            fs.rmSync(originalPath);
        }
    }

    /** Generate a new filename for the request based off the given rule */
    private async _getRuleFilename(originalPath: string, request: FileRenameRequest, rule: FileRule): Promise<string> {
        let stats: fs.Stats = await fs.promises.stat(originalPath)
        let createTimeMs = stats.birthtimeMs;
        if (createTimeMs == null || createTimeMs == 0) createTimeMs = stats.ctimeMs;
        if (createTimeMs == null || createTimeMs == 0) createTimeMs = stats.mtimeMs;
        if (createTimeMs == null || createTimeMs == 0) createTimeMs = stats.atimeMs;
        
        if (createTimeMs == null || createTimeMs == 0) throw "Unable to parse create time for file";

        let createTime = new Date(createTimeMs);

        let newFileName = `${request.originalFilename}`;
        newFileName = newFileName.replaceAll('{filename}', path.parse(request.originalFilename).name);
        newFileName = newFileName.replaceAll('{ext}', path.parse(request.originalFilename).ext);
        newFileName = newFileName.replaceAll('{create_date}', moment(createTime).format('YYYYMMDD'));
        newFileName = newFileName.replaceAll('{create_date}', moment(createTime).format('HHmmss'));
        
        return newFileName;
    }

    /**
     * Test each rule in order.  Stop at the first match
     * @param request 
     * @param rules 
     */
    private getRuleMatch(request: FileRenameRequest, rules: FileRule[]): FileRule {
        let matchingRule: FileRule = null;

        for (var i = 0; i < rules?.length; i++) {
            let r = rules[i];
        
            let filename: string;
            if (r.includePath) {
                filename =  path.join(request.originalPath, request.originalFilename);
            } else {
                filename = request.originalFilename;
            }

            if (r.matchType == 'contains') {
                //do a simple contains() check on the filename
                if (filename.includes(r.matchStr)) {
                    //found match
                    matchingRule = r;
                    break;
                }
            } else if (r.matchType == 'regex') {
                //test that the given regex matches the filename
                var flags = r.matchStr.replace(/.*\/([gimy]*)$/, '$1');
                var pattern = r.matchStr.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
                var regex = new RegExp(pattern, flags);
                let isMatch = regex.test(filename);
                if (isMatch) {
                    matchingRule = r;
                    break;
                }
            } else {
                log.info(`Unknown rule type '${r.matchType}'. Rule '${r.description}' will be ignored`);
            }
        }

        return matchingRule;
    }


    public stopProcessing() {
        this.isActive = false;
    }

}