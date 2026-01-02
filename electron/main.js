const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Mantener referencia global de la ventana
let mainWindow;

function createWindow() {
    // Crear la ventana del navegador
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1024,
        minHeight: 600,
        title: 'Solitaire',
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

    // Cargar el archivo HTML del juego
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    // Crear menú personalizado
    const menu = Menu.buildFromTemplate([
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
    ]);

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

// Deshabilitar navegación a URLs externas por seguridad
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        event.preventDefault();
    });
});

