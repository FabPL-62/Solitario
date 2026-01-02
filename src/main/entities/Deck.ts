import { ICard } from '../interfaces/ICard';
import { IDeck } from '../interfaces/IDeck';

/**
 * Entidad que representa el mazo de cartas (Stock)
 */
export class Deck implements IDeck {
    /**
     * Las cartas en el mazo
     */
    private _cards: ICard[];

    /**
     * Cantidad de cartas a robar por click
     */
    private _drawCount: number;

    /**
     * Constructor del mazo
     * @param cards - Cartas iniciales
     * @param drawCount - Cantidad de cartas a robar (1 o 3)
     */
    constructor(cards: ICard[] = [], drawCount: number = 1) {
        this._cards = [...cards];
        this._drawCount = drawCount;
        
        // Asegurar que todas las cartas estén boca abajo
        this._cards.forEach(card => card.hide());
    }

    /**
     * Cartas en el mazo (solo lectura)
     */
    public get cards(): readonly ICard[] {
        return this._cards;
    }

    /**
     * Número de cartas en el mazo
     */
    public get count(): number {
        return this._cards.length;
    }

    /**
     * Indica si el mazo está vacío
     */
    public get isEmpty(): boolean {
        return this._cards.length === 0;
    }

    /**
     * Cantidad de cartas a robar por click
     */
    public get drawCount(): number {
        return this._drawCount;
    }

    /**
     * Establece la cantidad de cartas a robar
     */
    public set drawCount(value: number) {
        this._drawCount = Math.max(1, Math.min(3, value));
    }

    /**
     * Roba cartas del mazo
     * @returns Las cartas robadas (boca arriba)
     */
    public draw(): ICard[] {
        if (this.isEmpty) {
            return [];
        }

        const count = Math.min(this._drawCount, this._cards.length);
        const drawnCards = this._cards.splice(-count);
        
        // Voltear las cartas robadas
        drawnCards.forEach(card => card.reveal());
        
        return drawnCards;
    }

    /**
     * Recicla las cartas del waste pile de vuelta al mazo
     * @param wasteCards - Las cartas del waste pile
     */
    public recycle(wasteCards: ICard[]): void {
        // Las cartas se agregan en orden inverso y boca abajo
        const recycledCards = [...wasteCards].reverse();
        recycledCards.forEach(card => card.hide());
        this._cards = recycledCards;
    }

    /**
     * Reinicia el mazo con un nuevo conjunto de cartas
     * @param cards - Las cartas para el mazo
     */
    public reset(cards: ICard[]): void {
        this._cards = [...cards];
        this._cards.forEach(card => card.hide());
    }

    /**
     * Limpia el mazo
     */
    public clear(): void {
        this._cards = [];
    }

    /**
     * Restaura el mazo con cartas específicas (para deshacer)
     * @param cards - Las cartas a restaurar
     */
    public restoreCards(cards: ICard[]): void {
        this._cards = [...cards];
    }
}

