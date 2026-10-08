"use client";

/**
 * Service Organisations : CRUD sur orgs et offers, avec bascule mock/Supabase.
 */

import { getDataSource, ok, err, type ServiceResult } from "./index";
import { MOCK_ORGS, MOCK_OFFERS, findMockOrgById, findMockOfferById } from "@/lib/mock/organizations";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Offer {
  id: string;
  organizationId: string;
  title: string;
  sportSlug: string;
  positionLabelFr: string;
  positionLabelEn: string;
  level: "beginner" | "amateur" | "semi_pro" | "pro";
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: "open" | "closed" | "filled";
}

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  type: "club" | "recruiter";
  country: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  verified: boolean;
  visibility: "public" | "verified_only" | "private";
  createdAt: string;
  updatedAt: string;
}

export class OrganizationService {
  private source = getDataSource();

  /**
   * Récupérer une organisation par ID (données publiques ou propre)
   */
  async getOrganization(id: string, userId?: string): Promise<ServiceResult<Organization>> {
    if (this.source === "demo") {
      const org = findMockOrgById(id);
      if (!org) return err("Organization not found");
      return ok({
        id: org.id,
        ownerId: org.id, // Simplification mock : pas de owner distinct
        name: org.name,
        type: org.type,
        country: org.country,
        description: org.description,
        logoUrl: org.logoUrl,
        verified: org.verified,
        visibility: "public",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return err(`Failed to fetch organization: ${error.message}`);
    if (!data) return err("Organization not found");

    return ok({
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      type: data.type,
      country: data.country,
      description: data.description,
      website: data.website,
      logoUrl: data.logo_url,
      verified: data.verified,
      visibility: data.visibility,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  /**
   * Lister les organisations (publiques ou du propriétaire si userId fourni)
   */
  async listOrganizations(
    filters?: { type?: "club" | "recruiter"; country?: string; ownerId?: string }
  ): Promise<ServiceResult<Organization[]>> {
    if (this.source === "demo") {
      let orgs = MOCK_ORGS;
      if (filters?.type) orgs = orgs.filter((o) => o.type === filters.type);
      if (filters?.country) orgs = orgs.filter((o) => o.country === filters.country);
      if (filters?.ownerId) orgs = orgs.filter((o) => o.id === filters.ownerId);

      return ok(
        orgs.map((o) => ({
          id: o.id,
          ownerId: o.id,
          name: o.name,
          type: o.type,
          country: o.country,
          description: o.description,
          logoUrl: o.logoUrl,
          verified: o.verified,
          visibility: "public" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      );
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    let query = supabase.from("organizations").select("*");

    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.country) query = query.eq("country", filters.country);
    if (filters?.ownerId) query = query.eq("owner_id", filters.ownerId);

    const { data, error } = await query;

    if (error) return err(`Failed to fetch organizations: ${error.message}`);

    return ok(
      (data || []).map((o: any) => ({
        id: o.id,
        ownerId: o.owner_id,
        name: o.name,
        type: o.type,
        country: o.country,
        description: o.description,
        website: o.website,
        logoUrl: o.logo_url,
        verified: o.verified,
        visibility: o.visibility,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      }))
    );
  }

  /**
   * Récupérer une offre par ID
   */
  async getOffer(id: string): Promise<ServiceResult<Offer>> {
    if (this.source === "demo") {
      const offer = findMockOfferById(id);
      if (!offer) return err("Offer not found");
      return ok({
        id: offer.id,
        organizationId: offer.orgId,
        title: offer.title,
        sportSlug: offer.sportSlug,
        positionLabelFr: offer.positionLabelFr,
        positionLabelEn: offer.positionLabelFr, // Simplification
        level: offer.level,
        location: offer.location,
        description: offer.description,
        createdAt: offer.createdAt,
        updatedAt: offer.createdAt,
        status: "open",
      });
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("offers").select("*").eq("id", id).single();

    if (error) return err(`Failed to fetch offer: ${error.message}`);
    if (!data) return err("Offer not found");

    return ok({
      id: data.id,
      organizationId: data.organization_id,
      title: data.title,
      sportSlug: data.sport_slug,
      positionLabelFr: data.position_label_fr,
      positionLabelEn: data.position_label_en,
      level: data.level,
      location: data.location,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status,
    });
  }

  /**
   * Lister les offres (avec filtres)
   */
  async listOffers(filters?: {
    organizationId?: string;
    sportSlug?: string;
    level?: string;
  }): Promise<ServiceResult<Offer[]>> {
    if (this.source === "demo") {
      let offers = MOCK_OFFERS;
      if (filters?.organizationId) offers = offers.filter((o) => o.orgId === filters.organizationId);
      if (filters?.sportSlug) offers = offers.filter((o) => o.sportSlug === filters.sportSlug);
      if (filters?.level) offers = offers.filter((o) => o.level === filters.level);

      return ok(
        offers.map((o) => ({
          id: o.id,
          organizationId: o.orgId,
          title: o.title,
          sportSlug: o.sportSlug,
          positionLabelFr: o.positionLabelFr,
          positionLabelEn: o.positionLabelFr,
          level: o.level,
          location: o.location,
          description: o.description,
          createdAt: o.createdAt,
          updatedAt: o.createdAt,
          status: "open" as const,
        }))
      );
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    let query = supabase.from("offers").select("*");

    if (filters?.organizationId) query = query.eq("organization_id", filters.organizationId);
    if (filters?.sportSlug) query = query.eq("sport_slug", filters.sportSlug);
    if (filters?.level) query = query.eq("level", filters.level);

    const { data, error } = await query;

    if (error) return err(`Failed to fetch offers: ${error.message}`);

    return ok(
      (data || []).map((o: any) => ({
        id: o.id,
        organizationId: o.organization_id,
        title: o.title,
        sportSlug: o.sport_slug,
        positionLabelFr: o.position_label_fr,
        positionLabelEn: o.position_label_en,
        level: o.level,
        location: o.location,
        description: o.description,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        status: o.status,
      }))
    );
  }
}

export const organizationService = new OrganizationService();
