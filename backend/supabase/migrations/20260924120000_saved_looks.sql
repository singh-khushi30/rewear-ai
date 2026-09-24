-- REWEAR saved looks
-- A look is an ordered set of the user's own garment IDs.
-- Apply after 20260918120000_garments_and_storage.sql.

create table if not exists public.saved_looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  occasion text not null default '',
  rationale text not null,
  fingerprint text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, fingerprint)
);

create index if not exists saved_looks_user_id_created_at_idx
  on public.saved_looks (user_id, created_at desc);

drop trigger if exists saved_looks_set_updated_at on public.saved_looks;
create trigger saved_looks_set_updated_at
before update on public.saved_looks
for each row
execute function public.set_updated_at();

create table if not exists public.saved_look_items (
  id uuid primary key default gen_random_uuid(),
  saved_look_id uuid not null references public.saved_looks (id) on delete cascade,
  garment_id uuid not null references public.garments (id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (saved_look_id, position),
  unique (saved_look_id, garment_id)
);

create index if not exists saved_look_items_look_id_position_idx
  on public.saved_look_items (saved_look_id, position);

create index if not exists saved_look_items_garment_id_idx
  on public.saved_look_items (garment_id);

alter table public.saved_looks enable row level security;
alter table public.saved_look_items enable row level security;

drop policy if exists saved_looks_select_own on public.saved_looks;
create policy saved_looks_select_own
on public.saved_looks
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists saved_looks_insert_own on public.saved_looks;
create policy saved_looks_insert_own
on public.saved_looks
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists saved_looks_update_own on public.saved_looks;
create policy saved_looks_update_own
on public.saved_looks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists saved_looks_delete_own on public.saved_looks;
create policy saved_looks_delete_own
on public.saved_looks
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists saved_look_items_select_own on public.saved_look_items;
create policy saved_look_items_select_own
on public.saved_look_items
for select
to authenticated
using (
  exists (
    select 1
    from public.saved_looks look
    where look.id = saved_look_id
      and look.user_id = auth.uid()
  )
);

drop policy if exists saved_look_items_insert_own on public.saved_look_items;
create policy saved_look_items_insert_own
on public.saved_look_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.saved_looks look
    where look.id = saved_look_id
      and look.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.garments garment
    where garment.id = garment_id
      and garment.user_id = auth.uid()
  )
);

drop policy if exists saved_look_items_update_own on public.saved_look_items;
create policy saved_look_items_update_own
on public.saved_look_items
for update
to authenticated
using (
  exists (
    select 1
    from public.saved_looks look
    where look.id = saved_look_id
      and look.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.saved_looks look
    where look.id = saved_look_id
      and look.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.garments garment
    where garment.id = garment_id
      and garment.user_id = auth.uid()
  )
);

drop policy if exists saved_look_items_delete_own on public.saved_look_items;
create policy saved_look_items_delete_own
on public.saved_look_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.saved_looks look
    where look.id = saved_look_id
      and look.user_id = auth.uid()
  )
);
