import { Scene, GameObjects } from 'phaser';
import { GameManager } from '../../main/services/GameManager';
import { GameController } from '../../main/services/GameController';
import { CardSprite } from '../components/CardSprite';
import { GameConfigManager } from '../config/GameConfig';
import { ICard } from '../../main/interfaces/ICard';
import { CardLocation } from '../../main/interfaces/IGameController';
import { DifficultyType } from '../../main/types/DifficultyType';

/**
 * Escena principal del juego de Solitario
 */
export class Main extends Scene {
    /**
     * Gestor del juego
     */
    private _gameManager!: GameManager;

    /**
     * Mapa de cartas lógicas a sprites
     */
    private _cardSprites: Map<string, CardSprite> = new Map();

    /**
     * Grupo de cartas siendo arrastradas
     */
    private _dragGroup: CardSprite[] = [];

    /**
     * Ubicación de la carta siendo arrastrada
     */
    private _dragSourceLocation: CardLocation | null = null;

    /**
     * Placeholder para zonas vacías
     */
    private _placeholders: GameObjects.Rectangle[] = [];

    /**
     * Textos de UI
     */
    private _scoreText!: GameObjects.Text;
    private _movesText!: GameObjects.Text;
    private _timeText!: GameObjects.Text;

    /**
     * Botón de deshacer
     */
    private _undoBtn!: GameObjects.Text;

    /**
     * Elementos del mensaje de fin de juego (victoria/game over)
     */
    private _endGameElements: GameObjects.GameObject[] = [];

    /**
     * Última vez de actualización
     */
    private _lastTime: number = 0;

    constructor() {
        super('Main');
    }

    create(): void {
        // Seleccionar fondo de carta aleatorio al inicio
        GameConfigManager.instance.randomizeCardBack();

        const config = GameConfigManager.instance.config;

        // Fondo verde de mesa
        this.cameras.main.setBackgroundColor(0x1a472a);

        // Crear UI
        this.createUI();

        // Crear placeholders para zonas vacías
        this.createPlaceholders();

        // Inicializar el juego
        this._gameManager = new GameManager();
        this._gameManager.difficulty = 'easy';
        this._gameManager.onWin(() => this.onWin());
        this._gameManager.onGameOver(() => this.onGameOver());
        this._gameManager.start();

        // Crear sprites de cartas
        this.createAllCardSprites();

        // Posicionar cartas iniciales
        this.layoutCards();

        // Configurar interactividad del deck
        this.setupDeckInteraction();

        // Iniciar el tiempo
        this._lastTime = this.time.now;
    }

    /**
     * Crea la interfaz de usuario
     */
    private createUI(): void {
        const style = {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        };

        // Puntaje
        this._scoreText = this.add.text(10, 10, 'Puntaje: 0', style);

        // Movimientos
        this._movesText = this.add.text(150, 10, 'Movimientos: 0', style);

        // Tiempo
        this._timeText = this.add.text(330, 10, 'Tiempo: 00:00', style);

        // Botón de nuevo juego
        const newGameBtn = this.add.text(720, 10, '🔄 Nuevo', {
            ...style,
            backgroundColor: '#2d5a3d',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => newGameBtn.setStyle({ backgroundColor: '#3d7a4d' }))
        .on('pointerout', () => newGameBtn.setStyle({ backgroundColor: '#2d5a3d' }))
        .on('pointerdown', () => this.restartGame());

        // Botón de deshacer
        this._undoBtn = this.add.text(500, 10, '↩️ Deshacer', {
            ...style,
            backgroundColor: '#5a3d2d',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            if (this._gameManager?.gameController?.canUndo) {
                this._undoBtn.setStyle({ backgroundColor: '#7a5d4d' });
            }
        })
        .on('pointerout', () => this.updateUndoButton())
        .on('pointerdown', () => this.undoMove());

        // Botón de pista
        const hintBtn = this.add.text(620, 10, '💡 Pista', {
            ...style,
            backgroundColor: '#2d5a3d',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => hintBtn.setStyle({ backgroundColor: '#3d7a4d' }))
        .on('pointerout', () => hintBtn.setStyle({ backgroundColor: '#2d5a3d' }))
        .on('pointerdown', () => this.showHint());
    }

    /**
     * Actualiza el estado del botón de deshacer
     */
    private updateUndoButton(): void {
        if (this._gameManager?.gameController?.canUndo) {
            this._undoBtn.setStyle({ backgroundColor: '#5a3d2d' });
            this._undoBtn.setAlpha(1);
        } else {
            this._undoBtn.setStyle({ backgroundColor: '#3a2d1d' });
            this._undoBtn.setAlpha(0.5);
        }
    }

    /**
     * Deshace el último movimiento
     */
    private undoMove(): void {
        if (!this._gameManager?.gameController?.canUndo) {
            return;
        }

        const success = this._gameManager.gameController.undo();
        if (success) {
            // Actualizar todas las cartas
            this.layoutCards();
            this.updateUI();
        }
    }

    /**
     * Crea los placeholders para las zonas vacías
     */
    private createPlaceholders(): void {
        const config = GameConfigManager.instance.config;
        const { card, topRowY, tableauY } = config;

        // Placeholder del deck
        this.createPlaceholder(
            GameConfigManager.instance.getDeckX(),
            topRowY + card.frameHeight / 2,
            '♠'
        );

        // Placeholder del waste
        this.createPlaceholder(
            GameConfigManager.instance.getWasteX(),
            topRowY + card.frameHeight / 2,
            ''
        );

        // Placeholders de las foundations
        for (let i = 0; i < 4; i++) {
            const suits = ['♣', '♦', '♥', '♠'];
            this.createPlaceholder(
                GameConfigManager.instance.getFoundationX(i),
                topRowY + card.frameHeight / 2,
                suits[i]
            );
        }

        // Placeholders del tableau
        for (let i = 0; i < 7; i++) {
            this.createPlaceholder(
                GameConfigManager.instance.getTableauX(i),
                tableauY + card.frameHeight / 2,
                ''
            );
        }
    }

    /**
     * Crea un placeholder
     */
    private createPlaceholder(x: number, y: number, symbol: string): void {
        const config = GameConfigManager.instance.config;
        const { card } = config;

        const placeholder = this.add.rectangle(x, y, card.frameWidth - 4, card.frameHeight - 4)
            .setStrokeStyle(2, 0x4a7c4e)
            .setFillStyle(0x1a472a, 0.5);

        this._placeholders.push(placeholder);

        if (symbol) {
            const color = (symbol === '♦' || symbol === '♥') ? '#cc3333' : '#333333';
            this.add.text(x, y, symbol, {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: color
            }).setOrigin(0.5).setAlpha(0.5);
        }
    }

    /**
     * Crea todos los sprites de cartas
     */
    private createAllCardSprites(): void {
        const controller = this._gameManager.gameController;

        // Cartas del deck
        for (const card of controller.deck.cards) {
            this.createCardSprite(card);
        }

        // Cartas del tableau
        for (const tableau of controller.tableaus) {
            for (const card of tableau.cards) {
                this.createCardSprite(card);
            }
        }
    }

    /**
     * Crea un sprite para una carta
     */
    private createCardSprite(card: ICard): CardSprite {
        const sprite = new CardSprite(this, 0, 0, card);
        this._cardSprites.set(card.id, sprite);
        
        // Configurar eventos de drag
        sprite.on('card:dragstart', (cardSprite: CardSprite) => this.onCardDragStart(cardSprite));
        sprite.on('card:drag', (cardSprite: CardSprite, x: number, y: number) => this.onCardDrag(cardSprite, x, y));
        sprite.on('card:dragend', (cardSprite: CardSprite, originalPos: {x: number, y: number}) => this.onCardDragEnd(cardSprite, originalPos));
        
        // Configurar evento de doble clic para mover a foundation
        sprite.on('card:doubleclick', (cardSprite: CardSprite) => this.onCardDoubleClick(cardSprite));

        return sprite;
    }

    /**
     * Mapeo de palos a índices de foundation según el orden visual
     * Orden visual: ♣ (0), ♦ (1), ♥ (2), ♠ (3)
     */
    private static readonly SUIT_TO_FOUNDATION: Record<string, number> = {
        'Clubs': 0,
        'Diamonds': 1,
        'Hearts': 2,
        'Spades': 3,
    };

    /**
     * Encuentra la foundation correcta para una carta
     * Primero busca una foundation que ya tenga cartas del mismo palo,
     * si no, usa la foundation asignada al palo según el orden visual
     */
    private findCorrectFoundation(card: ICard): number {
        const controller = this._gameManager.gameController;
        
        // Primero buscar foundation que ya tenga el mismo palo
        for (let i = 0; i < 4; i++) {
            const foundation = controller.foundations[i];
            if (foundation.suit === card.suit) {
                return i;
            }
        }
        
        // Si no hay foundation con ese palo, usar la asignada por defecto
        return Main.SUIT_TO_FOUNDATION[card.suit];
    }

    /**
     * Handler de doble clic en una carta
     * Intenta mover la carta a la foundation correspondiente, o a un tableau si no es posible
     */
    private onCardDoubleClick(cardSprite: CardSprite): void {
        const card = cardSprite.card;
        const controller = this._gameManager.gameController;

        // Encontrar la ubicación de la carta
        const location = this.findCardLocation(card);
        if (!location) return;

        // Solo procesar cartas del waste o la carta superior de un tableau
        if (location.type === 'waste') {
            // PRIORIDAD 1: Intentar mover a la foundation correcta según el palo
            const wasteCard = controller.wastePile.getTopCard();
            if (wasteCard) {
                // Primero intentar la foundation que corresponde al palo
                const targetFoundation = this.findCorrectFoundation(wasteCard);
                let result = controller.moveWasteToFoundation(targetFoundation);
                if (result.success) {
                    this.layoutCards();
                    this.updateUI();
                    return;
                }
                
                // Si no funciona, intentar todas las foundations
                for (let i = 0; i < 4; i++) {
                    if (i !== targetFoundation) {
                        result = controller.moveWasteToFoundation(i);
                        if (result.success) {
                            this.layoutCards();
                            this.updateUI();
                            return;
                        }
                    }
                }
            }
            
            // PRIORIDAD 2: Si no puede ir a ninguna foundation, intentar mover a un tableau
            for (let i = 0; i < 7; i++) {
                const result = controller.moveWasteToTableau(i);
                if (result.success) {
                    this.layoutCards();
                    this.updateUI();
                    return;
                }
            }
        } else if (location.type === 'tableau') {
            const tableau = controller.tableaus[location.index];
            // Solo la carta superior puede ir a foundation con doble clic
            if (location.cardIndex === tableau.count - 1) {
                const topCard = tableau.getTopCard();
                if (topCard) {
                    // PRIORIDAD 1: Intentar la foundation que corresponde al palo
                    const targetFoundation = this.findCorrectFoundation(topCard);
                    let result = controller.moveTableauToFoundation(location.index, targetFoundation);
                    if (result.success) {
                        this.layoutCards();
                        this.updateUI();
                        return;
                    }
                    
                    // Si no funciona, intentar todas las foundations
                    for (let i = 0; i < 4; i++) {
                        if (i !== targetFoundation) {
                            result = controller.moveTableauToFoundation(location.index, i);
                            if (result.success) {
                                this.layoutCards();
                                this.updateUI();
                                return;
                            }
                        }
                    }
                }
                
                // PRIORIDAD 2: No intentar mover a otro tableau desde aquí 
                // (el usuario puede arrastrar si quiere hacer eso)
            }
        } else if (location.type === 'foundation') {
            // Mover carta de foundation a tableau con doble clic
            for (let i = 0; i < 7; i++) {
                const result = controller.moveFoundationToTableau(location.index, i);
                if (result.success) {
                    this.layoutCards();
                    this.updateUI();
                    return;
                }
            }
        }
    }

    /**
     * Posiciona todas las cartas según el estado del juego
     */
    private layoutCards(): void {
        const controller = this._gameManager.gameController;
        const config = GameConfigManager.instance.config;
        const { topRowY, tableauY, card, cardStackOffsetHidden, cardStackOffsetVisible } = config;

        let zIndex = 0;

        // Posicionar deck
        const deckX = GameConfigManager.instance.getDeckX();
        const deckY = topRowY + card.frameHeight / 2;
        
        for (const deckCard of controller.deck.cards) {
            const sprite = this._cardSprites.get(deckCard.id);
            if (sprite) {
                sprite.setPosition(deckX, deckY);
                sprite.setDepth(zIndex++);
                sprite.updateVisibility();
                sprite.disableDrag();
            }
        }

        // Posicionar waste pile
        const wasteX = GameConfigManager.instance.getWasteX();
        const wasteY = topRowY + card.frameHeight / 2;
        
        for (const wasteCard of controller.wastePile.cards) {
            const sprite = this._cardSprites.get(wasteCard.id);
            if (sprite) {
                sprite.setPosition(wasteX, wasteY);
                sprite.setDepth(zIndex++);
                sprite.updateVisibility();
                
                // Solo la carta de arriba se puede arrastrar
                if (wasteCard === controller.wastePile.getTopCard()) {
                    sprite.enableDrag();
                } else {
                    sprite.disableDrag();
                }
            }
        }

        // Posicionar foundations
        for (let i = 0; i < 4; i++) {
            const foundation = controller.foundations[i];
            const foundationX = GameConfigManager.instance.getFoundationX(i);
            const foundationY = topRowY + card.frameHeight / 2;

            for (const foundationCard of foundation.cards) {
                const sprite = this._cardSprites.get(foundationCard.id);
                if (sprite) {
                    sprite.setPosition(foundationX, foundationY);
                    sprite.setDepth(zIndex++);
                    sprite.updateVisibility();
                    
                    // Solo la carta superior de la foundation se puede arrastrar
                    if (foundationCard === foundation.getTopCard()) {
                        sprite.enableDrag();
                    } else {
                        sprite.disableDrag();
                    }
                }
            }
        }

        // Posicionar tableaus
        for (let i = 0; i < 7; i++) {
            const tableau = controller.tableaus[i];
            const tableauX = GameConfigManager.instance.getTableauX(i);

            // Acumular el offset vertical para cada carta
            let accumulatedY = tableauY + card.frameHeight / 2;

            for (let j = 0; j < tableau.cards.length; j++) {
                const tableauCard = tableau.cards[j];
                const sprite = this._cardSprites.get(tableauCard.id);
                
                if (sprite) {
                    sprite.setPosition(tableauX, accumulatedY);
                    sprite.setDepth(zIndex++);
                    sprite.updateVisibility();

                    // Solo las cartas boca arriba se pueden arrastrar
                    if (tableauCard.isFaceUp) {
                        sprite.enableDrag();
                    } else {
                        sprite.disableDrag();
                    }
                }

                // Agregar el offset para la siguiente carta
                const offset = tableauCard.isFaceUp ? cardStackOffsetVisible : cardStackOffsetHidden;
                accumulatedY += offset;
            }
        }
    }

    /**
     * Configura la interacción con el deck
     */
    private setupDeckInteraction(): void {
        const config = GameConfigManager.instance.config;
        const deckX = GameConfigManager.instance.getDeckX();
        const deckY = config.topRowY + config.card.frameHeight / 2;

        // Zona de click para el deck
        const deckZone = this.add.rectangle(deckX, deckY, config.card.frameWidth, config.card.frameHeight)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.onDeckClick());

        deckZone.setFillStyle(0x000000, 0); // Transparente
    }

    /**
     * Handler del click en el deck
     */
    private onDeckClick(): void {
        const result = this._gameManager.gameController.drawFromDeck();
        if (result.success) {
            this.layoutCards();
            this.updateUI();
        }
    }

    /**
     * Handler de inicio de arrastre de carta
     */
    private onCardDragStart(cardSprite: CardSprite): void {
        const card = cardSprite.card;
        const controller = this._gameManager.gameController;

        // Encontrar la ubicación de la carta
        this._dragSourceLocation = this.findCardLocation(card);
        
        if (!this._dragSourceLocation) return;

        // Si es del tableau, obtener todas las cartas desde esta hacia arriba
        if (this._dragSourceLocation.type === 'tableau') {
            const tableau = controller.tableaus[this._dragSourceLocation.index];
            const cardIndex = tableau.getCardIndex(card);
            
            // Agregar esta carta y todas las de encima al grupo de arrastre
            this._dragGroup = [];
            for (let i = cardIndex; i < tableau.cards.length; i++) {
                const c = tableau.cards[i];
                const sprite = this._cardSprites.get(c.id);
                if (sprite) {
                    this._dragGroup.push(sprite);
                    sprite.setDepth(1000 + i);
                }
            }
        } else {
            this._dragGroup = [cardSprite];
        }
    }

    /**
     * Handler de arrastre de carta
     */
    private onCardDrag(cardSprite: CardSprite, x: number, y: number): void {
        const config = GameConfigManager.instance.config;
        
        // Mover todas las cartas del grupo usando setPosition para actualizar la máscara
        for (let i = 0; i < this._dragGroup.length; i++) {
            const sprite = this._dragGroup[i];
            if (sprite !== cardSprite) {
                // Usar setPosition para que la máscara se actualice correctamente
                sprite.setPosition(x, y + (i * config.cardStackOffsetVisible));
            }
        }
    }

    /**
     * Handler de fin de arrastre
     */
    private onCardDragEnd(cardSprite: CardSprite, originalPos: { x: number, y: number }): void {
        if (!this._dragSourceLocation || this._dragGroup.length === 0) {
            this.layoutCards();
            return;
        }

        const controller = this._gameManager.gameController;
        const config = GameConfigManager.instance.config;
        const card = cardSprite.card;

        // Encontrar el destino basado en la posición
        const targetLocation = this.findDropTarget(cardSprite.x, cardSprite.y);
        
        let moveSuccess = false;

        if (targetLocation) {
            if (this._dragSourceLocation.type === 'waste') {
                if (targetLocation.type === 'tableau') {
                    moveSuccess = controller.moveWasteToTableau(targetLocation.index).success;
                } else if (targetLocation.type === 'foundation') {
                    moveSuccess = controller.moveWasteToFoundation(targetLocation.index).success;
                }
            } else if (this._dragSourceLocation.type === 'tableau') {
                if (targetLocation.type === 'tableau') {
                    moveSuccess = controller.moveTableauToTableau(
                        this._dragSourceLocation.index,
                        this._dragSourceLocation.cardIndex,
                        targetLocation.index
                    ).success;
                } else if (targetLocation.type === 'foundation' && this._dragGroup.length === 1) {
                    moveSuccess = controller.moveTableauToFoundation(
                        this._dragSourceLocation.index,
                        targetLocation.index
                    ).success;
                }
            } else if (this._dragSourceLocation.type === 'foundation') {
                // Mover desde foundation a tableau
                if (targetLocation.type === 'tableau') {
                    moveSuccess = controller.moveFoundationToTableau(
                        this._dragSourceLocation.index,
                        targetLocation.index
                    ).success;
                }
            }
        }

        // Actualizar visualización
        this.layoutCards();
        this.updateUI();

        // Limpiar grupo de arrastre
        this._dragGroup = [];
        this._dragSourceLocation = null;
    }

    /**
     * Encuentra la ubicación de una carta
     */
    private findCardLocation(card: ICard): CardLocation | null {
        const controller = this._gameManager.gameController;

        // Buscar en waste
        if (controller.wastePile.getTopCard()?.id === card.id) {
            return { type: 'waste' };
        }

        // Buscar en tableaus
        for (let i = 0; i < 7; i++) {
            const tableau = controller.tableaus[i];
            const cardIndex = tableau.getCardIndex(card);
            if (cardIndex >= 0) {
                return { type: 'tableau', index: i, cardIndex };
            }
        }

        // Buscar en foundations
        for (let i = 0; i < 4; i++) {
            const foundation = controller.foundations[i];
            if (foundation.getTopCard()?.id === card.id) {
                return { type: 'foundation', index: i };
            }
        }

        return null;
    }

    /**
     * Encuentra el destino del drop basado en posición
     */
    private findDropTarget(x: number, y: number): CardLocation | null {
        const config = GameConfigManager.instance.config;
        const { card, topRowY, tableauY } = config;
        const threshold = card.frameWidth / 2;

        // Verificar foundations
        if (y < tableauY) {
            for (let i = 0; i < 4; i++) {
                const fx = GameConfigManager.instance.getFoundationX(i);
                const fy = topRowY + card.frameHeight / 2;
                
                if (Math.abs(x - fx) < threshold && Math.abs(y - fy) < card.frameHeight) {
                    return { type: 'foundation', index: i };
                }
            }
        }

        // Verificar tableaus
        for (let i = 0; i < 7; i++) {
            const tx = GameConfigManager.instance.getTableauX(i);
            
            if (Math.abs(x - tx) < threshold) {
                return { type: 'tableau', index: i, cardIndex: -1 }; // cardIndex -1 indica que es el destino, no una carta específica
            }
        }

        return null;
    }

    /**
     * Actualiza la UI
     */
    private updateUI(): void {
        const scoreManager = this._gameManager.gameController.scoreManager;
        
        this._scoreText.setText(`Puntaje: ${scoreManager.score}`);
        this._movesText.setText(`Movimientos: ${scoreManager.moves}`);
        
        // Actualizar estado del botón de deshacer
        this.updateUndoButton();
    }

    /**
     * Muestra una pista
     */
    private showHint(): void {
        const hint = this._gameManager.gameController.getHint();
        
        if (hint) {
            // Resaltar la carta origen
            let sourceSprite: CardSprite | undefined;
            
            if (hint.from.type === 'waste') {
                const card = this._gameManager.gameController.wastePile.getTopCard();
                if (card) sourceSprite = this._cardSprites.get(card.id);
            } else if (hint.from.type === 'tableau') {
                const tableau = this._gameManager.gameController.tableaus[hint.from.index];
                const card = tableau.cards[hint.from.cardIndex];
                if (card) sourceSprite = this._cardSprites.get(card.id);
            } else if (hint.from.type === 'deck') {
                // Indicar que debe robar del deck
                const deckX = GameConfigManager.instance.getDeckX();
                const deckY = GameConfigManager.instance.config.topRowY + GameConfigManager.instance.config.card.frameHeight / 2;
                
                this.showHintAnimation(deckX, deckY);
                return;
            }

            if (sourceSprite) {
                this.showHintAnimation(sourceSprite.x, sourceSprite.y);
            }
        }
    }

    /**
     * Muestra animación de pista
     */
    private showHintAnimation(x: number, y: number): void {
        const highlight = this.add.rectangle(x, y, 70, 100, 0xffff00, 0.5);
        
        this.tweens.add({
            targets: highlight,
            alpha: 0,
            scale: 1.2,
            duration: 800,
            ease: 'Power2',
            onComplete: () => highlight.destroy()
        });
    }

    /**
     * Reinicia el juego
     */
    private restartGame(): void {
        // Destruir mensaje de fin de juego si existe
        this._endGameElements.forEach(element => element.destroy());
        this._endGameElements = [];

        // Destruir sprites existentes
        this._cardSprites.forEach(sprite => sprite.destroy());
        this._cardSprites.clear();

        // Cambiar fondo de carta aleatoriamente
        GameConfigManager.instance.randomizeCardBack();

        // Reiniciar
        this._gameManager.restart();

        // Recrear sprites
        this.createAllCardSprites();
        this.layoutCards();
        this.updateUI();
    }

    /**
     * Handler de victoria
     */
    private onWin(): void {
        const finalScore = this._gameManager.gameController.scoreManager.getFinalScore();
        
        // Mostrar mensaje de victoria
        const victoryBg = this.add.rectangle(400, 300, 400, 200, 0x000000, 0.8);
        const victoryText = this.add.text(400, 280, '🎉 ¡GANASTE! 🎉', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const scoreText = this.add.text(400, 330, `Puntaje Final: ${finalScore}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Guardar elementos para poder destruirlos después
        this._endGameElements = [victoryBg, victoryText, scoreText];
    }

    /**
     * Handler de game over
     */
    private onGameOver(): void {
        const gameOverBg = this.add.rectangle(400, 300, 400, 200, 0x000000, 0.8);
        const gameOverText = this.add.text(400, 280, 'No hay más movimientos', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ff6666',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const restartText = this.add.text(400, 330, 'Click en "Nuevo" para reiniciar', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Guardar elementos para poder destruirlos después
        this._endGameElements = [gameOverBg, gameOverText, restartText];
    }

    /**
     * Actualización del juego
     */
    update(time: number, delta: number): void {
        // Actualizar tiempo del juego
        if (this._gameManager.state === 'playing') {
            this._gameManager.update(delta);
            
            // Actualizar texto de tiempo cada segundo
            const currentSecond = Math.floor(time / 1000);
            const lastSecond = Math.floor(this._lastTime / 1000);
            
            if (currentSecond !== lastSecond) {
                const scoreManager = this._gameManager.gameController.scoreManager as any;
                if (scoreManager.getFormattedTime) {
                    this._timeText.setText(`Tiempo: ${scoreManager.getFormattedTime()}`);
                }
            }
            
            this._lastTime = time;
        }
    }
}
