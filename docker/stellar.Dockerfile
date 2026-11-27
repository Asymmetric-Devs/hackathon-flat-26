# Toolchain para el contrato `sello`: Rust estable + target wasm32v1-none + stellar-cli.
# Uso: ver scripts/contract-build.sh, scripts/contract-test.sh y scripts/deploy-testnet.sh.
FROM rust:1-slim-bookworm

ARG STELLAR_CLI_VERSION=30.0.1

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl libdbus-1-3 libudev1 openssl \
 && rm -rf /var/lib/apt/lists/*

RUN rustup target add wasm32v1-none

RUN curl -fsSL -o /tmp/stellar.tar.gz \
      "https://github.com/stellar/stellar-cli/releases/download/v${STELLAR_CLI_VERSION}/stellar-cli-${STELLAR_CLI_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
 && tar -xzf /tmp/stellar.tar.gz -C /usr/local/bin stellar \
 && rm /tmp/stellar.tar.gz \
 && stellar --version

ENV STELLAR_NO_UPDATE_CHECK=1

# El repo se monta en /work; target/ y el registry de cargo van en volúmenes nombrados.
WORKDIR /work/contracts
