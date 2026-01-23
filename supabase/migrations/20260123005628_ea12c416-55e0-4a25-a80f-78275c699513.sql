-- Fix likes persistence + enable correct upsert semantics
-- 1) Ensure created_at is non-null and defaults to now()
update public.likes
set created_at = now()
where created_at is null;

alter table public.likes
  alter column created_at set default now();

alter table public.likes
  alter column created_at set not null;

-- 2) Deduplicate so we can enforce ONE row per (user_id, target_id)
with ranked as (
  select
    id,
    user_id,
    target_id,
    created_at,
    row_number() over (
      partition by user_id, target_id
      order by created_at desc, id desc
    ) as rn
  from public.likes
)
delete from public.likes l
using ranked r
where l.id = r.id
  and r.rn > 1;

-- 3) Replace wrong uniqueness (user_id,target_id,direction) with correct uniqueness (user_id,target_id)
alter table public.likes
  drop constraint if exists unique_user_target_direction;

alter table public.likes
  add constraint unique_user_target unique (user_id, target_id);

-- 4) Tighten RLS to prevent data leakage and support owner viewing likes on their own listings
alter table public.likes enable row level security;

-- Drop overly-permissive policy (any authenticated user can read all likes)
drop policy if exists "Allow authenticated users to read likes" on public.likes;

drop policy if exists "Users can read own likes" on public.likes;
create policy "Users can read own likes"
on public.likes
for select
to authenticated
using (auth.uid() = user_id);

-- Owners can see likes (direction=right) on listings they own
-- (this supports owner dashboards / interested-clients views)
drop policy if exists "Owners can read likes on own listings" on public.likes;
create policy "Owners can read likes on own listings"
on public.likes
for select
to authenticated
using (
  direction = 'right'
  and exists (
    select 1
    from public.listings l
    where l.id = likes.target_id
      and l.owner_id = auth.uid()
  )
);

-- Ensure write policies are strict
-- (re-create to avoid drift)
drop policy if exists "Allow users to insert their own likes" on public.likes;
create policy "Allow users to insert their own likes"
on public.likes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow users to update their own likes" on public.likes;
create policy "Allow users to update their own likes"
on public.likes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Allow users to delete their own likes" on public.likes;
create policy "Allow users to delete their own likes"
on public.likes
for delete
to authenticated
using (auth.uid() = user_id);
