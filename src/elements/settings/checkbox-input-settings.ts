import "@shoelace-style/shoelace/dist/components/checkbox/checkbox";
import "@shoelace-style/shoelace/dist/components/switch/switch";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
declare var settings: any;

@customElement('checkbox-input-setting')
export default class CheckboxInputSetting extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 1rem;
            transition: background-color 300ms ease;
            align-items: center;
            cursor: pointer;
        }

        :host(:hover) {
            background-color: rgba(0, 0, 0, 0.1);
        }

        .titles {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            margin-right: 1rem;
        }

        .row {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
        }

        sl-checkbox {
            margin-right: 16px;
        }
    
        .icon {
            margin-right: 1rem;
        }

        .title {
            font-size: var(--sl-font-size-medium);
            font-weight: var(--sl-font-weight-bold);
        }

        .subtitle {
            font-size: var(--sl-font-size-small);
            opacity: 0.7;
            max-width: 25rem;
            margin-top: .5rem;
        }

        *[hidden] {
            display: none !important;
        }
    `
    @property({ reflect: true })
    key: string;

    @property({ reflect: true })
    override title: string;

    @property({ reflect: true })
    subTitle: string;

    @property({ reflect: true })
    disabledSubTitle: string;

    @property({ reflect: true })
    enabledSubTitle: string;

    @property({ reflect: true })
    type: 'checkbox' | 'switch'

    @property({ reflect: true, type: Boolean })
    disabled: boolean = false;

    @property()
    icon: string;

    @property({ reflect: true, type: Boolean, attribute: 'checked' })
    isChecked: boolean = false;

    public override render() {
        let iconHtml = html``;
        if (this.icon != null) {
            iconHtml = html`<sl-icon slot="prefix" class="icon" name="${this.icon}"></sl-icon>`;
        }

        let inputHtml;
        if (this.type == 'checkbox') {
            inputHtml = html`<sl-checkbox id="input"
                ?disabled="${this.disabled}"
                ?checked="${this.isChecked}"
                @click="${this._onInputChange}"></sl-checkbox>`
        } else {
            inputHtml = html`<sl-switch id="input"
            ?disabled="${this.disabled}"
            ?checked="${this.isChecked}"
            @click="${this._onInputChange}"></sl-switch>`
        }

        let subtitleStr;
        if (this.isChecked) {
            subtitleStr = this.enabledSubTitle
        } else {
            subtitleStr = this.disabledSubTitle
        }

        if (this.subTitle) subtitleStr = this.subTitle;

        return html`
            <div class="titles">
                <div class="row">
                    ${iconHtml}
                    <div class="title">${this.title}</div>
                </div>
                <div ?hidden="${!subtitleStr}" class="subtitle">${unsafeHTML(subtitleStr)}</div>
            </div>

            ${inputHtml}
        `
    }

    override firstUpdated() {
        if (this.key) this.isChecked = settings.get(this.key);
        // (this.shadowRoot.getElementById('input') as any).checked = this.isChecked;
        this.shadowRoot.host.addEventListener('click', () => {
            this.shadowRoot.getElementById('input')?.click();
        })
    }

    _onInputChange(e: CustomEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        //save the changed data back to settings

        this.isChecked = !this.isChecked;
        console.log(`value for key ${this.key} was changed to ${this.isChecked}`);
        this._updateValue(this.isChecked);
    }

    _updateValue(value: boolean) {
        if (this.key) settings.set(this.key, value);
        this._notifyChange(value);
    }

    _notifyChange(value: boolean) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                key: this.key,
                value: value
            }
        }));
    }
}