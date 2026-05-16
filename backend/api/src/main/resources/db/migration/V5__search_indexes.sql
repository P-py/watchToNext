-- Fuzzy, accent-insensitive title search — backs both /movies?q= and the
-- /movies/suggest autocomplete endpoint.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() is only declared STABLE, so it cannot back an index expression.
-- Wrap it as IMMUTABLE — the explicit dictionary argument keeps it independent
-- of search_path, which makes the IMMUTABLE marking sound.
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
    PARALLEL SAFE
    STRICT
AS $$ SELECT unaccent('unaccent', $1) $$;

-- GIN trigram index over the accent-folded title. Accelerates both the ILIKE
-- substring match and the `%` similarity operator used for typo tolerance.
CREATE INDEX IF NOT EXISTS idx_movies_title_trgm
    ON movies USING gin (immutable_unaccent(title) gin_trgm_ops);
