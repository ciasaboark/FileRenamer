import { FileRule } from "../file/file-rule"

export interface SettingsTree {
    app: {
        /** Whether the application should start automatically at user login */
        autostart: boolean,
    },
    rules: {
        defaultRule: FileRule,
        rules: FileRule[]
    },
    mainwindow: {
        pinned: boolean,
        height: number,
        width: number
    }
}