import { FileRenameRequest } from "../file/rename-request";

export interface Files {
    addFileRequest(filename: string);
    getRequests(): Promise<FileRenameRequest[]>;
    clearCompleted();
}

export interface Log {
    info(msg: string): void;
    debug(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
}

export interface Settings {
    get(key: string, defVal?: any): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
    delete(key: string): void;
    getAsync(key: string, devVal?: any): Promise<any>;
    setAsync(key: string, value: any): Promise<void>;
    hasAsync(key: string): Promise<boolean>;
    deleteAsync(key: string): Promise<void>;
}

export interface Dialog {
    selectFolder(options?: Electron.OpenDialogSyncOptions): string;
    showConfirmation(
        title: string,
        positiveAction: string,
        message: string,
        type: 'none' | 'info' | 'error' | 'question' | 'warning'
    ): boolean
}

export interface FileBridge {
    exists(p: string): boolean;
    revealFile(p: string, filename?: string): void;
}

export interface API {
    receive(channel: string, func: Function): void;
}