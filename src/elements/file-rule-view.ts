import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileRule } from '../file/file-rule';

@customElement('file-rule-view')
export class FileRuleView extends LitElement {

    @property({ type: Object })
    rule: FileRule = null;

    static override styles = [
        css`
            :host {
                display: block;
                border: 1px solid rgba(0, 0, 0, 0.2);
                border-radius: .2em;
                padding: 1em;
                background-color: white;
            }

            .info {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                flex: 1;
            }

            sl-icon-button {
                align-self: center;
            }

            .row {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
            }

            .id {
                opacity: 0.7;
                font-size: 0.7em;
                margin-top: 1em;
            }

            .title {
                font-size: 1.1em;
                font-weight: bold;
            }

            .description {
                opacity: 0.85;
            }

        `
    ];

    override render() {
        return html`
            <div class="row">
                <div class="info">
                    <div class="title">${this.rule?.name}</div>
                    <div class="description">${this.rule?.description}</div>
                    <div style="flex: 1"></div>
                    <div class="id field">${this.rule?.id}</div>
                </div>
                <sl-icon-button name="gear" label="Settings" @click="${(e) => {
                this.dispatchEvent(new CustomEvent('edit', { detail: this.rule }))
            }}"></sl-icon-button>
            </div>
        `;
    }

    private _notifyChange() {
        this.dispatchEvent(new CustomEvent('change'));
    }
}
