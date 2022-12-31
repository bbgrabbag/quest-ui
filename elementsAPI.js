
export default (() => {

    const recordBtn = document.getElementById('record-btn');
    const audioEl = document.getElementById('audio-el');
    const recordingMsg = document.getElementById('recording-msg');
    const transcription = document.getElementById('transcription');
    const transcriptionLoading = document.getElementById('transcription-loading');
    const responseLoading = document.getElementById('response-loading');
    const response = document.getElementById('response');

    const enableRecordBtn = () => recordBtn.disabled = false;
    const disableAudio = () => { audioEl.src = undefined; audioEl.controls = false };
    const enableAudio = () => audioEl.controls = true;
    const setRecordBtnText = (isRecording) => recordBtn.innerText = isRecording ? 'Stop' : 'Click to start voice recording';
    const setAudioSource = (blob) => audioEl.src = window.URL.createObjectURL(blob);
    const displayRecordingMsg = () => recordingMsg.style.visibility = 'visible';
    const hideRecordingMsg = () => recordingMsg.style.visibility = 'hidden';
    const setTranscriptionText = (text) => transcription.innerText = text;
    const setResponseText = (text) => response.innerHTML = text;
    const setTranscriptionLoading = (isLoading) => {
        transcriptionLoading.style.display = isLoading ? 'block' : 'none';
        transcription.style.display = isLoading ? 'none' : 'block';
    }

    const setResponseLoading = (isLoading) => {
        responseLoading.style.display = isLoading ? 'block' : 'none';
        response.style.display = isLoading ? 'none' : 'block';
    }

    const reset = () => {
        setTranscriptionText('');
        setResponseText('');
        setTranscriptionLoading(false)
        setResponseLoading(false)
    }

    return {
        recordBtn,
        audioEl,
        disableAudio,
        enableAudio,
        enableRecordBtn,
        setRecordBtnText,
        setAudioSource,
        displayRecordingMsg,
        hideRecordingMsg,
        setTranscriptionText,
        setTranscriptionLoading,
        setResponseLoading,
        setResponseText,
        reset
    }
})()