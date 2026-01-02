import { ICard } from '../interfaces/ICard';
import { ITableau } from '../interfaces/ITableau';

/**
 * Entidad que representa una pila del tableau (zona de juego)
 * En el solitario Klondike hay 7 pilas
 */
export class Tableau implements ITableau {
    /**
     * Identificador de la pila (0-6)
     */
    public readonly index: number;

    /**
     * Las cartas en la pila
     */
    private _cards: ICard[];

    /**
     * Constructor del tableau
     * @param index - Índice de la pila (0-6)
     * @param initialCards - Cartas iniciales (opcional)
     */
    constructor(index: number, initialCards: ICard[] = []) {
        this.index = index;
        this._cards = [...initialCards];
    }

    /**
     * Todas las cartas en la pila (solo lectura)
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
     * Obtiene las cartas boca arriba (movibles)
     */
    public getFaceUpCards(): ICard[] {
        const faceUpCards: ICard[] = [];
        for (let i = this._cards.length - 1; i >= 0; i--) {
            if (this._cards[i].isFaceUp) {
                faceUpCards.unshift(this._cards[i]);
            } else {
                break;
            }
        }
        return faceUpCards;
    }

    /**
     * Verifica si una carta puede colocarse en esta pila
     * Regla: Rey en pila vacía, o color opuesto y valor menor por 1
     * @param card - La carta a colocar
     */
    public canAcceptCard(card: ICard): boolean {
        // Si está vacía, solo acepta Reyes
        if (this.isEmpty) {
            return card.value === 13; // Rey
        }

        const topCard = this.getTopCard()!;
        
        // La carta de la cima debe estar boca arriba
        if (!topCard.isFaceUp) {
            return false;
        }

        // Usar el método de la carta para verificar
        return card.canStackOnTableau(topCard);
    }

    /**
     * Agrega cartas a la cima de la pila
     * @param cards - Las cartas a agregar
     */
    public addCards(cards: ICard[]): boolean {
        if (cards.length === 0) {
            return false;
        }

        // Verificar que la primera carta puede colocarse
        if (!this.canAcceptCard(cards[0])) {
            return false;
        }

        // Agregar todas las cartas
        this._cards.push(...cards);
        return true;
    }

    /**
     * Remueve cartas desde una posición hasta la cima
     * @param fromIndex - Índice desde donde remover
     */
    public removeCardsFrom(fromIndex: number): ICard[] {
        if (fromIndex < 0 || fromIndex >= this._cards.length) {
            return [];
        }

        const removedCards = this._cards.splice(fromIndex);
        return removedCards;
    }

    /**
     * Revela la carta en la cima si está boca abajo
     */
    public revealTopCard(): void {
        const topCard = this.getTopCard();
        if (topCard && !topCard.isFaceUp) {
            topCard.reveal();
        }
    }

    /**
     * Obtiene el índice de una carta específica
     * @param card - La carta a buscar
     */
    public getCardIndex(card: ICard): number {
        return this._cards.findIndex(c => c.id === card.id);
    }

    /**
     * Inicializa la pila con cartas (para el reparto inicial)
     * @param cards - Las cartas a colocar
     */
    public initialize(cards: ICard[]): void {
        this._cards = [...cards];
    }

    /**
     * Limpia la pila
     */
    public clear(): void {
        this._cards = [];
    }

    /**
     * Restaura la pila con cartas específicas (para deshacer)
     * @param cards - Las cartas a restaurar
     */
    public restoreCards(cards: ICard[]): void {
        this._cards = [...cards];
    }
}

