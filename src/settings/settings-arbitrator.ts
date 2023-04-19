const ipc = require('electron').ipcRenderer;

type SettingsCallback = (key: string, newVal: any) => void;

class SettingsArbitrator {
    private static instance: SettingsArbitrator;

    map: Map<string, Set<SettingsCallback>>;

    private constructor() {
        this.map = new Map();
    }

    public static getInstance() {
        if (SettingsArbitrator.instance == null) {
            SettingsArbitrator.instance = new SettingsArbitrator();
        }

        return SettingsArbitrator.instance;
    }

    getSync(key: string, defaultVal?: any): any {
        let val = ipc.sendSync('get-sync', key);
        if (val == null && defaultVal != null) {
            return defaultVal;
        } else {
            return val;
        }
    }

    setSync(key: string, value: any) {
        ipc.sendSync('set-sync', key, value);
    }

    delete(key: string): void {
        ipc.sendSync('delete-sync', key);
    }

    async hasAsync(key: string) {
        let val = await this.getAsync(key);
        if (val == null) {
            return false;
        } else {
            return true;
        }
    }

    has(key: string) {
        let val = this.getAsync(key);
        if (val == null) {
            return false;
        } else {
            return true;
        }
    }

    async getAsync(key, defaultVal?: any): Promise<any> {
        let val = await ipc.invoke('get-async', key);
        if (val == null && defaultVal != null) {
            return defaultVal;
        } else {
            return val;
        }
    }

    async setAsync(key: string, value: any) {
        await ipc.invoke('set-async', key, value);
    }

    async deleteAsync(key: string): Promise<void> {
        await ipc.invoke('delete-async', key);
    }
}

export { SettingsCallback as Callback, SettingsArbitrator };

