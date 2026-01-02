/**
 * Palos de las cartas (pintas)
 * - Clubs: Tréboles (♣)
 * - Diamonds: Diamantes (♦)
 * - Hearts: Corazones (♥)
 * - Spades: Picas (♠)
 */
export type Suit = 'Clubs' | 'Diamonds' | 'Hearts' | 'Spades';

/**
 * Lista de todos los palos disponibles
 */
export const ALL_SUITS: readonly Suit[] = ['Clubs', 'Diamonds', 'Hearts', 'Spades'] as const;

