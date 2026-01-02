import { ICard } from '../interfaces/ICard';
import { CardColor, getCardColor, areOppositeColors } from '../types/CardColor';
import { CardValue } from '../types/CardValue';
import { Suit } from '../types/Suit';

/**
 * Entidad que representa una carta del juego
 */
export class Card implements ICard {
    /**
     * Identificador único de la carta
     */
    public readonly id: string;

    /**
     * Palo de la carta
     */
    public readonly suit: Suit;

    /**
     * Valor de la carta (1-13)
     */
    public readonly value: CardValue;

    /**
     * Color de la carta (derivado del palo)
     */
    public readonly color: CardColor;

    /**
     * Indica si la carta está boca arriba
     */
    private _isFaceUp: boolean;

    /**
     * Constructor de la carta
     * @param suit - Palo de la carta
     * @param value - Valor de la carta (1-13)
     * @param isFaceUp - Estado inicial (default: boca abajo)
     */
    constructor(suit: Suit, value: CardValue, isFaceUp: boolean = false) {
        this.suit = suit;
        this.value = value;
        this.color = getCardColor(suit);
        this._isFaceUp = isFaceUp;
        this.id = `${suit}_${value}`;
    }

    /**
     * Indica si la carta está boca arriba
     */
    public get isFaceUp(): boolean {
        return this._isFaceUp;
    }

    /**
     * Establece si la carta está boca arriba
     */
    public set isFaceUp(value: boolean) {
        this._isFaceUp = value;
    }

    /**
     * Voltea la carta
     */
    public flip(): void {
        this._isFaceUp = !this._isFaceUp;
    }

    /**
     * Pone la carta boca arriba
     */
    public reveal(): void {
        this._isFaceUp = true;
    }

    /**
     * Pone la carta boca abajo
     */
    public hide(): void {
        this._isFaceUp = false;
    }

    /**
     * Obtiene la clave del asset para esta carta
     */
    public getAssetKey(): string {
        return `${this.suit} ${this.value}`;
    }

    /**
     * Verifica si esta carta puede apilarse sobre otra en el tableau
     * Regla: Color opuesto y valor menor por 1
     * @param card - La carta sobre la que se quiere apilar
     */
    public canStackOnTableau(card: ICard): boolean {
        // Debe ser de color opuesto
        if (!areOppositeColors(this.suit, card.suit)) {
            return false;
        }
        // Debe ser exactamente un valor menor
        return this.value === card.value - 1;
    }

    /**
     * Verifica si esta carta puede colocarse en una foundation
     * Regla: Mismo palo y valor mayor por 1 (o As si está vacía)
     * @param topCard - La carta en la cima (null si vacía)
     * @param foundationSuit - El palo de la foundation (null si no asignado)
     */
    public canPlaceOnFoundation(topCard: ICard | null, foundationSuit: Suit | null): boolean {
        // Si la foundation está vacía, solo acepta Ases
        if (topCard === null) {
            return this.value === 1;
        }

        // Debe ser del mismo palo
        if (this.suit !== topCard.suit) {
            return false;
        }

        // Debe ser exactamente un valor mayor
        return this.value === topCard.value + 1;
    }

    /**
     * Representación en string de la carta
     */
    public toString(): string {
        const faceStatus = this._isFaceUp ? '↑' : '↓';
        return `[${this.suit} ${this.value}]${faceStatus}`;
    }
}

