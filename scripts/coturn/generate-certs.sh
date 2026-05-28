#!/usr/bin/env bash
# Generate self-signed TLS certs for coturn dev/staging (use Let's Encrypt in prod).
set -euo pipefail
DOMAIN="${1:-turn.localhost}"
CERT_DIR="$(dirname "$0")/../../infra/coturn/certs"
mkdir -p "$CERT_DIR"
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
  -keyout "$CERT_DIR/privkey.pem" \
  -out "$CERT_DIR/fullchain.pem" \
  -subj "/CN=${DOMAIN}"
echo "Certs written to ${CERT_DIR} for CN=${DOMAIN}"
