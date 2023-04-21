import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

@customElement('file-rule-editor')
export class FileRuleEditor extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    override render() {
        return html`
            <sl-select @sl-change="${(e: CustomEvent) => {}}">
                <sl-option value="contains">Contains</sl-option>
                <sl-option value="equals">Equals</sl-option>
                <sl-option value="regex">Regex</sl-option>
            </sl-select>
            
        `;
    }
}
