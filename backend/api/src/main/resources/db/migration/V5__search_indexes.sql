-- Accent-insensitive title search — powers /movies?q= and the /movies/suggest
-- autocomplete endpoint.
--
-- unaccent is a "trusted" extension (PostgreSQL 13+), so this migration does
-- not require superuser privileges.

CREATE EXTENSION IF NOT EXISTS unaccent;
