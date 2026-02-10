# Supabase Storage Setup (Marketplace Images)

## Bucket configuration

Create this bucket in Supabase Dashboard:

- Path: `Storage -> Buckets -> New bucket`
- Bucket name: `public-marketplace-images`
- Public bucket: `ON` (required for current `getPublicUrl` image rendering)
- Allowed MIME types (recommended): `image/*`
- File size limit (recommended): `10 MB`

## App environment

Set this in local and deployed env:

- `SUPABASE_STORAGE_BUCKET=public-marketplace-images`

Then restart/redeploy the app.

## Storage policies (3 separate policies)

Create these in:

- `Storage -> Policies -> storage.objects -> New policy`

### 1) Insert policy

- Policy name: `public_marketplace_images_insert_auth`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: `true` (or leave empty if UI disables it for INSERT)
- WITH CHECK expression:

```sql
bucket_id = 'public-marketplace-images'
```

### 2) Update policy

- Policy name: `public_marketplace_images_update_auth`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression:

```sql
bucket_id = 'public-marketplace-images'
```

- WITH CHECK expression:

```sql
bucket_id = 'public-marketplace-images'
```

### 3) Delete policy

- Policy name: `public_marketplace_images_delete_auth`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression:

```sql
bucket_id = 'public-marketplace-images'
```

- WITH CHECK expression: `true` (or leave empty if UI disables it for DELETE)

## Equivalent SQL (optional)

```sql
create policy "public_marketplace_images_insert_auth"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'public-marketplace-images');

create policy "public_marketplace_images_update_auth"
on storage.objects
for update
to authenticated
using (bucket_id = 'public-marketplace-images')
with check (bucket_id = 'public-marketplace-images');

create policy "public_marketplace_images_delete_auth"
on storage.objects
for delete
to authenticated
using (bucket_id = 'public-marketplace-images');
```

## Notes

- Public-read bucket means anyone with the URL can view images.
- This is appropriate for marketplace/public listing images only.
- Do not use this bucket for private files.
