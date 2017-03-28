CREATE TABLE IF NOT EXISTS racepredictionsfinals (
	`prediction`	TEXT NOT NULL,
	`race`	TEXT NOT NULL,
	`final` TEXT NOT NULL,
	PRIMARY KEY(`prediction`,`race`)
);