import { SettingsTree } from "./settings-tree";

export const DEFAULT_SETTINGS: SettingsTree = {
    app: {
        autostart: false,
    },
    rules: {
        defaultRule: {
            id: 'default-default-default-default-default',
            name: 'Default Rule',
            description: 'Fallback rule',
            matchType: 'all',
            matchStr: null,
            includePath: false,
            destinationPath: null,
            renameType: 'copy',
            renamePattern: '{filename}{ext}'
        },
        rules: []
    },
    mainwindow: {
        pinned: true,
        width: 500,
        height: 800
    }
}