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

    isDeviceSupported() {
        const supportsMemeTypes = [
            'audio/webm',
            'audio/webm;codecs=opus'
        ].filter(MediaRecorder.isTypeSupported).length;

        const supportsGetUserMedia = !!(navigator.mediaDevices.getUserMedia || navigator.mediaDevices)
        return supportsMemeTypes && supportsGetUserMedia
    }

    getUserMedia(config) {
        if (navigator.mediaDevices.getUserMedia) return navigator.mediaDevices.getUserMedia(config);
        return navigator.getUserMedia(config);
    }

    async registerMicrophone() {
        try {
            if (!this.isDeviceSupported())
                throw Error('device is currently not supported')
            return this.getUserMedia({ 'audio': true, 'video': false })
                .then(s => {
                    this.recorder = new MediaRecorder(s)
                    this.recorder.addEventListener('start', e => {
                        this.isRecording = true;
                        this.emit({ type: 'recordingstarted', payload: null })
                    })
                    this.recorder.addEventListener('dataavailable', e => {
                        this.addChunk(e.data);
                    });
                    this.recorder.addEventListener('stop', e => {
                        this.isRecording = false;
                        const blob = new Blob(this.chunks, { type: e.target.mimeType });
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
