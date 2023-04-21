
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileRenameRequest } from '../file/rename-request';
import './file-rename-view';


@customElement('request-list')
export class RequestList extends LitElement {
    static override styles = [
        css`
            :host {
               position: relative;
               flex: 1;
               display: flex;
               flex-direction: column;
               overflow: hidden;
            }

            *[hidden] {
                display: none !important;
            }
           

            :host([hidden]) {
                display: none;
            }

            .hide {
                display: none !important;
            }

            #importList {
                overflow-y: auto;
                overflow-x: hidden;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 8px;
            }

            #dropbox {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 300ms ease;;
            }
            
            #dropbox.small {
                flex: 0;
                padding: 8px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                min-height: 32px;
            }
            
            #dropbox.small .download {
                font-size: 24px;
                margin-right: 8px;
                margin-bottom: 0px;
                width: 32px !important;
                height: 32px !important;
            }

            .download {
                font-size: 96px;
                width: 96px;
                height: 96px;
                margin-bottom: 16px;
            }
        `
    ];

    @property()
    private requests: FileRenameRequest[] = [];

    override render() {
        let listTemplates = this._getListTemplates();

        return html`
            <div id="dropbox" class="section" ?hidden="${this.requests?.length > 0}">
                <img class="download" src="../assets/folder.svg" />
                <div>No files yet</div>
            </div>

            <div id="importList" ?hidden="${this.requests == null || this.requests?.length == 0}">${listTemplates}</div>
            
            <sl-button id="clearButton" class="hide" 
                ?disabled="${!this.hasClearableRequests()}"
                @click="${e => {
                console.log('clearing completed imports');
                this.requests = this.requests.filter((rr) => { return rr.status != 'complete' && rr.status != 'failed' })
                this.requestUpdate();
            }}">
                <sl-icon slot="prefix" name="eraser-fill"></sl-icon>
                Clear completed
            </sl-button>
        `;
    }

    private _getListTemplates() {
        let templates = [];

        this.requests?.forEach(r => {
            templates.push(html`
                <file-rename-view .request="${r}"></file-rename-view>
            `)
        })

        return templates;
    }

    private hasClearableRequests(): boolean {
        let hasClearable = false;
        this.requests.forEach(rr => {
            if (rr.status == 'complete' || rr.status == 'failed') {
                hasClearable = true;
                return;
            }
        })

        return hasClearable;
    }

    protected override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {

    }
}