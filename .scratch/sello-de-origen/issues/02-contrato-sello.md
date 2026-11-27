# Contrato sello

Status: resolved
Blocked by: 01

Contrato según la sección "Contrato sello" del spec, sobre el NFT de OpenZeppelin stellar-tokens 0.8 y soroban-sdk 28. Tests según el spec.

## Answer

`contracts/sello/` (workspace en `contracts/`, soroban-sdk 28.0.0 + OpenZeppelin `stellar-tokens` 0.8.0, sin fallback): interfaz del spec al pie de la letra y NFT SEP-50 vía `#[contractimpl(contracttrait)] impl NonFungibleToken { type ContractType = Base; }`; `issue` hace `Base::mint_with_id(admin, id)` con id = id de la pieza, y `token_uri(id)` = `base_uri + id`. wasm release: 18 KB.
10 tests (`scripts/contract-test.sh`) cubren todo lo que pide el spec, incluido un test de auth sin `mock_all_auths` (`mock_auths` por función/args, firma de otra cuenta rechazada). Detalles: `issue` emite también el evento `mint` de OZ antes de `piece_issued`; el NFT es transferible por la interfaz OZ (el certificado no depende del dueño); las entradas de OZ (dueño/balance) tienen TTL de 30 días, las nuestras 120.
