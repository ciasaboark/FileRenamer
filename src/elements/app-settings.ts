import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { Settings, Log, Dialog } from './context-bridge-interface';
declare const settings: Settings, log: Log, dialog: Dialog;

@customElement('app-settings')
export class AppSettings extends LitElement {
    static override styles = [
        css`
            :host {
               position: relative;
               padding: 16px;
               display: flex;
               flex-direction: column;
            }
           

            :host([hidden]) {
                display: none;
            }

            .hide {
                display: none !important;
            }

            .db-info {
                display: flex;
                flex-direction: row;
                align-items: center;
                overflow: hidden;
                border: 1px solid #ffffff6e;
                border-radius: 5px;
                margin: 8px;
                padding: 8px 24px 8px 8px;
                font-size: 9pt;
                position: relative;
                box-shadow: 0 0 5px rgb(0 0 0 / 40%);
            }

            .db-info sl-icon-button {
                position: absolute;
                top: 0;
                right: 0;
                --sl-focus-ring: none;
            }

            .db-info sl-icon-button.active {
                animation: spin 1s linear infinite;
                pointer-events: none;
            }

            .db-info .overlay {
                position: absolute;
                top: 0;
                right: 0;
                left: 0;
                bottom: 0;
                background-color: rgb(255 255 255 / 84%);
            }

            .db-info span {
                font-weight: bold;
            }

            sl-button, sl-checkbox, sl-input {
                margin-bottom: 16px;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }

                50% {
                    transform: rotate(180deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }
        `
    ];

    override render() {
        return html`
            <sl-checkbox id="autostartCheckbox">Automatically start at login</sl-checkbox>
            
            <sl-button id="selectDbButton">
                <sl-icon name="table"></sl-icon>
                Select Database File
            </sl-button>

            <sl-input id="backupInput" label="Backup Location"  placeholder="Select a folder"></sl-input>

            <input id="databaseInput" class="hide" type="file" />
            <input id="backupFileInput" webkitdirectory directory class="hide" type="file" />
        `;
    }

    protected override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this._initSettings();

        let autostartCheckbox = this.shadowRoot.getElementById('autostartCheckbox');
        let isAutostart = settings.get('app.autostart');
        if (isAutostart == null) isAutostart = true;
        if (isAutostart) autostartCheckbox.checked = true;

        autostartCheckbox.addEventListener('change', () => {
            let isChecked = autostartCheckbox.checked;
            settings.set('app.autostart', isChecked);
            window.ipcRenderer.send('change-autostart', isChecked);
        })

        let dbFileInput = this.shadowRoot.getElementById('databaseInput');
        dbFileInput.addEventListener('change', (e) => {
            // console.log('new file selected');
            let file = dbFileInput.files[0].path;
            settings.set('app.db-file', file);
            this._refreshDBInfo();
        })

        let dbButton = this.shadowRoot.getElementById('selectDbButton');
        dbButton.addEventListener('click', () => {
            //trigger the hidden file input click
            dbFileInput.click();
        });

        let backupInput = this.shadowRoot.getElementById('backupInput');
        let backupPath = settings.get('app.backup-path');
        if (backupPath != null) backupInput.value = backupPath;

        backupInput.addEventListener('click', (e) => {
            //pass all clicks to the hidden file input
            let results = dialog.selectFolder();
            
            if (results == undefined) {
                backupInput.value = '';
            } else {
                let backupPath = results[0];
                backupInput.value = backupPath;
                settings.set('app.backup-path', backupPath);
            }
            console.log(results);
        })
    }
}