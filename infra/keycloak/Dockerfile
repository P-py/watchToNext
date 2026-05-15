# syntax=docker/dockerfile:1
# watchToNext Keycloak — stock image + the realm export and custom login theme.
# Build context: the `infra/keycloak/` directory.
FROM quay.io/keycloak/keycloak:26.0

# Realm is imported on first boot via `start --import-realm`.
COPY realm-export.json /opt/keycloak/data/import/watchtonext-realm.json

# Custom dark/amber login theme (selected by the realm's `loginTheme`).
COPY themes /opt/keycloak/themes

# Startup guard — refuses to boot with a default/weak bootstrap admin password.
COPY --chmod=755 keycloak-entrypoint.sh /opt/keycloak/keycloak-entrypoint.sh

ENTRYPOINT ["/opt/keycloak/keycloak-entrypoint.sh"]
CMD ["start", "--import-realm"]
