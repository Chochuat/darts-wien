import { describe, it, expect } from "vitest";
import {
  parseNumericParam,
  requireNumericParam,
  errorResponse,
  validationError,
} from "./api-utils";

describe("parseNumericParam", () => {
  it("parses a valid number string", () => {
    expect(parseNumericParam("42")).toBe(42);
  });

  it("parses negative numbers", () => {
    expect(parseNumericParam("-5")).toBe(-5);
  });

  it("parses zero", () => {
    expect(parseNumericParam("0")).toBe(0);
  });

  it("parses floats", () => {
    expect(parseNumericParam("3.14")).toBeCloseTo(3.14);
  });

  it("returns null for non-numeric strings", () => {
    expect(parseNumericParam("abc")).toBeNull();
  });

  it("returns 0 for empty string (Number('') is 0)", () => {
    expect(parseNumericParam("")).toBe(0);
  });
});

describe("requireNumericParam", () => {
  it("returns id object for valid numeric param", () => {
    const result = requireNumericParam("7", "seasonId");
    expect(result).toEqual({ id: 7 });
  });

  it("returns NextResponse for invalid param", () => {
    const result = requireNumericParam("x", "matchId");
    expect(result).toHaveProperty("status");
    expect((result as { status: number }).status).toBe(400);
  });

  it("includes label in error message", async () => {
    const result = requireNumericParam("bad", "seasonId");
    const json = await (result as { json: () => Promise<unknown> }).json();
    expect(json).toEqual({ error: "Invalid seasonId" });
  });
});

describe("errorResponse", () => {
  it("returns 500 by default with Error message", async () => {
    const res = errorResponse(new Error("Something broke"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Something broke" });
  });

  it("uses provided status code", async () => {
    const res = errorResponse(new Error("Not found"), 404);
    expect(res.status).toBe(404);
  });

  it("handles non-Error unknown values", async () => {
    const res = errorResponse("string error");
    const json = await res.json();
    expect(json).toEqual({ error: "Unknown error" });
  });

  it("handles null", async () => {
    const res = errorResponse(null);
    const json = await res.json();
    expect(json).toEqual({ error: "Unknown error" });
  });
});

describe("validationError", () => {
  it("returns 400 with validation failed message", async () => {
    const issues = [{ message: "Required" }];
    const res = validationError(issues);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({
      error: "Validation failed",
      details: issues,
    });
  });
});
