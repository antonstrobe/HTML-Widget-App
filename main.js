const { app, BrowserWindow, ipcMain, screen, session, globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
let mainWindow;
let webWindow;
let controlWindow;
let originalWindowSize;
let isFullScreen = false;

function createMainWindow() {
    session.defaultSession.clearCache();
    let { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: 200,
        height: 310,
        x: width - 200,
        y: 50,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            partition: 'persist:main'
        },
        frame: false,
        alwaysOnTop: true,
        transparent: true
    });
    mainWindow.setOpacity(0.8);
    mainWindow.loadFile('index.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (webWindow) webWindow.close();
        if (controlWindow) controlWindow.close();
    });
}

function createWebWindow() {
    let { width, height } = screen.getPrimaryDisplay().workAreaSize;
    webWindow = new BrowserWindow({
        width: 200,
        height: 400,
        x: width - 200,
        y: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: 'persist:web'
        },
        frame: false,
        alwaysOnTop: true,
        transparent: true
    });
    webWindow.setOpacity(0.9);
    webWindow.loadURL('https://chatgpt.com/?model=gpt-4o/');
    webWindow.on('closed', () => {
        webWindow = null;
    });
}

function createControlWindow() {
    let { width, height } = screen.getPrimaryDisplay().workAreaSize;
    controlWindow = new BrowserWindow({
        width: 200,
        height: 170,
        x: width - 200,
        y: height - 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            partition: 'persist:main'
        },
        frame: false,
        alwaysOnTop: true,
        transparent: true
    });
    controlWindow.setOpacity(0.9);
    controlWindow.loadFile('controls.html');
    controlWindow.on('closed', () => {
        controlWindow = null;
    });
}

app.whenReady().then(() => {
    createMainWindow();
    createWebWindow();
    createControlWindow();
    openConsoleWindow();

    globalShortcut.register('Ctrl+Shift+T', () => {
        toggleFullScreen();
    });

    globalShortcut.register('Ctrl+Shift+M', () => {
        toggleFullScreen();
    });
});

function openConsoleWindow() {
    exec('start cmd.exe', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error opening console: ${error.message}`);
        }
        if (stderr) {
            console.error(`Console error: ${stderr}`);
        }
        console.log(`Console output: ${stdout}`);
    });
}

function toggleFullScreen() {
    if (webWindow) {
        isFullScreen = !isFullScreen;
        if (isFullScreen) {
            originalWindowSize = webWindow.getBounds();
            let { width, height } = screen.getPrimaryDisplay().workAreaSize;
            webWindow.setBounds({ x: 0, y: 0, width: width / 2, height: height });
        } else {
            webWindow.setBounds(originalWindowSize);
        }
        webWindow.webContents.send('fullsize-toggled', isFullScreen);
    }
}

ipcMain.on('save-file', (event, { filename, content }) => {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    let savedPath;
    try {
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath));
            savedPath = settings.savedPath || app.getPath('documents');
        } else {
            savedPath = app.getPath('documents');
        }
        const fullPath = path.join(savedPath, filename);
        fs.writeFileSync(fullPath, content);
        event.reply('saved', 'Файл сохранен успешно.');
    } catch (error) {
        event.reply('error', 'Ошибка при сохранении файла: ' + error.message);
    }
});

ipcMain.on('activate-web-window', () => {
    if (webWindow) {
        webWindow.focus();
    }
});

ipcMain.on('push-content', (event, { content }) => {
    if (webWindow) {
        webWindow.webContents.send('input-content', content);
        webWindow.focus();
    }
});

ipcMain.on('control-action', (event, action) => {
    switch (action) {
        case 'reload':
            if (webWindow) webWindow.reload();
            break;
        case 'toggle':
            if (webWindow) webWindow.isVisible() ? webWindow.hide() : webWindow.show();
            break;
        case 'fullsize':
            toggleFullScreen();
            break;
        case 'restore':
            toggleFullScreen();
            break;
    }
});

ipcMain.on('open-website', (event, url) => {
    if (webWindow) {
        webWindow.loadURL(url);
    }
});

ipcMain.on('save-pdf', () => {
    const pdfPath = path.join(app.getPath('documents'), 'page.pdf');
    mainWindow.webContents.printToPDF({}).then(data => {
        fs.writeFile(pdfPath, data, (error) => {
            if (error) {
                console.error('Failed to save PDF file:', error);
            } else {
                console.log('PDF file saved:', pdfPath);
            }
        });
    }).catch(error => {
        console.error('Failed to generate PDF:', error);
    });
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
