import { IScoreManager, ScoreAction } from '../interfaces/IScoreManager';

/**
 * Puntos por cada tipo de acción
 */
const SCORE_VALUES: Record<ScoreAction, number> = {
    'waste_to_tableau': 5,
    'waste_to_foundation': 10,
    'tableau_to_foundation': 10,
    'flip_tableau_card': 5,
    'foundation_to_tableau': -15,
    'recycle_waste': -100,
};

/**
 * Servicio que gestiona el puntaje del juego
 */
export class ScoreManager implements IScoreManager {
    /**
     * Puntaje actual
     */
    private _score: number;

    /**
     * Número de movimientos
     */
    private _moves: number;

    /**
     * Tiempo transcurrido en milisegundos
     */
    private _elapsedTimeMs: number;

    /**
     * Constructor del gestor de puntaje
     */
    constructor() {
        this._score = 0;
        this._moves = 0;
        this._elapsedTimeMs = 0;
    }

    /**
     * Puntaje actual
     */
    public get score(): number {
        return Math.max(0, this._score); // No permitir puntaje negativo
    }

    /**
     * Número de movimientos realizados
     */
    public get moves(): number {
        return this._moves;
    }

    /**
     * Tiempo transcurrido en segundos
     */
    public get elapsedTime(): number {
        return Math.floor(this._elapsedTimeMs / 1000);
    }

    /**
     * Registra una acción que afecta el puntaje
     * @param action - El tipo de acción
     */
    public recordAction(action: ScoreAction): void {
        const points = SCORE_VALUES[action];
        this._score += points;
    }

    /**
     * Incrementa el contador de movimientos
     */
    public incrementMoves(): void {
        this._moves++;
    }

    /**
     * Actualiza el tiempo transcurrido
     * @param deltaTime - Tiempo en milisegundos
     */
    public updateTime(deltaTime: number): void {
        this._elapsedTimeMs += deltaTime;
    }

    /**
     * Reinicia el puntaje y estadísticas
     */
    public reset(): void {
        this._score = 0;
        this._moves = 0;
        this._elapsedTimeMs = 0;
    }

    /**
     * Calcula el puntaje bonus por tiempo
     * Fórmula: 700000 / tiempo_en_segundos (si el tiempo > 30 segundos)
     */
    public calculateTimeBonus(): number {
        const seconds = this.elapsedTime;
        if (seconds <= 30) {
            return 0;
        }
        return Math.floor(700000 / seconds);
    }

    /**
     * Obtiene el puntaje final incluyendo bonus
     */
    public getFinalScore(): number {
        return this.score + this.calculateTimeBonus();
    }

    /**
     * Formatea el tiempo como MM:SS
     */
    public getFormattedTime(): string {
        const totalSeconds = this.elapsedTime;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Restaura el estado del puntaje (para deshacer)
     * @param score - Puntaje a restaurar
     * @param moves - Movimientos a restaurar
     */
    public restoreState(score: number, moves: number): void {
        this._score = score;
        this._moves = moves;
    }
}

