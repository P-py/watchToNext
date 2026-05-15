#!/bin/sh
# Hard guard for the internet-facing Keycloak: refuse to start if the
# bootstrap admin password is a well-known default.
#
# KC_BOOTSTRAP_ADMIN_* only seed the admin on the *first* boot. On later boots
# they are normally unset/empty and this check is a no-op — so removing them
# after first boot (recommended) keeps working.
set -e

WEAK_PASSWORDS="admin password changeme keycloak 123456 secret"

pw="${KC_BOOTSTRAP_ADMIN_PASSWORD:-}"
if [ -n "$pw" ]; then
  for weak in $WEAK_PASSWORDS; do
    if [ "$pw" = "$weak" ]; then
      echo "FATAL: KC_BOOTSTRAP_ADMIN_PASSWORD is a well-known weak value ('$weak')." >&2
      echo "       This Keycloak is public — set a strong, unique password." >&2
      exit 1
    fi
  done
fi

exec /opt/keycloak/bin/kc.sh "$@"
