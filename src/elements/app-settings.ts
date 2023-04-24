import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';
import { FileRule } from '../file/file-rule';
import { API, Dialog, FileBridge, Log, Settings } from './context-bridge-interface';
import './file-rule-editor';
import './file-rule-view';
import './settings/checkbox-input-settings';
declare const settings: Settings, log: Log, dialog: Dialog, api: API, filebridge: FileBridge;
import _ = require('lodash');


@customElement('app-settings')
export class AppSettings extends LitElement {
    static override styles = [
        css`
            :host {
               position: relative;
               display: flex;
               flex-direction: column;
               overflow: hidden;
               flex: 1;
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

            .list {
                height: 100%;
                overflow: auto;
                display: flex;
                flex-direction: column;
                padding: 1em;
                gap: 0.5em;
            }

            .option {
                padding: 1rem 1rem 0 1rem;
            }

            .title {
                font-size: var(--sl-font-size-medium);
                font-weight: var(--sl-font-weight-bold);
                margin-bottom: 1em;
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

            sl-dialog::part(panel) {
                width: min(80%, 40em);
            }

            .empty-list-warning {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1em;
            }

            .empty-list-warning .label {
                font-size: 1.2em;
                font-weight: bold;
            }

            .err {
                color: tomato;
                margin-right: 2em;
            }
        `
    ];

    @state()
    private defaultRule: FileRule;

    @state()
    private rules: FileRule[] = []

    @state()
    private editRule: FileRule;

    @state()
    private isEditLocked: boolean = false;

    /** Should some parts of the editor be locked (editing default rule) */
    @state()
    private canEditorSave: boolean = false;

    @state()
    private canEditorDelete: boolean = false;

    @state()
    private editorErrMsg: string = 'Some error message';

    override render() {
        let ruleListTemplates = this._getRuleListTemplates();

        return html`
            <checkbox-input-setting
                key="options.autostart"
                title="Automatically start at login"
                ></checkbox-input-setting>

            <checkbox-input-setting
                key="options.overwrite"
                title="Overwrite existing files"
                enabledsubtitle="Existing files will be overwritten without warning"
                disabledsubtitle="Will be prompted before overwrite existing files"
                ></checkbox-input-setting>

            <div class="option">
                <div class="title">Fallback Rule</div>
                <file-rule-view
                    .rule=${this.defaultRule}
                    @edit="${(e: CustomEvent) => { this._editRule(e.detail, true) }}"
                ></file-rule-view>
            </div>
            
            <div class="option" style="display: flex; flex-direction:row; align-items: center; justify-content: space-between">
                <div class="title">Specialty Rules</div>
                <sl-button size="small" @click="${this._createRule}">Create Rule</sl-button>
            </div>

            <div class="empty-list-warning" ?hidden="${this.rules?.length > 0}">
                <img src="../assets/no_rules.svg" />
                <div class="label">No rules defined</div>
            </div>
            
            <div class="list" ?hidden="${this.rules?.length == 0}">
                ${ruleListTemplates}
            </div>

            <sl-dialog id="editDialog" label="Edit Rule"
                @sl-show="${(e) => console.log('edit dialog show()')}"
                @sl-after-hide="${(e: CustomEvent) => {
                //event can also be fired from internal dialogs
                if (e.currentTarget != e.target) return;
                console.log('edit dialog hide()')
                this.editRule = null;
                this.isEditLocked = false;
                this.canEditorSave = false;
                this.canEditorDelete = false;
                this.editorErrMsg = null;
            }}">
                <file-rule-editor .rule="${this.editRule}" ?locked="${this.isEditLocked}" @change="${this._onEditorChange}"></file-rule-editor>
                <div slot="footer" style="display: flex; flex-direction: row; align-items: center;">
                    <div class="err" slot="footer">${this.editorErrMsg}</div>
                    <span style="flex:1"></span>
                    <sl-button style="margin-bottom: 0; margin-left: 1em;" variant="danger" @click="${this._confirmDelete}" ?hidden="${!this.canEditorDelete}">Delete</sl-button>
                    <sl-button style="margin-bottom: 0; margin-left: 1em;" variant="primary" @click="${this._saveEditRule}" ?disabled="${!this.canEditorSave}">Save Changes</sl-button>
                </div>
            </sl-dialog>

            <sl-dialog id="confirmDeleteDialog" label="Delete Rule">
                Are you sure you want to delete this rule?  This action cannot be undone.
                <sl-button slot="footer" variant="danger" @click="${this._deleteEditRule}">Delete</sl-button>
            </sl-dialog>
        `;
    }

    private _getRuleListTemplates() {
        let templates = [];

        this.rules?.forEach(r => {
            let t = this._getRuleTemplate(r);
            templates.push(t);
        })

        return templates;
    }

    private _getRuleTemplate(rule: FileRule) {
        return html`
            <file-rule-view
                .rule=${rule}
                @edit="${(e: CustomEvent) => { this._editRule(e.detail, false) }}"
            ></file-rule-view>
        `
    }

    private _onEditorChange(e: CustomEvent) {
        let rule: FileRule = e.detail;

        this._validateRule(rule);
    }

    private _validateRule(rule: FileRule) {
        this.canEditorSave = true;
        this.editorErrMsg = null;


        if (rule.name == null || rule.name.length == 0) {
            this.editorErrMsg = "Rule name missing";
            this.canEditorSave = false;
            return;
        }

        if (rule.matchType !== 'all' && (rule.matchStr == null || rule.matchStr.length == 0)) {
            this.editorErrMsg = 'Rule match text missing';
            this.canEditorSave = false;
            return;
        }

        if (rule.destinationPath == null || rule.destinationPath.length == 0) {
            this.editorErrMsg = "Destination path missing"
            this.canEditorSave = false;
            return;
        }

        if (!filebridge.exists(rule.destinationPath)) {
            this.editorErrMsg = "Destination path does not exist";
            this.canEditorSave = false;
            return;
        }

        if (rule.renamePattern == null || rule.renamePattern.length == 0) {
            this.editorErrMsg = "Rename pattern missing";
            this.canEditorSave = false;
            return;
        }
    }

    private _confirmDelete(e: CustomEvent) {
        let dialog = this.shadowRoot.getElementById('confirmDeleteDialog') as any;
        dialog.show();
    }

    private _deleteEditRule(e: CustomEvent) {
        if (this.editRule?.id == null) return;

        this.rules = this.rules.filter(r => { return r.id !== this.editRule.id });
        this._persistRules();
        let confirmDialog = this.shadowRoot.getElementById('confirmDeleteDialog') as any;
        confirmDialog.hide();
        let editDialog = this.shadowRoot.getElementById('editDialog') as any;
        editDialog.hide();
    }

    private _saveEditRule(e: CustomEvent) {
        //This could be called either from editing an existing rule or when a new rule is created.

        if (this.editRule.id == null) {
            //this was a new rule.  Just tack it onto the end of the existing rule set
            this.editRule.id = uuidv4();
            this.rules.push(this.editRule);
        } else {
            //If we were editing an existing rule, then replace it in the same index
            let inserts = [this.editRule];
            this.rules = this.rules.map(rule => inserts.find(r => r.id === rule.id) || rule);
        }

        this._persistRules();

        let editDialog = this.shadowRoot.getElementById('editDialog') as any;
        editDialog.hide();
    }

    private _createRule() {
        this.editRule = {
            id: null,
            name: 'New Rule',
            description: '',
            matchType: 'all',
            matchStr: '',
            includePath: false,
            destinationPath: null,
            renameType: 'copy',
            renamePattern: null
        }

        this.isEditLocked = false;
        this.canEditorSave = false;
        this.canEditorDelete = false;
        this.editorErrMsg = 'Rename pattern missing'

        let dialog = this.shadowRoot.getElementById('editDialog') as any;
        dialog.show();
    }

    private _editRule(rule: FileRule, isDefault: boolean) {
        let dialog = this.shadowRoot.getElementById('editDialog') as any;
        this.canEditorSave = false;
        //make a copy of the rule so that we can edit without immediately applying changes
        this.editRule = _.merge({}, rule);
        this.isEditLocked = isDefault;
        this.canEditorDelete = !isDefault;
        this._validateRule(this.editRule);
        dialog.show();
    }

    protected override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this._updateRules();
        api.receive('rules-updated', () => {
            this._updateRules();
        })
    }

    private _updateRules() {
        this.defaultRule = settings.get('rules.defaultRule');
        this.rules = settings.get('rules.rules');
    }

    private _persistRules() {
        settings.set('rules.rules', this.rules);
        settings.set('rules.default', this.defaultRule);
        this.requestUpdate();
    }


}