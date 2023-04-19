"use strict";
//make sure there is only one settings object initialized
const remote = require('electron').remote;
const {ipcRenderer} = require('electron');
const {app} = require('electron');
const path = require('path');
const fs = require('fs');
const dialog = remote.dialog;
const settings = remote.require('electron-settings');
const fileUrl = require('file-url');
const BackgroundUpdater = require('./background-updater.js').BackgroundUpdater;
const ipc = require('electron').ipcRenderer;
const win = require('electron').remote.getCurrentWindow();
const Mousetrap = require('mousetrap');
const uuidv1 = require('uuid/v1');
const keys = [];

ipc.send('screenview', 'about');

document.addEventListener("DOMContentLoaded", _init());

function _init() {
    //disable the menu so the screen is not cluttered
    win.setMenu(null);

    _initVersion();
    _initCredits();
    _applyTheme();
    _initManual();

    settings.watch("display.theme", () => {
        _applyTheme();
    });

    const shell = require('electron').shell;
    let anchorEls = document.getElementsByTagName("a");
    for (var i = 0; i < anchorEls.length; i++) {
        let a = anchorEls[i];
        a.addEventListener('click', (e) => {
            e.preventDefault();
            shell.openExternal(a.href);
        });
    }
}

function _initVersion() {
    ipc.send('app_version');
    ipc.on('app_version', (event, arg) => {
        ipc.removeAllListeners('app_version');
        document.getElementById('versionNo').innerText = arg.version;
    });

    ipc.send('build_timestamp');
    ipc.on('build_timestamp', (event, arg) => {
        ipc.removeAllListeners('build_timestamp');
        document.getElementById('buildTimestamp').innerHTML = arg.timestamp;
    });
}

function _initCredits() {
    let filePath = path.join(__dirname, '..', 'CREDITS.md');
    const file = fs.readFileSync(filePath)
    const mdString = file.toString()
    const showdown = require('showdown');
    const converter = new showdown.Converter();
    let html = converter.makeHtml(mdString);
    document.getElementById('content').innerHTML = html;
}

function _applyTheme() {
    let themeStyle = document.getElementById("themeStyle");
    let chosenTheme = settings.get("display.theme");
    switch (chosenTheme) {
        case 'light':
            themeStyle.href="./elements/theme-light.css";
            break;
        case 'dark':
            themeStyle.href = "./elements/theme-dark.css";
            break;
        case 'tron':
            themeStyle.href = "./elements/theme-tron.css";
            break;
        case 'edge':
            themeStyle.href = "./elements/theme-edge.css";
            break;
        default:
            themeStyle.href = "./elements/theme-dark.css";
    }
}

function _initManual() {
    let button = document.getElementById('manualButton');
    button.addEventListener('click', () => {
        let process = require('process');
        let path = require('path');
        let {shell, app} = require('electron').remote;
        let manualPath = path.resolve(__dirname,'../docs/manual.pdf');
        let tempPath = path.join(app.getPath('temp'), 'Production Display Manual.pdf');
        fs.copyFileSync(manualPath, tempPath);
        shell.openExternal(tempPath);
    })
}