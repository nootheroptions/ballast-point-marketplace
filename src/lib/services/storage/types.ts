export interface StorageUploadFile {
  path: string;
  data: ArrayBuffer;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface StorageUploadedFile {
  path: string;
  publicUrl: string;
}

export interface StorageService {
  uploadFiles(bucket: string, files: StorageUploadFile[]): Promise<StorageUploadedFile[]>;
}

export type StorageServiceFactory = () => Promise<StorageService>;
