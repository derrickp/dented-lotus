ALTER TABLE users ADD COLUMN numcorrectpicks INTEGER;
ALTER TABLE users ADD COLUMN positionchange INTEGER;
ALTER TABLE users ADD COLUMN position INTEGER;

drop view if exists full_user_vw;
drop view if exists public_users_vw;
CREATE VIEW full_user_vw as select users.displayname as display, users.email, users.firstname as firstName, users.lastname as lastName, users.points, users.key, users.role, users.imageurl as imageUrl, users.numcorrectpicks as numCorrectPicks, users.favedriver as faveDriver, users.faveteam as faveTeam, users.positionchange as positionChange, users.position as position from users;
CREATE VIEW public_users_vw as select users.displayname as display, users.points as points, users.key, users.numcorrectpicks as numCorrectPicks, users.imageurl as imageUrl, users.positionchange as positionChange, users.position as position from users;