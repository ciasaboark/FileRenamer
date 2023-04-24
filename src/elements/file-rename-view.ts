import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileRenameRequest } from '../file/rename-request';
import { FileBridge } from './context-bridge-interface';
import moment = require('moment');
declare const filebridge: FileBridge;

@customElement('file-rename-view')
export class FileRenameView extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
                width: -webkit-fill-available;
                padding: 8px;
                border: 1px solid gray;
                background-color: white;
            }

            .icon {
                margin: .5em 1.5em .5em .5em;
                width: 1.5em;
                height: 1.5em;
            }

            .large {
                font-size: 1.1em;
                font-weight: bold;
            }

            .fixed {
                font-family: monospace;
            }

            .detail {
                font-size: .9em;
            }

            .row {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            .col {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                flex: 1;
                gap: 0.2em;
                margin-bottom: 1em;
                overflow: hidden;
            }

            .times {
                opacity: 0.9;
                display: flex;
                flex-direction: row;
                font-size: 0.8em;
                justify-content: space-between;
            }

            .error {
                color: tomato;
                margin-top: .5em;
            }

            #fileLink {
                color: var(--accent-color);
                margin-left: 1em;
                opacity: 0;
                cursor: pointer;
                transition: all 300ms ease;
                border-radius: .25em;
                padding: .25em;
            }

            #fileLink:hover {
                color: white;
                background-color: var(--accent-color);
            }

            :host(:hover) #fileLink {
                opacity: 1;
            }
        `
    ];

    @property({ type: Object })
    request: FileRenameRequest = null;

    override render() {
        return html`
            
            <div class="col">
                <div class="row">
                    <img class="icon" src="${this._getStatusIcon()}" />
                    <div class="large fixed">${this.request?.originalFilename}</div>
                </div>
                <div class="detail" ?hidden="${this.request?.newFilename == null}">
                    Renamed to: <span class="fixed">${this.request?.newFilename}</span> 
                </div>
                <div class="detail" ?hidden="${this.request?.newPath == null}">
                    ${this.request.rule?.renameType == 'copy' ? 'Copied' : 'Moved'} to: <span class="fixed">${this.request?.newPath}</span>
                    <span id="fileLink" @click="${e => filebridge.revealFile(this.request.newPath, this.request.newFilename)}">Reveal</span>
                </div>
            </div>
            <div class="error" ?hidden="${this.request?.error == null}">Error: ${this.request?.error}</div>
            <div class="times">
                <div>Start: ${moment(this.request?.requestTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                <div ?hidden="${this.request?.completeTime == null}">Complete: ${moment(this.request?.completeTime).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
            
        `;
    }

    private _getStatusIcon() {
        switch (this.request?.status) {
            case 'complete':
                return '../assets/status_complete.svg'
            case 'failed':
                return '../assets/status_error.svg'
            case 'active':
                return '../assets/status_active.svg'
            case 'pending':
                return '../assets/status_pending.svg'
            default:
                return null;
        }
    }
}
