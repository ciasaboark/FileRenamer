import MsgReader from "@kenjiuno/msgreader";
import { randomUUID } from "crypto";
import { BrowserWindow, ipcMain } from "electron";
import { FileRenamerService } from "../file/file-renamer-service";
import { FileRenameRequest } from "../file/rename-request";
const mkdirp = require('mkdirp');
const { v1 } = require('uuid')
import path = require('path');
import fs = require('fs');
import os = require('os')
import moment = require('moment');

const fileRenamer = new FileRenamerService();

function showError(options: { msg: string }) {
    const { dialog } = require('electron');
    dialog.showMessageBoxSync(null, {
        title: 'Error',
        type: 'error',
        message: `Unable to rename file: ${options.msg}`
    });
}

export function init() {
    //start up the file renamer service
    fileRenamer.startProcessing();

    fileRenamer.on('change', () => {
        (global.mainWindow as BrowserWindow)?.webContents?.send('requests-changed');
    });

    fileRenamer.on('error', (options: { msg: string }) => {
        this._showError(options);
    })

    ipcMain.handle('api-file--process-file', (event, filename: string) => {
        processFileRequest(filename);
    });

    ipcMain.handle('api-file--current-status', (event) => {
        let requests: FileRenameRequest[] = fileRenamer.getStatus();
        return requests;
    });

    ipcMain.handle('api-file--clear-completed', (event) => {
        fileRenamer.clearCompleted();
    });
}

function processFileRequest(filename: string) {
    //test that the path exists
    let fileExists = fs.existsSync(filename);
    let stat = fs.lstatSync(filename);
    if (!fileExists) {
        showError({ msg: `File ${filename} does not exist.` })
    } else if (!stat.isFile()) {
        showError({ msg: `Path ${filename} is not a file` });
    } else {
        processFile(filename);
    }
}

function processFile(filename: string) {
    //special handling for Outlook .msg files
    let p = path.parse(filename);
    if (p.ext === '.msg') {
        processEmailAttachments(filename);
    } else {
        processRegularFile(filename);
    }
}

function processEmailAttachments(filename: string) {
    let fileBuffer = fs.readFileSync(filename);
    const msgReader = new MsgReader(fileBuffer);
    const fileData = msgReader.getFileData();
    const tempFolderBase = os.tmpdir();

    for (const att of fileData.attachments) {
        let uid = v1();
        let tempPath = path.join(tempFolderBase, 'file-renamer', uid);
        mkdirp.sync(tempPath);
        let tempFilePath = path.join(tempPath, att.fileName);
        console.log(`Saving attachment '${att.fileName}' to temp location '${tempFilePath}'`);
        let aData = msgReader.getAttachment(att);
        fs.writeFileSync(tempFilePath, aData.content);

        let p = path.parse(tempFilePath);
        let request: FileRenameRequest = {
            id: randomUUID(),
            status: 'pending',
            requestTime: new Date(),
            originalPath: p.dir,
            originalFilename: p.base,
        }

        //try to update the timestamps on the file to match the date on the email
        if (fileData.creationTime) {
            let d = moment(fileData.messageDeliveryTime).toDate();
            request.originalFileLastChange = d;
        }

        fileRenamer.addRequest(request);
    }
}

function processRegularFile(filename: string) {
    //otherwise create a new rename request
    let p = path.parse(filename);

    let request: FileRenameRequest = {
        id: randomUUID(),
        status: 'pending',
        requestTime: new Date(),
        originalPath: p.dir,
        originalFilename: p.base
    }

    fileRenamer.addRequest(request);
}

