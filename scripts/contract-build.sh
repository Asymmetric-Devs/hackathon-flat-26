#!/usr/bin/env bash
# Compila el contrato `sello` a wasm (stellar contract build) dentro de Docker.
# Resultado: target/wasm32v1-none/release/sello.wasm dentro del volumen oficio-target.
source "$(dirname "$0")/_docker.sh"
in_docker -- stellar contract build --package sello "$@"
in_docker -- sh -c "ls -l $WASM_PATH"
