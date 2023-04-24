import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileRule } from '../file/file-rule';
import './settings/folder-input-settings';
import './settings/settings-section';
import './settings/spinner-input-settings';
import './settings/text-input-settings';

@customElement('file-rule-editor')
export class FileRuleEditor extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
            }

            *[hidden] {
                display: none !important;
            }

            settings-section {
                margin-bottom: 1em;
                margin-top: 1em;
            }
        `
    ];

    @property({ type: Object })
    rule: FileRule;

    @property({ type: Boolean })
    locked: boolean = false;


    override render() {
        return html`

            <text-input-setting
                title="Rule Name"
                value="${this.rule?.name}"       
                type="text"     
                @change="${(e: CustomEvent) => {
                this.rule.name = e.detail.value;
                this.requestUpdate();
                this.notifyChange();
            }}"
            ></text-input-setting>

            <text-input-setting
                title="Description"
                value="${this.rule?.description}"       
                type="text"     
                @change="${(e: CustomEvent) => {
                this.rule.description = e.detail.value;
                this.requestUpdate();
                this.notifyChange();
            }}"
            ></text-input-setting>

            <settings-section label="Matching Options">
                <spinner-input-setting
                    title="Match Type"
                    ?disabled="${this.locked}"
                    .values='${[
                { "name": "Contains", "value": "contains", "description": "Match any file that contains the text" },
                { "name": "Equals", "value": "equals", "description": "Match any file that exactly matches the text" },
                { "name": "Regex", "value": "regex", "description": "Match any file that matches by regex" },
                { "name": "All", "value": "all", "description": "Match all files" }
            ]}'    
                    value="${this.rule?.matchType}"            
                    @change="${(e: CustomEvent) => {
                this.rule.matchType = e.detail.value;
                this.requestUpdate();
                this.notifyChange();
            }}"
                ></spinner-input-setting>

                <text-input-setting
                    title="Match Text"
                    ?hidden="${this.rule?.matchType === 'all'}"
                    value="${this.rule?.matchStr}"       
                    type="text"     
                    @change="${(e: CustomEvent) => {
                this.rule.matchStr = e.detail.value;
                this.requestUpdate();
                this.notifyChange();
            }}"
                ></text-input-setting>

                <checkbox-input-setting
                    title="Include File Path"
                    ?hidden="${this.rule?.matchType === 'all'}"
                    enabledsubtitle="The entire file path will be matched.<br />Ex: 'C:&#47Some Folder&#47Some File.txt'"
                    disabledsubtitle="Only the filename will be matched<br />Ex: 'Some File.txt'"
                    ?checked="${this.rule?.includePath}"
                    @change="${(e: CustomEvent) => {
                this.rule.includePath = e.detail.value;
                this.requestUpdate();
                this.notifyChange();
            }}"
                    ></checkbox-input-setting>
            </settings-section>

            <settings-section label="Rename Options">

                <spinner-input-setting
                    title="Rename Type"
                    .values='${[
                { "name": "Copy", "value": "copy", "description": "Original file will be left intact" },
                { "name": "Move", "value": "move", "description": "Original file will be deleted after the copy is complete" }
            ]}'    
                    value="${this.rule?.renameType}"            
                    @change="${(e: CustomEvent) => {
                this.rule.renameType = e.detail.value;
                this.requestUpdate();
                this.notifyChange();
            }}"
                ></spinner-input-setting>

                <folder-input-setting
                    title="Destination"
                    value="${this.rule?.destinationPath}"
                    @change="${(e: CustomEvent) => {
                this.rule.destinationPath = e.detail.value;
                this.requestUpdate();
                this.notifyChange()
            }}"
                ></folder-input-setting>

                <text-input-setting
                    title="Rename Pattern"
                    value="${this.rule?.renamePattern}"       
                    type="text"     
                    @change="${(e: CustomEvent) => {
                this.rule.renamePattern = e.detail.value;
                this.requestUpdate();
                this.notifyChange();
            }}"
                ></text-input-setting>
            </settings-section>


            
        `;
    }

    private notifyChange() {
        this.dispatchEvent(new CustomEvent('change', { detail: this.rule }));
    }
}
