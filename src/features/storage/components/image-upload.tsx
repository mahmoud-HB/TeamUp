"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";
import { isDemoMode } from "@/lib/services";

interface ImageUploadProps {
  onUpload: (url: string, fileName: string) => void;
  maxSize?: number; // bytes
  accept?: string;
  label?: string;
  currentImageUrl?: string;
}

/**
 * Composant upload d'images avec bascule démo/Supabase.
 * En démo: génère URL d'image fictive
 * En réel: upload vers Supabase Storage
 */
export function ImageUpload({
  onUpload,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = "image/*",
  label = "Télécharger une image",
  currentImageUrl,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > maxSize) {
      setError(`Fichier trop volumineux (max ${maxSize / 1024 / 1024}MB)`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Créer un preview local d'abord
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
      };
      reader.readAsDataURL(file);

      if (isDemoMode()) {
        // Mode démo: générer URL fictive
        const demoUrl = `https://images.unsplash.com/photo-${Date.now()}?w=200&h=200&fit=crop&q=70`;
        onUpload(demoUrl, file.name);
      } else {
        // Mode réel: upload vers Supabase Storage (TODO)
        // const { data, error } = await uploadToSupabase(file, bucket);
        // if (error) throw error;
        // onUpload(data.publicUrl, file.name);
        
        // Pour l'instant, utiliser URL local
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onUpload(dataUrl, file.name);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Aperçu"
            className="h-32 w-32 rounded-lg object-cover"
          />
          <button
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="cursor-pointer"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Upload...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        Max {maxSize / 1024 / 1024}MB • Format: {accept}
        {isDemoMode() && " (Mode démo - URL fictive)"}
      </p>
    </div>
  );
}
