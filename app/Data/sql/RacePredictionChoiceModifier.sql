CREATE TABLE `rel_choice_race_modifier_prediction` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`choice`	TEXT NOT NULL,
	`race`	TEXT NOT NULL,
	`multiplier`	REAL NOT NULL DEFAULT 1.00,
	`prediction`	TEXT
);