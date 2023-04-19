import { FileRenameRequest } from "../file/rename-request";
import { FileRenamerService } from "../file/file-renamer-service";

const fileRenamer = new FileRenamerService();

export function init() {
    //start up the file renamer service
    fileRenamer.startProcessing();

    global.ipcMain.handle('api-file--process-file', (event, filePath: string) => {

    });

    global.ipcMain.handle('api-file--current-status', (event) => {
        let requests: FileRenameRequest[] = fileRenamer.getStatus();
        return requests;
    })
}