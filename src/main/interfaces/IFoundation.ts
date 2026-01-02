import { Suit } from '../types/Suit';
import { ICard } from './ICard';

/**
 * Interface que define el contrato de una pila de fundación
 * En el solitario hay 4 foundations, una por cada palo
 * Las cartas se apilan del As al Rey
 */
export interface IFoundation {
    /**
     * Identificador de la foundation (0-3)
     */
    readonly index: number;

    /**
     * Palo asignado a esta foundation (null si está vacía)
     */
    readonly suit: Suit | null;

    /**
     * Todas las cartas en la foundation
     */
    readonly cards: readonly ICard[];

    /**
     * Número de cartas en la foundation
     */
    readonly count: number;

    /**
     * Indica si la foundation está vacía
     */
    readonly isEmpty: boolean;

    /**
     * Indica si la foundation está completa (tiene las 13 cartas)
     */
    readonly isComplete: boolean;

    /**
     * Obtiene la carta en la cima de la foundation
     * @returns La carta en la cima o null si está vacía
     */
    getTopCard(): ICard | null;

    /**
     * Verifica si una carta puede colocarse en esta foundation
     * @param card - La carta a colocar
     * @returns true si la carta puede colocarse
     */
    canAcceptCard(card: ICard): boolean;

    /**
     * Agrega una carta a la foundation
     * @param card - La carta a agregar
     * @returns true si se agregó correctamente
     */
    addCard(card: ICard): boolean;

    /**
     * Remueve la carta de la cima
     * @returns La carta removida o null si está vacía
     */
    removeTopCard(): ICard | null;
}

