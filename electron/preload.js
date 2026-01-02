// Preload script para Electron
// Este archivo se ejecuta en un contexto aislado antes de que se cargue la página web

const { contextBridge } = require('electron');

// Exponer APIs seguras al renderer process si es necesario
contextBridge.exposeInMainWorld('electronAPI', {
    // Información de la plataforma
    platform: process.platform,
    
    // Versión de la aplicación
    version: '1.0.0',
    
    // Indicador de que estamos en Electron
    isElectron: true
});

// Log para confirmar que el preload se cargó correctamente
console.log('Preload script loaded - Running in Electron');

