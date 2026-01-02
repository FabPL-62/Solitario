import { ICard } from './ICard';

/**
 * Interface que define el contrato del mazo de cartas (Stock)
 * El mazo contiene las cartas que no se han repartido
 */
export interface IDeck {
    /**
     * Cartas restantes en el mazo (boca abajo)
     */
    readonly cards: readonly ICard[];

    /**
     * Número de cartas restantes en el mazo
     */
    readonly count: number;

    /**
     * Indica si el mazo está vacío
     */
    readonly isEmpty: boolean;

    /**
     * Cantidad de cartas a voltear al hacer click (1 o 3 según dificultad)
     */
    readonly drawCount: number;

    /**
     * Roba cartas del mazo y las coloca en el waste pile
     * @returns Las cartas robadas
     */
    draw(): ICard[];

    /**
     * Recicla las cartas del waste pile de vuelta al mazo
     * @param wasteCards - Las cartas del waste pile
     */
    recycle(wasteCards: ICard[]): void;

    /**
     * Reinicia el mazo con un nuevo conjunto de cartas
     * @param cards - Las cartas para el mazo
     */
    reset(cards: ICard[]): void;
}

