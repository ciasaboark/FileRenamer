// Modules to control application life and create native browser window
import { BrowserWindow, Menu, Tray, app, ipcMain } from 'electron';
import { DEFAULT_SETTINGS } from './settings/default-settings';
import settings = require('electron-settings');
const _ = require('lodash');
const path = require('path')
const localshortcut = require('electron-localshortcut');
const log = require('electron-log');
log.transports.file.level = 'info';
const { autoUpdater } = require("electron-updater");
autoUpdater.logger = log;

//Only allow a single instance to run
let lock = app.requestSingleInstanceLock();
if (!lock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    createMainWindow();
  });
}

//enable the autostart feature if selected
let isAutostart = Boolean(settings.getSync('app.autostart'));
if (isAutostart == null) isAutostart = true;  //default to enabled
app.setLoginItemSettings({ openAtLogin: isAutostart });


//check for any updates
autoUpdater.addAuthHeader('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available');
  }
});

//merge the default settings
let curSettings = settings.getSync();

let mergedSettings = _.merge({}, DEFAULT_SETTINGS);
mergedSettings = _.merge(mergedSettings, curSettings);
settings.setSync(mergedSettings);


import * as settingsApi from './api/settings-api';
settingsApi.init();

import * as fileApi from './api/file-api';
fileApi.init();

import * as dialogApi from './api/dialog-api';
dialogApi.init();


function _showMainWindow() {
  let electron = require('electron');
  let screen = electron.screen;
  let display = screen.getPrimaryDisplay();
  let dh = display.workAreaSize.height;
  let dw = display.workAreaSize.width;

  let wh = mainWindow.getSize()[1];
  let ww = mainWindow.getSize()[0];

  let x = dw - ww;
  let y = dh - wh;

  mainWindow.setPosition(x, y);

  mainWindow.show();
  mainWindow.setAlwaysOnTop(true);
  mainWindow.focus();
}


let mainWindow;
function createMainWindow() {
  if (mainWindow != null) {
    _showMainWindow();
    return;
  }

  //is the main window supposed to be pinned to the top?
  let isPinned = Boolean(settings.getSync('mainwindow.pinned'));

  //restore our previous window size
  let height = parseInt(settings.getSync('mainwindow.height') as string);
  if (height == null || isNaN(height)) {
    height = 800;
  }

  let width = parseInt(settings.getSync('mainwindow.width') as string);
  if (width == null || isNaN(width)) {
    width = 400;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minHeight: 500,
    minWidth: 250,
    backgroundColor: 'white',
    show: false,
    icon: __dirname + '../assets/tray_icon.png',


    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      sandbox: false
    }
  });

  //stash the window as a global object
  global.mainWindow = mainWindow;

  mainWindow.removeMenu();

  // and load the index.html of the app.
  mainWindow.loadFile('src/window/index.html');
  // mainWindow.webContents.openDevTools({
  //   mode: 'detach'
  // });


  mainWindow.on('ready-to-show', () => {
    _showMainWindow();
  });

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.minimize();
    mainWindow.hide();
  });

  mainWindow.on('resized', (e) => {
    let size = mainWindow.getSize();
    let width = size[0];
    let height = size[1];

    settings.setSync('mainwindow.height', height);
    settings.setSync('mainwindow.width', width);

  });

  //only check for updates once the main window has been shown
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  localshortcut.register(mainWindow, "Ctrl+Shift+I", () => {
    mainWindow.webContents.openDevTools({
      mode: 'detach'
    });
  });
}

function createTrayIcon() {
  let iconPath = path.join(__dirname, '../src/assets/tray_icon.png');
  let tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show', type: 'normal', click: () => {
        createMainWindow();
      }
    },
    {
      label: `v ${app.getVersion()}`, type: 'normal', click: () => {
        //nothing to do here
      }
    },
    { type: 'separator' },
    {
      label: 'Quit', type: 'normal', click: () => {
        log.info('quitting...')
        app.quit();
        process.exit();
      }
    }
  ])
  tray.setToolTip('Container Importer')
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    log.debug('left click')
    createMainWindow();
  });
  tray.on('right-click', () => {
    log.debug('right click')
    tray.popUpContextMenu();
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createTrayIcon();


  //for testing, go ahead and create the main window
  // createMainWindow();



  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
});

app.on('window-all-closed', (e) => {
  log.debug('All windows closed');
});

app.on('will-quit', () => {
  log.debug('App will quit listener')
})

app.on('before-quit', (e) => {
  //preventDefault in the window-all-closed listener will prevent the app from quiting
  e.preventDefault();
  log.debug('Shutting down...');
})

ipcMain.on('mainwindow-pinned', (e, isPinned) => {
  settings.setSync('mainwindow.pinned', isPinned);
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(isPinned, 'normal');
  }
});

ipcMain.on('change-autostart', (e, isAutostart) => {
  app.setLoginItemSettings({ openAtLogin: isAutostart });
});


//listen for request to get/set configuration values
ipcMain.on('settings-set', (e, prop, val) => {
  settings.set(prop, val);
});

//listen for request to get/set configuration values
ipcMain.on('settings-set-sync', (e, prop, val) => {
  settings.set(prop, val);
  e.returnValue = true;
});

ipcMain.on('settings-get', (event, prop) => {
  let val = settings.getSync(prop);
  event.returnValue = val;
});


ipcMain.on('show-settings', () => {
  //show the main settings window
});

ipcMain.on('do-update', () => {
  autoUpdater.quitAndInstall();
});
