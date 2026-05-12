CREATE TABLE IF NOT EXISTS user_movie_ratings (
    user_id    UUID          NOT NULL,
    movie_id   BIGINT        NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    rating     NUMERIC(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS user_favorites (
    user_id    UUID        NOT NULL,
    movie_id   BIGINT      NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_user    ON user_movie_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_movie   ON user_movie_ratings(movie_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user  ON user_favorites(user_id);
