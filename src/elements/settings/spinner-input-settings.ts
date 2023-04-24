import '@shoelace-style/shoelace/dist/shoelace';
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
declare var settings: any;


@customElement('spinner-input-setting')
export default class SpinnerInputSetting extends LitElement {
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
            margin-right: 1rem;
        }

        sl-select {
            min-width: 15em;
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
    @property({ reflect: false })
    key: string;

    @property({ reflect: false })
    override title: string;

    @property({ reflect: false })
    subTitle: string;

    @property({ reflect: false, attribute: false, type: Array<Value> })
    values: Value[];

    @property({ reflect: false, attribute: 'value' })
    selectedValue: string;

    @property({ reflect: true, type: Boolean })
    disabled: false;

    constructor() {
        super();

    }

    public override render() {
        let menuItemsHtml = this._getMenuItemsHtml();
        let subtitleText = this._getSubtitle();

        return html`
            <div class="titles">
                <div class="title">${this.title}</div>
                <div ?hidden="${!subtitleText}" class="subtitle">${subtitleText}</div>
            </div>

            <sl-select id="input" part="spinner"
                ?disabled="${this.disabled}"
                @sl-select="${this._onInputChange}"
                value="${this.selectedValue}">
                ${menuItemsHtml}        
            </sl-select>
        `
    }

    private _getSubtitle(): string {
        let subtitleText;
        if (this.subTitle) {
            subtitleText = this.subTitle;
        } else {
            let match = this.values?.filter(st => { return st.value === this.selectedValue })[0];
            subtitleText = match?.description;
        }

        return subtitleText;
    }

    private _getMenuItemsHtml() {
        let menuTemplates = [];

        if (this.values != null && this.values.length > 0) {
            for (const e of this.values) {
                menuTemplates.push(html`<sl-menu-item value="${e.value}">${e.name}</sl-menu-item>`);
            }
        }

        return menuTemplates;
    }

    override firstUpdated() {
        if (this.key) this.selectedValue = settings.get(this.key);

        (this.shadowRoot.getElementById('input') as any).value = this.selectedValue;
    }

    _onInputChange(e: CustomEvent) {
        console.log('input was changed');
        let item: any = e.currentTarget;
        //save the changed data back to settings
        let value = item.value;
        this._updateValue(value);
    }

    _updateValue(value: string) {
        if (this.key) settings.set(this.key, value);
        this._notifyChange(value);
        this.selectedValue = value;
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

export interface Value {
    name: string,
    value: string,
    description?: string
}