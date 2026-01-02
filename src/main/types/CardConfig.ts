/**
 * Configuración de dimensiones y márgenes de las cartas
 */
export interface CardConfig {
    /**
     * Ancho de cada frame del spritesheet en píxeles
     */
    frameWidth: number;

    /**
     * Alto de cada frame del spritesheet en píxeles
     */
    frameHeight: number;

    /**
     * Margen horizontal entre frames del spritesheet (para ajuste de alineación)
     */
    spriteMarginX: number;

    /**
     * Margen vertical entre frames del spritesheet (para ajuste de alineación)
     */
    spriteMarginY: number;

    /**
     * Espaciado horizontal entre frames del spritesheet
     */
    spriteSpacingX: number;

    /**
     * Espaciado vertical entre frames del spritesheet
     */
    spriteSpacingY: number;

    /**
     * Radio del borde redondeado de las cartas
     */
    borderRadius: number;

    /**
     * Color de fondo de las cartas (hexadecimal)
     */
    backgroundColor: number;
}

/**
 * Configuración por defecto de las cartas
 * Los valores se pueden ajustar según el spritesheet
 */
export const DEFAULT_CARD_CONFIG: CardConfig = {
    frameWidth: 71,
    frameHeight: 95,
    spriteMarginX: 0,      // Margen inicial X del spritesheet
    spriteMarginY: 0,      // Margen inicial Y del spritesheet
    spriteSpacingX: 0,     // Espaciado entre frames horizontalmente
    spriteSpacingY: 0,     // Espaciado entre frames verticalmente
    borderRadius: 8,       // Radio del borde redondeado
    backgroundColor: 0xFFFFFF, // Blanco
};

/**
 * Calcula el ancho visible de la carta
 * @param config - Configuración de la carta
 * @returns Ancho visible en píxeles
 */
export function getVisibleWidth(config: CardConfig): number {
    return config.frameWidth;
}

/**
 * Calcula el alto visible de la carta
 * @param config - Configuración de la carta
 * @returns Alto visible en píxeles
 */
export function getVisibleHeight(config: CardConfig): number {
    return config.frameHeight;
}
