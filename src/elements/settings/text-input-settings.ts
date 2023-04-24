import '@shoelace-style/shoelace/dist/components/input/input';
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Settings } from "../context-bridge-interface";
declare var settings: Settings;

@customElement('text-input-setting')
export default class TextInputSetting extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 1rem;
            transition: background-color 300ms ease;
        }

        .titles {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            margin-bottom: 1rem;
        }
    
        .icon {
            margin-right: 8px;
        }

        .title {
            font-size: var(--sl-font-size-medium);
            font-weight: var(--sl-font-weight-bold);
            vertical-align: baseline;
        }

        .small {
            font-size: 0.6em;
            margin-left: 1em;
        }

        a:hover {
            cursor: pointer;
        }

        .subtitle {
            font-size: var(--sl-font-size-small);
            opacity: 0.7;
            
            margin-top: .5rem;
        }

        .help-message {
            color: tomato;
        }

        .input-wrapper {
            display: flex;
            flex-direction: column;
        }

        :host()
        sl-input::part(base) {
            max-width: 17em;
        }

        :host([type=number])
        sl-input::part(base) {
            max-width: 10em;
        }

        

        *[hidden] {
            display: none !important;
        }

        a {
            text-decoration: none;
            color: var(--sl-color-primary-800);
        }

        a:visited {
            color: var(--sl-color-primary-800);
        }
    `
    @property({ reflect: true })
    key: string;

    @property({ reflect: true })
    override title: string;

    @property({ reflect: true })
    subTitle: string;

    @property({ reflect: true })
    value: string;

    @property({ reflect: true, type: Boolean })
    disabled: boolean = false;

    //The type property should conform to the allowed types for
    //+ the SLInput element
    @property({ reflect: true })
    type: "number" | "date" | "datetime-local" | "email" | "password" | "search" | "tel" | "text" | "time" | "url";


    /**
     * Min and max values only apply if the type is numeric
     */
    @property({ reflect: true })
    min: number;

    @property({ reflect: true })
    max: number;

    @property()
    icon: string;

    @property({ reflect: false })
    pattern: string

    @property({ reflect: true })
    placeholder: string;

    @property({ type: Boolean, reflect: true })
    invalid: boolean = false;

    @property()
    helpMessage: string;

    @property()
    suffix: string;

    @property({ type: Boolean })
    markdownSupported: boolean = false;


    constructor() {
        super();
        this.type = "text"
        this.placeholder = ""
    }

    public override render() {
        let iconHtml = html``;
        if (this.icon != null) {
            iconHtml = html`<sl-icon slot="prefix" class="icon" name="${this.icon}"></sl-icon>`;
        }

        let helpHtml = html``;
        if (this.invalid) {
            helpHtml = html`<span class="help-message">${this.helpMessage}</span>`;
        }

        return html`
            <div class="titles">
                <div class="title">
                    <span>${this.title}</span>
                </div>
                <div ?hidden="${!this.subTitle}" class="subtitle">${unsafeHTML(this.subTitle)}</div>
            </div>
            <div class="input-wrapper" part="input">
                <sl-input id="input"
                    type="${this.type}"
                    @sl-change="${this._onInputChange}"
                    @sl-clear="${e => this._updateValue("")}"
                    pattern="${this.pattern}"
                    ?disabled="${this.disabled}"
                    placeholder="${this.placeholder}"
                    value="${this.value}"
                    min="${this.min}"
                    max="${this.max}">
                    ${iconHtml}
                    <span slot="suffix">${this.suffix}</span>
                </sl-input>
                ${helpHtml}
            </div>
        `
    }

    override firstUpdated() {
        if (this.key) this.value = settings.get(this.key);
        if (this.value != null) {
            (this.shadowRoot.getElementById('input') as SlInput).value = this.value;
        }

        // this._validateInput(this.data);
    }

    _onInputChange(e: CustomEvent) {
        console.log('input was changed');
        //save the changed data back to settings
        let input = (this.shadowRoot.getElementById('input') as SlInput);
        let value: any = input.value;
        if (this.pattern != null) {
            if (!this._validateInput(value)) {
                console.log('pattern did not match')
                this.invalid = true;
            } else {
                console.log('pattern match passed')
                this._updateValue(value);
                this.invalid = false;
            }
        } else {
            //sl-input does not prevent user from typing numeric values outside allowed range
            if (this.type == 'number') {
                if (this.max != null) value = Math.min(value, this.max);
                if (this.min != null) value = Math.max(value, this.min);
                input.value = value;
            }
            this._updateValue(value);
        }
    }

    _validateInput(value: string) {
        let isValid = false;
        let regExp: RegExp = new RegExp(this.pattern, 'g');
        isValid = regExp.test(value);

        return isValid;
    }

    _updateValue(value) {
        if (this.type === 'number') {
            value = parseFloat(value);
        }
        if (this.key) settings.set(this.key, value);
        this._notifyChange(value);
        this.value = value;
    }

    _notifyChange(value: string) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                key: this.key,
                value: value
            }
        }));
    }
}