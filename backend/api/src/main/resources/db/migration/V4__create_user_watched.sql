CREATE TABLE IF NOT EXISTS user_watched_movies (
    user_id    UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    movie_id   BIGINT      NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_user_watched_user ON user_watched_movies(user_id);
