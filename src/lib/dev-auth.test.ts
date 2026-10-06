import { afterEach, describe, expect, it, vi } from "vitest";
import { isDevBypassEnabled } from "@/lib/dev-auth";

describe("isDevBypassEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function setEnv(nodeEnv: string, enableDevLogin?: string, allowPublicDemo?: string) {
    vi.stubEnv("NODE_ENV", nodeEnv);
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEV_LOGIN", enableDevLogin ?? "");
    vi.stubEnv("NEXT_PUBLIC_ALLOW_PUBLIC_DEMO", allowPublicDemo ?? "");
  }

  it("is disabled when the dev-login flag is missing, whatever the environment", () => {
    setEnv("development");
    expect(isDevBypassEnabled()).toBe(false);
    setEnv("production", undefined, "true");
    expect(isDevBypassEnabled()).toBe(false);
  });

  it("is enabled in development as soon as the dev-login flag is set", () => {
    setEnv("development", "true");
    expect(isDevBypassEnabled()).toBe(true);
  });

  it("is disabled in production by default, even with the dev-login flag set", () => {
    setEnv("production", "true");
    expect(isDevBypassEnabled()).toBe(false);
  });

  it("is enabled in production only with the explicit public-demo opt-in", () => {
    setEnv("production", "true", "true");
    expect(isDevBypassEnabled()).toBe(true);
    setEnv("production", "true", "false");
    expect(isDevBypassEnabled()).toBe(false);
  });
});
