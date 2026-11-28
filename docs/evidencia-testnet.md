# Evidencia en testnet

Flujo real ejecutado con `scripts/seed-testnet.sh` sobre la instancia **demo** (1 día = 60 s, gracia 1 día).

- Contrato demo: [`CD725Z7JTP3BP3SR455WKYJS3AQHHVU7HZALNQBESQ2YGMRYCORN3T2Y`](https://stellar.expert/explorer/testnet/contract/CD725Z7JTP3BP3SR455WKYJS3AQHHVU7HZALNQBESQ2YGMRYCORN3T2Y)
- Token (XLM nativo, SAC): [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
- Artista: [`GAU7EXXUL3EZZZHT5W3SUCOB2MEV5ENPGYB6TOKC5CUI6UTYPQVSLRCC`](https://stellar.expert/explorer/testnet/account/GAU7EXXUL3EZZZHT5W3SUCOB2MEV5ENPGYB6TOKC5CUI6UTYPQVSLRCC)
- Venue: [`GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ`](https://stellar.expert/explorer/testnet/account/GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ)
- Visitante (propina / claim): [`GB7GCTDJ3WSF7J4WYVSZBBLGREA5VGTAUIHGVHS2KQ7S7W2W3PUGVMTC`](https://stellar.expert/explorer/testnet/account/GB7GCTDJ3WSF7J4WYVSZBBLGREA5VGTAUIHGVHS2KQ7S7W2W3PUGVMTC)

| Paso | Qué ocurre | Tx |
|---|---|---|
| publish | `manet-bar` -> obra #0 (precio 300 XLM, 3 XLM/día, depósito 40 XLM) | [`5ceaac97…`](https://stellar.expert/explorer/testnet/tx/5ceaac971e65d3c951b8fd75bd7ca0956646fec00d2120cbf8717fe5e110a15f) |
| publish | `candido-curupayti` -> obra #1 (precio 150 XLM, 2 XLM/día, depósito 20 XLM) | [`36c88f26…`](https://stellar.expert/explorer/testnet/tx/36c88f2647d9dce594cc8ded38528fc6181ba9e43265c8a67d1c5afb925dd70f) |
| publish | `fader-mantones` -> obra #2 (precio 200 XLM, 2 XLM/día, depósito 30 XLM) | [`7f3c8f5b…`](https://stellar.expert/explorer/testnet/tx/7f3c8f5b2540fe467c00b7036aaae876b518e7884e878bc7ba30a8b772dd62aa) |
| publish | `pueyrredon-alto` -> obra #3 (precio 400 XLM, 4 XLM/día, depósito 60 XLM) | [`40723c7b…`](https://stellar.expert/explorer/testnet/tx/40723c7b4b2b04e2afbba7bca84f37618b757606be1380fc8187d597e9dccaec) |
| publish | `afklint-retablo` -> obra #4 (precio 250 XLM, 3 XLM/día, depósito 40 XLM) | [`0db88642…`](https://stellar.expert/explorer/testnet/tx/0db8864277b2ac43b3462238e4d8ff329440593ccfd9832ca6ef8e70c8309f1d) |
| publish | `vangogh-terraza` -> obra #5 (precio 100 XLM, 1 XLM/día, depósito 25 XLM) | [`b7b42e7c…`](https://stellar.expert/explorer/testnet/tx/b7b42e7c474e9b23404ce0f4b975a0e7ef45baa4e8b462cd6b9ad86aed8c7a53) |
| hang | muro-venue cuelga `manet-bar` por 120 días (depósito 40 XLM + 360 XLM prepago) | [`040333bd…`](https://stellar.expert/explorer/testnet/tx/040333bd25a6ceb081c5fa258e3ded5b108c975c3fc0db4588d92a370ec52457) |
| hang | muro-venue cuelga `candido-curupayti` por 3 días (depósito 20 XLM + 6 XLM) | [`a5cc1811…`](https://stellar.expert/explorer/testnet/tx/a5cc1811abe8ccbf72951ac9ee40ace322c0ee8c07e18c87484595e503b8225a) |
| stop | muro-venue devuelve `candido-curupayti` (liquida lo devengado, reembolsa prepago, retiene depósito) | [`eae4e15c…`](https://stellar.expert/explorer/testnet/tx/eae4e15c1b1698e2993c1309d1c795d1f4827f1e705ca7e7b6a0755bb1a68709) |
| confirm_return | muro-artist confirma la devolución (depósito 20 XLM vuelve al venue; queda en el historial) | [`3f95bf73…`](https://stellar.expert/explorer/testnet/tx/3f95bf73604c145bcf466efa54ec8cccbad66402c195baa6a42e11c54f4449a3) |
| claim | muro-guest (cualquiera) ejecuta `claim` sobre `manet-bar`: devengado previo 65000000 stroops, pagado al artista 67500000 stroops | [`43b4375a…`](https://stellar.expert/explorer/testnet/tx/43b4375a0983bc13c493e04b61a4c6031be0e8017a0c6355de6b6da241b9329f) |
| tip | muro-guest da propina de 5 XLM al artista por `manet-bar` | [`67e12f32…`](https://stellar.expert/explorer/testnet/tx/67e12f32a96d7458f1d1c9ae45507639f8bfc528c7e3cf8f984556d7c4e67232) |

## Estado final

- `manet-bar` (obra #0): **Hung** en vivo. Devengado al momento del claim: 65000000 stroops.
- `candido-curupayti` (obra #1): **Available**, con un registro `Returned` en el historial.
- Resto de las obras: **Available**.

Lease actual de `manet-bar`:

```json
{"deposit":"400000000","ended_at":0,"from":1795840849,"paid":"67500000","prepaid":"3532500000","start":1795840714,"venue":"GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ"}
```

Historial de `candido-curupayti`:

```json
[{"end":1795840754,"outcome":"Returned","paid":"11666666","start":1795840719,"venue":"GAZME3P5EJFINGNJB6MSU4VD7VFKGUFJSBGMPNG5YNNRFNA53LPTRSMJ"}]
```
