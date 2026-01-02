import { GameState } from "../types/GameState";

/**
 * Interface que define el contrato del gestor de juego
 */
export interface IGameManager {

    /**
     * Estado actual del juego
     */
    state: GameState;

    /**
     * Inicializa el juego
     */
    initialize(): void;

    /**
     * Inicia el juego
     */
    start(): void;

    /**
     * Pausa el juego
     */
    pause(): void;

    /**
     * Reanuda el juego
     */
    resume(): void;

    /**
     * Finaliza el juego
     */
    end(): void;

    /**
     * Reinicia el juego con la misma configuración
     */
    restart(): void;

    /**
     * Actualiza la lógica del juego
     * @param deltaTime - Tiempo transcurrido desde la última actualización
     */
    update(deltaTime: number): void;
}
