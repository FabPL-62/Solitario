import { ICard } from '../interfaces/ICard';
import { IWastePile } from '../interfaces/IWastePile';

/**
 * Entidad que representa la pila de descarte (Waste Pile)
 * Aquí se colocan las cartas robadas del mazo
 */
export class WastePile implements IWastePile {
    /**
     * Las cartas en la pila
     */
    private _cards: ICard[];

    /**
     * Constructor de la pila de descarte
     */
    constructor() {
        this._cards = [];
    }

    /**
     * Cartas en la pila (solo lectura)
     */
    public get cards(): readonly ICard[] {
        return this._cards;
    }

    /**
     * Número de cartas en la pila
     */
    public get count(): number {
        return this._cards.length;
    }

    /**
     * Indica si la pila está vacía
     */
    public get isEmpty(): boolean {
        return this._cards.length === 0;
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
     * Agrega cartas a la pila
     * @param cards - Las cartas a agregar
     */
    public addCards(cards: ICard[]): void {
        // Asegurar que estén boca arriba
        cards.forEach(card => card.reveal());
        this._cards.push(...cards);
    }

    /**
     * Remueve la carta de la cima
     */
    public removeTopCard(): ICard | null {
        if (this.isEmpty) {
            return null;
        }
        return this._cards.pop()!;
    }

    /**
     * Remueve y retorna todas las cartas
     */
    public removeAll(): ICard[] {
        const cards = [...this._cards];
        this._cards = [];
        return cards;
    }

    /**
     * Limpia la pila
     */
    public clear(): void {
        this._cards = [];
    }
}

