const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const serveHandler = require('serve-handler');

// Перевіряємо, чи запущено в режимі розробки
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let server = null;

function createWindow(urlToLoad) {
  mainWindow = new BrowserWindow({
    width: 480,               // Зручна стартова ширина (схожа на мобільний/планшет)
    height: 850,              // Висота вікна
    minWidth: 400,
    minHeight: 600,
    title: 'AI Mock Interviewer',
    backgroundColor: '#0f172a', // slate-900 (фон під стиль додатку)
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,    // Приховати стандартне верхнє меню вікна
  });

  mainWindow.loadURL(urlToLoad);

  // Зовнішні посилання відкриваємо у стандартному браузері ОС, а не у вікні додатку
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (isDev) {
    // У режимі розробки підключаємося до локального Metro сервера Expo (з Fast Refresh)
    createWindow('http://localhost:8081');
  } else {
    // У production режимі запускаємо легкий внутрішній HTTP сервер для файлів з папки dist
    // Це вирішує проблему абсолютних шляхів "/_expo/..." у статичному бандлі
    server = http.createServer((request, response) => {
      return serveHandler(request, response, {
        public: path.join(__dirname, '../dist'),
        rewrites: [{ source: '**', destination: '/index.html' }],
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      createWindow(`http://127.0.0.1:${port}`);
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isDev) {
        createWindow('http://localhost:8081');
      } else if (server) {
        const port = server.address().port;
        createWindow(`http://127.0.0.1:${port}`);
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
