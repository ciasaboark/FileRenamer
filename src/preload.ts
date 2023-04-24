import { contextBridge, ipcRenderer, shell } from "electron";
import { FileRenameRequest } from "./file/rename-request";
import { SettingsArbitrator } from "./settings/settings-arbitrator";
import log = require('electron-log');
const sa = SettingsArbitrator.getInstance();
import fs = require('fs');
const path = require('path');


console.log('Preload!')

contextBridge.exposeInMainWorld('log', {
    info: (msg: string) => log.info(msg),
    debug: (msg: string) => log.debug(msg),
    warn: (msg: string) => log.warn(msg),
    error: (msg: string) => log.error(msg)
});

contextBridge.exposeInMainWorld('files', {
    addFileRequest(filename: string) {
        ipcRenderer.invoke('api-file--process-file', filename);
    },
    getRequests(): Promise<FileRenameRequest[]> {
        let requests = ipcRenderer.invoke('api-file--current-status');
        return requests;
    },
    clearCompleted(): void {
        ipcRenderer.invoke('api-file--clear-completed');
    }
});

contextBridge.exposeInMainWorld('settings', {
    get(key: string, defVal: any): any {
        return sa.getSync(key, defVal);
    },
    set(key: string, value: any): void {
        return sa.setSync(key, value);
    },
    has(key: string): boolean {
        return sa.has(key);
    },
    delete(key: string): void {
        return sa.delete(key);
    },
    async getAsync(key: string, devVal: any): Promise<any> {
        return await sa.getAsync(key, devVal);
    },
    async setAsync(key: string, value: any): Promise<void> {
        return await sa.setAsync(key, value);
    },
    async hasAsync(key: string): Promise<boolean> {
        return await sa.hasAsync(key);
    },
    async deleteAsync(key: string): Promise<void> {
        return await sa.deleteAsync(key);
    }
});

contextBridge.exposeInMainWorld('dialog', {
    selectFolder(options?: any): string {
        let folder = ipcRenderer.sendSync('api-dialog--select-single-folder', options);
        return folder;
    },

    showConfirmation(
        title: string = "Warning",
        positiveAction: string = "OK",
        message: string = "",
        type: 'none' | 'info' | 'error' | 'question' | 'warning' = "info"
    ): boolean {
        const options = {
            type: type,
            buttons: ['Cancel', positiveAction],
            defaultId: 0,
            title: title,
            message: message,
            noLink: true
        };

        let result = ipcRenderer.sendSync('api-dialog--show-confirmation', options);
        return result;
    }
});

contextBridge.exposeInMainWorld('api', {
    async receive(channel: string, func: Function) {
        ipcRenderer.on(channel, (event, ...args) => {
            try {
                func.apply(null, args);
            } catch (err) {
                log.error(`Uncaught error in caller return function: ${err}`)
            }
        })
    }
});

contextBridge.exposeInMainWorld('filebridge', {
    exists(p: string): boolean {
        let fileExists = fs.existsSync(p);
        return fileExists;
    },
    revealFile(p: string, filename?: string): void {
        if (filename) {
            p = path.join(p, filename);
        }
        shell.showItemInFolder(p)
    }
});
