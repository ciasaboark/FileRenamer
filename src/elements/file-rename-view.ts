import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileRenameRequest } from '../file/rename-request';
import moment = require('moment');

@customElement('file-rename-view')
export class FileRenameView extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
                width: -webkit-fill-available;
                padding: 8px;
                border-bottom: 1px solid gray;
            }

            .icon {
                margin: .5em 1.5em .5em .5em;
                width: 3em;
                height: 3em;
            }

            .large {
                font-size: 1.3em;
                font-weight: bold;
            }

            .fixed {
                font-family: monospace;
            }

            .row {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .col {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                flex: 1;
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
        `
    ];

    @property({ type: Object })
    request: FileRenameRequest = null;

    override render() {
        return html`
            <div class="row">
                <img class="icon" src="${this._getStatusIcon()}" />
                <div class="col">
                    <div class="large fixed">${this.request?.originalFilename}</div>
                    <div ?hidden="${this.request?.newFilename == null}">
                        Renamed to: <span class="fixed">${this.request?.newFilename}</span>
                    </div>
                    <div ?hidden="${this.request?.newPath == null}">
                        Moved to: <span class="fixed">${this.request?.newPath}</span>
                    </div>
                    <div>${this.request?.newPath}</div>

                </div>
            </div>
            <div class="times">
                <div>Start: ${moment(this.request?.requestTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                <div ?hidden="${this.request?.completeTime == null}">Complete: ${moment(this.request?.completeTime).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
            <div class="error" ?hidden="${this.request?.error == null}">Error: ${this.request?.error}</div>
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
