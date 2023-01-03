import { _Component } from "../lib.js";
import { audioService } from "../services/audio.service.js";

const DEFAULT_INFO_TEXT = 'Click and hold while speaking into the mic. Release to send.';

export class RecordButton extends _Component {
    static tagName = 'record-button';
    constructor() {
        super();
        this.eventListeners = [
            {
                selector: '#recorder',
                event: 'mousedown',
                listener: this.handleMouseDown
            },
            {
                selector: '#recorder',
                event: 'mouseup',
                listener: this.handleMouseUp
            },
            {
                selector: '#recorder',
                event: 'mouseleave',
                listener: this.handleMouseLeave
            }
        ];

        this.css = {
            extends: ['assets/css/global.css']
        }

        this.state = {
            infoText: DEFAULT_INFO_TEXT,
            disabled: false
        }

    }

    onMount() {
        audioService.registerMicrophone()
            .then(() => {
                this.audioServiceSub = audioService.subscribe(this.audioServiceSubscriptionHandler);
            });
    }

    onDismount() {
        audioService.unsubscribe(this.audioServiceSub)
    }

    onStateChange() {
        this.updateButtonUI()
    }

    updateButtonUI() {
        this.elements.recorder.disabled = this.state.disabled;
        this.elements.info.innerText = this.state.infoText;
    }

    audioServiceSubscriptionHandler = e => {
        switch (e.type) {
            case 'recordingstarted':
                return this.setState(p => ({ ...p, infoText: 'recording...' }));
            case 'recordingstopped':
                return this.setState(p => ({ ...p, infoText: 'recorded successfully.' }));
            case 'pendingreply':
                return this.setState(p => ({ ...p, disabled: true, infoText: 'waiting for reply...' }));
            case 'replycompleted':
                return this.setState(p => ({ ...p, disabled: false, infoText: DEFAULT_INFO_TEXT }));
        }
    }

    handleMouseDown = e => {
        audioService.startRecording();
        this.styleRecordBtn('active');
    }

    handleMouseUp = e => {
        if (!audioService.isRecording) return;
        audioService.stopRecording();
        this.styleRecordBtn('inactive');
    }

    handleMouseLeave = e => {
        if (!audioService.isRecording) return;
        audioService.stopRecording();
        this.styleRecordBtn('inactive');
    }

    styleRecordBtn = (status) => {
        if (status == 'active') {
            this.elements.recorder.classList.add('active-recording');
        }
        if (status == 'inactive') {
            this.elements.recorder.classList.remove('active-recording');
        }
    }

    render() {
        return `
            <div class="flex column align-items-center padding v h md">
                <div>
                    <button class="icon" ${this.state.disabled ? 'disabled' : ''} id='recorder'>
                        <img src="/assets/icons/microphone.png" />
                    </button>
                </div>
                <div class="padding v md text-center">
                    <code id="info">${this.state.infoText}</code>
                </div>
            </div>
        `
    }
}