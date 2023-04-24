import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { FileRenameRequest } from '../file/rename-request';
import './app-settings';
import { API, Files, Log } from './context-bridge-interface';
import './request-list';
declare const files: Files, api: API, log: Log;


@customElement('main-app')
export class MainApp extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
                width: 100vw;
                height: 100vh;
            }

            *[hidden] {
                display: none !important;
            }

           
            #dropTarget {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: -webkit-fill-available;
                padding: 16px;
            }

            #dropTarget * {
                pointer-events: none;
            }

            .active {
                background-color: var(--accent-color);
            }

            #update {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                font-size: small;
                background: #ffd400;
            }

            
            .tabs {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-around;
                /* border-bottom: 1px solid #00000061; */
                z-index: 2;
                box-shadow: 0 0 4px rgb(0 0 0 / 40%);
            }

            .tab {
                font-size: 1.2em;
                padding: 10px;
                flex: 1;
                text-align: center;
                cursor: pointer;
                border-bottom: 3px solid #c6c6c6;
                transition: all 300ms ease;
            }

            .tab:hover {
                background-color: var(--accent-color-dim);
                border-bottom: 3px solid var(--accent-color);
            }

            .tab[active] {
                font-weight: bold;
                border-bottom: 3px solid var(--accent-color);
            }

            header {
                padding-left: 8px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            header .title {
                max-lines: 1;
                text-overflow: ellipsis;
                font-weight: bold;
                font-size: 1.3em;
                flex: 1;
                align-items: center;
                justify-content: flex-start;
                -webkit-app-region: drag;
                user-select: none;
            }

            header .buttons {
                display: flex;
                flex-direction: row;
                -webkit-app-region: no-drag;
                align-items: center;
                justify-content: flex-end;
            }

            #closeButton {
                background: rgba(255, 255, 255, 0);
                transition: all 300ms ease;
                width: 48px;
                height: 32px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
            }

            #closeButton:hover {
                background-color: rgba(198, 63, 51, 0.671);
            }

            #closeButton:active {
                background-color: rgba(247, 70, 54, 0.999);
            }

            h1 {
                margin: 0;
            }

            main {
                flex: 1;
                -webkit-app-region: no-drag;
                z-index: 1;
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                width: 100vw;
                height: 100vh;
            }


            footer {
                background-color: #b6b6b6;
                padding: 16px;
                z-index: 1;
            }

            .section {
                display: flex;
                flex-direction: column;
                opacity: 1;
                flex: 1;
                overflow: hidden;
            }

            .divider {
                height: 1px;
                width: -webkit-fill-available;
                background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.6), transparent);
                align-self: center;
            }

            .hidden {
                transform: translateX(100%) !important;
                opacity: 0;
            }

            /* #closeButton::part(base) {
                color: grey;
            }

            #closeButton::part(base):hover {
                color: red;
            }

            #closeButton::part(base):focus {
                color: blue;
            } */

            .hide {
                display: none;
            }

            sl-dialog::part(body) {
                padding: 0 16px;
            }

            sl-dialog::part(title) {
                font-size: 1.2em;
                font-weight: bold;
                padding: 16px;
            }

            .bottom-bar {
                padding: 0.5em 1em;
                background: rgba(0, 0, 0, 0.1);
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-end;
                transition: all 300ms ease;
            }

            .bottom-bar.shift {
                transform: translateY(100%)
            }
        `
    ];

    @state()
    private isUpdateAvailable: boolean = false;

    @state()
    private currentTab: 'import' | 'settings' = 'import';

    @state()
    private requests: FileRenameRequest[] = [];

    /** An interval to refresh the requests lists */
    private _refreshInterval;

    override render() {
        return html`
            <main>
                <div id="update" ?hidden="${!this.isUpdateAvailable}">
                    An update is available!
                    <sl-button variant="text" id="updateButton" @click="${e => (window as any).ipcRenderer.send('do-update')}">Install</sl-button>
                </div>
                <div class="tabs" @click="${this._onTabClicked}">
                    <div class="tab" ?active="${this.currentTab == 'import'}" data-name="import">Rename</div>
                    <div class="tab" ?active="${this.currentTab == 'settings'}" data-name="settings">Settings</div>
                </div>

                <div class="section" data-name="import" ?hidden="${this.currentTab != 'import'}">
                    <div id="dropTarget" class="fade"
                        @dragstart="${this._onDragStart}"
                        @dragover="${this._onDragOver}"
                        @dragenter="${this._onDragOver}"
                        @dragleave="${this._onDragExit}"
                        @dragend="${this._onDragExit}"
                        @drop="${this._onDrop}"
                    >
                        <sl-icon class="download" name="download"></sl-icon>
                        <div>Drop files here to rename</div>
                    </div>
                    <div class="divider"></div>
                    <request-list id="list" .requests="${this.requests}"></request-list>
                    <div class="bottom-bar ${this.requests == null || this.requests.length == 0 ? 'shift' : ''}">
                        <sl-button @click="${e => files.clearCompleted()}">
                            <sl-icon slot="prefix" name="stars"></sl-icon>
                            Clear Completed
                    </sl-button>
                    </div>
                </div>

                <div class="section" data-name="settings" ?hidden="${this.currentTab != 'settings'}">
                    <app-settings></app-settings>
                </div>
            </main>

            <sl-dialog id="dialog" label="Details" class="dialog-overview">
            <p style="white-space: pre-wrap;" class="content"></p>
            </sl-dialog>
        `;


    }

    private _onDragStart(e: DragEvent) {
        e.dataTransfer.effectAllowed = 'all';
    }

    private _onDragOver(e: DragEvent) {
        console.log(`Drag over, type: ${e.type}`)
        let dropTarget = this.shadowRoot.getElementById('dropTarget');
        dropTarget.classList.add('active');
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    private _onDragExit(e: DragEvent) {
        console.log('drag leave')
        let dropTarget = this.shadowRoot.getElementById('dropTarget');
        dropTarget.classList.remove('active');
    }

    private _onDrop(e: DragEvent) {
        console.log('drag drop')
        let dropTarget = this.shadowRoot.getElementById('dropTarget');
        dropTarget.classList.remove('active');

        e.preventDefault();
        e.stopPropagation();
        const attachment = e.dataTransfer.getData('attachment');
        const file = e.dataTransfer.getData('file');
        const emailData = e.dataTransfer.getData('text');
        console.log('attachment', attachment);
        console.log('file', file);
        console.log('emailData', emailData);

        this._handleFileDrop(e.dataTransfer.files);
    }

    protected override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this._init();
        this._updateRequests();
        let dropTarget = this.shadowRoot.getElementById('dropTarget');
        dropTarget.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            console.log('drop detected')
        });


        // this._refreshInterval = setInterval(async () => {
        //     this.requests = await files.getRequests();
        // }, 1000)
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._refreshInterval);
    }

    private _init() {
        this._initIpcListeners();
        this._initTabs();
    }

    private _initTabs() {
        let tab = document.querySelector('.tabs');
        let tabs = document.querySelectorAll('.tab');
        let sections = document.querySelectorAll('.section');


    }

    private _onTabClicked(e: MouseEvent) {

        console.log(e.target);
        let sectionName = (e.target as any).dataset['name'];
        this.currentTab = sectionName;
    }

    _handleFileDrop(fileList: FileList) {
        let doRename = true;
        if (fileList.length > 2) {
            doRename = confirm(`A large number of files were dropped (${fileList.length.toFixed(0)}).\n\nAre you sure you want to rename this many files?`)
        }

        if (doRename) {
            for (var i = 0; i < fileList.length; i++) {
                let f = fileList[i]
                files.addFileRequest(f.path);
            }
        }
    }

    private _initIpcListeners() {
        api.receive('update-available', () => {
            this.isUpdateAvailable = true;
        });

        api.receive('requests-changed', async () => {
            console.log('saw requests changed notification')
            this._updateRequests();
        })
    }

    private async _updateRequests() {
        this.requests = await files.getRequests();
        this.requestUpdate();
    }
}

