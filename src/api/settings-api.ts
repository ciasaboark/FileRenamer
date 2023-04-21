import { ipcMain } from "electron";
import settings = require('electron-settings');


export function init() {
    ipcMain.on('get-sync', (event, key) => {
        let val = settings.getSync(key);
        event.returnValue = val;
    });

    ipcMain.handle('get-async', async (event, key) => {
        let val = await settings.get(key);
        return val;
    });

    ipcMain.on('set-sync', (event, key, value) => {
        let oldVal = settings.getSync(key);
        settings.setSync(key, value);
        notifyKeyChange(key, value);
        event.returnValue = oldVal;
    });

    ipcMain.on('delete-sync', (event, key) => {
        settings.unsetSync(key);
        notifyKeyChange(key);
    });

    ipcMain.handle('set-async', async (event, key, value) => {
        let oldVal = settings.get(key);
        await settings.set(key, value);
        notifyKeyChange(key, value);
        return oldVal;
    });

    ipcMain.handle('delete-async', async (event, key) => {
        await settings.unset(key);
        notifyKeyChange(key);
    });

    async function notifyKeyChange(key: string, value?: any) {
        //notify the main window
        global.mainWindow?.webContents?.send('settings-changed', key, value);
    }
}