
import el from './elementsAPI.js';
import audio from './audioAPI.js';
import data from './dataAPI.js';

(function initialize() {
    el.setRecordBtnText(audio.isRecording);
    audio.registerMicrophone({
        handleBlob: blob => {
            el.setAudioSource(blob);
            el.reset();
            el.setTranscriptionLoading(true);
            el.setResponseLoading(true);
            data.sendFile(blob)
                .then(data => {
                    el.setTranscriptionText(data.transcription || 'No speech detected, please try again');
                    el.setTranscriptionLoading(false);

                    return data.transcription
                })
                .then(data.sendPrompt)
                .then(data => {
                    el.setResponseText(data.answer)
                    el.setResponseLoading(false)
                })
                .catch(err => {
                    console.error(err);
                    el.reset()
                })
        },
        onStart: () => {
            el.setRecordBtnText(true);
            el.displayRecordingMsg();
            // el.disableAudio();
        },
        onStop: () => {
            el.setRecordBtnText(false);
            el.hideRecordingMsg()
            // el.enableAudio()
        }
    })
        .then(() => el.enableRecordBtn())
    el.recordBtn.addEventListener('click', e => {
        if (audio.isRecording)
            audio.stopRecording();
        else
            audio.startRecording();
    })
})();

