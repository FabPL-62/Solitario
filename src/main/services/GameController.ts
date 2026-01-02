import { Card } from '../entities/Card';
import { Deck } from '../entities/Deck';
import { Foundation } from '../entities/Foundation';
import { Tableau } from '../entities/Tableau';
import { WastePile } from '../entities/WastePile';
import { CardLocation, IGameController, MoveResult } from '../interfaces/IGameController';
import { ICard } from '../interfaces/ICard';
import { IDeck } from '../interfaces/IDeck';
import { IFoundation } from '../interfaces/IFoundation';
import { IScoreManager } from '../interfaces/IScoreManager';
import { ITableau } from '../interfaces/ITableau';
import { IWastePile } from '../interfaces/IWastePile';
import { DifficultyType } from '../types/DifficultyType';
import { DealerService } from './DealerService';
import { GameState, MoveHistory } from './MoveHistory';
import { ScoreManager } from './ScoreManager';

/**
 * Controlador principal del juego de Solitario
 * Orquesta todos los componentes y gestiona la lógica del juego
 */
export class GameController implements IGameController {
    /**
     * Servicio de reparto
     */
    private _dealerService: DealerService;

    /**
     * El mazo de cartas
     */
    private _deck: Deck;

    /**
     * La pila de descarte
     */
    private _wastePile: WastePile;

    /**
     * Las 7 pilas del tableau
     */
    private _tableaus: Tableau[];

    /**
     * Las 4 foundations
     */
    private _foundations: Foundation[];

    /**
     * Gestor de puntaje
     */
    private _scoreManager: ScoreManager;

    /**
     * Dificultad actual
     */
    private _difficulty: DifficultyType;

    /**
     * Historial de movimientos para deshacer
     */
    private _moveHistory: MoveHistory;

    /**
     * Mapa de todas las cartas por ID
     */
    private _allCards: Map<string, Card>;

    /**
     * Constructor del controlador
     */
    constructor() {
        this._dealerService = new DealerService();
        this._scoreManager = new ScoreManager();
        this._moveHistory = new MoveHistory();
        this._deck = new Deck();
        this._wastePile = new WastePile();
        this._tableaus = [];
        this._foundations = [];
        this._difficulty = 'easy';
        this._allCards = new Map();

        this.initializeComponents();
    }

    /**
     * Inicializa los componentes del juego
     */
    private initializeComponents(): void {
        // Crear 7 tableaus
        this._tableaus = [];
        for (let i = 0; i < 7; i++) {
            this._tableaus.push(new Tableau(i));
        }

        // Crear 4 foundations
        this._foundations = [];
        for (let i = 0; i < 4; i++) {
            this._foundations.push(new Foundation(i));
        }
    }

    // Getters públicos
    public get deck(): IDeck {
        return this._deck;
    }

    public get wastePile(): IWastePile {
        return this._wastePile;
    }

    public get tableaus(): readonly ITableau[] {
        return this._tableaus;
    }

    public get foundations(): readonly IFoundation[] {
        return this._foundations;
    }

    public get scoreManager(): IScoreManager {
        return this._scoreManager;
    }

    public get difficulty(): DifficultyType {
        return this._difficulty;
    }

    /**
     * Indica si se puede deshacer un movimiento
     */
    public get canUndo(): boolean {
        return this._moveHistory.canUndo;
    }

    /**
     * Verifica si el juego ha sido ganado
     */
    public get isWon(): boolean {
        return this._foundations.every(f => f.isComplete);
    }

    /**
     * Verifica si hay movimientos disponibles
     */
    public get hasAvailableMoves(): boolean {
        // Verificar si hay cartas en el deck o waste
        if (!this._deck.isEmpty || !this._wastePile.isEmpty) {
            return true;
        }

        // Verificar movimientos del waste
        const wasteCard = this._wastePile.getTopCard();
        if (wasteCard) {
            // Puede ir a algún tableau o foundation
            for (const tableau of this._tableaus) {
                if (tableau.canAcceptCard(wasteCard)) return true;
            }
            for (const foundation of this._foundations) {
                if (foundation.canAcceptCard(wasteCard)) return true;
            }
        }

        // Verificar movimientos de tableau a tableau o foundation
        for (const tableau of this._tableaus) {
            const faceUpCards = tableau.getFaceUpCards();
            if (faceUpCards.length === 0) continue;

            // Primera carta visible puede moverse a otro tableau
            const firstFaceUp = faceUpCards[0];
            for (const otherTableau of this._tableaus) {
                if (otherTableau.index !== tableau.index && otherTableau.canAcceptCard(firstFaceUp)) {
                    return true;
                }
            }

            // Carta superior puede ir a foundation
            const topCard = tableau.getTopCard();
            if (topCard) {
                for (const foundation of this._foundations) {
                    if (foundation.canAcceptCard(topCard)) return true;
                }
            }
        }

        return false;
    }

    /**
     * Inicia un nuevo juego
     * @param difficulty - Nivel de dificultad
     * @param seed - Semilla opcional
     */
    public newGame(difficulty: DifficultyType, seed?: number): void {
        this._difficulty = difficulty;

        // Reiniciar componentes
        this._scoreManager.reset();
        this._wastePile.clear();
        this._foundations.forEach(f => f.clear());
        this._tableaus.forEach(t => t.clear());
        this._moveHistory.clear();
        this._allCards.clear();

        // Repartir cartas
        const dealResult = this._dealerService.deal(difficulty, seed);

        // Configurar el deck
        const drawCount = this._dealerService.getDrawCount(difficulty);
        this._deck = new Deck(dealResult.stockCards, drawCount);

        // Distribuir al tableau
        for (let i = 0; i < 7; i++) {
            this._tableaus[i].initialize(dealResult.tableauCards[i]);
        }

        // Registrar todas las cartas
        this.registerAllCards();
    }

    /**
     * Registra todas las cartas en el mapa para poder restaurar estados
     */
    private registerAllCards(): void {
        // Cartas del deck
        for (const card of this._deck.cards) {
            this._allCards.set(card.id, card as Card);
        }

        // Cartas del waste
        for (const card of this._wastePile.cards) {
            this._allCards.set(card.id, card as Card);
        }

        // Cartas de los tableaus
        for (const tableau of this._tableaus) {
            for (const card of tableau.cards) {
                this._allCards.set(card.id, card as Card);
            }
        }

        // Cartas de las foundations
        for (const foundation of this._foundations) {
            for (const card of foundation.cards) {
                this._allCards.set(card.id, card as Card);
            }
        }
    }

    /**
     * Guarda el estado actual del juego en el historial
     */
    private saveState(): void {
        const state: GameState = {
            deckCards: this._deck.cards.map(c => ({ id: c.id, isFaceUp: c.isFaceUp })),
            wasteCards: this._wastePile.cards.map(c => ({ id: c.id, isFaceUp: c.isFaceUp })),
            tableauCards: this._tableaus.map(t => 
                t.cards.map(c => ({ id: c.id, isFaceUp: c.isFaceUp }))
            ),
            foundationCards: this._foundations.map(f => 
                f.cards.map(c => ({ id: c.id, isFaceUp: c.isFaceUp }))
            ),
            score: this._scoreManager.score,
            moves: this._scoreManager.moves
        };

        this._moveHistory.pushState(state);
    }

    /**
     * Deshace el último movimiento
     * @returns true si se pudo deshacer, false si no hay movimientos
     */
    public undo(): boolean {
        const previousState = this._moveHistory.popState();
        if (!previousState) {
            return false;
        }

        // Restaurar el deck
        const deckCards: Card[] = [];
        for (const cardState of previousState.deckCards) {
            const card = this._allCards.get(cardState.id);
            if (card) {
                if (card.isFaceUp !== cardState.isFaceUp) {
                    card.flip();
                }
                deckCards.push(card);
            }
        }
        this._deck.restoreCards(deckCards);

        // Restaurar el waste
        this._wastePile.clear();
        for (const cardState of previousState.wasteCards) {
            const card = this._allCards.get(cardState.id);
            if (card) {
                if (card.isFaceUp !== cardState.isFaceUp) {
                    card.flip();
                }
                this._wastePile.addCards([card]);
            }
        }

        // Restaurar los tableaus
        for (let i = 0; i < 7; i++) {
            const tableauCards: Card[] = [];
            for (const cardState of previousState.tableauCards[i]) {
                const card = this._allCards.get(cardState.id);
                if (card) {
                    if (card.isFaceUp !== cardState.isFaceUp) {
                        card.flip();
                    }
                    tableauCards.push(card);
                }
            }
            this._tableaus[i].restoreCards(tableauCards);
        }

        // Restaurar las foundations
        for (let i = 0; i < 4; i++) {
            const foundationCards: Card[] = [];
            for (const cardState of previousState.foundationCards[i]) {
                const card = this._allCards.get(cardState.id);
                if (card) {
                    if (card.isFaceUp !== cardState.isFaceUp) {
                        card.flip();
                    }
                    foundationCards.push(card);
                }
            }
            this._foundations[i].restoreCards(foundationCards);
        }

        // Restaurar puntaje y movimientos
        this._scoreManager.restoreState(previousState.score, previousState.moves);

        return true;
    }

    /**
     * Roba cartas del mazo
     */
    public drawFromDeck(): MoveResult {
        // Guardar estado antes del movimiento
        this.saveState();

        if (this._deck.isEmpty) {
            // Reciclar waste pile
            if (this._wastePile.isEmpty) {
                // Revertir el guardado si no hay movimiento
                this._moveHistory.popState();
                return { success: false, message: 'No hay cartas para reciclar' };
            }

            const wasteCards = this._wastePile.removeAll();
            this._deck.recycle(wasteCards);
            
            // Penalización por reciclar en modo 1 carta
            if (this._deck.drawCount === 1) {
                this._scoreManager.recordAction('recycle_waste');
            }

            return { success: true, message: 'Mazo reciclado' };
        }

        const drawnCards = this._deck.draw();
        this._wastePile.addCards(drawnCards);
        
        return { success: true, message: `Robaste ${drawnCards.length} carta(s)` };
    }

    /**
     * Mueve una carta del waste al tableau
     * @param tableauIndex - Índice del tableau destino
     */
    public moveWasteToTableau(tableauIndex: number): MoveResult {
        const card = this._wastePile.getTopCard();
        if (!card) {
            return { success: false, message: 'No hay carta en el waste' };
        }

        const tableau = this._tableaus[tableauIndex];
        if (!tableau) {
            return { success: false, message: 'Tableau inválido' };
        }

        if (!tableau.canAcceptCard(card)) {
            return { success: false, message: 'Movimiento no permitido' };
        }

        // Guardar estado antes del movimiento
        this.saveState();

        this._wastePile.removeTopCard();
        tableau.addCards([card]);
        
        this._scoreManager.recordAction('waste_to_tableau');
        this._scoreManager.incrementMoves();

        return { success: true };
    }

    /**
     * Mueve una carta del waste a la foundation
     * @param foundationIndex - Índice de la foundation destino
     */
    public moveWasteToFoundation(foundationIndex: number): MoveResult {
        const card = this._wastePile.getTopCard();
        if (!card) {
            return { success: false, message: 'No hay carta en el waste' };
        }

        const foundation = this._foundations[foundationIndex];
        if (!foundation) {
            return { success: false, message: 'Foundation inválida' };
        }

        if (!foundation.canAcceptCard(card)) {
            return { success: false, message: 'Movimiento no permitido' };
        }

        // Guardar estado antes del movimiento
        this.saveState();

        this._wastePile.removeTopCard();
        foundation.addCard(card);
        
        this._scoreManager.recordAction('waste_to_foundation');
        this._scoreManager.incrementMoves();

        return { success: true };
    }

    /**
     * Mueve cartas de un tableau a otro
     * @param fromTableau - Índice del tableau origen
     * @param cardIndex - Índice de la carta a mover
     * @param toTableau - Índice del tableau destino
     */
    public moveTableauToTableau(fromTableau: number, cardIndex: number, toTableau: number): MoveResult {
        const sourceTableau = this._tableaus[fromTableau];
        const targetTableau = this._tableaus[toTableau];

        if (!sourceTableau || !targetTableau) {
            return { success: false, message: 'Tableau inválido' };
        }

        if (fromTableau === toTableau) {
            return { success: false, message: 'Mismo tableau' };
        }

        const cards = sourceTableau.cards;
        if (cardIndex < 0 || cardIndex >= cards.length) {
            return { success: false, message: 'Índice de carta inválido' };
        }

        const cardToMove = cards[cardIndex];
        if (!cardToMove.isFaceUp) {
            return { success: false, message: 'La carta está boca abajo' };
        }

        if (!targetTableau.canAcceptCard(cardToMove)) {
            return { success: false, message: 'Movimiento no permitido' };
        }

        // Guardar estado antes del movimiento
        this.saveState();

        // Remover las cartas del origen
        const movedCards = sourceTableau.removeCardsFrom(cardIndex);
        
        // Agregar al destino
        targetTableau.addCards(movedCards);

        // Revelar la carta que queda arriba
        const hadFaceDownCard = !sourceTableau.isEmpty && !sourceTableau.getTopCard()!.isFaceUp;
        sourceTableau.revealTopCard();
        
        if (hadFaceDownCard) {
            this._scoreManager.recordAction('flip_tableau_card');
        }

        this._scoreManager.incrementMoves();

        return { success: true };
    }

    /**
     * Mueve la carta superior de un tableau a la foundation
     * @param tableauIndex - Índice del tableau origen
     * @param foundationIndex - Índice de la foundation destino
     */
    public moveTableauToFoundation(tableauIndex: number, foundationIndex: number): MoveResult {
        const tableau = this._tableaus[tableauIndex];
        const foundation = this._foundations[foundationIndex];

        if (!tableau || !foundation) {
            return { success: false, message: 'Índice inválido' };
        }

        const card = tableau.getTopCard();
        if (!card) {
            return { success: false, message: 'Tableau vacío' };
        }

        if (!card.isFaceUp) {
            return { success: false, message: 'La carta está boca abajo' };
        }

        if (!foundation.canAcceptCard(card)) {
            return { success: false, message: 'Movimiento no permitido' };
        }

        // Guardar estado antes del movimiento
        this.saveState();

        // Remover del tableau
        tableau.removeCardsFrom(tableau.count - 1);
        
        // Agregar a foundation
        foundation.addCard(card);

        // Revelar la carta que queda arriba
        const hadFaceDownCard = !tableau.isEmpty && !tableau.getTopCard()!.isFaceUp;
        tableau.revealTopCard();
        
        if (hadFaceDownCard) {
            this._scoreManager.recordAction('flip_tableau_card');
        }

        this._scoreManager.recordAction('tableau_to_foundation');
        this._scoreManager.incrementMoves();

        return { success: true };
    }

    /**
     * Mueve una carta de la foundation al tableau
     * @param foundationIndex - Índice de la foundation origen
     * @param tableauIndex - Índice del tableau destino
     */
    public moveFoundationToTableau(foundationIndex: number, tableauIndex: number): MoveResult {
        const foundation = this._foundations[foundationIndex];
        const tableau = this._tableaus[tableauIndex];

        if (!foundation || !tableau) {
            return { success: false, message: 'Índice inválido' };
        }

        const card = foundation.getTopCard();
        if (!card) {
            return { success: false, message: 'Foundation vacía' };
        }

        if (!tableau.canAcceptCard(card)) {
            return { success: false, message: 'Movimiento no permitido' };
        }

        // Guardar estado antes del movimiento
        this.saveState();

        // Remover de foundation
        foundation.removeTopCard();
        
        // Agregar al tableau
        tableau.addCards([card]);

        this._scoreManager.recordAction('foundation_to_tableau');
        this._scoreManager.incrementMoves();

        return { success: true };
    }

    /**
     * Intenta mover una carta automáticamente
     * @param location - Ubicación de la carta
     */
    public autoMove(location: CardLocation): MoveResult {
        if (location.type === 'waste') {
            const card = this._wastePile.getTopCard();
            if (!card) {
                return { success: false, message: 'No hay carta' };
            }

            // Intentar foundation primero
            for (let i = 0; i < 4; i++) {
                if (this._foundations[i].canAcceptCard(card)) {
                    return this.moveWasteToFoundation(i);
                }
            }

            // Intentar tableau
            for (let i = 0; i < 7; i++) {
                if (this._tableaus[i].canAcceptCard(card)) {
                    return this.moveWasteToTableau(i);
                }
            }
        } else if (location.type === 'tableau') {
            const tableau = this._tableaus[location.index];
            const card = tableau.getTopCard();
            if (!card) {
                return { success: false, message: 'Tableau vacío' };
            }

            // Intentar foundation primero
            for (let i = 0; i < 4; i++) {
                if (this._foundations[i].canAcceptCard(card)) {
                    return this.moveTableauToFoundation(location.index, i);
                }
            }
        } else if (location.type === 'foundation') {
            const foundation = this._foundations[location.index];
            const card = foundation.getTopCard();
            if (!card) {
                return { success: false, message: 'Foundation vacía' };
            }

            // Intentar tableau
            for (let i = 0; i < 7; i++) {
                if (this._tableaus[i].canAcceptCard(card)) {
                    return this.moveFoundationToTableau(location.index, i);
                }
            }
        }

        return { success: false, message: 'No hay movimiento automático disponible' };
    }

    /**
     * Verifica si el juego está sin solución
     */
    public checkGameOver(): boolean {
        return !this.hasAvailableMoves && !this.isWon;
    }

    /**
     * Obtiene una pista del siguiente movimiento
     */
    public getHint(): { from: CardLocation; to: CardLocation } | null {
        // Buscar movimientos al foundation desde tableau
        for (let i = 0; i < 7; i++) {
            const card = this._tableaus[i].getTopCard();
            if (card && card.isFaceUp) {
                for (let j = 0; j < 4; j++) {
                    if (this._foundations[j].canAcceptCard(card)) {
                        return {
                            from: { type: 'tableau', index: i, cardIndex: this._tableaus[i].count - 1 },
                            to: { type: 'foundation', index: j }
                        };
                    }
                }
            }
        }

        // Buscar movimientos del waste al foundation
        const wasteCard = this._wastePile.getTopCard();
        if (wasteCard) {
            for (let j = 0; j < 4; j++) {
                if (this._foundations[j].canAcceptCard(wasteCard)) {
                    return {
                        from: { type: 'waste' },
                        to: { type: 'foundation', index: j }
                    };
                }
            }
        }

        // Buscar movimientos entre tableaus
        for (let i = 0; i < 7; i++) {
            const faceUpCards = this._tableaus[i].getFaceUpCards();
            if (faceUpCards.length === 0) continue;

            const firstFaceUp = faceUpCards[0];
            const cardIndex = this._tableaus[i].getCardIndex(firstFaceUp);

            for (let j = 0; j < 7; j++) {
                if (i !== j && this._tableaus[j].canAcceptCard(firstFaceUp)) {
                    // Evitar movimientos circulares sin beneficio
                    const sourceHasHiddenCards = cardIndex > 0;
                    if (sourceHasHiddenCards || this._tableaus[j].isEmpty) {
                        return {
                            from: { type: 'tableau', index: i, cardIndex },
                            to: { type: 'tableau', index: j }
                        };
                    }
                }
            }
        }

        // Buscar movimientos del waste al tableau
        if (wasteCard) {
            for (let j = 0; j < 7; j++) {
                if (this._tableaus[j].canAcceptCard(wasteCard)) {
                    return {
                        from: { type: 'waste' },
                        to: { type: 'tableau', index: j }
                    };
                }
            }
        }

        // Si hay cartas en el deck, sugerir robar
        if (!this._deck.isEmpty) {
            return {
                from: { type: 'deck' },
                to: { type: 'waste' }
            };
        }

        return null;
    }

    /**
     * Actualiza el estado del juego
     * @param deltaTime - Tiempo transcurrido en ms
     */
    public update(deltaTime: number): void {
        this._scoreManager.updateTime(deltaTime);
    }
}

