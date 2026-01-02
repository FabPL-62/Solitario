const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Detectar si estamos en modo desarrollo
const isDev = process.env.ELECTRON_DEV === 'true';
const DEV_SERVER_URL = 'http://localhost:8080';

// Mantener referencia global de la ventana
let mainWindow;

function createWindow() {
    // Crear la ventana del navegador
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1024,
        minHeight: 600,
        title: 'Solitaire' + (isDev ? ' (Dev)' : ''),
        icon: path.join(__dirname, '../assets/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
        resizable: true,
        center: true,
        backgroundColor: '#1a472a'
    });

    // Cargar desde servidor de desarrollo o archivo compilado
    if (isDev) {
        mainWindow.loadURL(DEV_SERVER_URL);
        // Abrir DevTools en modo desarrollo
        mainWindow.webContents.openDevTools();
        console.log('🚀 Modo desarrollo - Cargando desde:', DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Crear menú personalizado
    const menuTemplate = [
        {
            label: 'Juego',
            submenu: [
                {
                    label: 'Pantalla Completa',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                { type: 'separator' },
                {
                    label: 'Recargar',
                    accelerator: 'F5',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Salir',
                    accelerator: 'Alt+F4',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Vista',
            submenu: [
                {
                    label: 'Acercar',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomFactor();
                        mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
                    }
                },
                {
                    label: 'Alejar',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomFactor();
                        mainWindow.webContents.setZoomFactor(Math.max(0.5, currentZoom - 0.1));
                    }
                },
                {
                    label: 'Tamaño Original',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow.webContents.setZoomFactor(1);
                    }
                }
            ]
        },
        {
            label: 'Ayuda',
            submenu: [
                {
                    label: 'Acerca de',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Acerca de Solitaire',
                            message: 'Solitaire v1.0.0',
                            detail: 'Un juego de Solitario Klondike desarrollado con TypeScript, Phaser 4 y Electron.\n\n© 2026 - Todos los derechos reservados.'
                        });
                    }
                }
            ]
        }
    ];

    // Agregar menú de desarrollo en modo dev
    if (isDev) {
        menuTemplate.push({
            label: 'Desarrollo',
            submenu: [
                {
                    label: 'Abrir DevTools',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                },
                {
                    label: 'Recargar (Hard)',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Evento cuando la ventana se cierra
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Cuando Electron ha terminado de inicializarse
app.whenReady().then(() => {
    createWindow();

    // En macOS es común recrear la ventana cuando se hace clic en el icono del dock
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
    // En macOS es común que las aplicaciones se mantengan activas
    // hasta que el usuario salga explícitamente con Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Deshabilitar navegación a URLs externas por seguridad (solo en producción)
if (!isDev) {
    app.on('web-contents-created', (event, contents) => {
        contents.on('will-navigate', (event, navigationUrl) => {
            event.preventDefault();
        });
    });
}
