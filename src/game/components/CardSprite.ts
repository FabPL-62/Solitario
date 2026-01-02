import { GameObjects, Scene } from 'phaser';
import { ICard } from '../../main/interfaces/ICard';
import { 
    GameConfigManager, 
    PLAYING_CARDS_SPRITESHEET, 
    CARD_BACKS_SPRITESHEET,
    SUIT_TO_ROW,
    getCardColumn 
} from '../config/GameConfig';

/**
 * Componente visual que representa una carta en Phaser
 */
export class CardSprite extends GameObjects.Container {
    /**
     * Referencia a la carta lógica
     */
    private _card: ICard;

    /**
     * Gráfico del fondo blanco con bordes redondeados
     */
    private _background: GameObjects.Graphics;

    /**
     * Sprite de la cara de la carta
     */
    private _faceSprite: GameObjects.Image;

    /**
     * Sprite del reverso de la carta
     */
    private _backSprite: GameObjects.Image;

    /**
     * Máscara para los bordes redondeados
     */
    private _maskGraphics: GameObjects.Graphics;

    /**
     * Indica si el drag está habilitado
     */
    private _draggable: boolean = false;

    /**
     * Posición original antes del drag
     */
    private _originalPosition: { x: number; y: number } = { x: 0, y: 0 };

    /**
     * Timestamp del último clic para detectar doble clic
     */
    private _lastClickTime: number = 0;

    /**
     * Umbral de tiempo para considerar doble clic (ms)
     */
    private static readonly DOUBLE_CLICK_THRESHOLD = 300;

    /**
     * Constructor
     * @param scene - La escena de Phaser
     * @param x - Posición X
     * @param y - Posición Y
     * @param card - La carta lógica
     */
    constructor(scene: Scene, x: number, y: number, card: ICard) {
        super(scene, x, y);

        this._card = card;

        const config = GameConfigManager.instance.config;
        const { frameWidth, frameHeight, borderRadius, backgroundColor } = config.card;

        // Crear el fondo blanco con bordes redondeados
        this._background = scene.add.graphics();
        this._background.fillStyle(backgroundColor, 1);
        this._background.fillRoundedRect(
            -frameWidth / 2, 
            -frameHeight / 2, 
            frameWidth, 
            frameHeight, 
            borderRadius
        );
        this.add(this._background);

        // Crear máscara para los bordes redondeados
        this._maskGraphics = scene.add.graphics();
        this._maskGraphics.fillStyle(0xffffff);
        this._maskGraphics.fillRoundedRect(
            -frameWidth / 2, 
            -frameHeight / 2, 
            frameWidth, 
            frameHeight, 
            borderRadius
        );

        // Calcular frame index del fondo de carta
        const backFrameIndex = GameConfigManager.instance.getCardBackFrameIndex();

        // Crear sprite del reverso
        this._backSprite = scene.add.image(0, 0, CARD_BACKS_SPRITESHEET.key, backFrameIndex);
        this.add(this._backSprite);

        // Calcular frame index de la carta
        const faceFrameIndex = this.getCardFrameIndex();

        // Crear sprite de la cara
        this._faceSprite = scene.add.image(0, 0, PLAYING_CARDS_SPRITESHEET.key, faceFrameIndex);
        this.add(this._faceSprite);

        // Aplicar máscara a los sprites
        const mask = this._maskGraphics.createGeometryMask();
        this._faceSprite.setMask(mask);
        this._backSprite.setMask(mask);

        // La máscara debe seguir al contenedor
        this._maskGraphics.setPosition(x, y);

        // Configurar tamaño
        this.setSize(frameWidth, frameHeight);

        // Actualizar visibilidad según estado
        this.updateVisibility();

        // Agregar a la escena
        scene.add.existing(this);
    }

    /**
     * Calcula el frame index para esta carta en el spritesheet
     */
    private getCardFrameIndex(): number {
        const row = SUIT_TO_ROW[this._card.suit];
        const col = getCardColumn(this._card.value);
        return row * 13 + col; // 13 cartas por fila
    }

    /**
     * Obtiene la carta lógica
     */
    public get card(): ICard {
        return this._card;
    }

    /**
     * Actualiza la visibilidad de cara/reverso
     */
    public updateVisibility(): void {
        this._faceSprite.setVisible(this._card.isFaceUp);
        this._backSprite.setVisible(!this._card.isFaceUp);
    }

    /**
     * Actualiza el fondo de la carta (para cambio aleatorio)
     */
    public updateCardBack(): void {
        const backFrameIndex = GameConfigManager.instance.getCardBackFrameIndex();
        this._backSprite.setFrame(backFrameIndex);
    }

    /**
     * Actualiza la posición de la máscara cuando el contenedor se mueve
     */
    private updateMaskPosition(): void {
        this._maskGraphics.setPosition(this.x, this.y);
    }

    /**
     * Sobrescribe setPosition para actualizar la máscara
     */
    public setPosition(x?: number, y?: number, z?: number, w?: number): this {
        super.setPosition(x, y, z, w);
        if (this._maskGraphics) {
            this._maskGraphics.setPosition(this.x, this.y);
        }
        return this;
    }

    /**
     * Voltea la carta con animación
     * @param duration - Duración de la animación en ms
     */
    public flipWithAnimation(duration: number = 200): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                scaleX: 0,
                duration: duration / 2,
                ease: 'Power2',
                onComplete: () => {
                    this._card.flip();
                    this.updateVisibility();
                    
                    this.scene.tweens.add({
                        targets: this,
                        scaleX: 1,
                        duration: duration / 2,
                        ease: 'Power2',
                        onComplete: () => resolve()
                    });
                }
            });
        });
    }

    /**
     * Revela la carta con animación
     */
    public revealWithAnimation(duration: number = 200): Promise<void> {
        if (this._card.isFaceUp) {
            return Promise.resolve();
        }
        return this.flipWithAnimation(duration);
    }

    /**
     * Habilita el arrastre de la carta
     */
    public enableDrag(): void {
        if (this._draggable) return;

        this._draggable = true;
        this.setInteractive({ draggable: true, useHandCursor: true });

        this.on('dragstart', this.onDragStart, this);
        this.on('drag', this.onDrag, this);
        this.on('dragend', this.onDragEnd, this);
        this.on('pointerdown', this.onPointerDown, this);
    }

    /**
     * Deshabilita el arrastre
     */
    public disableDrag(): void {
        if (!this._draggable) return;

        this._draggable = false;
        this.disableInteractive();

        this.off('dragstart', this.onDragStart, this);
        this.off('drag', this.onDrag, this);
        this.off('dragend', this.onDragEnd, this);
        this.off('pointerdown', this.onPointerDown, this);
    }

    /**
     * Handler de pointerdown para detectar doble clic
     */
    private onPointerDown(): void {
        const currentTime = Date.now();
        const timeDiff = currentTime - this._lastClickTime;

        if (timeDiff < CardSprite.DOUBLE_CLICK_THRESHOLD && timeDiff > 0) {
            // Es un doble clic
            this.emit('card:doubleclick', this);
            this._lastClickTime = 0; // Reset para evitar triple clic
        } else {
            this._lastClickTime = currentTime;
        }
    }

    /**
     * Habilita el click
     * @param callback - Función a ejecutar al hacer click
     */
    public enableClick(callback: () => void): void {
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', callback);
    }

    /**
     * Handler de inicio de arrastre
     */
    private onDragStart(): void {
        this._originalPosition = { x: this.x, y: this.y };
        this.setDepth(1000);
        
        this.emit('card:dragstart', this);
    }

    /**
     * Handler de arrastre
     */
    private onDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
        this.x = dragX;
        this.y = dragY;
        this.updateMaskPosition();
        
        this.emit('card:drag', this, dragX, dragY);
    }

    /**
     * Handler de fin de arrastre
     */
    private onDragEnd(): void {
        this.emit('card:dragend', this, this._originalPosition);
    }

    /**
     * Mueve la carta a una posición con animación
     */
    public animateTo(x: number, y: number, duration: number = 150): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                x,
                y,
                duration,
                ease: 'Power2',
                onUpdate: () => this.updateMaskPosition(),
                onComplete: () => {
                    this.updateMaskPosition();
                    resolve();
                }
            });
        });
    }

    /**
     * Regresa a la posición original
     */
    public returnToOriginalPosition(duration: number = 150): Promise<void> {
        return this.animateTo(this._originalPosition.x, this._originalPosition.y, duration);
    }

    /**
     * Destruye el sprite
     */
    public destroy(fromScene?: boolean): void {
        this.disableDrag();
        if (this._maskGraphics) {
            this._maskGraphics.destroy();
        }
        super.destroy(fromScene);
    }
}
