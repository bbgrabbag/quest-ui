
export const sendFile = (blob) => {
    const fd = new FormData();
    fd.append('file', blob);
    return fetch('http://localhost:8080/audio', {
        method: 'POST',
        body: fd,
    }).then(res => res.json())
}

export const sendPrompt = (text) => {
    if (!text) return Promise.resolve({ answer: '' })
    return fetch('http://localhost:8080/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    }).then(res => res.json())
}

