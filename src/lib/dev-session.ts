import { cookies } from "next/headers";
import {
  DEV_BYPASS_COOKIE,
  DEV_ROLE_COOKIE,
  isDevBypassEnabled,
  parseDevRole,
  type DevRole,
} from "@/lib/dev-auth";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";
import type { MockAthlete } from "@/lib/mock/types";

export type DevSession = {
  role: DevRole;
  /** Athlète fictif utilisé comme "moi" quand le rôle démo est athlète. */
  mockMe: MockAthlete;
};

/**
 * Lit la session de démonstration (dev uniquement) posée par
 * `devBypassLoginAction`. Retourne `null` si le bypass n'est pas actif —
 * les pages doivent alors se rabattre sur la vraie session Supabase.
 */
export async function getDevSession(): Promise<DevSession | null> {
  if (!isDevBypassEnabled()) return null;

  const cookieStore = await cookies();
  if (cookieStore.get(DEV_BYPASS_COOKIE)?.value !== "1") return null;

  const role = parseDevRole(cookieStore.get(DEV_ROLE_COOKIE)?.value);

  return { role, mockMe: MOCK_ATHLETES[0] };
}
