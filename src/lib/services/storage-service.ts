"use client";

/**
 * Service de stockage : upload fichiers vers Supabase Storage ou mock en démo.
 */

import { getDataSource, ok, err, type ServiceResult } from "./index";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
  uploadedAt: string;
}

export class StorageService {
  private source = getDataSource();

  /**
   * Uploader une image vers avatars bucket
   */
  async uploadAvatar(file: File, userId: string): Promise<ServiceResult<UploadResult>> {
    if (this.source === "demo") {
      return this.mockUpload(file, userId, "avatars");
    }

    return this.uploadToSupabase(file, "avatars", `${userId}/${file.name}`);
  }

  /**
   * Uploader une image vers media bucket
   */
  async uploadMedia(file: File, userId: string): Promise<ServiceResult<UploadResult>> {
    if (this.source === "demo") {
      return this.mockUpload(file, userId, "media");
    }

    return this.uploadToSupabase(file, "media", `${userId}/${file.name}`);
  }

  /**
   * Uploader un logo d'organisation
   */
  async uploadOrgLogo(file: File, orgId: string): Promise<ServiceResult<UploadResult>> {
    if (this.source === "demo") {
      return this.mockUpload(file, orgId, "org_logos");
    }

    return this.uploadToSupabase(file, "org_logos", `${orgId}/${file.name}`);
  }

  /**
   * Mock upload (démo mode)
   */
  private mockUpload(
    file: File,
    id: string,
    bucket: string
  ): ServiceResult<UploadResult> {
    const path = `${bucket}/${id}/${file.name}`;
    const url = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=400&fit=crop&q=70`;

    return ok({
      url,
      path,
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  }

  /**
   * Upload réel vers Supabase Storage
   */
  private async uploadToSupabase(
    file: File,
    bucket: string,
    path: string
  ): Promise<ServiceResult<UploadResult>> {
    try {
      const supabase = createSupabaseBrowserClient();

      // Upload le fichier
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        return err(`Upload failed: ${uploadError.message}`);
      }

      // Récupérer l'URL publique (ou URL avec token si privé)
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return ok({
        url: publicUrlData.publicUrl,
        path: data.path,
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      return err(`Upload error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Supprimer un fichier
   */
  async deleteFile(bucket: string, path: string): Promise<ServiceResult<boolean>> {
    if (this.source === "demo") {
      // En démo, juste retourner succès
      return ok(true);
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        return err(`Delete failed: ${error.message}`);
      }

      return ok(true);
    } catch (error) {
      return err(`Delete error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export const storageService = new StorageService();
