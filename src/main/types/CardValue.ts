/**
 * Valores posibles de las cartas (1-13)
 * 1 = As
 * 2-10 = Números
 * 11 = J (Jack/Jota)
 * 12 = Q (Queen/Reina)
 * 13 = K (King/Rey)
 */
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/**
 * Lista de todos los valores posibles de las cartas
 */
export const ALL_CARD_VALUES: readonly CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

/**
 * Nombres legibles de los valores de las cartas
 */
export const CARD_VALUE_NAMES: Record<CardValue, string> = {
    1: 'As',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K',
};

