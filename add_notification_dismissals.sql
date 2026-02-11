-- Notification dismissals for user-specific dropdown state

create table if not exists notification_dismissals (
  user_id uuid references auth.users not null,
  notification_key text not null,
  dismissed_on date not null default current_date,
  created_at timestamp with time zone not null default now(),
  primary key (user_id, notification_key)
);

alter table notification_dismissals enable row level security;

create policy "Users can view their own notification dismissals."
  on notification_dismissals for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own notification dismissals."
  on notification_dismissals for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own notification dismissals."
  on notification_dismissals for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete their own notification dismissals."
  on notification_dismissals for delete
  using ((select auth.uid()) = user_id);
