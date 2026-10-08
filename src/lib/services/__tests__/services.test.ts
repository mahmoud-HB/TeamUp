import { describe, it, expect, beforeEach } from "vitest";
import { organizationService } from "@/lib/services/organization-service";
import { messagingService } from "@/lib/services/messaging-service";

/**
 * Tests pour les services de données avec bascule mock/Supabase.
 * En mode démo (NEXT_PUBLIC_DEMO_MODE=true), utilise les mocks.
 */

describe("OrganizationService (Demo Mode)", () => {
  // Note: Services tests disabled in Node environment (requires browser/DEMO_MODE env)
  // Full integration tests run in E2E/Playwright with proper environment setup
  
  it.skip("listOffers() retourne les offres mockées", async () => {
    // Placeholder - tests run in E2E/browser only with NEXT_PUBLIC_DEMO_MODE=true
  });

  it.skip("getOffer() récupère une offre par ID", async () => {
    // Placeholder - tests run in E2E/browser only
  });

  it.skip("listOrganizations() retourne les orgs mockées", async () => {
    // Placeholder - tests run in E2E/browser only
  });

  it.skip("getOrganization() récupère une org par ID", async () => {
    // Placeholder - tests run in E2E/browser only
  });
});

describe("MessagingService (Demo Mode - Mock Storage)", () => {
  // Note: Tests disabled in Node.js environment (localStorage not available)
  // Messaging tests run in browser/E2E only
  
  it.skip("getOrCreateConversation() crée une conversation", async () => {
    // Placeholder - tests run in E2E/browser only
  });
});
