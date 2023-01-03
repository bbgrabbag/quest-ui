import { _Component } from "../lib.js";
import { audioService } from "../services/audio.service.js";

const DEFAULT_INFO_TEXT = 'click to begin recording <br><br> speak into mic <br><br> click again to send <br><br> message will be sent automatically after timer runs out';

export class RecordButton extends _Component {
    static tagName = 'record-button';
    constructor() {
        super();
        this.eventListeners = [
            {
                selector: '#recorder',
                event: 'click',
                listener: this.handleClick
            }

        ];

        this.css = {
            extends: ['assets/css/global.css'],
            styles: `
                #wrapper {
                    height: 30px;
                }
            `
        }

        this.state = {
            infoText: DEFAULT_INFO_TEXT,
            disabled: false,
        }

        this.timerAmount = 5000;

    }

    onMount() {
        this.audioServiceSub = audioService.subscribe(this.audioServiceSubscriptionHandler);
        audioService.registerMicrophone()
    }

    onDismount() {
        audioService.unsubscribe(this.audioServiceSub)
    }

    onStateChange() {
        this.updateButtonUI()
    }

    updateButtonUI() {
        this.elements.recorder.disabled = this.state.disabled;
        this.elements.info.innerHTML = this.state.infoText;
    }

    audioServiceSubscriptionHandler = e => {
        switch (e.type) {
            case 'recordingstarted':
                this.styleRecordBtn('active');
                this.startTimer();
                return this.setState(p => ({ ...p, infoText: 'recording...' }));
            case 'recordingstopped':
                this.styleRecordBtn('inactive');
                this.stopTimer();
                return this.setState(p => ({ ...p, infoText: 'recorded successfully.' }));
            case 'pendingreply':
                return this.setState(p => ({ ...p, disabled: true, infoText: 'waiting for reply...' }));
            case 'replycompleted':
                this.styleRecordBtn('inactive');
                this.stopTimer();
                return this.setState(p => ({ ...p, disabled: false, infoText: DEFAULT_INFO_TEXT }));
            case 'error':
                this.styleRecordBtn('inactive');
                this.stopTimer();
                return this.setState(p => ({ ...p, disabled: true, infoText: e.payload.message }))
        }
    }

    startInterval() {
        this.elements.timer.innerText = this.timerAmount / 1000;
        this.interval = setInterval(() => {
            if (!this.timeout) {
                this.stopInterval();
                return;
            }
            const diff = new Date().getTime() - this.timestamp.getTime()
            this.elements.timer.innerText = this.timerAmount / 1000 - Math.floor(diff / 1000);
        }, 1000)
    }

    stopInterval() {
        this.interval = clearInterval(this.interval);
        this.elements.timer.innerText = ' ';
    }

    startTimer() {
        this.stopTimer();
        this.startInterval();
        this.timestamp = new Date();
        this.timeout = setTimeout(() => {
            if (audioService.isRecording) audioService.stopRecording();
            this.stopTimer();
            this.stopInterval();
        }, this.timerAmount)
    }

    stopTimer() {
        if (this.timeout) clearTimeout(this.timeout);
        if (this.interval) clearInterval(this.interval);
        this.timestamp = null;
        this.elements.timer.innerText = ' ';
    }

    handleClick = e => {
        if (audioService.isRecording) {
            audioService.stopRecording();
            return;
        }
        audioService.startRecording();
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
            <div id="wrapper"class="flex column align-items-center padding v h md">
                <div>
                    <button class="icon" ${this.state.disabled ? 'disabled' : ''} id='recorder'>
                        <img src="/assets/icons/microphone.png" />
                    </button>
                </div>
                <div class="padding v md text-center">
                <code id="info">${this.state.infoText}</code>
                </div>
                <div class="padding v sm text-center">
                    <b><code id="timer"></code></b>
                </div>
            </div>
        `
    }
}