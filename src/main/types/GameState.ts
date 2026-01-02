/**
 * Estado actual del juego
 * - idle: Esperando para iniciar
 * - starting: Iniciando el juego
 * - playing: En juego
 * - paused: Pausado
 * - gameover: Fin del juego (perdió un jugador)
 * - finished: Juego terminado completamente
 */
export type GameState = 'idle' | 'starting' | 'playing' | 'paused' | 'gameover' | 'finished';

