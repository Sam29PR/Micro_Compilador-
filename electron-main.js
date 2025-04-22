const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    resizable: false,
    title: "🧠 Micro-Compilador",
    icon: path.join(__dirname, 'assets/icon.png'),
    backgroundColor: '#1e1e1e',
    webPreferences: {
      nodeIntegration: true
    }
  });
  

  win.loadFile(path.join(__dirname, 'dist/tu-app-angular/index.html'));
}

app.whenReady().then(createWindow);
