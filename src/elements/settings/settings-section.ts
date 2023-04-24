import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('settings-section')
export class SettingsSection extends LitElement {
    static override styles = [
        css`
            :host {
                background-color: white;
                border: 1px solid rgba(159, 159, 159, 0.32);
                border-radius: 3px;
                margin: 0em 1em;
                /* padding: 1em; */
                width: -webkit-fill-available;
                max-width: 45rem;
                align-self: center;
                display: block;
                min-height: fit-content;
                position: relative;
            }

            :host([hidden]) {
                display: none;
            }

            .label {
                left: 0.5em;
                position: absolute;
                top: -0.5em;
                background: #e6eefc;
                border: 1px solid rgba(159, 159, 159, 0.32);
                padding: 0 0.5em;
                border-radius: 3px;
            }

            .spacer {
                height: 1em;
            }

            /* ::slotted(:not(:first-child)) {
                margin-top: .5em;
            } */
        `
    ];

    @property()
    label: string;

    override render() {
        return html`
            <div class="label">${this.label}</div>
            <div class="spacer"></div>
            <slot></slot>
        `;
    }
}