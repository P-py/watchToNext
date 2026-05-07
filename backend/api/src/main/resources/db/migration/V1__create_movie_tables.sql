CREATE TABLE IF NOT EXISTS genres (
    id   INTEGER      PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS movies (
    id           BIGSERIAL    PRIMARY KEY,
    tmdb_id      BIGINT       NOT NULL UNIQUE,
    title        VARCHAR(500) NOT NULL,
    overview     TEXT,
    poster_path  VARCHAR(500),
    vote_average NUMERIC(4, 2),
    vote_count   INTEGER,
    popularity   NUMERIC(12, 4),
    release_date DATE
);

CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id BIGINT  NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE IF NOT EXISTS cast_members (
    id             BIGSERIAL    PRIMARY KEY,
    movie_id       BIGINT       NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    tmdb_person_id BIGINT,
    name           VARCHAR(200) NOT NULL,
    character_name VARCHAR(300),
    cast_order     INTEGER,
    profile_path   VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id     ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_title       ON movies(title);
CREATE INDEX IF NOT EXISTS idx_cast_movie         ON cast_members(movie_id);
