import log = require('electron-log');

export function init() {
    global.ipcMain.on('api-dialog--select-single-folder', (event, options) => {
        const { dialog } = require('electron');
        log.info('showing folder open dialog')

        //Default options for the dialog
        let dialogOptions = {
            title: 'Select Folder',
            message: 'Select Folder',
        };

        //Override the settings with the user supplied options
        if (options != null) {
            dialogOptions = Object.assign(dialogOptions, options);
        }

        //but force the dialog to be a folder select dialog
        dialogOptions = Object.assign(dialogOptions, {
            properties: [
                'openDirectory'
            ]
        });

        let results: string | Array<string> = dialog.showOpenDialogSync(dialogOptions);

        let folder: string;

        if (results != null && results[0] != null) {
            folder = results[0];
        } else {
            folder = null;
        }

        event.returnValue = folder;
    });

    global.ipcMain.on('api-dialog--show-confirmation', (event, options) => {
        const { dialog } = require('electron');
        let selected = dialog.showMessageBoxSync(null, options);
        let isPositive = selected === 1;

        event.returnValue = isPositive;
    });
}