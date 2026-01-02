import { ICard } from '../interfaces/ICard';
import { IFoundation } from '../interfaces/IFoundation';
import { Suit } from '../types/Suit';

/**
 * Entidad que representa una pila de fundación
 * Las cartas se apilan del As al Rey del mismo palo
 */
export class Foundation implements IFoundation {
    /**
     * Identificador de la foundation (0-3)
     */
    public readonly index: number;

    /**
     * Las cartas en la foundation
     */
    private _cards: ICard[];

    /**
     * Palo asignado a esta foundation
     */
    private _suit: Suit | null;

    /**
     * Constructor de la foundation
     * @param index - Índice de la foundation (0-3)
     */
    constructor(index: number) {
        this.index = index;
        this._cards = [];
        this._suit = null;
    }

    /**
     * Palo asignado a esta foundation
     */
    public get suit(): Suit | null {
        return this._suit;
    }

    /**
     * Todas las cartas en la foundation (solo lectura)
     */
    public get cards(): readonly ICard[] {
        return this._cards;
    }

    /**
     * Número de cartas en la foundation
     */
    public get count(): number {
        return this._cards.length;
    }

    /**
     * Indica si la foundation está vacía
     */
    public get isEmpty(): boolean {
        return this._cards.length === 0;
    }

    /**
     * Indica si la foundation está completa (13 cartas)
     */
    public get isComplete(): boolean {
        return this._cards.length === 13;
    }

    /**
     * Obtiene la carta en la cima
     */
    public getTopCard(): ICard | null {
        if (this.isEmpty) {
            return null;
        }
        return this._cards[this._cards.length - 1];
    }

    /**
     * Verifica si una carta puede colocarse en esta foundation
     * @param card - La carta a verificar
     */
    public canAcceptCard(card: ICard): boolean {
        // Si está completa, no acepta más cartas
        if (this.isComplete) {
            return false;
        }

        // Si está vacía, solo acepta Ases
        if (this.isEmpty) {
            return card.value === 1;
        }

        const topCard = this.getTopCard()!;
        
        // Usar el método de la carta para verificar
        return card.canPlaceOnFoundation(topCard, this._suit);
    }

    /**
     * Agrega una carta a la foundation
     * @param card - La carta a agregar
     */
    public addCard(card: ICard): boolean {
        if (!this.canAcceptCard(card)) {
            return false;
        }

        // Si es la primera carta, asignar el palo
        if (this.isEmpty) {
            this._suit = card.suit;
        }

        this._cards.push(card);
        return true;
    }

    /**
     * Remueve la carta de la cima
     */
    public removeTopCard(): ICard | null {
        if (this.isEmpty) {
            return null;
        }

        const card = this._cards.pop()!;

        // Si queda vacía, limpiar el palo
        if (this.isEmpty) {
            this._suit = null;
        }

        return card;
    }

    /**
     * Limpia la foundation
     */
    public clear(): void {
        this._cards = [];
        this._suit = null;
    }

    /**
     * Restaura la foundation con cartas específicas (para deshacer)
     * @param cards - Las cartas a restaurar
     */
    public restoreCards(cards: ICard[]): void {
        this._cards = [...cards];
        // Actualizar el palo basado en las cartas
        if (this._cards.length > 0) {
            this._suit = this._cards[0].suit;
        } else {
            this._suit = null;
        }
    }
}

