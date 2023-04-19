import { MainApp } from "../elements/main-app";


//a dialog that will be used to show import errors
let dialog, dialogContent;

document.addEventListener("DOMContentLoaded", () => {
    // window.ga.screenView('main');
    
    setTimeout(() => {
        _init();
        
    }, 100)
});


function _init() {   
    let closeButton = document.querySelector("#closeButton");
    closeButton.addEventListener('click', () => {
        window.close();
    })

    
    _initDragListeners();
    _initDialog();
    _initTabs();

    

    let logger = document.querySelector('#logger');
    (window as any).ipcRenderer.on('log-line', (e, line) => {
        logger.addLine(line);
    });

    (window as any).ipcRenderer.on('update-available', () => {
        let update = document.querySelector('update');
        update.classList.remove('hide');
    })
}






