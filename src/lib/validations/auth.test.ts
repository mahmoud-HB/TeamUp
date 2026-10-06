import { describe, expect, it } from "vitest";
import {
  computeAge,
  createForgotPasswordSchema,
  createLoginSchema,
  createRegisterSchema,
  isMinor,
} from "@/lib/validations/auth";
import { t } from "@/test/fake-translator";

describe("createLoginSchema", () => {
  const schema = createLoginSchema(t);

  it("accepts a valid login payload", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "whatever",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = schema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("emailInvalid");
    }
  });

  it("rejects an empty password", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createForgotPasswordSchema", () => {
  const schema = createForgotPasswordSchema(t);

  it("requires a valid email", () => {
    expect(schema.safeParse({ email: "user@example.com" }).success).toBe(
      true,
    );
    expect(schema.safeParse({ email: "invalid" }).success).toBe(false);
  });
});

describe("createRegisterSchema", () => {
  const schema = createRegisterSchema(t);
  const validPayload = {
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
    role: "athlete" as const,
    birthDate: "2000-01-01",
    acceptTerms: true as const,
  };

  it("accepts a fully valid registration payload", () => {
    const result = schema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = schema.safeParse({ ...validPayload, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = schema.safeParse({
      ...validPayload,
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("confirmPassword")),
      ).toBe(true);
    }
  });

  it("rejects an invalid role", () => {
    const result = schema.safeParse({ ...validPayload, role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects a birth date in the future", () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const result = schema.safeParse({
      ...validPayload,
      birthDate: futureDate.toISOString().slice(0, 10),
    });
    expect(result.success).toBe(false);
  });

  it("rejects when terms are not accepted", () => {
    const result = schema.safeParse({ ...validPayload, acceptTerms: false });
    expect(result.success).toBe(false);
  });
});

describe("computeAge / isMinor", () => {
  const referenceNow = new Date("2024-06-15T00:00:00Z");

  it("computes the correct age before the birthday this year", () => {
    expect(computeAge("2000-07-01", referenceNow)).toBe(23);
  });

  it("computes the correct age on/after the birthday this year", () => {
    expect(computeAge("2000-06-01", referenceNow)).toBe(24);
  });

  it("flags a 17-year-old as a minor", () => {
    expect(isMinor("2007-01-01", referenceNow)).toBe(true);
  });

  it("flags an 18-year-old as not a minor", () => {
    expect(isMinor("2006-01-01", referenceNow)).toBe(false);
  });
});
