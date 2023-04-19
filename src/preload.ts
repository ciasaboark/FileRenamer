import { app, contextBridge, ipcRenderer, Size } from "electron";
import log = require('electron-log');
import fs = require('fs');
import { SettingsArbitrator } from "./settings/settings-arbitrator";
const sa = SettingsArbitrator.getInstance();

console.log('Preload!')

contextBridge.exposeInMainWorld('log', {
    info: (msg: string) => log.info(msg),
    debug: (msg: string) => log.debug(msg),
    warn: (msg: string) => log.warn(msg),
    error: (msg: string) => log.error(msg)
});

contextBridge.exposeInMainWorld('file', {
    async rename(oldPath: string, newPath: string): Promise<void> {
        await fs.promises.rename(oldPath, newPath);
        return;
    },

    async copy(oldPath: string, newPath: string): Promise<void> {
        await fs.promises.copyFile(oldPath, newPath);
        return;
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

