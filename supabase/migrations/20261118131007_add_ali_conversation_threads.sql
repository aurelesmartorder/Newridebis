alter table public.ai_coach_messages
  add column if not exists conversation_id uuid;

with ordered as (
  select
    id,
    user_id,
    sport,
    created_at,
    lag(created_at) over (
      partition by user_id, sport
      order by created_at asc nulls first, id
    ) as previous_created_at
  from public.ai_coach_messages
  where conversation_id is null
),
numbered as (
  select
    id,
    user_id,
    sport,
    sum(
      case
        when previous_created_at is null
          or created_at is null
          or created_at - previous_created_at > interval '60 minutes'
        then 1 else 0
      end
    ) over (
      partition by user_id, sport
      order by created_at asc nulls first, id
      rows unbounded preceding
    ) as conversation_group
  from ordered
),
group_ids as (
  select user_id, sport, conversation_group, gen_random_uuid() as conversation_id
  from numbered
  group by user_id, sport, conversation_group
)
update public.ai_coach_messages m
set conversation_id = g.conversation_id
from numbered n
join group_ids g using (user_id, sport, conversation_group)
where m.id = n.id
  and m.conversation_id is null;

create index if not exists ai_coach_messages_thread_history_idx
  on public.ai_coach_messages (user_id, sport, conversation_id, created_at);
