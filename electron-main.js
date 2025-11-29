const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let server;

// Avvia server express per servire l'app Angular
function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const serverApp = express();
      const distPath = path.join(__dirname, 'dist/angular-phendelver/browser');
      
      // Serve static files with fallback
      serverApp.use(express.static(distPath, { 
        index: 'index.html',
        fallthrough: true 
      }));
      
      // Catch-all fallback for SPA routing
      serverApp.use((req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      
      // Listen on random available port
      server = serverApp.listen(0, 'localhost', () => {
        const port = server.address().port;
        console.log(`Server started on http://localhost:${port}`);
        resolve(port);
      });
    } catch (error) {
      console.error('Error starting server:', error);
      reject(error);
    }
  });
}

function createWindow() {
  // Determina il percorso dell'icona in base all'ambiente
  let iconPath;
  if (app.isPackaged) {
    // In produzione (app installata)
    iconPath = path.join(process.resourcesPath, 'icon.ico');
  } else {
    // In sviluppo
    iconPath = path.join(__dirname, 'public/icon.ico');
  }
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    backgroundColor: '#121212',
    show: false
  });

  // Avvia il server e carica l'URL
  startServer().then((port) => {
    const appUrl = `http://localhost:${port}`;
    console.log('Loading Electron app from:', appUrl);
    mainWindow.loadURL(appUrl);
  });

  // Log degli errori di caricamento
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Mostra la finestra quando è pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Apri DevTools in modalità development (commentare in produzione)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
