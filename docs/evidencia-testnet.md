# Evidencia en testnet

Flujo real ejecutado con `scripts/seed-testnet.sh` sobre la instancia **demo** (1 día = 60 s, gracia 1 día).

- Contrato demo: [`CCMC4ZLYQQ5F6VLOELFJABAW3O4GEGT4M62J3XIJJ2BLO4BA7GM2S6XS`](https://stellar.expert/explorer/testnet/contract/CCMC4ZLYQQ5F6VLOELFJABAW3O4GEGT4M62J3XIJJ2BLO4BA7GM2S6XS)
- Token (XLM nativo, SAC): [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
- Artista: [`GAU7EXXUL3EZZZHT5W3SUCOB2MEV5ENPGYB6TOKC5CUI6UTYPQVSLRCC`](https://stellar.expert/explorer/testnet/account/GAU7EXXUL3EZZZHT5W3SUCOB2MEV5ENPGYB6TOKC5CUI6UTYPQVSLRCC)
- Venue: [`GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ`](https://stellar.expert/explorer/testnet/account/GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ)
- Visitante (propina / claim): [`GB7GCTDJ3WSF7J4WYVSZBBLGREA5VGTAUIHGVHS2KQ7S7W2W3PUGVMTC`](https://stellar.expert/explorer/testnet/account/GB7GCTDJ3WSF7J4WYVSZBBLGREA5VGTAUIHGVHS2KQ7S7W2W3PUGVMTC)

| Paso | Qué ocurre | Tx |
|---|---|---|
| publish | `manet-bar` -> obra #0 (precio 300 XLM, 3 XLM/día, depósito 40 XLM) | [`7257cedd…`](https://stellar.expert/explorer/testnet/tx/7257cedd5c78b0488c5ef9b0d51bb03b02ae45cdac20cf341989aca6bdc89289) |
| publish | `candido-curupayti` -> obra #1 (precio 150 XLM, 2 XLM/día, depósito 20 XLM) | [`a16622b1…`](https://stellar.expert/explorer/testnet/tx/a16622b18d69dda12c3c315e9c57de082c71f14555efc6b0134bfaf7f042d9c6) |
| publish | `fader-mantones` -> obra #2 (precio 200 XLM, 2 XLM/día, depósito 30 XLM) | [`e1849fd0…`](https://stellar.expert/explorer/testnet/tx/e1849fd058a9c1e79be060116be96a4356baa512d2da711ae4199d58dcad4ef5) |
| publish | `pueyrredon-alto` -> obra #3 (precio 400 XLM, 4 XLM/día, depósito 60 XLM) | [`580f416f…`](https://stellar.expert/explorer/testnet/tx/580f416fab3b99fca81366ce47e3b9610709bd8a7c2e2bcb23c6745e395e1f4b) |
| publish | `afklint-retablo` -> obra #4 (precio 250 XLM, 3 XLM/día, depósito 40 XLM) | [`a9c32b71…`](https://stellar.expert/explorer/testnet/tx/a9c32b717acd51d29e129e1f98518307d288afa4e71a4e255fb0325588fb09bd) |
| publish | `vangogh-terraza` -> obra #5 (precio 100 XLM, 1 XLM/día, depósito 25 XLM) | [`5c179ef1…`](https://stellar.expert/explorer/testnet/tx/5c179ef17b7ade3fabb0925be38a12edb70bf12d965d7d5b6a6ea01a6ed3d62e) |
| hang | muro-venue cuelga `manet-bar` por 30 días (depósito 40 XLM + 90 XLM prepago) | [`8e816acf…`](https://stellar.expert/explorer/testnet/tx/8e816acf95dbf82716fcd45f985998027d6999dd4ff3001e5db767d8b0589a27) |
| hang | muro-venue cuelga `candido-curupayti` por 3 días (depósito 20 XLM + 6 XLM) | [`58299c7d…`](https://stellar.expert/explorer/testnet/tx/58299c7d8d6118bccc5c10dd044b66e60255db5bbecbc980a4cdb880cadc70d7) |
| stop | muro-venue devuelve `candido-curupayti` (liquida lo devengado, reembolsa prepago, retiene depósito) | [`880185b6…`](https://stellar.expert/explorer/testnet/tx/880185b680c342c32b501ff064b62bf2794ffb5da5f78c323245871621e9c0af) |
| confirm_return | muro-artist confirma la devolución (depósito 20 XLM vuelve al venue; queda en el historial) | [`1d9f046c…`](https://stellar.expert/explorer/testnet/tx/1d9f046c95a76c492766efb7aab471b0c4bb8bd68a95c48eedcea901754f1f0b) |
| claim | muro-guest (cualquiera) ejecuta `claim` sobre `manet-bar`: devengado previo 65000000 stroops, pagado al artista 67500000 stroops | [`a2d38c9a…`](https://stellar.expert/explorer/testnet/tx/a2d38c9a36dfeadae13d3d15bfda98760be4de7102596cfe316fe0e2f8ac7470) |
| tip | muro-guest da propina de 5 XLM al artista por `manet-bar` | [`42edee1a…`](https://stellar.expert/explorer/testnet/tx/42edee1a09d0d523a956e29a46a707fb329ace36612f97e230d5f7e51c7cb699) |

## Estado final

- `manet-bar` (obra #0): **Hung** en vivo. Devengado al momento del claim: 65000000 stroops.
- `candido-curupayti` (obra #1): **Available**, con un registro `Returned` en el historial.
- Resto de las obras: **Available**.

Lease actual de `manet-bar`:

```json
{"deposit":"400000000","ended_at":0,"from":1795755794,"paid":"67500000","prepaid":"832500000","start":1795755659,"venue":"GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ"}
```

Historial de `candido-curupayti`:

```json
[{"end":1795755699,"outcome":"Returned","paid":"11666666","start":1795755664,"venue":"GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ"}]
```
