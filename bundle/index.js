/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
//a dialog that will be used to show import errors
let dialog, dialogContent;
document.addEventListener("DOMContentLoaded", () => {
    // window.ga.screenView('main');
    setTimeout(() => {
        _init();
    }, 100);
});
function _init() {
    _initButtons();
    _initDragListeners();
    _initDialog();
    _initTabs();
    let logger = document.querySelector('#logger');
    window.ipcRenderer.on('log-line', (e, line) => {
        logger.addLine(line);
    });
    window.ipcRenderer.on('update-available', () => {
        let update = document.querySelector('update');
        update.classList.remove('hide');
    });
}
function _initTabs() {
    let tab = document.querySelector('.tabs');
    let tabs = document.querySelectorAll('.tab');
    let sections = document.querySelectorAll('.section');
    tab.addEventListener('click', (e) => {
        console.log(e.target);
        let sectionName = e.target.dataset['name'];
        sections.forEach(section => {
            if (section.dataset['name'] == sectionName) {
                section.classList.remove('hide');
            }
            else {
                section.classList.add('hide');
            }
        });
        tabs.forEach(tab => {
            if (tab.dataset['name'] == sectionName) {
                tab.classList.add('active');
            }
            else {
                tab.classList.remove('active');
            }
        });
    });
}
function _initButtons() {
    let updateButton = document.querySelector('#updateButton');
    updateButton.addEventListener('click', () => {
        window.ipcRenderer.send('do-update');
    });
    let closeButton = document.querySelector("#closeButton");
    closeButton.addEventListener('click', () => {
        window.close();
    });
}
function _initDragListeners() {
    let main = document.querySelector('main');
    let dropTarget = document.querySelector('#dropTarget');
    dropTarget.addEventListener('dragover', e => {
        e.preventDefault();
        e.stopPropagation();
    });
    //The drag events will be a bit messy.  The enter
    //+ event will trigger on the main div.  Once the drop
    //+ target is displayed main will no longer be the target
    //+ for drag/drop events
    main.addEventListener('dragenter', e => {
        window.log.debug('file is over drop space');
        dropTarget.classList.remove('hid');
    });
    dropTarget.addEventListener('dragleave', e => {
        window.log.debug('file left drag space');
        dropTarget.classList.add('hid');
    });
    dropTarget.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        dropTarget.classList.add('hid');
        _handleFileDrop(e.dataTransfer.files);
    });
}
function _handleFileDrop(files) {
    let doImport = true;
    if (files.length > 2) {
        doImport = confirm("Are you sure you want to import this many files?");
    }
    if (doImport) {
        for (var f of files) {
            let uuid = window.uuidv4();
            let importFile = new window.ImportFile(uuid, f.path, 'pending', 0);
            let pendingEl = new PendingImport();
            pendingEl.id = `import-${uuid}`;
            pendingEl.uuid = uuid;
            pendingEl.status = importFile.status;
            pendingEl.label = "Waiting...";
            let filename = extractFilename(importFile.path);
            pendingEl.name = filename;
            let path = extractPath(importFile.path);
            pendingEl.path = path;
            pendingEl.progress = importFile.progress;
            pendingEl.addEventListener('cancel', (e) => {
                window.ipcRenderer.send('cancel-import-file', e.detail);
            });
            pendingEl.addEventListener('show-details', (e) => {
                dialogContent.innerHTML = e.detail;
                dialog.show();
            });
            let list = document.querySelector('#list');
            list.addItem(pendingEl);
            window.log.debug(`dropped file ${f.path}: uuid: ${uuid}`);
            window.ipcRenderer.send('add-import-file', importFile);
        }
    }
    function extractPath(path) {
        if (path.substr(0, 12) == "C:\\fakepath\\")
            return path.substr(0, 11); // modern browser
        var x;
        x = path.lastIndexOf('/');
        if (x >= 0) // Unix-based path
            return path.substr(0, x);
        x = path.lastIndexOf('\\');
        if (x >= 0) // Windows-based path
            return path.substr(0, x);
        return ""; // just the filename
    }
    function extractFilename(path) {
        if (path.substr(0, 12) == "C:\\fakepath\\")
            return path.substr(12); // modern browser
        var x;
        x = path.lastIndexOf('/');
        if (x >= 0) // Unix-based path
            return path.substr(x + 1);
        x = path.lastIndexOf('\\');
        if (x >= 0) // Windows-based path
            return path.substr(x + 1);
        return "path"; // just the filename
    }
}
function _initDialog() {
    dialog = document.querySelector('#dialog');
    dialogContent = document.querySelector('#dialog .content');
}

/******/ })()
;
//# sourceMappingURL=index.js.map