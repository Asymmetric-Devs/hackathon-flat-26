# Auditoría de seguridad de Muro

Revisión independiente (un agente distinto del que escribió el código, sobre una copia aislada del repo) del contrato Soroban y de la web. Se verificó contra el código, no contra la documentación, y los hallazgos graves se reprodujeron con tests. Todo lo que se corrigió tiene test de regresión (`cargo test`: 38 pruebas).

## Resumen

| # | Severidad | Hallazgo | Estado |
|---|---|---|---|
| H1 | **Alta** (confirmada) | Redondeo en `settle`: `from` avanzaba con piso, y con `rate` en stroops mayor que la duración del día el avance era 0. Cada `claim` repetido en el mismo instante cobraba de nuevo, así que cualquiera podía vaciar el prepago y forzar una compra anticipada. | **Corregido**: el avance redondea hacia arriba y se acota por el tiempo transcurrido. Tests `repeated_claim_in_same_second_pays_once` y `repeated_claim_real_day_length_never_overcharges` (3.600 claims duplicados en la instancia de 24 h: el artista pierde menos de 1 stroop por claim, nunca se cobra de más). |
| M3 | Media | El TTL de la instancia y de las entradas de una obra solo se extendía en `publish`. Pasados ~60 días sin publicar, el contrato quedaba archivado. | **Corregido**: todas las operaciones que cambian estado extienden el TTL (`touch`). |
| M4 | Media | Con depósito 0, cualquiera podía colgar una obra y devolverla de inmediato para dejarla en `Returning`. | **Corregido en parte**: el depósito ahora es obligatorio (> 0). El artista igual debe confirmar la devolución; cuesta una transacción. |
| L1 | Baja | El historial por obra era un `Vec` sin límite que se reescribía entero. | **Corregido**: se guardan las últimas 100 exposiciones. |
| L3 | Baja | Posible overflow con montos absurdos en `due * day_secs`. | **Corregido**: tope de 1e18 stroops en precio, tarifa y depósito. Test de montos enormes. |
| L5 | Baja (funcional) | `meta` limitado a 64 bytes: publicar una obra propia fallaba siempre. | **Corregido**: límite 512 bytes, la web valida el tamaño y traduce el error. |
| L6 | Baja | La clave del modo invitado vive en `localStorage` y firma sola. | **Corregido**: `guestSigner` se niega a funcionar si la red no es Testnet. Sigue siendo solo para pruebas. |
| L7 | Baja | `img` y `ratio` del JSON de la cadena se usaban sin validar (rastreo por imágenes de terceros, layout roto). | **Corregido**: solo `https://`, longitud acotada, `ratio` limitado a 0,2–5 y textos recortados. |
| L8 | Baja | `toStroops` con floats: NaN, infinitos y montos que pierden precisión llegaban crudos a la UI. | **Corregido**: se rechazan montos no finitos, negativos o mayores a 900 M XLM. |
| Info | — | Gracia 0 permitiría `seize` inmediato. | **Corregido**: el constructor exige `grace_days >= 1`. |
| Info | — | Sin cabeceras de seguridad. | **Corregido**: `web/public/_headers` y `web/vercel.json` con CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP y `frame-ancestors 'none'`. |
| Info | — | Dependencias. | `npm audit`: 0 vulnerabilidades. `package-lock.json` versionado. |

## Riesgos conocidos que NO se corrigieron (y por qué)

- **M1. Pagos al artista dentro de `stop` y `buy_now`.** Si la cuenta del artista no puede recibir el activo (por ejemplo, sin trustline con USDC), esas llamadas revierten y el prepago del espacio queda retenido hasta que el artista lo arregle. Con XLM nativo (testnet) no pasa. Antes de pasar a USDC en producción conviene un patrón "pull" (el contrato acredita y el artista retira).
- **M2. Confirmación de devolución en manos del artista.** El contrato no puede saber si la obra física volvió: depende de que el artista confirme. Un artista deshonesto podría quedarse con un depósito aunque la obra haya vuelto. Es inherente a no tener un oráculo; se mitiga con el plazo de gracia, con el currículum público (reputación) y se podría sumar un árbitro opcional.
- **L2. `top_up` después de agotado el prepago** cobra el tiempo vencido de forma retroactiva. Es consistente con el modelo, pero puede sorprender: una recarga chica se consume en la deuda.
- **L4. Auto-colgado (wash trading).** El artista puede colgar su propia obra para fabricar historial. Un currículum de exposiciones propias no es prueba de reputación ante sybils; haría falta verificación de espacios.
- **Modo invitado.** La clave se guarda en el navegador sin cifrar. Es aceptable solo en Testnet.
- **CSP con `img-src https:`.** Las imágenes de obras propias son cualquier URL https; se acepta el riesgo de rastreo a cambio de poder mostrarlas.

## Lo que se revisó y estaba bien

Autorización (`require_auth` de la parte correcta en cada función; `claim` es permisiva a propósito y es segura una vez corregido H1), montos cero o negativos, orden efectos–interacciones, máquina de estados (sin doble alquiler, `Sold` y `Lost` terminales), la invariante de custodia (el contrato retiene exactamente depósito + prepago), QR por `dangerouslySetInnerHTML` (SVG generado sin datos reflejados), `rel="noreferrer"` en enlaces externos, passphrase de red fija y verificada contra Freighter, y que lo firmado es lo construido (`prepareTransaction`).

## Contratos desplegados tras la auditoría

Los de antes de la corrección quedaron huérfanos en Testnet y no se usan. Las direcciones vigentes están en `web/src/deployed.json` y en la página *Evidencia*.
