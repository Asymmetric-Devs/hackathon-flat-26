# Muro

> La obra cobra por día. Si se enamoran, es suya.

Muro le paga un alquiler diario a una obra mientras cuelga de la pared de un bar, una bodega o un hotel. Cada día pagado cuenta como cuota de su precio. Cuando la suma llega al precio, la obra pasa a ser del espacio. Cada pago queda como una exposición pública que nadie puede editar.

**Eje:** Arte (con Territorio: artistas de Mendoza y el NEA y los lugares que cuelgan su obra).

## El problema (y qué validamos)

Pinturas, fotos y grabados decoran bares, cafés, bodegas y hoteles de todo el país. La hipótesis de partida es que esa obra suele colgar sin precio, sin contrato claro y sin registro de dónde estuvo.

> **Validación con artista ([ver entrevista completa](validacion-laura-zapata.md)).** Hablamos con **Laura Zapata**, artista visual con taller propio en Resistencia (Chaco). Confirmó que en los talleres hay obra terminada guardada que no sale por falta de circuito claro, consideró justo que cada día pagado descuente del precio de venta (incluso como forma de pago en cuotas para el espacio) y señaló una condición clave: debe quedar explícito que el local elige la obra porque le gusta y que alquilar no lo obliga a comprarla. Queda pendiente contrastar la disposición de pago diario con dueños de bares, bodegas u hoteles.

## Cómo funciona

1. **El artista publica** la obra con tres números: precio de venta, alquiler por día y depósito que debe dejar el espacio.
2. **Un espacio la cuelga:** deja el depósito en garantía y paga unos días por adelantado. El contrato los retiene.
3. **Cada día es una cuota:** el alquiler se devenga con el reloj. Cualquiera puede ejecutar el cobro y el dinero siempre va al artista. Lo cobrado se descuenta del precio.
4. **Se queda o vuelve:**
   - Si el total cobrado llega al precio (o el espacio paga la diferencia con "Quedármela"), la obra es del espacio: se devuelve el depósito y queda el registro.
   - Si el espacio frena el alquiler, devuelve la obra y el artista confirma que la recibió: el depósito vuelve.
   - Si no la devuelve o el prepago se agota y pasa el plazo de gracia, el depósito pasa al artista.

Además: una landing con intro animada (la palabra MURO se pinta con pincel, letra por letra, en el estilo rugoso del fondo (un único trazado vectorial fijo, idéntico en cualquier tamaño), chorrea y vuela hasta su lugar en la portada), recorrido horizontal de las obras con el scroll, scroll suave, barra que se esconde al bajar (y menú a pantalla completa en el celular), transiciones entre páginas (la obra que se toca viaja y crece hasta su ficha) y respeto por "reducir movimiento" (se desactiva la intro y las animaciones). La intro corre en cada carga de la página y se puede saltar con clic, Esc o Enter. En la ficha de cada obra hay un escenario con **lupa** que sigue al mouse y un visor **Explorar** a pantalla completa (zoom con la rueda o pellizco, arrastrar, doble clic). **Cartela con QR** junto a la obra (muestra lo cobrado en vivo y permite dejar una propina al artista sin instalar nada) y **currículum público** de exposiciones por obra.

## Por qué blockchain

- **El historial no se puede editar ni borrar** (ni por el artista, ni por el espacio, ni por nosotros). Cada exposición costó dinero real.
- **El dinero retenido tiene reglas públicas:** depósito, prepago y compra automática no dependen de la buena fe de nadie ni de una plataforma que lo custodie.
- **Costo:** Stellar cobra una fracción de centavo por transacción, lo que permite liquidar por día. Con tarjeta o transferencia bancaria sería inviable.
- **Qué NO va en la cadena:** las imágenes y el texto de las obras. En la cadena solo van montos, estados y un identificador (`meta`).

## Stellar: qué usamos

- **Soroban** (contrato en Rust, `soroban-sdk 29`): `contracts/muro`. 41 pruebas y una auditoría independiente ([`AUDITORIA.md`](AUDITORIA.md)).
- **SAC / SEP-41:** el activo de pago. En testnet es XLM nativo; en producción sería USDC.
- **Freighter** (wallet existente) y un **modo invitado** solo para Testnet (cuenta creada en el navegador y fondeada con Friendbot) para que cualquier persona pruebe sin instalar nada.
- **Stellar Expert** como explorador.

### Por qué no Trustless Work

Trustless Work libera por hitos y cobra 0,3 % por transacción. Muro necesita un pago continuo (devengado por tiempo) que se acredita hacia una compra, con un depósito atado al mismo estado. Un 0,3 % sobre liquidaciones diarias rompe el modelo, y los hitos discretos no representan un alquiler por día.

### Consulta a Stellar Raven

El **28 de noviembre de 2026** consultamos [Stellar Raven Playground](https://raven.stellar.org/playground) para contrastar Muro contra proyectos existentes en el ecosistema (incluyendo proyectos financiados por el Stellar Community Fund) y componentes reutilizables.

> Muro combina alquiler diario acreditable a compra, garantía y registro de exposiciones para arte físico en espacios comerciales. Existen antecedentes en propiedad condicional de NFT, tokenización de arte y streaming de pagos; no identificamos ninguno que combine estas funciones del mismo modo.

**Antecedentes contrastados en Stellar:**

| Proyecto | Qué hace | Diferencia con Muro |
|---|---|---|
| [Plutus](https://communityfund.stellar.org/project/plutus-kmw) | **SCF** (marcado inactivo). Propiedad condicional de NFT (alquiler, hipoteca y préstamo). | No cubre obra física, exposiciones en espacios ni alquiler diario acreditable al precio de compra. |
| [Neftwerk](https://stellarlight.xyz/project/neftwerk) | Transacciones de arte contemporáneo y tokenización con MyPocket Gallery. | No implementa alquiler con opción a compra ni currículum on-chain de exposiciones. |
| [Kunst21](https://communityfund.stellar.org/project/kunst21com-ray) | **SCF** (marcado inactivo). Crowdinvesting en arte y objetos de colección. | Es inversión colectiva, no alquiler diario en comercios. |
| [ART Club](https://communityfund.stellar.org/project/art-club-ia2) | **SCF**. Conecta creadores con financiadores. | Financiación de creadores, sin mecanismo rent-to-own en espacios físicos. |

**Componentes evaluados y decisiones técnicas:**

- **Streaming de pagos (`SStream`, `Zentra` — SCF):** repositorios con últimos commits en 2024; resuelven flujos temporales continuos pero no depósito en garantía, crédito acumulado hacia compra ni transferencia de estado.
- **Escrow (`Mica` — SCF inmobiliario; `Trustless Work`):** referencias útiles para garantías y disputas, pero no cubren devengado diario acoplado a compra automática (y en Trustless Work el esquema por hitos y la comisión del 0,3 % por transacción no encajan con liquidaciones diarias).
- **NFT y royalties (`Litemint`, `OpenZeppelin Contracts for Stellar`):** siguiendo la advertencia de Raven, no se añadió un NFT en el MVP porque un token no prueba autenticidad, entrega física ni transferencia legal; mantenemos SAC/SEP-41 y registro económico verificable.
- **UX e indexación hacia producción:** Passkeys (`JS-Capacitor Passkey Kit` / `Soropass`) como evolución frente a Freighter y el modo invitado de testnet; `StreamingFast` (Firehose/Substreams) para indexar el historial completo más allá de las 100 exposiciones almacenadas on-chain.
- **Controles pre-mainnet:** los puntos críticos señalados por Raven (redondeo y límites del devengo, prepago agotado, TTL, autorización y revisión independiente) ya cuentan con mitigaciones y tests de regresión documentados en [`AUDITORIA.md`](AUDITORIA.md) (41 pruebas).

## Modelo de negocio

Hoy el contrato **no cobra comisión**. Líneas posibles para una versión real: una comisión chica (por ejemplo 1–2 %) sobre las compras que se completan; servicios para espacios (impresión de cartelas, seguro de la obra) y una galería curada para artistas verificados.

## Arquitectura

```
contracts/muro        Soroban: publish, hang, top_up, claim, buy_now, stop, confirm_return, seize, tip
scripts/              deploy-testnet.sh, seed-testnet.sh, refresh-demo.sh
web/                  Vite + React + TypeScript, lee el contrato por Soroban RPC
docs/                 especificación del contrato, evidencia en testnet, este documento
```

Dos instancias desplegadas en Testnet (ver `web/src/deployed.json` y la página *Evidencia* de la web):

- **demo:** 1 "día" dura 60 segundos para que el contador se vea correr en vivo (la web lo aclara en la ficha de cada obra colgada).
- **real:** 1 día dura 24 horas.

## Cómo correrlo

```bash
# contrato
cargo test                      # 41 pruebas
stellar contract build

# web
cd web && npm install && npm run dev      # http://localhost:5173
npm run build                              # sitio estático en web/dist

# testnet
scripts/deploy-testnet.sh       # despliega las dos instancias y escribe web/src/deployed.json
scripts/seed-testnet.sh         # publica obras de ejemplo y corre un flujo real
scripts/refresh-demo.sh 0 100   # recarga el prepago de la obra #0 (100 días = ~100 min de demo)
scripts/reset-demo.sh           # reinicia toda la demo (despliega, siembra y regenera la evidencia)
```

**Antes de presentar:** con 1 día = 1 minuto, la obra colgada llega al 100 % del precio en ~100 minutos y se vende sola. Correr `scripts/reset-demo.sh` (~5 min) justo antes para tener la demo fresca. No conviene recargar con `top_up` una obra cuyo prepago ya venció: el contrato cobra de golpe todo el tiempo vencido y la obra se vende.

La paleta base es un dorado suave (`#e8d282`) sobre un lienzo de papel claro, con el negro como tinta. Se puede probar otra con `?acento=acuarela|ultramar|bermellon|tinta-roja|amarillo|viridian|naranja` en la URL; se recuerda en el navegador.

## Validación con alguien de afuera

Registro de entrevistas y pruebas con personas ajenas al equipo (criterio 3 — 25 %):

| Quién | Qué dijo | Qué aprendimos / cambiamos |
|---|---|---|
| **Laura Zapata** · artista visual con taller propio (Resistencia, Chaco) — [entrevista y audio](validacion-laura-zapata.md) | Confirmó que los artistas suelen tener mucha obra guardada sin circuito para mostrarla; vio justo el alquiler acreditable a compra e incluso útil como financiamiento en cuotas para el local; pidió que quede claro que al bar o bodega le gusta la obra y no la cuelga solo "por hacer un favor". | Validado el dolor del taller y el modelo rent-to-own. Dejamos explícito que colgar es una elección curatorial del espacio y que devolverla (`stop`) recupera el depósito sin conflicto. Siguiente paso: entrevistar a un dueño de bar/bodega y probar el escaneo de cartela en vivo. |

Preguntas para completar la validación del lado del espacio y prueba física:

1. A un dueño de bar, bodega o café: *¿Cuelgan obra? ¿Cómo lo arreglan con el artista? ¿Pagarían un alquiler diario chico con opción a quedársela?*
2. Prueba de uso presencial: que una persona externa escanee la cartela, deje una propina y diga qué entendió.

## Guion del video (2 a 3 minutos)

1. **0:00** Pared de un bar. *"Esta obra lleva un mes colgada acá. ¿Cuánto cobró?"* (silencio). *"Nada."* (solo si la validación lo confirma).
2. **0:20** La web: *"En Muro la obra cobra por día."* Mostrar la landing y el contador en vivo.
3. **0:45** El artista publica una obra: tres números.
4. **1:10** El espacio la cuelga: depósito + prepago. Mostrar la transacción en Stellar Expert.
5. **1:35** El contador corre. *"Cada día es una cuota del precio."* Mostrar el simulador.
6. **2:00** Escanear la cartela con el celular y dejar una propina sin instalar nada.
7. **2:20** Devolver la obra → el artista confirma → el currículum queda público.
8. **2:40** Cierre: *"La obra cobra por día. Si se enamoran, es suya."*

## Checklist de entrega en Apex

- [ ] Proyecto creado en https://stellarapex.org y **publicado en "FLAT Stellar 2026"** (y en público)
- [x] Repositorio con este README y el [README raíz](../README.md) actualizado
- [ ] Video público de 2 a 3 minutos
- [x] Al menos un hash en testnet verificable en Stellar Expert (ver [`docs/evidencia-testnet.md`](evidencia-testnet.md))
- [x] Validación completada en la tabla de arriba (ver [`validacion-laura-zapata.md`](validacion-laura-zapata.md))
- [x] Consultar Raven: ¿ya existe algo parecido en Stellar? (documentado en la sección [Consulta a Stellar Raven](#consulta-a-stellar-raven))

## Limitaciones honestas

- La obra física no se puede controlar desde la cadena: el contrato retiene dinero, no objetos. La garantía es económica (depósito) y reputacional (currículum público).
- La entrevista con [Laura Zapata](validacion-laura-zapata.md) validó el lado del artista; queda pendiente contrastar la disposición de pago diario con dueños de bares, bodegas u hoteles.
- Obras de ejemplo: son de dominio público (fuente: Wikimedia Commons). Los epígrafes son nuestros y la fecha, técnica y colección deben contrastarse antes de usarse fuera de la demo.
- Modo invitado: existe solo para Testnet. En producción cada persona usaría su propia wallet.
- Las pruebas automáticas dejaron obras de prueba en la instancia *real*; no afectan a la instancia demo.
- Seguridad: ver [`AUDITORIA.md`](AUDITORIA.md) (un hallazgo grave encontrado y corregido; riesgos conocidos que quedan abiertos explicados ahí).
