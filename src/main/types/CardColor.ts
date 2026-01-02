import { Suit } from './Suit';

/**
 * Colores de las cartas
 * - red: Diamantes y Corazones
 * - black: Tréboles y Picas
 */
export type CardColor = 'red' | 'black';

/**
 * Mapeo de palo a color
 */
export const SUIT_COLOR_MAP: Record<Suit, CardColor> = {
    Clubs: 'black',
    Spades: 'black',
    Diamonds: 'red',
    Hearts: 'red',
};

/**
 * Obtiene el color de un palo
 * @param suit - El palo de la carta
 * @returns El color correspondiente
 */
export function getCardColor(suit: Suit): CardColor {
    return SUIT_COLOR_MAP[suit];
}

/**
 * Verifica si dos palos tienen colores opuestos
 * @param suit1 - Primer palo
 * @param suit2 - Segundo palo
 * @returns true si los colores son opuestos
 */
export function areOppositeColors(suit1: Suit, suit2: Suit): boolean {
    return SUIT_COLOR_MAP[suit1] !== SUIT_COLOR_MAP[suit2];
}

