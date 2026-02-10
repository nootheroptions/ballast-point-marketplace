import { createServerSupabaseClient } from '@/lib/services/auth/supabase-client';
import type { StorageService, StorageUploadFile, StorageUploadedFile } from './types';

async function uploadSingleFile(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  bucket: string,
  file: StorageUploadFile
): Promise<StorageUploadedFile> {
  const { error } = await supabase.storage.from(bucket).upload(file.path, file.data, {
    contentType: file.contentType,
    cacheControl: file.cacheControl ?? '3600',
    upsert: file.upsert ?? false,
  });

  if (error) {
    throw new Error(`Failed to upload "${file.path}" to bucket "${bucket}": ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(file.path);

  return {
    path: file.path,
    publicUrl: data.publicUrl,
  };
}

export async function createSupabaseStorageService(): Promise<StorageService> {
  const supabase = await createServerSupabaseClient();

  return {
    async uploadFiles(bucket: string, files: StorageUploadFile[]): Promise<StorageUploadedFile[]> {
      const uploads: StorageUploadedFile[] = [];

      for (const file of files) {
        uploads.push(await uploadSingleFile(supabase, bucket, file));
      }

      return uploads;
    },
  };
}
