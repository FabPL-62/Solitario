import { ICard } from './ICard';

/**
 * Interface que define el contrato de una pila del tableau (zona de juego)
 * En el solitario Klondike hay 7 pilas de tableau
 */
export interface ITableau {
    /**
     * Identificador de la pila (0-6)
     */
    readonly index: number;

    /**
     * Todas las cartas en la pila
     */
    readonly cards: readonly ICard[];

    /**
     * Número de cartas en la pila
     */
    readonly count: number;

    /**
     * Indica si la pila está vacía
     */
    readonly isEmpty: boolean;

    /**
     * Obtiene la carta en la cima de la pila (última carta)
     * @returns La carta en la cima o null si está vacía
     */
    getTopCard(): ICard | null;

    /**
     * Obtiene las cartas boca arriba (movibles)
     * @returns Array de cartas boca arriba desde la primera visible hasta la cima
     */
    getFaceUpCards(): ICard[];

    /**
     * Verifica si una carta puede colocarse en esta pila
     * @param card - La carta a colocar
     * @returns true si la carta puede colocarse
     */
    canAcceptCard(card: ICard): boolean;

    /**
     * Agrega una o más cartas a la cima de la pila
     * @param cards - Las cartas a agregar
     * @returns true si se agregaron correctamente
     */
    addCards(cards: ICard[]): boolean;

    /**
     * Remueve cartas desde una posición hasta la cima
     * @param fromIndex - Índice desde donde remover (inclusive)
     * @returns Las cartas removidas
     */
    removeCardsFrom(fromIndex: number): ICard[];

    /**
     * Revela la carta en la cima si está boca abajo
     */
    revealTopCard(): void;

    /**
     * Obtiene el índice de una carta específica en la pila
     * @param card - La carta a buscar
     * @returns El índice de la carta o -1 si no se encuentra
     */
    getCardIndex(card: ICard): number;
}

