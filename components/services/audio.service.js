import { _Service } from "../lib.js";

class AudioService extends _Service {
    constructor() {
        super();
        this.chunks = [];
        this.recorder = null;
        this.isRecording = false;
        this.supportedMemeTypes = [
            'audio/webm',
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus',
            // 'audio/mp4'
        ]
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
        const supportsMemeTypes = this.supportedMemeTypes.filter(MediaRecorder.isTypeSupported).length;
        const supportsGetUserMedia = !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia)
        return supportsMemeTypes && supportsGetUserMedia
    }

    getUserMedia(config) {
        if (navigator.mediaDevices?.getUserMedia) return navigator.mediaDevices.getUserMedia(config);
        return navigator.getUserMedia(config);
    }

    async createAudioFileBlob(mimeType) {
        const blob = new Blob(this.chunks, { type: mimeType });

        const convertMp4ToWebm = (blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsArrayBuffer(blob);
                reader.onload = (e) => {
                    // handle webm to mp4 conversion here
                    const blob = new Blob([e.target.result], {type: 'audio/webm'})
                    resolve(blob);
                }
                reader.onerror = err => reject(err);
            })
        }

        switch (mimeType) {
            case 'audio/mp4':
                return await convertMp4ToWebm(blob);
            case 'audio/webm':
            case 'audio/webm;codecs=opus':
            case 'audio/ogg;codecs=opus':
            default:
                return blob;

        }
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
                        this.createAudioFileBlob(e.target.mimeType)
                            .then(blob => {
                                this.emit({ type: 'recordingstopped', payload: null });
                                this.emit({ type: 'blobready', payload: { blob } });
                                this.clearChunks()
                            })
                            .catch(err => console.error(err))
                    })
                })
        } catch (err) {
            this.emit({ type: 'error', payload: { message: err.message } })
        }
    }
}

export const audioService = new AudioService();
