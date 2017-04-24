ALTER TABLE users ADD COLUMN numcorrectpicks INTEGER;

drop view if exists full_user_vw;
drop view if exists public_users_vw;
CREATE VIEW full_user_vw as select users.displayname as displayName, users.email, users.firstname as firstName, users.lastname as lastName, users.points, users.key, users.role, users.imageurl as imageUrl, users.numcorrectpicks as numCorrectPicks, user.favedriver as faveDriver, user.faveteam as faveTeam from users;
CREATE VIEW public_users_vw as select users.displayname as display, users.points as points, users.key, users.numcorrectpicks as numCorrectPicks, users.imageurl as imageUrl from users;