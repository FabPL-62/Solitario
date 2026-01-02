import { DifficultyType } from '../types/DifficultyType';
import { ICard } from './ICard';

/**
 * Resultado del reparto de cartas
 */
export interface DealResult {
    /**
     * Cartas para el mazo (stock)
     */
    stockCards: ICard[];

    /**
     * Cartas para cada pila del tableau (7 pilas)
     * Cada pila tiene las cartas en orden (primera carta abajo, última arriba)
     */
    tableauCards: ICard[][];
}

/**
 * Interface que define el contrato del servicio de reparto
 * Responsable de generar y repartir las cartas según la dificultad
 */
export interface IDealerService {
    /**
     * Genera un mazo completo de 52 cartas
     * @returns Array con las 52 cartas
     */
    generateDeck(): ICard[];

    /**
     * Mezcla las cartas
     * @param cards - Las cartas a mezclar
     * @returns Las cartas mezcladas
     */
    shuffle(cards: ICard[]): ICard[];

    /**
     * Reparte las cartas para iniciar el juego
     * @param difficulty - Nivel de dificultad
     * @param seed - Semilla opcional para reproducibilidad
     * @returns El resultado del reparto
     */
    deal(difficulty: DifficultyType, seed?: number): DealResult;

    /**
     * Genera un reparto garantizado como ganable (según dificultad)
     * @param difficulty - Nivel de dificultad
     * @returns El resultado del reparto
     */
    dealWinnable(difficulty: DifficultyType): DealResult;
}

