
class AssigneeUser extends HTMLElement {
    constructor(assignee) {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.72/dist/themes/light.css" />
        <script type="module" src="../node_modules/@shoelace-style/shoelace/dist/shoelace.js"></script>
        <style>
            :host {
               position: relative;
            }
           

            :host([hidden]) {
                display: none;
            }

            #base {
                display: flex;
                flex-direction: row;
                border-radius: 5px;
                border: 1px solid #1f6762;
                padding: 8px;
                align-items: center;
                background-color: rgb(255, 255, 255);
                box-shadow: 0 3px 5px rgb(100 100 100 / 50%);
            }

            #details {
                padding-left: 16px;
                padding-right: 16px;
                flex: 1;
            }

            #groups {
                display: flex;
                flex-direction: row;
            }

            #icons {
                display: flex;
                flex-direction: row;
            }
             
            h3 {
                font-size: 12pt;
                margin: 0 0 16px 0;
            }

            h4 {
                font-size: 10pt;
                margin: 0 0 8px 0;
            }

            #updatedAt {
                color: grey;
                font-size: 7pt;
            }
            
        </style>
        <div id="base">
            <sl-avatar id="avatar"></sl-avatar>
            <div id="details">
                <h3>Name: <span id="name"></h3>
                <h4>ID: <span id="id"></h4>
                <h4>Company: <span id="company"></h4>
                <div class="row">
                    <div id="groups">

                    </div>
                    <span id="updatedAt"></span>
                </div>
            </div>
            <div id="icons">
                <sl-icon-button id="deleteButton" name="trash" label="Delete"></sl-icon-button>
                <sl-icon-button id="editButton" name="pencil" label="Edit"></sl-icon-button>
            </div>

        </div>
        `;

        this._assignee = assignee;

        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        setTimeout(() => {
            this._init();
            this._fillData();
        }, 100);
    }

    static get observedAttributes() {
        return [];
    }

    set assignee(assignee) {
        this._assignee = assignee;
        this._fillData();
    }

    get assignee() {
        return this._assignee;
    }

    _fillData() {
        let name = this.shadowRoot.getElementById('name');
        let id = this.shadowRoot.getElementById('id');
        let company = this.shadowRoot.getElementById('company');
        let updatedAt = this.shadowRoot.getElementById('updatedAt');

        this._setData(name, 'Name');
        this._setData(id, 'AssigneeId');
        this._setData(company, 'Company');
        this._setData(updatedAt, 'UpdatedOnUTC');

        this._setGroups();
    }

    _init() {
        let deleteButton = this.shadowRoot.getElementById('deleteButton');
        deleteButton.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('delete', {detail: this._assignee.Id, bubbles: true}));
        });

        let editButton = this.shadowRoot.getElementById('editButton');
        editButton.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('edit', {detail: this._assignee.Id, bubbles: true}));
        });
    }

    _setData(el, property) {
        el.innerHTML = '';
        if (this._assignee != null) {
            if (this._assignee[property] != null) {
                el.innerHTML = this._assignee[property];
            }
        }
    }

    _setGroups() {
        let groups = this.shadowRoot.getElementById('groups');
        groups.innerHTML = '';
        if (this._assignee && this._assignee.AssigneeGroups) {
            for (var i = 0; i < this._assignee.AssigneeGroups.length; i++) {
                let g = this._assignee.AssigneeGroups[i];
                let badge = document.createElement('sl-badge');
                badge.variant = 'primary';
                badge.innerHTML = g;
                groups.appendChild(badge);
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        let hasValue = newValue !== null;

    }

   
}

customElements.define("assignee-user", AssigneeUser);