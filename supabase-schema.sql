create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  game_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  highest_wave integer not null default 1 check (highest_wave >= 1),
  lifetime_coins integer not null default 0 check (lifetime_coins >= 0),
  play_seconds integer not null default 0 check (play_seconds >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.leaderboard_scores enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Anyone can read leaderboard" on public.leaderboard_scores;
create policy "Anyone can read leaderboard"
  on public.leaderboard_scores for select
  using (true);

drop policy if exists "Users can insert their own score" on public.leaderboard_scores;
create policy "Users can insert their own score"
  on public.leaderboard_scores for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own score" on public.leaderboard_scores;
create policy "Users can update their own score"
  on public.leaderboard_scores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
