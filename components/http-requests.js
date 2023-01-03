
const hostname = window.location.hostname;
const baseUrl = hostname == 'localhost' ? 'http://localhost:8080' : 'https://quest-api.herokuapp.com';
// const baseUrl = 'https://quest-api.herokuapp.com';

export const sendFile = (blob) => {
    const fd = new FormData();
    fd.append('file', blob);
    return fetch(`${baseUrl}/audio`, {
        method: 'POST',
        body: fd,
    }).then(res => res.json())
}

export const sendPrompt = (text) => {
    if (!text) return Promise.resolve({ answer: '' })
    return fetch(`${baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    }).then(res => res.json())
}

