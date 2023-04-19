import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { LogViewer } from "./log-viewer";

@customElement('main-app')
export class MainApp extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
            }

            .hid {
                pointer-events: none;
                opacity: 0;
            }
        `
    ];

    @state()
    private isDragVisible: boolean = false;

    override render() {
        return html`
            <main
                @dragover="${(e: DragEvent) => {
                    (window as any).log.debug('file is over drop space');
                    this.isDragVisible = true;
                }}"
                @dragleave="${(e: DragEvent) => {
                    (window as any).log.debug('file left drag space');
                    this.isDragVisible = false;
                }}"
                @drop="${(e: DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
            
                    this.isDragVisible = false;
                    this._handleFileDrop(e.dataTransfer.files);
                }}"
            >
                <div id="dropTarget" class="${this.isDragVisible ? '' : 'hid'}">
                    <sl-icon class="download" name="download"></sl-icon>
                    <div>Drop files here to rename</div>
                </div>
                <div id="update" class="hide">
                    An update is available!
                    <sl-button variant="text" id="updateButton" @click="${e => (window as any).ipcRenderer.send('do-update')}">Install</sl-button>
                </div>
                <div class="tabs">
                    <div class="tab active" data-name="import">Rename</div>
                    <div class="tab" data-name="settings">Settings</div>
                    <div class="tab" data-name="logs">Logs</div>
                </div>

                <div class="section" data-name="import">
                    <import-list id="list"></import-list>
                </div>

                <div class="section hide" data-name="settings">
                    <app-settings></app-settings>
                </div>

                <div class="section hide" data-name="logs">
                    <log-viewer id="logger"></div>
                </div>
            
            </main>

            <sl-dialog id="dialog" label="Details" class="dialog-overview">
            <p style="white-space: pre-wrap;" class="content"></p>
            </sl-dialog>
        `;
    }

    protected override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this._init();
    }

    private _init() {
        this._initTabs();
    }

    private _initTabs() {
        let tab = document.querySelector('.tabs');
        let tabs = document.querySelectorAll('.tab');
        let sections = document.querySelectorAll('.section');
        tab.addEventListener('click', (e: any) => {
            console.log(e.target);
            let sectionName = e.target.dataset['name'];
    
            sections.forEach((section: any) => {
                if (section.dataset['name'] == sectionName) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }
            });
    
            tabs.forEach((tab: any) => {
                if (tab.dataset['name'] == sectionName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        });
    
    }

    _handleFileDrop(files) {
        let doRename = true;
        if (files.length > 2) {
            doRename = confirm("Are you sure you want to rename this many files?")
        }
    
        if (doRename) {
            for (var f of files) {
                let importFile = new window.ImportFile(uuid, f.path, 'pending', 0);
                let pendingEl = new PendingImport();
                pendingEl.id = `import-${uuid}`;
                pendingEl.uuid = uuid;
                pendingEl.status = importFile.status;
                pendingEl.label = "Waiting...";
                let filename = this._extractFilename(importFile.path);
                pendingEl.name = filename;
                let path = this._extractPath(importFile.path);
                pendingEl.path = path;
                pendingEl.progress = importFile.progress;
                pendingEl.addEventListener('cancel', (e) => {
                    (window as any).ipcRenderer.send('cancel-import-file', e.detail);
                });
    
                pendingEl.addEventListener('show-details', (e) => {
                    dialogContent.innerHTML = e.detail;
                    dialog.show();
                });
                
                let list = document.querySelector('#list');
                list.addItem(pendingEl);
                (window as any).log.debug(`dropped file ${f.path}: uuid: ${uuid}`);
                (window as any).ipcRenderer.send('add-import-file', importFile);
    
            }
        }
    }

    private _extractPath(path) {
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

    private _extractFilename(path) {
        if (path.substr(0, 12) == "C:\\fakepath\\")
          return path.substr(12); // modern browser
        var x;
        x = path.lastIndexOf('/');
        if (x >= 0) // Unix-based path
          return path.substr(x+1);
        x = path.lastIndexOf('\\');
        if (x >= 0) // Windows-based path
          return path.substr(x+1);
        return "path"; // just the filename
    }
}

