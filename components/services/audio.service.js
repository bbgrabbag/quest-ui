import { _Service } from "../lib.js";

class AudioService extends _Service {
    constructor() {
        super();
        this.chunks = [];
        this.recorder = null;
        this.isRecording = false;
    }

    addChunk(data) {
        this.chunks.push(data);
    }

    clearChunks() {
        this.chunks = [];
    }

    stopRecording() {
        this.recorder.stop();
    }

    startRecording() {
        this.recorder.start();
    }

    async registerMicrophone() {
        try {

            const supported = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'mp4 '
            ].filter(enc => MediaRecorder.isTypeSupported(enc))
            if (!supported.length) throw Error('audio recording not supported for this device');

            return navigator.mediaDevices.getUserMedia({ 'audio': true, 'video': false })
                .then(s => {
                    this.recorder = new MediaRecorder(s, {
                        audioBitsPerSecond: 48000,
                        mimeType: 'audio/webm;codecs=opus'
                    });
                    this.recorder.addEventListener('start', e => {
                        this.isRecording = true;
                        this.emit({ type: 'recordingstarted', payload: null })
                    })
                    this.recorder.addEventListener('dataavailable', e => {
                        this.addChunk(e.data);
                    });
                    this.recorder.addEventListener('stop', e => {
                        this.isRecording = false;
                        const blob = new Blob(this.chunks, { type: 'audio/webm;codecs=opus' });
                        this.emit({ type: 'recordingstopped', payload: null });
                        this.emit({ type: 'blobready', payload: { blob } });
                        this.clearChunks()
                    })
                })
        } catch (err) {
            this.emit({ type: 'error', payload: { message: err.message } })
        }
    }
}

export const audioService = new AudioService();
