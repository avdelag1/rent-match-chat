
-- Create a security-definer RPC to fetch client profiles visible to an owner.
-- It maps columns to what the frontend expects (id, full_name, interests, preferences, images, location).
-- Access is restricted so the caller's auth.uid() must match the owner_user_id passed in.

create or replace function public.get_clients_for_owner(owner_user_id uuid)
returns table (
  id uuid,
  full_name text,
  age integer,
  bio text,
  gender text,
  interests text[],
  preferences text[],
  images text[],
  location jsonb
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  -- Ensure the caller is the same as the provided owner_user_id
  if owner_user_id is null or owner_user_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  -- Return recent client profiles (excluding the owner themself)
  return query
  select
    cp.user_id as id,
    cp.name as full_name,
    cp.age,
    cp.bio,
    cp.gender,
    cp.interests,
    cp.preferred_activities as preferences,
    cp.profile_images as images,
    cp.location
  from public.client_profiles cp
  where cp.user_id is not null
    and cp.user_id <> owner_user_id
  order by cp.updated_at desc nulls last, cp.created_at desc nulls last
  limit 50;
end;
$$;

-- Allow authenticated users to execute the function
grant execute on function public.get_clients_for_owner(uuid) to authenticated;
