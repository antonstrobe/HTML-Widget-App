const { ipcRenderer } = require('electron');

// Внутри функции onclick для вашей кнопки Toggle
ipcRenderer.send('toggle-window-size');
