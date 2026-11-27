#!/usr/bin/env bash
# Corre los tests del contrato `sello` (cargo test) dentro de Docker.
# Argumentos extra se pasan a cargo test (ej: scripts/contract-test.sh revoke).
source "$(dirname "$0")/_docker.sh"
in_docker -- cargo test "$@"
