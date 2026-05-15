CREATE TABLE IF NOT EXISTS users (
    id           UUID         PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    email        VARCHAR(320),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
    ON users(email)
    WHERE email IS NOT NULL;

-- Clean break: ratings/favorites were keyed by opaque UUIDs without referential integrity.
-- The FKs below require every user_id to exist in `users`; we wipe pre-existing rows rather
-- than backfill (decision recorded in task SMWTN-70).
TRUNCATE user_movie_ratings, user_favorites RESTART IDENTITY CASCADE;

ALTER TABLE user_movie_ratings
    ADD CONSTRAINT fk_user_ratings_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_favorites
    ADD CONSTRAINT fk_user_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
