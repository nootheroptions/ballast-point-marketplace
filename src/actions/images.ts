'use server';

import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { UnauthorizedError, requireUser } from '@/lib/auth/server-auth';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createServiceRepository } from '@/lib/repositories/service.repo';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { requireProviderAdmin } from '@/lib/auth/provider-authorization';
import { createStorageService } from '@/lib/services/storage';
import { env } from '@/lib/config/env';
import type { AuthUser } from '@/lib/services/auth/types';
import type { ActionResult } from './types';

const MAX_FILES_PER_UPLOAD = 10;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function getImageFilesFromFormData(formData: FormData): File[] {
  return formData
    .getAll('files')
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function buildFileExtension(file: File): string {
  const fileNameParts = file.name.split('.');
  if (fileNameParts.length < 2) {
    return '';
  }

  const rawExtension = fileNameParts[fileNameParts.length - 1]?.toLowerCase() ?? '';
  const safeExtension = rawExtension.replace(/[^a-z0-9]/g, '');
  return safeExtension ? `.${safeExtension}` : '';
}

function validateUploadRequest(files: File[]): ActionResult<never> | null {
  if (files.length === 0) {
    return {
      success: false,
      error: 'Please select at least one image',
    };
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return {
      success: false,
      error: `You can upload up to ${MAX_FILES_PER_UPLOAD} images at a time`,
    };
  }

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Only image files are allowed',
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'Each image must be 10MB or smaller',
      };
    }
  }

  return null;
}

async function getCurrentProviderProfileId(user: AuthUser): Promise<string | null> {
  const cookieStore = await cookies();
  const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  if (!teamId) {
    return null;
  }

  const providerRepository = createProviderProfileRepository();
  const providerProfile = await providerRepository.findByTeamId(teamId);
  if (!providerProfile) {
    return null;
  }

  await requireProviderAdmin(user, providerProfile.id);
  return providerProfile.id;
}

async function uploadFilesToStorage(
  files: File[],
  basePath: string
): Promise<ActionResult<{ imageUrls: string[] }>> {
  const storageService = await createStorageService();

  const uploadedFiles = await storageService.uploadFiles(
    env.SUPABASE_STORAGE_BUCKET,
    await Promise.all(
      files.map(async (file) => {
        const extension = buildFileExtension(file);
        const fileName = `${Date.now()}-${randomUUID()}${extension}`;

        return {
          path: `${basePath}/${fileName}`,
          data: await file.arrayBuffer(),
          contentType: file.type,
          upsert: false,
        };
      })
    )
  );

  return {
    success: true,
    data: {
      imageUrls: uploadedFiles.map((file) => file.publicUrl),
    },
  };
}

export async function uploadProviderImages(
  formData: FormData
): Promise<ActionResult<{ imageUrls: string[] }>> {
  try {
    const user = await requireUser();
    const files = getImageFilesFromFormData(formData);
    const validationError = validateUploadRequest(files);
    if (validationError) {
      return validationError;
    }

    const providerProfileId = await getCurrentProviderProfileId(user);
    if (!providerProfileId) {
      return {
        success: false,
        error: 'Provider profile not found',
      };
    }

    return await uploadFilesToStorage(files, `providers/${providerProfileId}/profile`);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('Provider image upload failed:', error);
    return {
      success: false,
      error: 'Failed to upload images',
    };
  }
}

export async function uploadServiceImages(
  formData: FormData
): Promise<ActionResult<{ imageUrls: string[] }>> {
  try {
    const user = await requireUser();
    const files = getImageFilesFromFormData(formData);
    const validationError = validateUploadRequest(files);
    if (validationError) {
      return validationError;
    }

    const providerProfileId = await getCurrentProviderProfileId(user);
    if (!providerProfileId) {
      return {
        success: false,
        error: 'Provider profile not found',
      };
    }

    const serviceIdRaw = formData.get('serviceId');
    const serviceId =
      typeof serviceIdRaw === 'string' && serviceIdRaw.length > 0 ? serviceIdRaw : null;

    if (serviceId) {
      const serviceRepository = createServiceRepository();
      const service = await serviceRepository.findById(serviceId);

      if (!service || service.providerProfileId !== providerProfileId) {
        return {
          success: false,
          error: 'Service not found',
        };
      }
    }

    const uploadPath = serviceId
      ? `providers/${providerProfileId}/services/${serviceId}`
      : `providers/${providerProfileId}/services/drafts`;

    return await uploadFilesToStorage(files, uploadPath);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error('Service image upload failed:', error);
    return {
      success: false,
      error: 'Failed to upload images',
    };
  }
}
