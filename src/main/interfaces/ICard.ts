import { CardColor } from '../types/CardColor';
import { CardValue } from '../types/CardValue';
import { Suit } from '../types/Suit';

/**
 * Interface que define el contrato de una carta
 */
export interface ICard {
    /**
     * Identificador único de la carta
     */
    readonly id: string;

    /**
     * Palo de la carta (Clubs, Diamonds, Hearts, Spades)
     */
    readonly suit: Suit;

    /**
     * Valor de la carta (1-13)
     */
    readonly value: CardValue;

    /**
     * Color de la carta (red, black)
     */
    readonly color: CardColor;

    /**
     * Indica si la carta está boca arriba (visible)
     */
    isFaceUp: boolean;

    /**
     * Voltea la carta (cambia el estado de boca arriba/abajo)
     */
    flip(): void;

    /**
     * Pone la carta boca arriba
     */
    reveal(): void;

    /**
     * Pone la carta boca abajo
     */
    hide(): void;

    /**
     * Obtiene la clave del asset para esta carta
     * @returns El nombre del asset (ej: "Hearts 1", "Spades 13")
     */
    getAssetKey(): string;

    /**
     * Verifica si esta carta puede apilarse sobre otra en el tableau
     * (color opuesto y valor menor por 1)
     * @param card - La carta sobre la que se quiere apilar
     * @returns true si se puede apilar
     */
    canStackOnTableau(card: ICard): boolean;

    /**
     * Verifica si esta carta puede colocarse en una foundation
     * (mismo palo y valor mayor por 1, o As si está vacía)
     * @param topCard - La carta en la cima de la foundation (null si está vacía)
     * @param foundationSuit - El palo de la foundation (null si no tiene palo asignado)
     * @returns true si se puede colocar
     */
    canPlaceOnFoundation(topCard: ICard | null, foundationSuit: Suit | null): boolean;
}

