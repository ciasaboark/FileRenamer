
import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { FileRenameRequest } from './types';


@customElement('import-list')
export class ImportList extends LitElement {
    static override styles = [
        css`
            :host {
               position: relative;
               flex: 1;
               display: flex;
               flex-direction: column;
               overflow: hidden;
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

    @state()
    private renameRequests: FileRenameRequest[] = [];

    override render() {
        return html`
            <div id="dropbox" class="section">
            <img class="download" src="assets/pallet.png" />
            <div>Drop files here to rename</div>
            </div>
            <div id="importList" class="hide"></div>
            <sl-button id="clearButton" class="hide" 
                ?disabled="${!this.hasClearableRequests()}"
                @click="${e => {
                    console.log('clearing completed imports');
                    this.renameRequests = this.renameRequests.filter((rr) => {return rr.status != 'complete' && rr.status != 'failed'})
                    this.requestUpdate();
                }}">
                <sl-icon slot="prefix" name="eraser-fill"></sl-icon>
                Clear completed
            </sl-icon-button>
        `;
    }

    private hasClearableRequests(): boolean {
        let hasClearable = false;
        this.renameRequests.forEach(rr => {
            if (rr.status == 'complete' || rr.status == 'failed') {
                hasClearable = true;
                return;
            }
        })

        return hasClearable;
    }

    protected override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        let _importListEl = this.shadowRoot.getElementById('importList');
        let changeObserver = new MutationObserver((e) => {
            let dropbox = this.shadowRoot.getElementById('dropbox');
            if (_importListEl.children.length > 0) {
                dropbox.classList.add('small');
                _importListEl.classList.remove('hide');
            } else {
                dropbox.classList.remove('small');
                _importListEl.classList.add('hide');
            }
        });

        changeObserver.observe(_importListEl, { childList: true });

        this._initIpcListeners();
    }

    private _initIpcListeners() {
        window.ipcRenderer.on('import-start', (e, uuid) => {
            window.log.debug(`start import ${uuid}`);
            let importEl = this.shadowRoot.querySelector(`#import-${uuid}`);
            if (importEl) {
                importEl.status = 'active';
                importEl.label = "Importing...";
                importEl.progress = 0;
            }
        });


        window.ipcRenderer.on('import-removed', (e, uuid) => {
            window.log.debug(`import removed ${uuid}`);
            let importEl = this.shadowRoot.querySelector(`#import-${uuid}`);
            if (importEl) {
                importEl.remove();
                this._showHideClearButton();
            }
        });

        window.ipcRenderer.on('import-progress', (e, uuid, progress) => {
            window.log.debug(`import progress ${uuid}`);
            let importEl = this.shadowRoot.querySelector(`#import-${uuid}`);
            if (importEl) {
                importEl.status = 'active';
                importEl.label = "Importing...";
                importEl.progress = progress;
                this._scrollTo(importEl);
                this._showHideClearButton();
            }
        });

        window.ipcRenderer.on('import-complete', (e, uuid) => {
            window.log.debug(`import complete ${uuid}`);
            let importEl = this.shadowRoot.querySelector(`#import-${uuid}`);
            if (importEl) {
                importEl.status = 'complete';
                importEl.label = 'Complete!';
                importEl.progress = 100;
                this._scrollTo(importEl);
                this._showHideClearButton();
            }
        })
    
        window.ipcRenderer.on('import-failed', (e, uuid, errMsg, errDetails) => {
            window.log.debug(`import error ${uuid}`);
            let importEl = this.shadowRoot.querySelector(`#import-${uuid}`);
            if (importEl) {
                importEl.status = 'failed';
                importEl.label = errMsg;
                importEl.details = errDetails;
                importEl.progress = 100;
                this._scrollTo(importEl);
                this._showHideClearButton();
            }
        })
    }

    public addItem(item) {
        this._importListEl.appendChild(item);
    }
}


//     _showHideClearButton() {
//         let pendingImports = Array.from(this.shadowRoot.querySelectorAll('pending-import'));
//         let completedImports = pendingImports.filter(pi => {
//             return pi.status == 'complete' || pi.status == 'failed'
//         });
//         let clearButton = this.shadowRoot.getElementById('clearButton');
//         if (completedImports.length > 0) {
//             clearButton.classList.remove('hide');
//         } else {
//             clearButton.classList.add('hide');
//         }
//     }

//     _scrollTo(el) {
//         el.scrollIntoView({behavior: 'smooth'});
//     }

//     attributeChangedCallback(name, oldValue, newValue) {
//         let hasValue = newValue !== null;

//     }

   
// }

// customElements.define("import-list", ImportList);


