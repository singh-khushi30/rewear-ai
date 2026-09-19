-- REWEAR wardrobe persistence
-- Apply this in the Supabase SQL Editor (or via the Supabase CLI) before using auth/storage.

create extension if not exists "pgcrypto";

create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  image_path text not null,
  category text not null,
  primary_color text not null,
  material text,
  silhouette text,
  formality text,
  season text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists garments_user_id_created_at_idx
  on public.garments (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists garments_set_updated_at on public.garments;
create trigger garments_set_updated_at
before update on public.garments
for each row
execute function public.set_updated_at();

alter table public.garments enable row level security;

drop policy if exists garments_select_own on public.garments;
create policy garments_select_own
on public.garments
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists garments_insert_own on public.garments;
create policy garments_insert_own
on public.garments
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists garments_update_own on public.garments;
create policy garments_update_own
on public.garments
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists garments_delete_own on public.garments;
create policy garments_delete_own
on public.garments
for delete
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wardrobe-images',
  'wardrobe-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists wardrobe_images_select_own on storage.objects;
create policy wardrobe_images_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'wardrobe-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists wardrobe_images_insert_own on storage.objects;
create policy wardrobe_images_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wardrobe-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists wardrobe_images_update_own on storage.objects;
create policy wardrobe_images_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'wardrobe-images'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'wardrobe-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists wardrobe_images_delete_own on storage.objects;
create policy wardrobe_images_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'wardrobe-images'
  and split_part(name, '/', 1) = auth.uid()::text
);
