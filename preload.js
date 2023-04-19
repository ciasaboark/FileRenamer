// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })


const { contextBridge, ipcRenderer } = require("electron");

// // Expose protected methods that allow the renderer process to use
// // the ipcRenderer without exposing the entire object
// contextBridge.exposeInMainWorld(
//   "settings", {
//       set: (prop, val) => {
//         ipcRenderer.send('settings-set', prop, val)
//       },
//       get: (prop) => {
//         ipcRenderer.sendSync('settings-get', prop);
//       }
//   },
//   "ga", {
//     screenView: (name) => {
//       ipcRenderer.send('ga-screenview', name);
//     },
//     exception: (e) => {
//       ipcRenderer.send('ga-exception', e);
//     }
//   }
// );


window.ipcRenderer = require('electron').ipcRenderer;
log = require('electron-log');
log.info("Logger loaded")
window.log = log;

settings = require('electron-settings');
window.settings = {};

window.settings.set = (prop, val) => {
  ipcRenderer.send('settings-set', prop, val)
}

window.settings.setSync = (prop, val) => {
  ipcRenderer.sendSync('settings-set-sync', prop, val);
}

window.settings.getSync = (prop) => {
  let val = ipcRenderer.sendSync('settings-get', prop);
  return val;
}

const { v4: uuidv4 } = require('uuid');
window.uuidv4 = uuidv4;

const ImportFile = require('./src/import-file.js');
window.ImportFile = ImportFile;




