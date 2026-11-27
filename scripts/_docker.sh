# Helper compartido por los scripts del contrato. Se usa con `source`.
# Construye la imagen si no existe y define `in_docker <cmd...>`, que corre un
# comando dentro del contenedor con el repo montado en /work.
#
# Funciona desde Git Bash en Windows (convierte la ruta con `pwd -W` y desactiva
# la conversión de rutas de MSYS) y desde Linux/macOS.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE="${OFICIO_STELLAR_IMAGE:-oficio-stellar:30.0.1}"

if (cd "$REPO_ROOT" && pwd -W) >/dev/null 2>&1; then
  HOST_REPO="$(cd "$REPO_ROOT" && pwd -W)"   # C:/Users/... en Git Bash
else
  HOST_REPO="$REPO_ROOT"
fi
export MSYS_NO_PATHCONV=1

ensure_image() {
  if [[ "${OFICIO_REBUILD_IMAGE:-0}" == "1" ]] || ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo ">> construyendo imagen $IMAGE" >&2
    docker build -t "$IMAGE" -f "$HOST_REPO/docker/stellar.Dockerfile" "$HOST_REPO/docker" >&2
  fi
}

# in_docker [-e VAR=valor ...] -- cmd args...
in_docker() {
  local envs=()
  while [[ $# -gt 0 && "$1" != "--" ]]; do envs+=("$1"); shift; done
  [[ "${1:-}" == "--" ]] && shift
  ensure_image
  local tty=()
  [[ -t 0 && -t 1 ]] && tty=(-t)
  docker run --rm -i "${tty[@]}" \
    -v "$HOST_REPO:/work" \
    -v oficio-cargo-registry:/usr/local/cargo/registry \
    -v oficio-cargo-git:/usr/local/cargo/git \
    -v oficio-target:/work/contracts/target \
    -w /work/contracts \
    "${envs[@]}" \
    "$IMAGE" "$@"
}

WASM_PATH="/work/contracts/target/wasm32v1-none/release/sello.wasm"
