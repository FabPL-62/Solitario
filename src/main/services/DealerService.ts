import { Card } from '../entities/Card';
import { DealResult, IDealerService } from '../interfaces/IDealerService';
import { ICard } from '../interfaces/ICard';
import { CardValue, ALL_CARD_VALUES } from '../types/CardValue';
import { DifficultyType } from '../types/DifficultyType';
import { Suit, ALL_SUITS } from '../types/Suit';

/**
 * Servicio encargado de generar y repartir las cartas
 */
export class DealerService implements IDealerService {
    /**
     * Semilla actual para el generador aleatorio
     */
    private _seed: number;

    /**
     * Constructor del servicio
     * @param seed - Semilla inicial opcional
     */
    constructor(seed?: number) {
        this._seed = seed ?? Date.now();
    }

    /**
     * Generador de números pseudo-aleatorios (Mulberry32)
     * @returns Un número entre 0 y 1
     */
    private random(): number {
        let t = this._seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    /**
     * Genera un mazo completo de 52 cartas
     */
    public generateDeck(): ICard[] {
        const cards: ICard[] = [];

        for (const suit of ALL_SUITS) {
            for (const value of ALL_CARD_VALUES) {
                cards.push(new Card(suit, value));
            }
        }

        return cards;
    }

    /**
     * Mezcla las cartas usando Fisher-Yates
     * @param cards - Las cartas a mezclar
     */
    public shuffle(cards: ICard[]): ICard[] {
        const shuffled = [...cards];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * Establece la semilla del generador
     * @param seed - Nueva semilla
     */
    public setSeed(seed: number): void {
        this._seed = seed;
    }

    /**
     * Reparte las cartas para iniciar el juego
     * @param difficulty - Nivel de dificultad
     * @param seed - Semilla opcional
     */
    public deal(difficulty: DifficultyType, seed?: number): DealResult {
        if (seed !== undefined) {
            this._seed = seed;
        }

        // Generar y mezclar el mazo
        let deck = this.generateDeck();
        deck = this.shuffle(deck);

        // Repartir al tableau (7 pilas)
        // Pila 0: 1 carta, Pila 1: 2 cartas, ..., Pila 6: 7 cartas
        const tableauCards: ICard[][] = [];
        let cardIndex = 0;

        for (let pileIndex = 0; pileIndex < 7; pileIndex++) {
            const pileCards: ICard[] = [];
            const cardCount = pileIndex + 1;

            for (let i = 0; i < cardCount; i++) {
                const card = deck[cardIndex++];
                // Solo la última carta de cada pila está boca arriba
                if (i === cardCount - 1) {
                    card.reveal();
                } else {
                    card.hide();
                }
                pileCards.push(card);
            }

            tableauCards.push(pileCards);
        }

        // Las cartas restantes van al stock
        const stockCards = deck.slice(cardIndex);
        stockCards.forEach(card => card.hide());

        return {
            stockCards,
            tableauCards,
        };
    }

    /**
     * Genera un reparto garantizado como ganable
     * Nota: Implementación simplificada - genera un reparto estándar
     * @param difficulty - Nivel de dificultad
     */
    public dealWinnable(difficulty: DifficultyType): DealResult {
        // Por ahora, usa el reparto estándar
        // Una implementación más avanzada podría usar un solver
        return this.deal(difficulty);
    }

    /**
     * Obtiene la cantidad de cartas a robar según la dificultad
     * @param difficulty - Nivel de dificultad
     */
    public getDrawCount(difficulty: DifficultyType): number {
        switch (difficulty) {
            case 'easy':
                return 1; // Robar de 1 en 1
            case 'medium':
                return 1;
            case 'hard':
                return 3; // Robar de 3 en 3
            case 'expert':
                return 3;
            default:
                return 1;
        }
    }
}

