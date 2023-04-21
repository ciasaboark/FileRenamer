import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { FileRule } from '../file/file-rule';
import { Dialog, Log, Settings } from './context-bridge-interface';
declare const settings: Settings, log: Log, dialog: Dialog;

import './file-rule-editor';
import './file-rule-view';
import './settings/checkbox-input-settings';

@customElement('app-settings')
export class AppSettings extends LitElement {
    static override styles = [
        css`
            :host {
               position: relative;
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

            .list {
                height: 100%;
                overflow: auto;
                display: flex;
                flex-direction: column;
                padding: 0.25em;
                gap: 0.25em;
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
        `
    ];

    @state()
    private defaultRule: FileRule;

    @state()
    private rules: FileRule[] = []

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
            
            <div class="option">
                <div class="title">Specialty Rules</div>
            </div>
            <div class="list">
                ${ruleListTemplates}
            </div>
        `;
    }

    private _getRuleListTemplates() {
        let templates = [];

        this.rules = [this.defaultRule, this.defaultRule, this.defaultRule, this.defaultRule, this.defaultRule, this.defaultRule, this.defaultRule, this.defaultRule]

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

    private _editRule(rule: FileRule, isDefault: boolean) {

    }

    protected override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this._updateRules();
    }

    private _updateRules() {
        this.defaultRule = settings.get('rules.defaultRule');
        this.rules = settings.get('rules.rules');
    }


}