import { describe, expect, it } from "vitest";
import { searchMockAthletes } from "@/lib/mock/search";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";

describe("searchMockAthletes", () => {
  it("returns all non-minor, non-private athletes with no filters", () => {
    const results = searchMockAthletes({});
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((a) => !a.isMinor)).toBe(true);
    expect(results.every((a) => a.visibility !== "private")).toBe(true);
  });

  it("never returns minor athletes, even if explicitly matching other filters", () => {
    const minor = MOCK_ATHLETES.find((a) => a.isMinor);
    expect(minor).toBeDefined();
    const results = searchMockAthletes({ sportSlug: minor!.sports[0].sportSlug });
    expect(results.some((a) => a.id === minor!.id)).toBe(false);
  });

  it("filters by sport", () => {
    const results = searchMockAthletes({ sportSlug: "basketball" });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((a) => a.sports.some((s) => s.sportSlug === "basketball")),
    ).toBe(true);
  });

  it("filters by level", () => {
    const results = searchMockAthletes({ level: "pro" });
    expect(results.every((a) => a.sports.some((s) => s.level === "pro"))).toBe(
      true,
    );
  });

  it("filters by availability", () => {
    const results = searchMockAthletes({ availability: "free" });
    expect(results.every((a) => a.availability === "free")).toBe(true);
  });

  it("filters by age range", () => {
    const results = searchMockAthletes({ minAge: 20, maxAge: 23 });
    for (const athlete of results) {
      const age = new Date().getFullYear() - new Date(athlete.birthDate).getFullYear();
      expect(age).toBeGreaterThanOrEqual(18); // sanity: no minors slipped through
    }
  });

  it("filters by free-text query across name, username, club and bio", () => {
    const results = searchMockAthletes({ query: "martins" });
    expect(results.some((a) => a.lastName === "Martins")).toBe(true);
  });

  it("combines multiple filters with AND semantics", () => {
    const results = searchMockAthletes({
      sportSlug: "football",
      availability: "free",
    });
    expect(
      results.every(
        (a) =>
          a.sports.some((s) => s.sportSlug === "football") &&
          a.availability === "free",
      ),
    ).toBe(true);
  });

  it("returns an empty array when no athlete matches", () => {
    const results = searchMockAthletes({ query: "zzzznonexistent" });
    expect(results).toEqual([]);
  });
});
