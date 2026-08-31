begin;

drop policy if exists profiles_visible_read on community.profiles;
create policy profiles_visible_read on community.profiles for select to anon, authenticated
using (
  (
    profile_visibility = 'public'
    or user_id = (select auth.uid())
    or (
      profile_visibility = 'followers'
      and exists (select 1 from community.follows f where f.followed_id = profiles.user_id and f.follower_id = (select auth.uid()))
    )
  )
  and (auth.uid() is null or not private.is_blocked_between(user_id))
);

drop policy if exists user_collections_visible_read on community.collections;
create policy user_collections_visible_read on community.collections for select to anon, authenticated
using (
  (
    visibility = 'public'
    or owner_id = (select auth.uid())
    or (visibility = 'followers' and exists (select 1 from community.follows f where f.followed_id = collections.owner_id and f.follower_id = (select auth.uid())))
  )
  and (auth.uid() is null or not private.is_blocked_between(owner_id))
);

commit;
