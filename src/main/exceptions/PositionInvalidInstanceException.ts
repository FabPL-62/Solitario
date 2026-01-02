export class PositionInvalidInstanceException extends Error {
    constructor() {
        super(`Position is not an instance of Position class`);
        this.name = "PositionInvalidInstanceException";
    }
}