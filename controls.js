const { ipcRenderer } = require('electron');

document.getElementById('save-pdf').addEventListener('click', () => {
    ipcRenderer.send('save-pdf');
});

document.getElementById('reload').addEventListener('click', () => {
    ipcRenderer.send('control-action', 'reload');
});

document.getElementById('toggle').addEventListener('click', () => {
    ipcRenderer.send('control-action', 'toggle');
});

document.getElementById('fullsize').addEventListener('click', () => {
    ipcRenderer.send('control-action', 'fullsize');
    document.getElementById('fullsize').style.display = 'none';
    document.getElementById('restore').style.display = '';
});

document.getElementById('restore').addEventListener('click', () => {
    ipcRenderer.send('control-action', 'restore');
    document.getElementById('restore').style.display = 'none';
    document.getElementById('fullsize').style.display = '';
});

document.getElementById('toggle').addEventListener('auxclick', (event) => {
    if (event.button === 1) {
        ipcRenderer.send('control-action', 'fullsize');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey) {
        ipcRenderer.send('control-action', 'fullsize');
    }
});

const links = [
    { name: '4', url: 'https://chatgpt.com/?model=gpt-4' },
    { name: '3.5', url: 'https://chatgpt.com/?model=text-davinci-002-render-sha' },
    { name: '4o', url: 'https://chatgpt.com/?model=gpt-4o' },
];

function createButton(name, url) {
    const button = document.createElement('button');
    button.className = 'button';
    button.textContent = name;
    button.addEventListener('click', () => {
        ipcRenderer.send('open-website', url);
    });
    return button;
}

function renderButtons() {
    const container = document.getElementById('link-buttons-container');
    container.innerHTML = '';
    for (let i = 0; i < links.length; i += 3) {
        const row = document.createElement('div');
        row.className = 'button-row';
        for (let j = 0; j < 3; j++) {
            if (i + j < links.length) {
                const button = createButton(links[i + j].name, links[i + j].url);
                row.appendChild(button);
            }
        }
        container.appendChild(row);
    }
}

renderButtons();

ipcRenderer.send('open-website', 'https://chatgpt.com/?model=gpt-4o');
