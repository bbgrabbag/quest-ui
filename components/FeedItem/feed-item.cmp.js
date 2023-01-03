import { _Component } from "../lib.js";

export class FeedItem extends _Component {
    static tagName = 'feed-item';
    static get observedAttributes() { return ['text', 'type'] }


    constructor() {
        super();
        this.css = {
            extends: ['assets/css/global.css'],
            styles: `
                div code {
                    white-space: break-spaces;
                }
                div code.transcription {
                    background: var(--primary);
                }
                div code.answer {
                    background: var(--secondary);
                }
                div.margin-r {
                    margin-right:15%;
                }
                div.margin-l {
                    margin-left:15%;
                }
        `
        }
    }

    handleTextChange(text){
        this.elements.text.innerText = text;
    }

    onAttrChange(attr, prev, curr){
        switch(attr){
            case 'text': 
                return this.handleTextChange(curr)
        }
    }

    render() {
        const text = this.getAttribute('text');
        const type = this.getAttribute('type')
        const justify = type == 'answer' ? '' : 'justify-right';
        const background = type == 'answer' ? 'answer' : 'transcription';
        const margin = type == 'answer' ? 'margin-r' : 'margin-l';

        return `
            <div key="type"class="flex ${justify} ${margin} padding v h sm">
                <code key="text" class="${background} padding v h md round-edges">${text}</code>
            </div>
        `
    }
}