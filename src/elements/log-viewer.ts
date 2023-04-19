
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('log-viewer')
export class LogViewer extends LitElement {
    static override styles = [
        css`
            :host {
               position: relative;
               flex: 1;
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

            #content {
                overflow-y: auto;
                overflow-x: hidden;
                padding: 0 8px 0 8px;
                font-family: SourceCodePro-VariableFont_wght, 'Consolas', monospace;
                font-size: 9pt;
            }

            header {
                padding: 8px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
        `
    ];

    @state()
    private lines: string[] = [];

    override render() {
        return html`
            <header>
                <sl-checkbox id="checkbox" checked>Autoscroll</sl-checkbox>
                <sl-icon-button id="clearButton" name="eraser-fill" @click="${e => {this.lines = []; this.requestUpdate();}}"></sl-icon-button>
            </header>
            <div id="content">
            </div>
        `;
    }

    addLine(line) {
        this.lines.push(line);
        this.requestUpdate();
    }
}