import '@shoelace-style/shoelace/dist/components/input/input';
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import { Dialog, FileBridge, Settings } from '../context-bridge-interface';

//context bridge
declare const settings: Settings, dialog: Dialog, filebridge: FileBridge;


@customElement('folder-input-setting')
export default class FolderInputSetting extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 1rem;
            transition: background-color 300ms ease;
        }

        .row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: -webkit-fill-available;
        }

        .column {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: .5rem;
            width: -webkit-fill-available;
        }

        .titles {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            margin-right: 1rem;
        }

        .title {
            font-size: var(--sl-font-size-medium);
            font-weight: var(--sl-font-weight-bold);
            margin-bottom: .5rem;
        }

        .subtitle, .description {
            font-size: var(--sl-font-size-small);
            opacity: 0.7;
        }

        .input-wrapper {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start
        }

        .input-wrapper * {
            margin-left: 4px;
        }

        .error {
            font-size: small;
            color: tomato;
            margin-top: .5em;
        }

        sl-input {
            width: -webkit-fill-available;
        }
    
    `
    @property({ reflect: true })
    key: string;

    @property({ reflect: true })
    override title: string;

    @property({ reflect: true })
    subTitle: string;

    @property({ reflect: false })
    description: string;

    @property({ reflect: true, type: Boolean })
    disabled: boolean = false;

    @property()
    value: string;

    @property()
    dialogTitle;

    @state()
    private errorMsg: string = null;


    public override render() {
        let iconHtml = html`<sl-icon slot="prefix" name="folder2"></sl-icon>`;

        return html`
        <div class="column">
            <div class="row">
                <div class="titles">
                    <div class="title">${this.title}</div>
                    <div class="subtitle">${unsafeHTML(this.subTitle)}</div>        
                    </div>
                <sl-button @click="${this._openDialog}" ?disabled="${this.disabled}" >
                    Browse
                    <sl-icon name="folder" slot="prefix"></sl-icon>
                </sl-button>
            </div>

            <div class="input-wrapper">
                <sl-input id="input"
                    type="text"
                    clearable
                    value="${this.value == null ? '' : this.value}"
                    @sl-clear="${this._onInputChange}"
                    @sl-change="${this._onInputChange}"
                    ?disabled="${this.disabled}"
                    >${iconHtml}</sl-input>
            </div>
            
            <div class="error" ?hidden="${this.errorMsg == null}">${this.errorMsg}</div>
            <div class="description">
                ${unsafeHTML(this.description)}
            </div>
        </div>
        `
    }

    override firstUpdated() {
        if (this.key) this.value = settings.get(this.key);
        (this.shadowRoot.getElementById('input') as SlInput).value = this.value;

        if (this.value) {
            this._verifySelectedPath();
        }
    }

    _openDialog() {
        //show the file selector dialog
        let value = this._showFolderOpenDialog();

        if (value != null) {
            this.value = value;
            (this.shadowRoot.getElementById('input') as SlInput).value = value;
            if (this.key) settings.set(this.key, this.value);
            this._notifyChange(value);
        }
    }


    _showFolderOpenDialog() {
        let folder = dialog.selectFolder();
        return folder;
    }

    _onInputChange(e: CustomEvent) {
        let value = (this.shadowRoot.getElementById('input') as SlInput).value;

        //save the changed data back to settings
        if (this.key) settings.set(this.key, value);
        this._notifyChange(value);
        this.value = value;

        this._verifySelectedPath();
    }

    _verifySelectedPath() {
        //since the input field allows free-form text the user may have typed
        //+ a path that does not exist.  We will still save the change, but
        //+ should show an error message
        let msg;
        if (this.value == null || filebridge.exists(this.value)) {
            msg = null;
        } else {
            msg = 'Selected path does not exist'
        }

        if (msg !== this.errorMsg) {
            this.errorMsg = msg;
            this.requestUpdate();
        }
    }

    _notifyChange(value: string) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                key: this.key,
                value: value
            }
        }));
        this.requestUpdate();
    }
}