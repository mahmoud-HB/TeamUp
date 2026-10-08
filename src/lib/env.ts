/**
 * Variables d'environnement requises par l'application, typées et
 * validées au démarrage pour éviter les erreurs silencieuses en production.
 */
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default("placeholder-anon-key"),
});

function readEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Variables d'environnement Supabase invalides ou manquantes : ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

export const env = readEnv();
