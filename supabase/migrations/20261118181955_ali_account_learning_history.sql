-- V2 account-owned coaching record. Additive: no existing rows are changed.
create table public.ali_learning_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  kind text not null check (kind in ('exercise','note','lesson','voice','instruction','video','transcript')),
  title text not null check (length(title) between 1 and 240),
  content text not null default '' check (length(content) <= 12000),
  horse_id text not null default '' check (length(horse_id) <= 100),
  horse_name text not null default '' check (length(horse_name) <= 100),
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 86400),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details)='object' and octet_length(details::text)<=20000),
  created_at timestamptz not null default now(),
  primary key(user_id,id)
);
create index ali_learning_events_owner_date on public.ali_learning_events(user_id,created_at desc,id desc);
alter table public.ali_learning_events enable row level security;
revoke all on public.ali_learning_events from anon;
grant select,insert,update,delete on public.ali_learning_events to authenticated;
create policy ali_learning_events_read on public.ali_learning_events for select to authenticated using ((select auth.uid())=user_id);
create policy ali_learning_events_insert on public.ali_learning_events for insert to authenticated with check ((select auth.uid())=user_id);
create policy ali_learning_events_update on public.ali_learning_events for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy ali_learning_events_delete on public.ali_learning_events for delete to authenticated using ((select auth.uid())=user_id);
