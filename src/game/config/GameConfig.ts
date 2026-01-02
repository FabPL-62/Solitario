import { CardConfig, DEFAULT_CARD_CONFIG } from '../../main/types/CardConfig';

/**
 * Posición de un fondo de carta en el spritesheet (fila, columna)
 */
export interface CardBackPosition {
    row: number;
    col: number;
}

/**
 * Lista de fondos de carta disponibles en el spritesheet
 * Formato: { row, col } donde row y col empiezan en 0
 */
export const AVAILABLE_CARD_BACKS: CardBackPosition[] = [
    { row: 0, col: 0 },  // 1,1
    { row: 0, col: 3 },  // 1,4
    { row: 2, col: 0 },  // 3,1
    { row: 2, col: 1 },  // 3,2
    { row: 2, col: 2 },  // 3,3
    { row: 2, col: 3 },  // 3,4
    { row: 2, col: 4 },  // 3,5
    { row: 2, col: 5 },  // 3,6
    { row: 2, col: 6 },  // 3,7
    { row: 3, col: 0 },  // 4,1
    { row: 3, col: 1 },  // 4,2
    { row: 3, col: 2 },  // 4,3
    { row: 3, col: 4 },  // 4,5
    { row: 4, col: 0 },  // 5,1
    { row: 4, col: 1 },  // 5,2
    { row: 4, col: 2 },  // 5,3
    { row: 4, col: 3 },  // 5,4
];

/**
 * Configuración del spritesheet de fondos
 */
export const CARD_BACKS_SPRITESHEET = {
    key: 'card_backs',
    path: 'assets/back-cards-01.png',
    rows: 5,
    cols: 7,
};

/**
 * Configuración del spritesheet de cartas
 */
export const PLAYING_CARDS_SPRITESHEET = {
    key: 'playing_cards',
    path: 'assets/playing-cards-01.png',
    rows: 4,    // Hearts, Clubs, Diamonds, Spades
    cols: 13,   // 2-10, J, Q, K, A
};

/**
 * Mapeo de palos a filas del spritesheet
 */
export const SUIT_TO_ROW: Record<string, number> = {
    'Hearts': 0,
    'Clubs': 1,
    'Diamonds': 2,
    'Spades': 3,
};

/**
 * Mapeo de valores de carta a columnas del spritesheet
 * Orden: 2, 3, 4, 5, 6, 7, 8, 9, 10, J(11), Q(12), K(13), A(1)
 */
export function getCardColumn(value: number): number {
    if (value === 1) return 12; // As está al final
    return value - 2; // 2 -> 0, 3 -> 1, ..., 13 -> 11
}

/**
 * Configuración visual del juego
 */
export interface GameVisualConfig {
    /**
     * Configuración de las cartas
     */
    card: CardConfig;

    /**
     * Espaciado horizontal entre pilas del tableau
     */
    tableauSpacing: number;

    /**
     * Espaciado vertical entre cartas apiladas (boca abajo)
     */
    cardStackOffsetHidden: number;

    /**
     * Espaciado vertical entre cartas apiladas (boca arriba)
     */
    cardStackOffsetVisible: number;

    /**
     * Posición Y del tableau
     */
    tableauY: number;

    /**
     * Posición Y de las foundations y deck
     */
    topRowY: number;

    /**
     * Margen izquierdo
     */
    marginLeft: number;

    /**
     * Índice del fondo de carta actual (índice en AVAILABLE_CARD_BACKS)
     */
    cardBackIndex: number;
}

/**
 * Configuración por defecto
 */
export const DEFAULT_VISUAL_CONFIG: GameVisualConfig = {
    card: { ...DEFAULT_CARD_CONFIG },
    tableauSpacing: 15,
    cardStackOffsetHidden: 15,
    cardStackOffsetVisible: 20,
    tableauY: 180,
    topRowY: 60,
    marginLeft: 50,
    cardBackIndex: 0,
};

/**
 * Clase para gestionar la configuración visual
 */
export class GameConfigManager {
    private static _instance: GameConfigManager;
    private _config: GameVisualConfig;

    private constructor() {
        this._config = { ...DEFAULT_VISUAL_CONFIG };
    }

    public static get instance(): GameConfigManager {
        if (!GameConfigManager._instance) {
            GameConfigManager._instance = new GameConfigManager();
        }
        return GameConfigManager._instance;
    }

    public get config(): GameVisualConfig {
        return this._config;
    }

    /**
     * Actualiza la configuración de las cartas
     */
    public setCardConfig(config: Partial<CardConfig>): void {
        this._config.card = { ...this._config.card, ...config };
    }

    /**
     * Actualiza la configuración visual
     */
    public setVisualConfig(config: Partial<GameVisualConfig>): void {
        this._config = { ...this._config, ...config };
    }

    /**
     * Obtiene el ancho total de las 7 pilas del tableau
     */
    public getTableauTotalWidth(): number {
        const { card, tableauSpacing } = this._config;
        return (card.frameWidth * 7) + (tableauSpacing * 6);
    }

    /**
     * Obtiene la posición X de una pila del tableau
     */
    public getTableauX(index: number): number {
        const { card, tableauSpacing, marginLeft } = this._config;
        return marginLeft + (index * (card.frameWidth + tableauSpacing)) + (card.frameWidth / 2);
    }

    /**
     * Obtiene la posición X de una foundation
     */
    public getFoundationX(index: number): number {
        const { card, tableauSpacing, marginLeft } = this._config;
        return marginLeft + ((3 + index) * (card.frameWidth + tableauSpacing)) + (card.frameWidth / 2);
    }

    /**
     * Obtiene la posición X del deck
     */
    public getDeckX(): number {
        return this.getTableauX(0);
    }

    /**
     * Obtiene la posición X del waste pile
     */
    public getWasteX(): number {
        return this.getTableauX(1);
    }

    /**
     * Selecciona un fondo de carta aleatorio
     */
    public randomizeCardBack(): void {
        const randomIndex = Math.floor(Math.random() * AVAILABLE_CARD_BACKS.length);
        this._config.cardBackIndex = randomIndex;
    }

    /**
     * Obtiene la posición actual del fondo de carta
     */
    public getCurrentCardBack(): CardBackPosition {
        return AVAILABLE_CARD_BACKS[this._config.cardBackIndex];
    }

    /**
     * Obtiene el frame index del fondo actual
     */
    public getCardBackFrameIndex(): number {
        const back = this.getCurrentCardBack();
        return back.row * CARD_BACKS_SPRITESHEET.cols + back.col;
    }
}
