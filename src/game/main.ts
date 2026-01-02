import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Main } from './scenes/Main';

/**
 * Configuración del juego (phaser v4)
 */
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a472a',
    scene: [
        Boot,
        Preloader,
        Main,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        activePointers: 1,
    },
}

/**
 * Función para iniciar el juego
 * @param parent - El contenedor del juego
 * @returns El juego
 */
const StartGame = (parent: string) => {
    return new Game({
        ...config,
        parent
    });
}

export default StartGame;