import { describe, it, expect } from "bun:test";
import { Position } from "../../../src/main/types/Position";
import { PositionInvalidException } from "../../../src/main/exceptions/PositionInvalidException";
import { PositionInvalidInstanceException } from "../../../src/main/exceptions/PositionInvalidInstanceException";

describe("Position type", () => {
    it("Zero position ok", () => {
        const pos1 = new Position(0, 0);
        expect(pos1.x).toBe(0);
        expect(pos1.y).toBe(0);
    });
    it("Positive position ok", () => {
        const pos2 = new Position(5, 10);
        expect(pos2.x).toBe(5);
        expect(pos2.y).toBe(10);
    });
    it("Negative position ok", () => {
        const pos3 = new Position(-5, -10);
        expect(pos3.x).toBe(-5);
        expect(pos3.y).toBe(-10);
    });
    it("Mixed position ok", () => {
        const pos4 = new Position(-5, 10);
        expect(pos4.x).toBe(-5);
        expect(pos4.y).toBe(10);
    });
    it("Decimal position ok", () => {
        const pos5 = new Position(5.5, -10.25);
        expect(pos5.x).toBe(5.5);
        expect(pos5.y).toBe(-10.25);
    });
    it("Invalid position throws exception", () => {
        const invalidValues = [NaN, Infinity, -Infinity, "string", null, undefined, {}, []];
        invalidValues.forEach((value) => {
            // @ts-ignore
            expect(() => new Position(value, value)).toThrowError(PositionInvalidException);
        });
    });
    it("Position distance calculation ok", () => {
        const pos1 = new Position(0, 0);
        const pos2 = new Position(3, 4);
        expect(pos1.distanceTo(pos2)).toBe(5);
        expect(pos2.distanceTo(pos1)).toBe(5);
    });
    it("Position distance to self is zero", () => {
        const pos1 = new Position(1, 1);
        expect(pos1.distanceTo(pos1)).toBe(0);
    });
    it("Position distance to null throws exception", () => {
        const pos1 = new Position(0, 0);
        // @ts-ignore
        expect(() => pos1.distanceTo(null)).toThrowError(PositionInvalidInstanceException);
    });
    it("Position distance to undefined throws exception", () => {
        const pos1 = new Position(0, 0);
        // @ts-ignore
        expect(() => pos1.distanceTo(undefined)).toThrowError(PositionInvalidInstanceException);
    });
    it("Position distance to number throws exception", () => {
        const pos1 = new Position(0, 0);
        // @ts-ignore
        expect(() => pos1.distanceTo(5)).toThrowError(PositionInvalidInstanceException);
    });
    it("Position distance to string throws exception", () => {
        const pos1 = new Position(0, 0);
        // @ts-ignore
        expect(() => pos1.distanceTo("string")).toThrowError(PositionInvalidInstanceException);
    });
    it("Position distance to array throws exception", () => {
        const pos1 = new Position(0, 0);
        // @ts-ignore
        expect(() => pos1.distanceTo([])).toThrowError(PositionInvalidInstanceException);
    });
    it("Distance to invalid instance throws exception", () => {
        const pos1 = new Position(0, 0);
        // @ts-ignore
        expect(() => pos1.distanceTo({ x: 3, y: 4 })).toThrowError(PositionInvalidInstanceException);
    });
});
