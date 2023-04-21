import { BrowserWindow, dialog } from "electron";
import { EventEmitter } from "stream";
import { FileRule } from "./file-rule";
import { FileRenameRequest } from "./rename-request";
import log = require('electron-log')
import settings = require('electron-settings');
import path = require('path');
import fs = require('fs');
import moment = require('moment');
let mainWindow: BrowserWindow = global.mainWindow;


export class FileRenamerService extends EventEmitter {
    private pendingRequests: FileRenameRequest[] = [];
    private activeRequest: FileRenameRequest;
    private completedRequests: FileRenameRequest[] = [];

    private isActive = false;
    private isRunning = false;

    public addRequest(request: FileRenameRequest) {
        this.pendingRequests.push(request);
        this._notifyChange();
    }

    public getStatus(): FileRenameRequest[] {
        let requests = [...this.pendingRequests, ...this.completedRequests];
        if (this.activeRequest != null) {
            requests.unshift(this.activeRequest);
        }

        requests.sort((a, b) => {
            return a.requestTime.getTime() - b.requestTime.getTime();
        });

        return requests;
    }

    public startProcessing() {
        this.isActive = true;
        //start the main loop
        this._mainLoop();
    }

    public clearCompleted(): void {
        this.completedRequests = [];
        this._notifyChange();
    }

    private async _mainLoop() {
        //don't allow the main loop to run twice
        if (this.isRunning) return;

        this.isRunning = true;
        try {
            while (true) {
                if (!this.isActive) {
                    log.info('File processing stopping by request');
                    this.isRunning = false;
                    return;
                }

                //pull the next file request to process, then sleep for a bit
                if (this.activeRequest == null && this.pendingRequests.length > 0) {
                    let request = this.pendingRequests.splice(0, 1)[0];
                    await this._processRequest(request);
                }
                await this._delay(200);
            }
        } catch (err) {
            log.error(`Uncaught error in file processing loop: ${err}`);
            this.isRunning = false;
            this.isActive = false;
            this._notifyChange();
            this._promptToRestart(err);
        }
    }

    private async _delay(ms: number): Promise<any> {
        return new Promise(async (resolve) => {
            setTimeout(() => {
                resolve(null);
            }, ms);
        });
    }

    private async _showFileError(p: string, f: string, err) {
        log.info('showing prompt to restart file rename service')
        dialog.showMessageBoxSync(null, {
            title: 'Error',
            type: 'error',
            message: `File '${f}' could not be renamed.\n\nError: '${err}'.\n\nThis file will be skipped.`,

        })

    }

    private async _promptToRestart(err) {
        const { dialog } = require('electron');
        log.info('showing prompt to restart file rename service')

        let result = dialog.showMessageBoxSync(null, {
            title: 'Service Error',
            message: `File rename service has stopped with the error '${err}'.\n\nRestart the service?`,
            buttons: ['Restart', 'Cancel']
        })

        if (result == 0) {
            log.info('User request service restart')
            this.startProcessing();
        } else {
            log.info('User did not request service restart')
        }
    }

    private async _processRequest(request: FileRenameRequest): Promise<any> {
        this.activeRequest = request;
        this.activeRequest.status = 'active';
        this._notifyChange();

        setTimeout(() => {
            let rules: FileRule[] = settings.getSync('file-rules') as unknown as FileRule[];
            if (!Array.isArray(rules)) {
                rules = [];
            }

            let matchingRule = this.getRuleMatch(this.activeRequest, rules);
            //TODO have a fallback rule for files that don't match anything?
            try {
                if (matchingRule == null) {
                    throw 'Unable to process file.  No matching rules found';
                } else {
                    this._processRule(this.activeRequest, matchingRule);

                    this.activeRequest.status = 'complete'
                }
            } catch (err) {
                log.error(`Error processing file rule: ${err}`);
                this.activeRequest.status = 'failed';
                this.activeRequest.error = `${err}`;
            } finally {
                //record the completed timestamp
                this.activeRequest.completeTime = new Date();

                //move the request to the completed list
                this.completedRequests.push(this.activeRequest);
                this.activeRequest = null;

                this._notifyChange();
            }
        }, 200);


    }

    /** Move/copy the file */
    private async _processRule(request: FileRenameRequest, rule: FileRule) {
        let originalPath = path.join(request.originalPath, request.originalFilename);
        let newFileName = await this._getRuleFilename(originalPath, request, rule);
        request.newPath = rule.destinationPath;
        request.newFilename = newFileName;
        let newPath = path.join(request.newPath, request.newFilename);

        //does a file already exist with the same name?
        let silentOverwrite = Boolean(settings.getSync('options.overwrite'));
        let allowWrite = false;
        if (silentOverwrite) {
            allowWrite = true;
        } else if (!fs.existsSync(newPath)) {
            allowWrite = true;
        } else {
            //file already exists and we need user permission to overwrite
            let result = dialog.showMessageBoxSync(null, {
                title: 'Overwrite existing file?',
                message: `File '${newPath}' already exists. Overwrite with contents of '${originalPath}'?`,
                buttons: ['Overwrite', 'Cancel']
            });
            if (result == 0) {
                allowWrite = true;
            }
        }

        if (allowWrite) {
            fs.copyFileSync(originalPath, newPath);
            //delete the original file if a move was requested
            if (rule.renameType == 'move') {
                fs.rmSync(originalPath);
            }
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
                filename = path.join(request.originalPath, request.originalFilename);
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
                var pattern = r.matchStr.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
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

    private _notifyDebounceTimeout;
    private _notifyChange() {
        clearTimeout(this._notifyDebounceTimeout);
        setTimeout(() => {
            this.emit('change');
        }, 100);
    }
}