import { ICard } from '../interfaces/ICard';

/**
 * Representa el estado de una carta
 */
export interface CardState {
    id: string;
    isFaceUp: boolean;
}

/**
 * Representa el estado completo del juego en un momento dado
 */
export interface GameState {
    /**
     * Cartas en el deck (stock)
     */
    deckCards: CardState[];

    /**
     * Cartas en el waste pile
     */
    wasteCards: CardState[];

    /**
     * Cartas en cada tableau (7 pilas)
     */
    tableauCards: CardState[][];

    /**
     * Cartas en cada foundation (4 pilas)
     */
    foundationCards: CardState[][];

    /**
     * Puntaje en el momento del estado
     */
    score: number;

    /**
     * Número de movimientos
     */
    moves: number;
}

/**
 * Servicio para manejar el historial de movimientos
 * Permite deshacer movimientos
 */
export class MoveHistory {
    /**
     * Pila de estados anteriores
     */
    private _history: GameState[];

    /**
     * Límite máximo de estados a guardar
     */
    private readonly _maxHistory: number;

    /**
     * Constructor
     * @param maxHistory - Número máximo de estados a guardar (por defecto 50)
     */
    constructor(maxHistory: number = 50) {
        this._history = [];
        this._maxHistory = maxHistory;
    }

    /**
     * Indica si hay movimientos para deshacer
     */
    public get canUndo(): boolean {
        return this._history.length > 0;
    }

    /**
     * Cantidad de movimientos que se pueden deshacer
     */
    public get undoCount(): number {
        return this._history.length;
    }

    /**
     * Guarda un estado en el historial
     * @param state - Estado del juego a guardar
     */
    public pushState(state: GameState): void {
        this._history.push(state);

        // Limitar el tamaño del historial
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    }

    /**
     * Obtiene y elimina el último estado guardado
     * @returns El estado anterior o null si no hay historial
     */
    public popState(): GameState | null {
        return this._history.pop() || null;
    }

    /**
     * Obtiene el último estado sin eliminarlo
     * @returns El estado anterior o null si no hay historial
     */
    public peekState(): GameState | null {
        return this._history.length > 0 ? this._history[this._history.length - 1] : null;
    }

    /**
     * Limpia todo el historial
     */
    public clear(): void {
        this._history = [];
    }
}

