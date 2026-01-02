import { IGameManager } from "../interfaces/IGameManager";
import { DifficultyType } from "../types/DifficultyType";
import { GameState } from "../types/GameState";
import { GameController } from "./GameController";

/**
 * Servicio que gestiona el estado y la lógica principal del juego
 * Actúa como fachada para el GameController
 */
export class GameManager implements IGameManager {

    /**
     * Estado actual del juego
     */
    state: GameState = 'idle';

    /**
     * Controlador del juego
     */
    private _gameController: GameController;

    /**
     * Dificultad actual
     */
    private _difficulty: DifficultyType = 'easy';

    /**
     * Callbacks para notificar cambios
     */
    private _onStateChange?: (state: GameState) => void;
    private _onWin?: () => void;
    private _onGameOver?: () => void;

    /**
     * Constructor del GameManager
     */
    constructor() {
        this._gameController = new GameController();
    }

    /**
     * Obtiene el controlador del juego
     */
    public get gameController(): GameController {
        return this._gameController;
    }

    /**
     * Obtiene la dificultad actual
     */
    public get difficulty(): DifficultyType {
        return this._difficulty;
    }

    /**
     * Establece la dificultad
     */
    public set difficulty(value: DifficultyType) {
        this._difficulty = value;
    }

    /**
     * Registra un callback para cambios de estado
     */
    public onStateChange(callback: (state: GameState) => void): void {
        this._onStateChange = callback;
    }

    /**
     * Registra un callback para victoria
     */
    public onWin(callback: () => void): void {
        this._onWin = callback;
    }

    /**
     * Registra un callback para game over
     */
    public onGameOver(callback: () => void): void {
        this._onGameOver = callback;
    }

    /**
     * Cambia el estado y notifica
     */
    private setState(newState: GameState): void {
        this.state = newState;
        this._onStateChange?.(newState);
    }

    /**
     * Inicializa el juego
     */
    initialize(): void {
        this.setState('idle');
    }

    /**
     * Inicia el juego con la dificultad configurada
     * @param seed - Semilla opcional para reproducibilidad
     */
    start(seed?: number): void {
        if (this.state !== 'idle') {
            return;
        }

        this.setState('starting');
        
        // Iniciar nuevo juego con el controlador
        this._gameController.newGame(this._difficulty, seed);
        
        this.setState('playing');
    }

    /**
     * Pausa el juego
     */
    pause(): void {
        if (this.state !== 'playing') {
            return;
        }

        this.setState('paused');
    }

    /**
     * Reanuda el juego
     */
    resume(): void {
        if (this.state !== 'paused') {
            return;
        }

        this.setState('playing');
    }

    /**
     * Finaliza el juego
     */
    end(): void {
        this.setState('finished');
    }

    /**
     * Reinicia el juego con la misma configuración
     */
    restart(): void {
        this.setState('idle');
        this.start();
    }

    /**
     * Actualiza la lógica del juego
     * @param deltaTime - Tiempo transcurrido desde la última actualización (ms)
     */
    update(deltaTime: number): void {
        if (this.state !== 'playing') {
            return;
        }

        // Actualizar el controlador
        this._gameController.update(deltaTime);

        // Verificar condiciones de fin de juego
        if (this._gameController.isWon) {
            this.setState('finished');
            this._onWin?.();
        } else if (this._gameController.checkGameOver()) {
            this.setState('gameover');
            this._onGameOver?.();
        }
    }

    /**
     * Cambia la dificultad y reinicia
     * @param difficulty - Nueva dificultad
     */
    changeDifficulty(difficulty: DifficultyType): void {
        this._difficulty = difficulty;
        if (this.state !== 'idle') {
            this.restart();
        }
    }
}
