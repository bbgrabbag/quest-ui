import { _Component } from "../lib.js";
import { audioService } from "../services/audio.service.js";
import * as http from '../http-requests.js'

export class Feed extends _Component {
    static tagName = 'conversation-feed';

    constructor() {
        super();
        this.css = {
            extends: ['assets/css/styles.css'],
            styles: `
                #feed {
                    height: 350px;
                    max-width: 500px;
                    margin: auto;
                }
                @media (min-width: 400px){
                    #feed {
                        height: 450px;
                    }
                }
                @media (min-width: 600px){
                    #feed {
                        height: 600px;
                    }
                }
                
            `
        }
    }

    onMount() {
        this.audioServiceSub = audioService.subscribe(this.audioServiceSubscriptionHandler);
    }

    onDismount() {
        audioService.unsubscribe(this.audioServiceSub)
    }

    audioServiceSubscriptionHandler = e => {
        switch (e.type) {
            case 'blobready':
                this.handleBlob(e.payload.blob)
        }
    }

    onEvent(event) {
        switch (event.type) {
            case 'ADD_ITEM':
                return this.handleAddItem(event.payload.item);
            case 'UPDATE_LAST_CHILD':
                return this.handleUpdateLastChild(event.payload.item);
        }
    }

    handleUpdateLastChild(item) {
        const itemEl = this.elements.feed.lastChild;
        itemEl.setAttribute('text', item.text);
        itemEl.setAttribute('type', item.type);
        itemEl.scrollIntoView({ block: "start", inline: "nearest", behavior: 'smooth' })
    }

    handleAddItem(item) {
        const itemEl = document.createElement('feed-item')
        itemEl.setAttribute('text', item.text);
        itemEl.setAttribute('type', item.type);
        this.elements.feed.appendChild(itemEl);
        itemEl.scrollIntoView({ block: "start", inline: "nearest", behavior: 'smooth' })
    }

    handleBlob = blob => {
        audioService.emit({ type: 'pendingreply' })
        const item = { type: 'transcription', text: 'transcribing...' };
        this.emit({ type: 'ADD_ITEM', payload: { item } });
        http.sendFile(blob)
            .then(data => {
                const item = { type: 'transcription', text: data.transcription || 'no audio detected, please try again' };
                this.emit({ type: 'UPDATE_LAST_CHILD', payload: { item } })
                return data.transcription;
            })
            .then(transcription => {
                const item = { type: 'answer', text: 'typing...' };
                this.emit({ type: 'ADD_ITEM', payload: { item } });
                http.sendPrompt(transcription)
                    .then(data => {
                        const item = { type: 'answer', text: data.answer || ' ' }
                        this.emit({ type: 'UPDATE_LAST_CHILD', payload: { item } })
                        audioService.emit({ type: 'replycompleted' })
                    });
            }).
            catch(err => {
                console.error(err);
                audioService.emit({ type: 'error', payload: { message: 'there was a problem retrieving a reply' } })
            })
    }

    renderListItems() {
        return this.state.items.map((item, i) => {
            return `<feed-item key="${'feed-item-' + i}" text="${item.text}"type="${item.type}"></feed-item>`
        }).join('');
    }
    render() {
        return `
            <div id="feed"class="scrollable-y hide-scrollbar padding v h md">
            </div>
        `
    }
}