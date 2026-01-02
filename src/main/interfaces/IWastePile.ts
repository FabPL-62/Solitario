import { ICard } from './ICard';

/**
 * Interface que define el contrato de la pila de descarte (Waste Pile)
 * Aquí se colocan las cartas robadas del mazo
 */
export interface IWastePile {
    /**
     * Cartas en la pila de descarte
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
     * Obtiene la carta en la cima (la única que se puede jugar)
     * @returns La carta en la cima o null si está vacía
     */
    getTopCard(): ICard | null;

    /**
     * Agrega cartas a la pila de descarte
     * @param cards - Las cartas a agregar
     */
    addCards(cards: ICard[]): void;

    /**
     * Remueve la carta de la cima
     * @returns La carta removida o null si está vacía
     */
    removeTopCard(): ICard | null;

    /**
     * Remueve y retorna todas las cartas
     * @returns Todas las cartas de la pila
     */
    removeAll(): ICard[];

    /**
     * Limpia la pila
     */
    clear(): void;
}

