# Toolchain en Docker

Status: resolved

Imagen Docker con Rust (target wasm32v1-none) y stellar-cli 30.0.1 para compilar, testear y desplegar el contrato sin instalar Rust en Windows. Scripts de conveniencia para build y test.

## Answer

`docker/stellar.Dockerfile` (rust:1-slim-bookworm + wasm32v1-none + stellar-cli 30.0.1 binario) → imagen `oficio-stellar:30.0.1`, se construye sola la primera vez. `scripts/_docker.sh` monta el repo en `/work` (ruta vía `pwd -W`, `MSYS_NO_PATHCONV=1`) y cachea registry/git/target en volúmenes `oficio-cargo-registry`, `oficio-cargo-git`, `oficio-target`.
Uso desde Git Bash: `scripts/contract-build.sh` y `scripts/contract-test.sh`. Ojo: la primera compilación en esta máquina tarda ~30 min por cada perfil (test y release); después es incremental.
