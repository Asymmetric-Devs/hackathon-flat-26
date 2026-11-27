# Evidencia en testnet

Flujo real ejecutado con `scripts/seed-testnet.sh` sobre la instancia **demo** (1 día = 60 s, gracia 1 día).

- Contrato demo: [`CDVMEHWUVQBHUXRPXUD2FWYKCUDLMTJP46RQJCKTHMJY44FB5TQ3NHXP`](https://stellar.expert/explorer/testnet/contract/CDVMEHWUVQBHUXRPXUD2FWYKCUDLMTJP46RQJCKTHMJY44FB5TQ3NHXP)
- Token (XLM nativo, SAC): [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
- Artista: [`GAU7EXXUL3EZZZHT5W3SUCOB2MEV5ENPGYB6TOKC5CUI6UTYPQVSLRCC`](https://stellar.expert/explorer/testnet/account/GAU7EXXUL3EZZZHT5W3SUCOB2MEV5ENPGYB6TOKC5CUI6UTYPQVSLRCC)
- Venue: [`GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ`](https://stellar.expert/explorer/testnet/account/GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ)
- Visitante (propina / claim): [`GB7GCTDJ3WSF7J4WYVSZBBLGREA5VGTAUIHGVHS2KQ7S7W2W3PUGVMTC`](https://stellar.expert/explorer/testnet/account/GB7GCTDJ3WSF7J4WYVSZBBLGREA5VGTAUIHGVHS2KQ7S7W2W3PUGVMTC)

| Paso | Qué ocurre | Tx |
|---|---|---|
| publish | `manet-bar` -> obra #0 (precio 300 XLM, 3 XLM/día, depósito 40 XLM) | [`85b7fdd1…`](https://stellar.expert/explorer/testnet/tx/85b7fdd1ef4ff5fcc2f1be0396ea5a14388f1e2ecd8cc8249dd41ce8e496b5ee) |
| publish | `candido-curupayti` -> obra #1 (precio 150 XLM, 2 XLM/día, depósito 20 XLM) | [`5fb18e81…`](https://stellar.expert/explorer/testnet/tx/5fb18e811f9cdc0b6f39509b9a38bf197baff7250d0c889f83535db0098d923c) |
| publish | `fader-mantones` -> obra #2 (precio 200 XLM, 2 XLM/día, depósito 30 XLM) | [`568daf69…`](https://stellar.expert/explorer/testnet/tx/568daf69e3730d7c20f06e9fe8b4fd5dd9af8b39de910330b0cdd4ee12ab33dc) |
| publish | `pueyrredon-alto` -> obra #3 (precio 400 XLM, 4 XLM/día, depósito 60 XLM) | [`c7d47c32…`](https://stellar.expert/explorer/testnet/tx/c7d47c32a5c539c1440875431f1f229ef373407bffec34bca51b7e29da1a6101) |
| publish | `afklint-retablo` -> obra #4 (precio 250 XLM, 3 XLM/día, depósito 40 XLM) | [`a6742b10…`](https://stellar.expert/explorer/testnet/tx/a6742b100ff1f9b8a9ff15990ded6ddc32795c3c9ddfc57b7a0426bfd8b921eb) |
| publish | `vangogh-terraza` -> obra #5 (precio 100 XLM, 1 XLM/día, depósito 25 XLM) | [`76ee5dbd…`](https://stellar.expert/explorer/testnet/tx/76ee5dbdee7da06422d3712333a31bcce8f4f2dee3ae825cd60129b41a2bf56b) |
| hang | muro-venue cuelga `manet-bar` por 30 días (depósito 40 XLM + 90 XLM prepago) | [`710f9225…`](https://stellar.expert/explorer/testnet/tx/710f9225520e9b850cb2a06fffa3d295f7bb77f78110a991327cc73c8608f5bc) |
| hang | muro-venue cuelga `candido-curupayti` por 3 días (depósito 20 XLM + 6 XLM) | [`3b10d1a3…`](https://stellar.expert/explorer/testnet/tx/3b10d1a319c0ed9fb341f97472e4b64dbd293bd93a690f43f3eab0ab66f3e529) |
| stop | muro-venue devuelve `candido-curupayti` (liquida lo devengado, reembolsa prepago, retiene depósito) | [`f5b6619a…`](https://stellar.expert/explorer/testnet/tx/f5b6619a07c63e6bd51e48b2dc3e5dc0cfdb0ecafeea96a78b884be3c0bcd28e) |
| confirm_return | muro-artist confirma la devolución (depósito 20 XLM vuelve al venue; queda en el historial) | [`b235312a…`](https://stellar.expert/explorer/testnet/tx/b235312a9ed72350cbbcaae77eed22ab44223394e8bba4099552060672038bdb) |
| claim | muro-guest (cualquiera) ejecuta `claim` sobre `manet-bar`: devengado previo 65000000 stroops, pagado al artista 70000000 stroops | [`7711e6b7…`](https://stellar.expert/explorer/testnet/tx/7711e6b7d2ba23792099637a44b11d8b5f452c15b6b2d368b2ca7d0d6c0f044b) |
| tip | muro-guest da propina de 5 XLM al artista por `manet-bar` | [`efa2c8ed…`](https://stellar.expert/explorer/testnet/tx/efa2c8edf3f33bf239dbc8247ab57bc64593a158b476258c5fdcabc83504217b) |

## Estado final

- `manet-bar` (obra #0): **Hung** en vivo. Devengado al momento del claim: 65000000 stroops.
- `candido-curupayti` (obra #1): **Available**, con un registro `Returned` en el historial.
- Resto de las obras: **Available**.

Lease actual de `manet-bar`:

```json
{"deposit":"400000000","ended_at":0,"from":1795760044,"paid":"70000000","prepaid":"830000000","start":1795759904,"venue":"GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ"}
```

Historial de `candido-curupayti`:

```json
[{"end":1795759944,"outcome":"Returned","paid":"11666666","start":1795759909,"venue":"GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ"}]
```
