/**
 * Tipos de movimientos que afectan el puntaje
 */
export type ScoreAction =
    | 'waste_to_tableau'      // Waste a Tableau: +5
    | 'waste_to_foundation'   // Waste a Foundation: +10
    | 'tableau_to_foundation' // Tableau a Foundation: +10
    | 'flip_tableau_card'     // Voltear carta en Tableau: +5
    | 'foundation_to_tableau' // Foundation a Tableau: -15
    | 'recycle_waste';        // Reciclar waste (modo 1 carta): -100

/**
 * Interface que define el contrato del gestor de puntaje
 */
export interface IScoreManager {
    /**
     * Puntaje actual
     */
    readonly score: number;

    /**
     * Número de movimientos realizados
     */
    readonly moves: number;

    /**
     * Tiempo transcurrido en segundos
     */
    readonly elapsedTime: number;

    /**
     * Registra una acción que afecta el puntaje
     * @param action - El tipo de acción realizada
     */
    recordAction(action: ScoreAction): void;

    /**
     * Incrementa el contador de movimientos
     */
    incrementMoves(): void;

    /**
     * Actualiza el tiempo transcurrido
     * @param deltaTime - Tiempo transcurrido desde la última actualización (ms)
     */
    updateTime(deltaTime: number): void;

    /**
     * Reinicia el puntaje y estadísticas
     */
    reset(): void;

    /**
     * Calcula el puntaje bonus por tiempo (si aplica)
     * @returns El puntaje bonus
     */
    calculateTimeBonus(): number;

    /**
     * Obtiene el puntaje final incluyendo bonus
     * @returns El puntaje final
     */
    getFinalScore(): number;
}

