
class PendingImport extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.72/dist/themes/light.css" />
        <script type="module" src="../node_modules/@shoelace-style/shoelace/dist/shoelace.js"></script>
        <style>
            :host {
               position: relative;
               flex: 1;
            }
           

            :host([hidden]) {
                display: none;
            }

            #base {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                padding: 8px;
                border-bottom: 1px solid black;
                height: 60px;
                transition: 390ms all ease;
                overflow: hidden;
            }

            .data {
                margin-left: 16px;
                margin-right: 8px;
                flex: 1;
                overflow: hidden;
            }

            .hide {
                display: none !important;
            }

            #check {
                font-size: 32px;
            }

            #progress {
                --size: 32px;
                --track-width: 2px;
            }

            #spinner {
                font-size: 32px;
                --track-width: 2px;
            }

            .fail::part(base) {
                color: tomato;
            }

            sl-icon::part(base) {
                color: green;
            }

            sl-icon.small {
                font-size: 11pt;
                margin-right: 8px;
                width: 12pt;
                min-width: 12pt;
            }

            sl-icon.small::part(base) {
                color: grey;
            }

            .row {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                margin-bottom: 4px;
            }

            #name, #path, #label {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                font-size: 10pt;
            }

            #details {
                font-size: 9pt;
                color: tomato;
                cursor: pointer;
                margin-left: 8px;
            }
            
            
        </style>
        <div id="base">
            <div class="wrapper">
                <sl-spinner id="spinner"></sl-spinner>
                <sl-progress-ring id="progress" min="0" max="100"></sl-progress-ring>
                <sl-icon id="check" name="check"></sl-icon>
            </div>
            <div class="data">
                <div class="row"><sl-icon class="small" name="file-earmark-spreadsheet"></sl-icon><div id="name"></div></div>
                <div class="row"><sl-icon class="small" name="folder"></sl-icon><div id="path"></div></div>
                <div class="row">
                    <div id="label"></div>
                    <div id="details" class="hide">More details</div>
                </div>
            </div>
            
            <div id="icons">
                <sl-icon-button id="cancelButton" name="x-circle" label="Cancel"></sl-icon-button>
            </div>

        </div>
        `;

        this._status = 'failed';
        this._name = 'name';
        this._path = 'path';
        this._label = 'label';
        this._details = null;
        this._uuid = '';
        this._progress = 50;
        this._cancellable = true;

        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        setTimeout(() => {
            this._init();
        }, 100);
    }

    static get observedAttributes() {
        return [];
    }

    set uuid(uuid) {
        this._uuid = uuid;
    }

    get uuid() {
        return this._uuid;
    }

    set status(status) {
        this._status = status;
        this._updateStatus();
    }

    get status() {
        return this._status;
    }

    set progress(progress) {
        this._progress = progress;
        this._updateProgress();
    }

    get progress() {
        return this._progress;
    }

    set name(name) {
        this._name = name;
        this._updateName();
    }

    get name() {
        return this._name;
    }

    set path(path) {
        this._path = path;
        this._updatePath();
    }

    get path() {
        return this._path;
    }

    set label(label) {
        this._label = label;
        this._updateLabel();
    }

    get label() {
        return this._label;
    }

    set details(details) {
        this._details = details;
        this._showHideDetails();
    }

    get details() {
        return this._details;
    }

    set cancellable(cancellable) {
        this._cancellable = Boolean(cancellable);
        this._showHideCancelButtfon();
    }

    get cancellable() {
        return this._cancellable;
    }

    _init() {
        this.spinnerEl = this.shadowRoot.getElementById('spinner');
        this.checkEl = this.shadowRoot.getElementById('check');
        this.progressEl = this.shadowRoot.getElementById('progress');
        this.nameEl = this.shadowRoot.getElementById('name');
        this.pathEl = this.shadowRoot.getElementById('path');
        this.statusEl = this.shadowRoot.getElementById('status');
        this.labelEl = this.shadowRoot.getElementById('label');
        this.detailsEl = this.shadowRoot.getElementById('details');
        this.detailsEl.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('show-details', {detail: this._details}));
        })
        this.cancelButtonEl = this.shadowRoot.getElementById('cancelButton');
        this.cancelButtonEl.addEventListener('click', () => {
            if (this._status == 'pending') {
                this.dispatchEvent(new CustomEvent('cancel', {detail: this._uuid}));
            } else {
                let base = this.shadowRoot.getElementById('base');
                base.style.transform = 'translateX(100%)';
                base.style.opacity = 0;
                setTimeout(() => {
                    base.style.height = '0px';
                    base.style.padding = '0'
                    setTimeout(() => {
                        this.remove();
                    }, 300);
                }, 300);
                
            }
        });

        this._initComplete = true;

        this._updateStatus();
        this._updateProgress();
        this._updateName();
        this._updatePath();
        this._updateLabel();
        this._showHideCancelButton();
    }

    _updateStatus() { 
        if (!this._initComplete) return;

        switch(this._status) {
            case 'pending':
                this.progressEl.classList.add('hide');
                this.checkEl.classList.add('hide');
                
                this.cancelButtonEl.classList.remove('hide');
                this.cancelButtonEl.name = "x-circle";
                this.spinnerEl.classList.remove('hide');
            break;
            case 'active':
                this.spinnerEl.classList.add('hide');
                this.checkEl.classList.add('hide');
                this.cancelButtonEl.classList.add('hide');

                this.progressEl.classList.remove('hide');
            break;
            case 'complete':
                this.progressEl.classList.add('hide');
                this.spinnerEl.classList.add('hide');
                this.cancelButtonEl.classList.remove('hide');
                this.cancelButtonEl.name = 'trash';

                this.checkEl.classList.remove('hide');
                this.checkEl.classList.remove('fail');
                this.checkEl.name = 'check';

            break;
            case 'failed':
                this.progressEl.classList.add('hide');
                this.spinnerEl.classList.add('hide');
                this.cancelButtonEl.classList.remove('hide');
                this.cancelButtonEl.name = 'trash';

                this.checkEl.classList.remove('hide');
                this.checkEl.classList.add('fail');
                this.checkEl.name = 'exclamation-diamond';
            break;
        }
    }

    _updateProgress() {
        if (!this._initComplete) return;
        this.progressEl.value = this._progress;
    }

    _updateLabel() {
        if (!this._initComplete) return;
        this.labelEl.innerHTML = this._label;
    }

    _updateName() {
        if (!this._initComplete) return;
        this.nameEl.innerHTML = this._name;
    }

    _updatePath() {
        if (!this._initComplete) return;
        this.pathEl.innerHTML = this._path;
    }

    _showHideCancelButton() {
        if (!this._initComplete) return;
        if (this._cancellable) {
            this.cancelButtonEl.classList.remove('hide');
        } else {
            this.cancelButtonEl.classList.add('hide');
        }
    }

    _showHideDetails() {
        if (!this._initComplete) return;
        if (this._details != null) {
            this.detailsEl.classList.remove('hide');
        } else {
            this.detailsEl.classList.add('hide');
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        let hasValue = newValue !== null;

    }

   
}

customElements.define("pending-import", PendingImport);