export default (() => {
    let chunks = [];
    let stream;
    let recorder;
    let isRecording = false;

    const addChunk = (data) => chunks.push(data);
    const clearChunks = () => chunks = [];
    const stopRecording = () => {
        recorder.stop();
    }
    const startRecording = () => {
        recorder.start();
    }

    return {
        registerMicrophone: async ({ handleBlob, onStop, onStart }) => {
            try {
                return navigator.mediaDevices.getUserMedia({ 'audio': true, 'video': false })
                    .then(s => {
                        stream = s;
                        recorder = new MediaRecorder(s);
                        recorder.addEventListener('start', e => {
                            isRecording = true;
                            if (onStart) onStart();
                        })
                        recorder.addEventListener('dataavailable', e => {
                            addChunk(e.data);
                        });
                        recorder.addEventListener('stop', e => {
                            isRecording = false;
                            const blob = new Blob(chunks, { type: 'audio/wav; codecs=0' });
                            if (handleBlob) handleBlob(blob);
                            if (onStop) onStop();
                            clearChunks()
                        })
                    })
            } catch (err) {
                console.error(err)
            }
        },
        get chunks() { return [...chunks] },
        get isRecording() { return isRecording },
        stopRecording,
        startRecording,
        addChunk,
        clearChunks,
    }
})()