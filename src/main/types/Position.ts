import { PositionInvalidException } from "../exceptions/PositionInvalidException";
import { PositionInvalidInstanceException } from "../exceptions/PositionInvalidInstanceException";

/**
 * Clase que representa una posicion en el espacio
 */
export class Position {

    /**
     * Posicion en el eje x
     */
    x: number;

    /**
     * Posicion en el eje y
     */
    y: number;

    /**
     * Constructor de la posicion
     * @param x - Posicion en el eje x
     * @param y - Posicion en el eje y
     */
    constructor(x: number, y: number) {
        this.update(x, y);
    }

    /**
     * Actualiza la posicion
     * @param x - Nueva posicion en el eje x
     * @param y - Nueva posicion en el eje y
     */
    update(x: number, y: number): void {
        if (
            isNaN(x)
            || isNaN(y)
            || !isFinite(x)
            || !isFinite(y)
            || typeof x !== "number"
            || typeof y !== "number"
        ) {
            throw new PositionInvalidException(x, y);
        }
        this.x = x;
        this.y = y;
    }

    /**
     * Mide la distancia entre dos posiciones
     * @param position - Posicion a medir
     * @returns Distancia entre las dos posiciones
     */
    distanceTo(position: Position): number {
        if (!(position instanceof Position)) {
            throw new PositionInvalidInstanceException();
        }
        return Math.sqrt((this.x - position.x) ** 2 + (this.y - position.y) ** 2);
    }

    /**
     * Direccion a la posicion objetivo
     * @param position - Posicion objetivo
     * @returns Direccion a la posicion objetivo en radianes
     */
    directionTo(position: Position): number {
        if (!(position instanceof Position)) {
            throw new PositionInvalidInstanceException();
        }
        return Math.atan2(position.y - this.y, position.x - this.x);
    }

    /**
     * Direccion a la posicion objetivo en grados
     * @param position - Posicion objetivo
     * @returns Direccion a la posicion objetivo en grados
     */
    directionToDegrees(position: Position): number {
        return this.directionTo(position) * 180 / Math.PI;
    }
}