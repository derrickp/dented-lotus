ALTER TABLE users ADD COLUMN imageurl TEXT;

drop view if exists full_user_vw;
CREATE VIEW full_user_vw as select users.displayname as displayName, users.email, users.firstname as firstName, users.lastname as lastName, users.points, users.key, users.role, users.imageurl as imageUrl from users;