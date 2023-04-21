import { randomUUID } from "crypto";
import { BrowserWindow, ipcMain } from "electron";
import { FileRenamerService } from "../file/file-renamer-service";
import { FileRenameRequest } from "../file/rename-request";
import path = require('path');
import fs = require('fs');

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
        //test that the path exists
        let fileExists = fs.existsSync(filename);
        let stat = fs.lstatSync(filename);
        if (!fileExists) {
            showError({ msg: `File ${filename} does not exist.` })
        } else if (!stat.isFile()) {
            showError({ msg: `Path ${filename} is not a file` });
        } else {
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
    });

    ipcMain.handle('api-file--current-status', (event) => {
        let requests: FileRenameRequest[] = fileRenamer.getStatus();
        return requests;
    });

    ipcMain.handle('api-file--clear-completed', (event) => {
        fileRenamer.clearCompleted();
    });
}