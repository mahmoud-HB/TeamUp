import { describe, expect, it } from "vitest";
import { createAthleteProfileSchema } from "@/lib/validations/athlete-profile";
import { t } from "@/test/fake-translator";

describe("createAthleteProfileSchema", () => {
  const schema = createAthleteProfileSchema(t);

  const basePayload = (overrides: Partial<Record<string, unknown>> = {}) => ({
    username: "john_doe",
    avatarUrl: "",
    bio: "",
    country: "FR",
    birthDate: "1998-01-01",
    sports: [{ sportId: "sport-1", positionId: "", level: "amateur" }],
    status: "free",
    mobility: true,
    visibility: "public",
    ...overrides,
  });

  it("accepts a fully valid adult profile", () => {
    const result = schema.safeParse(basePayload());
    expect(result.success).toBe(true);
  });

  it("rejects a username that is too short", () => {
    const result = schema.safeParse(basePayload({ username: "ab" }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid username format", () => {
    const result = schema.safeParse(basePayload({ username: "john doe!" }));
    expect(result.success).toBe(false);
  });

  it("rejects a bio longer than 500 characters", () => {
    const result = schema.safeParse(basePayload({ bio: "a".repeat(501) }));
    expect(result.success).toBe(false);
  });

  it("requires at least one sport", () => {
    const result = schema.safeParse(basePayload({ sports: [] }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid sport level", () => {
    const result = schema.safeParse(
      basePayload({
        sports: [{ sportId: "sport-1", positionId: "", level: "legend" }],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an invalid availability status", () => {
    const result = schema.safeParse(basePayload({ status: "retired" }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid visibility option", () => {
    const result = schema.safeParse(basePayload({ visibility: "friends_only" }));
    expect(result.success).toBe(false);
  });

  it("rejects a future birth date", () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = schema.safeParse(
      basePayload({ birthDate: futureDate.toISOString().slice(0, 10) }),
    );
    expect(result.success).toBe(false);
  });

  describe("minors visibility rule", () => {
    const minorBirthDate = () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 16);
      return date.toISOString().slice(0, 10);
    };

    it("rejects public visibility for a minor", () => {
      const result = schema.safeParse(
        basePayload({ birthDate: minorBirthDate(), visibility: "public" }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("visibility")),
        ).toBe(true);
      }
    });

    it("accepts verified_only visibility for a minor", () => {
      const result = schema.safeParse(
        basePayload({ birthDate: minorBirthDate(), visibility: "verified_only" }),
      );
      expect(result.success).toBe(true);
    });

    it("accepts private visibility for a minor", () => {
      const result = schema.safeParse(
        basePayload({ birthDate: minorBirthDate(), visibility: "private" }),
      );
      expect(result.success).toBe(true);
    });

    it("accepts public visibility for an adult", () => {
      const result = schema.safeParse(
        basePayload({ birthDate: "1990-01-01", visibility: "public" }),
      );
      expect(result.success).toBe(true);
    });
  });
});
