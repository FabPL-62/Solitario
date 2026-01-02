export class PositionInvalidException extends Error {
    constructor(x: number, y: number) {
        super(`Position is invalid: ${JSON.stringify({ x, y })}`);
        this.name = "PositionInvalidException";
    }
}