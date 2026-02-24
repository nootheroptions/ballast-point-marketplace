'use client';

import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProviderProfile } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  updateProviderProfileSchema,
  type UpdateProviderProfileData,
} from '@/lib/validations/provider-profile';
import { updateProviderProfile } from '@/actions/providers';
import { uploadProviderImages } from '@/actions/images';
import { Camera, Upload, User, X } from 'lucide-react';
import { useRegisterPageHeaderSave } from '../layout/provider-dashboard/PageHeaderContext';

interface BasicInfoFormProps {
  profile: ProviderProfile;
}

const MAX_IMAGE_COUNT = 10;

export function BasicInfoForm({ profile }: BasicInfoFormProps) {
  const router = useRouter();
  const profileFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<UpdateProviderProfileData>({
    resolver: zodResolver(updateProviderProfileSchema),
    defaultValues: {
      name: profile.name,
      slug: profile.slug,
      description: profile.description ?? '',
      profileUrl: profile.profileUrl ?? '',
      imageUrls: profile.imageUrls.length > 0 ? profile.imageUrls : [],
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = useCallback(
    async (data: UpdateProviderProfileData) => {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const result = await updateProviderProfile(data);

        if ('success' in result && !result.success) {
          setErrorMessage(result.error || 'Failed to update profile');
          return;
        }

        setSuccessMessage('Profile updated successfully');
        // Reset form state to mark as not dirty after successful save
        if ('data' in result && result.data) {
          form.reset({
            name: result.data.name,
            slug: result.data.slug,
            description: result.data.description ?? '',
            profileUrl: result.data.profileUrl ?? '',
            imageUrls: result.data.imageUrls ?? [],
          });
        }
        router.refresh();
      } catch (error) {
        setErrorMessage('An unexpected error occurred');
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, router]
  );

  // Create a save handler for the page header
  const handleSave = useCallback(() => {
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  // Register save handler with page header
  useRegisterPageHeaderSave(handleSave, isSubmitting, !isDirty);

  const handleImageUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length === 0) {
        return;
      }

      const existingUrls = form.getValues('imageUrls') ?? [];
      const remainingSlots = MAX_IMAGE_COUNT - existingUrls.length;

      if (remainingSlots <= 0) {
        setErrorMessage(`You can upload up to ${MAX_IMAGE_COUNT} images`);
        return;
      }

      if (files.length > remainingSlots) {
        setErrorMessage(
          `You can upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`
        );
        return;
      }

      setErrorMessage(null);
      setSuccessMessage(null);
      setIsUploadingImages(true);

      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append('files', file);
        }

        const result = await uploadProviderImages(formData);
        if (!result.success || !result.data) {
          setErrorMessage(result.error ?? 'Failed to upload images');
          return;
        }

        const nextUrls = Array.from(new Set([...existingUrls, ...result.data.imageUrls]));
        form.setValue('imageUrls', nextUrls, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to upload images');
      } finally {
        setIsUploadingImages(false);
      }
    },
    [form]
  );

  const handleProfileImageUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const [file] = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (!file) {
        return;
      }

      setErrorMessage(null);
      setSuccessMessage(null);
      setIsUploadingProfileImage(true);

      try {
        const formData = new FormData();
        formData.append('files', file);

        const result = await uploadProviderImages(formData);
        if (!result.success || !result.data || result.data.imageUrls.length === 0) {
          setErrorMessage(result.error ?? 'Failed to upload profile image');
          return;
        }

        const uploadedProfileUrl = result.data.imageUrls[0];
        form.setValue('profileUrl', uploadedProfileUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to upload profile image');
      } finally {
        setIsUploadingProfileImage(false);
      }
    },
    [form]
  );

  const handleRemoveImage = useCallback(
    (imageUrl: string) => {
      const imageUrls = form.getValues('imageUrls') ?? [];
      form.setValue(
        'imageUrls',
        imageUrls.filter((url) => url !== imageUrl),
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
    },
    [form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-success/15 text-success rounded-lg p-3 text-sm">{successMessage}</div>
        )}

        <div className="flex flex-col items-start gap-4 md:flex-row md:gap-6">
          <FormField
            control={form.control}
            name="profileUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      ref={profileFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      disabled={isUploadingProfileImage || isSubmitting}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => profileFileInputRef.current?.click()}
                      disabled={isUploadingProfileImage || isSubmitting}
                      className="relative"
                      aria-label="Upload profile image"
                    >
                      <div className="bg-muted relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border md:h-28 md:w-28">
                        {field.value ? (
                          <Image
                            src={field.value}
                            alt="Profile image"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <User className="text-muted-foreground h-10 w-10" />
                        )}
                        <div className="absolute inset-0 flex items-end justify-end bg-black/0 p-2 hover:bg-black/25">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black">
                            <Camera className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                    <p className="text-muted-foreground text-xs">
                      {isUploadingProfileImage ? 'Uploading...' : 'Click to upload profile image'}
                    </p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Business Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed publicly on your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    URL Slug <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="your-business-name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used in your public profile URL. Only lowercase letters, numbers,
                    and hyphens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your business"
                  className="min-h-32 resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                A brief description of your business (max 600 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Images</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploadingImages || isSubmitting}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageFileInputRef.current?.click()}
                    disabled={isUploadingImages || isSubmitting}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploadingImages ? 'Uploading...' : 'Choose Files'}
                  </Button>

                  {field.value?.length ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {field.value.map((imageUrl) => (
                        <div
                          key={imageUrl}
                          className="bg-muted relative aspect-video overflow-hidden rounded-lg border"
                        >
                          <Image
                            src={imageUrl}
                            alt="Uploaded provider image"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => handleRemoveImage(imageUrl)}
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                      No images uploaded yet.
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload up to 10 images for your profile. These appear publicly on your provider
                page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
