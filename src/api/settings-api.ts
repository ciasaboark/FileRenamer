export function init() {
    global.ipcMain.on('get-sync', (event, key) => {
        let val = global.settings.getSync(key);
        event.returnValue = val;
    });

    global.ipcMain.handle('get-async', async (event, key) => {
        let val = await global.settings.get(key);
        return val;
    });

    global.ipcMain.on('set-sync', (event, key, value) => {
        let oldVal = global.settings.getSync(key);
        global.settings.setSync(key, value);
        notifyKeyChange(key, value);
        event.returnValue = oldVal;
    });

    global.ipcMain.on('delete-sync', (event, key) => {
        global.settings.unsetSync(key);
        notifyKeyChange(key);
    });

    global.ipcMain.handle('set-async', async (event, key, value) => {
        let oldVal = global.settings.get(key);
        await global.settings.set(key, value);
        notifyKeyChange(key, value);
        return oldVal;
    });

    global.ipcMain.handle('delete-async', async (event, key) => {
        await global.settings.unset(key);
        notifyKeyChange(key);
    });

    async function notifyKeyChange(key: string, value?: any) {
        //notify the main window
        global?.mainWindow?.webContents?.send('settings-changed', key, value);   
    }
}