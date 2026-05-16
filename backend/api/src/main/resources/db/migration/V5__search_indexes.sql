-- Fuzzy, accent-insensitive title search — powers /movies?q= and the
-- /movies/suggest autocomplete endpoint.
--
-- pg_trgm and unaccent are "trusted" extensions (PostgreSQL 13+), so this
-- migration does not require superuser privileges.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- GIN trigram index on the title. Accelerates trigram similarity / ILIKE
-- scans; the accent-folded overlay (unaccent()) is evaluated per row, which is
-- comfortably within budget at this project's catalog size.
CREATE INDEX IF NOT EXISTS idx_movies_title_trgm
    ON movies USING gin (title gin_trgm_ops);
