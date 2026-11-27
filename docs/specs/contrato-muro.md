# Contrato `muro` (Soroban)

Un contrato por despliegue. Alquiler diario de obras con depósito en garantía, acreditación hacia la compra ("obra en cuotas") y currículum público de exposiciones.

## Constructor
`__constructor(token: Address, day_secs: u64, grace_days: u32)`
- `token`: SAC (SEP-41). En testnet: XLM nativo. En producción: USDC.
- `day_secs`: duración de un "día". Producción 86400. El despliegue de demo usa 60 para que el contador se vea correr en vivo (la UI lo indica).
- `grace_days`: días de gracia antes de poder ejecutar el depósito. Debe ser >= 1.

## Tipos
- `Status`: `Available | Hung | Returning | Sold | Lost`
- `Outcome`: `Returned | Bought | Seized`
- `Work { id: u32, artist: Address, owner: Address, price: i128, rate: i128, deposit: i128, meta: String, status: Status }` (`rate` = monto por día; `owner == artist` hasta la venta; `meta` es un slug que la web resuelve)
- `Lease { venue: Address, start: u64, from: u64, prepaid: i128, paid: i128, deposit: i128, ended_at: u64 }` (`from` = último instante liquidado; `paid` = alquiler ya cobrado por el artista = crédito hacia la compra; `ended_at` = 0 si sigue activo)
- `Record { venue: Address, start: u64, end: u64, paid: i128, outcome: Outcome }`

## Funciones
| Función | Auth | Efecto |
|---|---|---|
| `publish(artist, price, rate, deposit, meta) -> u32` | artist | Crea la obra (`Available`). Valida `price>0`, `rate>0`, `deposit>0` (obligatorio), cada monto <= 1e18 stroops y `meta` de 1 a 512 bytes. |
| `hang(venue, work_id, days: u32)` | venue | Solo `Available`. Transfiere `deposit + rate*days` del venue al contrato. Crea el lease, `Hung`. `days>=1`. |
| `top_up(venue, work_id, days: u32)` | venue del lease | Suma `rate*days` a `prepaid`. Solo `Hung`. |
| `accrued(work_id) -> i128` | vista | `min(floor((now-from)*rate/day_secs), prepaid, price-paid)`; 0 si no está `Hung`. |
| `claim(work_id) -> i128` | nadie (cualquiera puede llamarla) | Paga `accrued` al artista, baja `prepaid`, sube `paid`, avanza `from`. Si `paid == price` completa la venta (ver `sold`). |
| `buy_now(venue, work_id)` | venue del lease | Liquida lo devengado, cobra `price - paid` al venue, completa la venta. |
| `stop(venue, work_id)` | venue del lease | Liquida lo devengado al artista, devuelve el `prepaid` sobrante al venue, estado `Returning`, `ended_at = now`. El depósito queda retenido. |
| `confirm_return(artist, work_id)` | artist | Solo `Returning`. Devuelve el depósito al venue, agrega `Record(Returned)`, vuelve a `Available`. |
| `seize(artist, work_id)` | artist | Permitido si (`Hung` y `prepaid` agotado y `now >= runout + grace`) o (`Returning` y `now >= ended_at + grace`). El depósito pasa al artista, `Record(Seized)`, estado `Lost`. `runout = from + prepaid*day_secs/rate`. |
| `tip(from, work_id, amount)` | from | Transfiere `amount` de `from` al artista (cualquier estado menos inexistente). Suma a `tips(work_id)`. |
| `work(id) -> Work`, `lease(id) -> Option<Lease>`, `history(id) -> Vec<Record>`, `count() -> u32`, `tips(id) -> i128`, `config() -> (Address, u64, u32)` | vistas | |

### Venta (`sold`)
Se dispara desde `claim` o `buy_now`. `owner = venue`, estado `Sold`, devuelve al venue el depósito y el `prepaid` sobrante, `Record(Bought)` con `paid = price`, borra el lease.

## Eventos
`published`, `hung`, `claimed`, `sold`, `stopped`, `returned`, `seized`, `tipped`. Cada uno con `work_id` como topic y los montos relevantes como data.

## Reglas
- Una obra tiene como máximo un lease activo.
- Redondeo: pagos hacia abajo; `from` avanza `paid_now * day_secs / rate` (nunca se cobra de más).
- Errores con `#[contracterror]` (`NotFound`, `BadState`, `BadAmount`, `Early`, `Unauthorized`, ...).
- Storage persistente por obra (`Work`, `Lease`, `History`, `Tips`) con extensión de TTL en cada escritura; config en instance.
- Toda transferencia usa el cliente `token::Client`. `require_auth()` en cada función con auth.
- Sin admin, sin upgrade, sin comisión de plataforma.

## Por qué no Trustless Work
Trustless Work libera por hitos y cobra 0,3 % por transacción. Acá el pago es continuo (devengado por tiempo) y se acredita hacia una compra, con depósito atado a ese mismo estado. Un cobro del 0,3 % sobre micro-liquidaciones diarias rompe el modelo. Se usan igualmente componentes existentes: SEP-41/SAC para el activo, Freighter / Stellar Wallets Kit para firmar, Stellar Expert como explorador.

## Cambios tras la auditoría (ver `docs/AUDITORIA.md`)
- `from` avanza con **techo** (acotado por el tiempo transcurrido): evita que `claim` repetido cobre de más.
- Depósito obligatorio (> 0); montos acotados a 1e18; `meta` hasta 512 bytes; `grace_days >= 1`.
- Historial acotado a las últimas 100 exposiciones por obra.
- Todas las operaciones que cambian estado extienden el TTL de la instancia y de las entradas de la obra.
