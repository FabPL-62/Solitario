import { DifficultyType } from '../types/DifficultyType';
import { ICard } from './ICard';
import { IDeck } from './IDeck';
import { IFoundation } from './IFoundation';
import { IScoreManager } from './IScoreManager';
import { ITableau } from './ITableau';
import { IWastePile } from './IWastePile';

/**
 * Resultado de un movimiento
 */
export interface MoveResult {
    /**
     * Indica si el movimiento fue exitoso
     */
    success: boolean;

    /**
     * Mensaje descriptivo del resultado
     */
    message?: string;
}

/**
 * Ubicación de una carta en el juego
 */
export type CardLocation =
    | { type: 'deck' }
    | { type: 'waste' }
    | { type: 'tableau'; index: number; cardIndex: number }
    | { type: 'foundation'; index: number };

/**
 * Interface que define el contrato del controlador del juego
 * Orquesta todos los componentes del solitario
 */
export interface IGameController {
    /**
     * El mazo de cartas (stock)
     */
    readonly deck: IDeck;

    /**
     * La pila de descarte
     */
    readonly wastePile: IWastePile;

    /**
     * Las 7 pilas del tableau
     */
    readonly tableaus: readonly ITableau[];

    /**
     * Las 4 foundations
     */
    readonly foundations: readonly IFoundation[];

    /**
     * Gestor de puntaje
     */
    readonly scoreManager: IScoreManager;

    /**
     * Dificultad actual
     */
    readonly difficulty: DifficultyType;

    /**
     * Indica si el juego ha sido ganado
     */
    readonly isWon: boolean;

    /**
     * Indica si hay movimientos disponibles
     */
    readonly hasAvailableMoves: boolean;

    /**
     * Inicializa un nuevo juego
     * @param difficulty - Nivel de dificultad
     * @param seed - Semilla opcional para reproducibilidad
     */
    newGame(difficulty: DifficultyType, seed?: number): void;

    /**
     * Roba cartas del mazo
     * @returns Resultado del movimiento
     */
    drawFromDeck(): MoveResult;

    /**
     * Mueve una carta del waste al tableau
     * @param tableauIndex - Índice del tableau destino (0-6)
     * @returns Resultado del movimiento
     */
    moveWasteToTableau(tableauIndex: number): MoveResult;

    /**
     * Mueve una carta del waste a la foundation
     * @param foundationIndex - Índice de la foundation destino (0-3)
     * @returns Resultado del movimiento
     */
    moveWasteToFoundation(foundationIndex: number): MoveResult;

    /**
     * Mueve cartas de un tableau a otro
     * @param fromTableau - Índice del tableau origen
     * @param cardIndex - Índice de la carta a mover (y todas las de encima)
     * @param toTableau - Índice del tableau destino
     * @returns Resultado del movimiento
     */
    moveTableauToTableau(fromTableau: number, cardIndex: number, toTableau: number): MoveResult;

    /**
     * Mueve la carta superior de un tableau a la foundation
     * @param tableauIndex - Índice del tableau origen
     * @param foundationIndex - Índice de la foundation destino
     * @returns Resultado del movimiento
     */
    moveTableauToFoundation(tableauIndex: number, foundationIndex: number): MoveResult;

    /**
     * Mueve una carta de la foundation al tableau
     * @param foundationIndex - Índice de la foundation origen
     * @param tableauIndex - Índice del tableau destino
     * @returns Resultado del movimiento
     */
    moveFoundationToTableau(foundationIndex: number, tableauIndex: number): MoveResult;

    /**
     * Intenta mover una carta automáticamente a la mejor ubicación
     * @param location - Ubicación actual de la carta
     * @returns Resultado del movimiento
     */
    autoMove(location: CardLocation): MoveResult;

    /**
     * Verifica si el juego está en un estado sin solución
     * @returns true si no hay más movimientos posibles
     */
    checkGameOver(): boolean;

    /**
     * Obtiene una pista del siguiente movimiento disponible
     * @returns La ubicación origen y destino sugerida, o null si no hay pista
     */
    getHint(): { from: CardLocation; to: CardLocation } | null;

    /**
     * Actualiza el estado del juego
     * @param deltaTime - Tiempo transcurrido desde la última actualización (ms)
     */
    update(deltaTime: number): void;

    /**
     * Indica si se puede deshacer un movimiento
     */
    readonly canUndo: boolean;

    /**
     * Deshace el último movimiento
     * @returns true si se pudo deshacer, false si no hay movimientos
     */
    undo(): boolean;
}

