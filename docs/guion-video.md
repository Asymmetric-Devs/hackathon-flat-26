# Guion de Video · Muro (FLAT Stellar 2026)

> **Documento de producción para agente de video IA y equipo de edición.**
> Basado en la UI viva en [`muro.asymmetric.com.ar`](https://muro.asymmetric.com.ar/), el contrato Soroban en Stellar Testnet, la entrevista de validación externa ([`validacion-laura-zapata.md`](validacion-laura-zapata.md)), el análisis en Stellar Raven ([`MURO.md`](MURO.md)), la auditoría de seguridad ([`AUDITORIA.md`](AUDITORIA.md)) y los requisitos de entrega de **Sin Coordenadas · FLAT Stellar 2026 (BAF × Stellar)**.

---

## 1. Ficha técnica y dirección creativa

| Parámetro | Especificación |
|---|---|
| **Duración objetivo** | **02:40 (160 segundos)** — margen seguro dentro del requisito oficial de 2 a 3 minutos (incluso con ±8 % de variación en locución queda entre 02:27 y 02:53). |
| **Formato de salida** | 16:9 · 1920×1080 · 60 fps (crítico para que se aprecien fluidas las animaciones GSAP, el scroll horizontal de *La pared* y la lupa sobre la pincelada). |
| **Idioma y tono de voz** | Español rioplatense (Argentina), consistente con la voz de la interfaz (*«Colgá»*, *«Pagá»*, *«Escaneá»*, *«Mové»*). Tono editorial, cercano, seguro y con pausa curatorial — **no** estilo pitch agresivo de startup ni jerga cripto vacía. |
| **Ritmo de locución** | ~145 palabras por minuto (~385 palabras totales), dejando silencios breves intencionales para que respiren la intro pintada a pincel, el impacto de los cuadros en la pared y el contador corriendo en vivo. |
| **Dirección estética** | Fiel al sistema visual de Muro (`web/src/styles.css`): **pared de calle con criterio de estudio**. Paleta crema/papel (`#f6f1e5` / `#fdfbf4`), asfalto/tinta (`#0d1024`) y dorado suave (`#e8d282`), tipografía condensada en mayúsculas (`Big Shoulders Display`), mono técnica (`Geist Mono`) y acentos gestuales (`Permanent Marker`). |
| **Música y diseño sonoro** | Base minimalista cálida (piano con fieltro o guitarra acústica limpia + pulso percusivo muy sutil que entra en el segundo `00:20` y cobra tracción en la demo técnica a partir de `01:06`). Efectos táctiles muy sobrios: trazo húmedo de pincel en la intro, leve golpe seco de papel/cinta al caer las obras, clic suave de galería al abrir la lupa y confirmación limpia al enviar la propina. |

---

## 2. Mapa de cumplimiento con las reglas de FLAT Stellar 2026

Esta tabla garantiza que el agente productor **no recorte** ninguna escena clave exigida por el jurado (charlas de Dani Henao y Darío Sánchez + checklist de Stellar Apex):

| Requisito / Criterio del jurado | Dónde aparece en el video |
|---|---|
| **Problema concreto y real** (eje Arte y Territorio: Mendoza y NEA) | `00:00 – 00:20` (Bloque 01) y `00:20 – 00:48` (Bloque 02) |
| **Validación con usuario externo al equipo** (Laura Zapata, Resistencia, Chaco) | `00:48 – 01:06` (Bloque 03) |
| **App funcionando en Stellar Testnet** (`muro.asymmetric.com.ar`) | `01:06 – 02:02` (Bloques 04 y 05) |
| **Flujo completo de valor** (`publish`, `hang`, contador vivo, `claim`, `tip` desde QR sin instalar nada, `stop` + `confirm_return`, currículum inmutable) | `01:06 – 02:02` (Bloques 04 y 05) |
| **Evidencia verificable en Stellar Expert** (contrato, hashes y eventos on-chain) | `02:02 – 02:14` (Bloque 06) |
| **Por qué blockchain y por qué Stellar** (micropagos de fracción de centavo, custodia sin intermediarios, historial inmutable, datos livianos on-chain) | `02:02 – 02:26` (Bloque 06) |
| **Componentes existentes de Stellar + justificación de por qué NO Trustless Work** | `02:14 – 02:26` (Bloque 06) |
| **Consulta a Stellar Raven + calidad de código** (41 tests, auditoría independiente, sin NFT forzado) | `02:14 – 02:26` (Bloque 06) |
| **Modelo de negocio y beneficios claros para cada actor** | `02:26 – 02:40` (Bloque 07) |
| **Video público de 2 a 3 minutos** | Total: **02:40** |

---

## 3. Preparación previa antes de capturar pantalla

Para que las capturas reflejen el estado vivo real en Testnet:

1. **Refrescar la instancia demo justo antes de grabar:** en la instancia demo `1 día = 60 segundos`, por lo que la obra `#0` completa el 100 % de su precio en ~100 minutos y se vende sola. Ejecutar `scripts/reset-demo.sh` (~5 min) antes de la sesión de grabación para tener el contador corriendo en un porcentaje visualmente atractivo (entre 10 % y 40 %).
2. **Preferencias del navegador:**
   - Ventana limpia sin barra de marcadores ni extensiones visibles (salvo el ícono de Freighter si se quiere mostrar la opción).
   - Viewport escritorio: `1920×1080` (zoom 100 %).
   - Viewport móvil para la escena de cartela QR: emulador `390×844` o grabación real de celular escaneando la cartela impresa.
   - Asegurar `prefers-reduced-motion: no-preference` para que corran la intro pincelada, el scrub de texto, el scroll horizontal y las inclinaciones 3D con el puntero.
3. **Rutas exactas a preparar:**
   - Portada (pestaña nueva para disparar la intro): `https://muro.asymmetric.com.ar/`
   - Publicar obra: `https://muro.asymmetric.com.ar/#/publicar`
   - Ficha obra colgada en vivo (*Un bar aux Folies-Bergère*, Manet): `https://muro.asymmetric.com.ar/#/obra/0`
   - Cartela móvil QR de la obra `#0`: `https://muro.asymmetric.com.ar/#/cartela/0`
   - Ficha obra con historial `Returned` (*Después de la batalla de Curupaytí*, Cándido López): `https://muro.asymmetric.com.ar/#/obra/1`
   - Página de Evidencia: `https://muro.asymmetric.com.ar/#/evidencia`
   - Contrato Demo en Stellar Expert: `https://stellar.expert/explorer/testnet/contract/CD725Z7JTP3BP3SR455WKYJS3AQHHVU7HZALNQBESQ2YGMRYCORN3T2Y`

---

## 4. Guion detallado por secciones

---

### BLOQUE 01 · Apertura: La pared que no paga
- **Tiempo:** `00:00 – 00:20`
- **Duración:** **20 segundos**
- **Qué se aborda:** Gancho emocional y planteo directo del problema en territorio real (bares, cafés, bodegas y hoteles que exhiben arte físico "por visibilidad", sin precio, sin contrato ni trazabilidad) seguido de la revelación visual de la identidad de **Muro**.

#### Qué se muestra de la app y dirección visual
- **`00:00 – 00:06` (Escena puente / gancho):** Plano breve (stock/generado en estética cálida editorial o fotografía real con grano sutil) de un cuadro colgado en la pared de un bar o una bodega iluminada de noche. Sobreimpreso minimalista en `Geist Mono`: `30 DÍAS COLGADA · $0 COBRADOS`.
- **`00:06 – 00:10` (Intro animada real de `Landing.tsx` + `Intro.tsx`):** Corte limpio a la carga real de `https://muro.asymmetric.com.ar/`. Se deja correr **sin acelerar** la coreografía original de `Intro.tsx` (3,4 s): sobre el lienzo crema con grano, la palabra **MURO** se pinta letra por letra con trazo de pincel en zigzag, la tinta chorrea hacia abajo y la palabra gigante vuela sin cortes hasta su posición en el fondo del hero.
- **`00:10 – 00:20` (Entrada elástica del Hero):** Entran en cascada las 6 obras de la portada (alternando afiche pegado con cinta adhesiva y cuadro enmarcado — Cándido López, Hilma af Klint, Manet, Van Gogh, Pueyrredón y Fader), rebotando suavemente contra la pared mientras aparecen sus cartelas, los stickers dorados (`% cobrado` / `XLM/día`) y el titular con resaltado dorado `#e8d282`: **«LA OBRA COBRA POR DÍA.»** El cursor se desliza lentamente sobre *Un bar aux Folies-Bergère* y *Curupaytí*, activando el efecto 3D de inclinación magnética y el cursor contextual `Ver obra`.

#### Diseño sonoro
- `00:00 – 00:06`: Ambiente sutil de café/bar casi imperceptible + silencio dramático antes de la respuesta *"Nada"*.
- `00:06 – 00:10`: Sonido orgánico de pincelada sobre papel rugoso; al aterrizar las obras en el hero (`00:10`), entra la base musical cálida y rítmica.

#### Sugerencia de guion para hablar (~38 palabras)
> *«Imaginá una obra colgada hace un mes en la pared de un bar o una bodega. ¿Cuánto cobró su artista?»*
> `[pausa 1.2s]`
> *«Nada. Ni un peso, ni un contrato, ni un registro de dónde estuvo.»*
> `[pausa 2.5s — corre la intro pincelada MURO y caen las obras en el hero]`
> *«Eso cambia con **Muro**: la obra cobra por día. Y si se enamoran, es suya.»*

---

### BLOQUE 02 · La idea: El arte en cuotas y cómo funciona
- **Tiempo:** `00:20 – 00:48`
- **Duración:** **28 segundos**
- **Qué se aborda:** Explicar la mecánica central de Muro (alquiler diario acreditable al precio de venta + depósito en garantía + currículum inmutable) aprovechando el nivel de creatividad interactiva y editorial de la landing page.

#### Qué se muestra de la app y dirección visual
- **`00:20 – 00:26` (Sección *La Pregunta* — fondo asfalto `#0d1024`):** Scroll suave desde el hero hacia `#pregunta`. El titular gigante **«¿CUÁNTO COBRA UNA OBRA POR COLGAR UN MES EN LA PARED DE UN BAR?»** se enciende letra por letra con el scroll (`data-scrub`), mientras a la derecha se revela como una cortina la lámina de *Terraza de café por la noche* de Van Gogh con su epígrafe de catálogo.
- **`00:26 – 00:37` (Sección *Cómo se cuelga* — `#como`):** Scroll controlado recorriendo los 4 pasos (`01` a `04`) mientras a la izquierda el cuadro de *Los mantones de Manila* (Fernando Fader) rota suavemente y su cartela viva evoluciona en tiempo real:
  - Paso 1: `Precio 220 XLM · 2 XLM por día`
  - Paso 2: `Depósito 30 XLM en garantía · 10 días prepagos`
  - Paso 3: barra dorada avanzando (`Día X · cobró Y XLM`)
  - Paso 4: `Día 110 · pagó 220 XLM · es suya`
- **`00:37 – 00:48` (Simulador *Obra en cuotas* — `#cuotas`, fondo papel `#fdfbf4`):** Aparece el titular contundente: **«EL ARTE ES LO ÚNICO QUE EN ARGENTINA NO SE COMPRA EN CUOTAS. *HASTA AHORA.*»** El cursor mueve el slider **«Días colgada»** de `40` hacia `100` (con `Precio 300 XLM` y `3 XLM/día`): se ve la barra dorada llenarse hasta el 100 % y actualizarse las dos tarjetas de salida (*«Si la devuelve hoy»* vs. *«Si se la queda»*).

#### Diseño sonoro
- Base musical constante y fluida; ligero efecto táctil al deslizar el control del simulador hasta llegar al 100 %.

#### Sugerencia de guion para hablar (~68 palabras)
> *«En Muro, el artista publica su obra con tres números: precio de venta, alquiler por día y un depósito en garantía.*
> *Cuando un bar, una bodega o un hotel decide colgarla, deposita la garantía y prepaga días en un contrato inteligente sobre Stellar.*
> *Cada día colgada genera alquiler para el artista y, al mismo tiempo, descuenta como cuota del precio final.*
> *En Argentina todo se compra en cuotas, menos el arte. Hasta ahora.»*

---

### BLOQUE 03 · Validación en taller: Una voz real fuera del equipo
- **Tiempo:** `00:48 – 01:06`
- **Duración:** **18 segundos**
- **Qué se aborda:** Criterio clave del jurado: demostrar que no diseñamos desde una burbuja. Presentar la entrevista real con **Laura Zapata** (artista visual con taller propio en Resistencia, Chaco), el problema que confirmó y el ajuste concreto que incorporamos al producto gracias a su devolución.

#### Qué se muestra de la app y dirección visual
- **`00:48 – 00:59` (Tarjeta editorial de validación):** Composición con la misma estética de Muro (fondo asfalto `#0d1024`, tarjeta color papel `#fdfbf4` con cita en `Big Shoulders Display` / `Geist` y etiqueta dorada `VALIDACIÓN EXTERNA · RESISTENCIA, CHACO`).
  - Se muestra el nombre: **Laura Zapata — Artista visual con taller propio**.
  - Onda de audio sutil (referencia al audio original de 2m 24s documentado en `docs/validacion-laura-zapata.md`) y cita resaltada:
    > *«La usaría así como está... Es una manera de ir pagándola cuando quizás no cuenta con todo el dinero junto y le gusta.»*
- **`00:59 – 01:06` (Cómo impactó en el producto):** Corte rápido a la caja de acción **«Colgar esta obra en tu espacio»** en `/obra/2`, haciendo zoom suave sobre el texto que agregamos por su sugerencia: *«Elegís esta obra porque la querés en tu pared: devolverla no es un conflicto, recuperás el depósito y el artista cobra los días expuestos.»*

#### Diseño sonoro
- La música baja un punto (ducking sutil) para dar peso humano y credibilidad al testimonio; vuelve a subir suavemente al volver a la UI.

#### Sugerencia de guion para hablar (~44 palabras)
> *«Salimos a validar la idea con **Laura Zapata**, artista visual con taller propio en Resistencia, Chaco.*
> *Nos confirmó cuánta obra terminada queda guardada sin circuito, vio justo el alquiler como cuota y nos dio un ajuste clave: que colgar sea una elección genuina del local, nunca un favor.»*

---

### BLOQUE 04 · Demo en vivo: Publicar, La Pared y Contador en Stellar Testnet
- **Tiempo:** `01:06 – 01:36`
- **Duración:** **30 segundos**
- **Qué se aborda:** Demostración funcional en vivo sobre Stellar Testnet (`muro.asymmetric.com.ar`): cómo publica un artista, cómo se ve el catálogo vivo en la tira horizontal *La pared* y cómo corre el alquiler por segundo en la ficha de una obra real, junto con la experiencia visual de galería (lupa y visor a pantalla completa).

#### Qué se muestra de la app y dirección visual
- **`01:06 – 01:15` (Publicar una obra — `/#/publicar`):** Vista de la pantalla dividida: a la izquierda el formulario en 2 pasos (*1. La obra*, *2. Los números*: Precio `200 XLM`, Alquiler `2 XLM/día`, Depósito `30 XLM` y cálculo automático: *«Con estos números la obra es del espacio a los 100 días de alquiler»*); a la derecha la vista previa en vivo de la obra y su cartela. Clic en **«Publicar la obra»** (o transición rápida mostrando el toast verde/dorado *«Listo · Tu obra quedó publicada»* con enlace directo a Stellar Expert).
- **`01:15 – 01:22` (La pared en vivo — `#pared` en la landing):** Scroll horizontal cinematográfico de `Wall.tsx` mostrando el contador global en grande (**`X XLM pagados a artistas en Stellar Testnet`**) y el desfile de obras numeradas (`01` a `06`) con paralaje y sus stickers de progreso.
- **`01:22 – 01:36` (Ficha de obra colgada en vivo — `/#/obra/0`, *Un bar aux Folies-Bergère*):**
  - El cursor pasa sobre la pintura y se activa la **lupa circular 2.6×** (`ArtStage`) revelando el detalle de las pinceladas; breve toque de 1,5 s en **«Explorar la obra»** (visor fullscreen) y cierre suave.
  - Foco en el panel derecho: chip **«Colgada»**, el **medidor en vivo (`Meter`)** con el monto acreditado subiendo segundo a segundo (con la nota honesta: *«En esta demo 1 día dura 1 minuto»*), y el bloque de acciones (`Cobrar lo devengado` / `claim` permisivo, `Quedármela` / `buy_now`, `Descolgar` / `stop`).
  - Clic en **«Cobrar lo devengado»**: aparece el toast **«Listo · Se cobró lo devengado y se acreditó al precio»** con el link **«Ver la transacción en Stellar Expert»**.

#### Diseño sonoro
- Ritmo musical con mayor energía y claridad; pequeño chasquido limpio al activar la lupa y tono positivo sutil al confirmarse el `claim` on-chain.

#### Sugerencia de guion para hablar (~71 palabras)
> *«Veámoslo funcionando en vivo en Stellar Testnet.*
> *El artista carga su obra y fija sus tres números con vista previa inmediata.*
> *En **La pared**, cada cuadro muestra en tiempo real cuánto lleva cobrado.*
> *Al abrir una obra colgada, podés inspeccionar cada pincelada con lupa y ver el contador correr segundo a segundo —acelerado a un minuto por día para esta demo.*
> *Cualquiera puede liquidar lo devengado: el dinero va directo al artista y baja el saldo para comprarla.»*

---

### BLOQUE 05 · El puente físico-digital: Cartela QR, propinas sin fricción y currículum inmutable
- **Tiempo:** `01:36 – 02:02`
- **Duración:** **26 segundos**
- **Qué se aborda:** Mostrar cómo Muro vive en el mundo físico de un bar o bodega (cartela imprimible con QR), cómo resuelve la fricción Web3 para visitantes comunes (propina directa sin instalar wallets vía Modo Invitado Testnet + Friendbot) y qué pasa cuando la obra se devuelve limpiamente (currículum público e inmutable de exposiciones).

#### Qué se muestra de la app y dirección visual
- **`01:36 – 01:42` (La cartela de la pared — abajo en `/#/obra/0`):** Scroll hasta la sección **«La cartela de la pared»**: se ve la tarjeta blanca con borde negro grueso estilo museo (*«MURO · EN ESTA PARED · UN BAR AUX FOLIES-BERGÈRE · Escaneá y dejale una propina al artista»*) con su código QR y los botones `Imprimir`, `Bajar cartela` (A5 lista para imprenta) y `Bajar solo el QR`.
- **`01:42 – 01:52` (Escaneo móvil — `/#/cartela/0` en marco de celular):** Transición fluida a vista móvil de la cartela viva. Se ve el cuadro, su barra de cuotas en tiempo real y los chips de propina (`1`, `2`, `5`, `10 XLM`). Toque en **`5 XLM`** → botón **«Dejarle 5 XLM a Édouard»**. Se destaca la aclaración: *«Se crea una cuenta de invitado de Testnet en tu navegador, sin instalar nada»* (fondeada automáticamente por Friendbot). Toast de confirmación: *«Llegó directo, sin intermediarios.»*
- **`01:52 – 02:02` (Devolución limpia y currículum público — `/#/obra/1`, *Después de la batalla de Curupaytí*):** Corte a la ficha de la obra `#1`, bajando hasta **«El currículum de la obra»**. Se ve la línea de tiempo con el registro real on-chain: **`Expuesta y devuelta`** · monto pagado · fechas · dirección del espacio. Overlay discreto resumiendo el cierre del ciclo: `stop` (frena alquiler y devuelve prepago sobrante) → `confirm_return` (vuelve el depósito y graba el historial) / `seize` (si no se devuelve tras la gracia, el depósito protege al artista).

#### Diseño sonoro
- Efecto de escaneo/notificación móvil sutil al pasar a la vista de celular; pulso limpio al enviar la propina.

#### Sugerencia de guion para hablar (~62 palabras)
> *«Junto al cuadro físico va esta **cartela con QR**, lista para imprimir como en un museo.*
> *Cualquier cliente del bar la escanea, ve cuánto lleva cobrado y deja una propina directa al artista, sin instalar extensiones gracias al modo invitado en Testnet.*
> *Y si el espacio decide devolver la obra, el artista confirma que la recibió, el depósito regresa y esa exposición queda grabada para siempre en un currículum que nadie puede editar.»*

---

### BLOQUE 06 · Bajo el capó: Por qué Stellar, ecosistema, Raven y evidencia verificable
- **Tiempo:** `02:02 – 02:26`
- **Duración:** **24 segundos**
- **Qué se aborda:** Responder de frente y con rigor técnico a todas las preguntas del jurado de Stellar: evidencia real en Testnet (Stellar Expert), por qué blockchain y por qué Stellar, qué componentes existentes usamos, por qué **no** usamos Trustless Work, qué verificamos con **Stellar Raven**, y la calidad/seguridad del contrato Soroban.

#### Qué se muestra de la app y dirección visual
- **`02:02 – 02:11` (Página `/#/evidencia` → Stellar Expert Testnet):**
  - Se muestra la tabla de `/#/evidencia`: las **dos instancias desplegadas en Testnet** — `Demo` (`60 s`, gracia `1 día`, contrato `CD72…T2Y`) y `Real` (`24 horas`, gracia `7 días`, contrato `CDUI…DGI`) — y la lista de **12 transacciones reales** (`publish`, `hang`, `stop`, `confirm_return`, `claim`, `tip`).
  - Clic en uno de los hashes: se abre **Stellar Expert (Testnet)** mostrando el contrato Muro, las invocaciones y los eventos on-chain (`hung`, `claimed`, `returned`, `tipped`).
- **`02:11 – 02:26` (Placa arquitectónica limpia con estilo Muro — fondo asfalto `#0d1024` + acentos `#e8d282`):** Cuatro pilares claros que aparecen sincronizados con la locución (sin saturar de texto):
  1. **Por qué Stellar:** comisiones de fracción de centavo (hacen viable liquidar por día), custodia sin intermediarios y solo montos/estados on-chain (imágenes off-chain).
  2. **Ecosistema:** `Soroban SDK 29` · `SAC / SEP-41` (XLM en testnet, USDC en producción) · `Freighter` + `Friendbot` · `Stellar Expert`.
  3. **Sin reinventar (y con criterio):** validado con **Stellar Raven** (sin precedentes que combinen alquiler diario acreditable a compra + garantía + CV físico; sin NFT innecesario). **¿Por qué no Trustless Work?** Cobra 0,3 % por transacción y trabaja por hitos discretos; Muro requiere devengo continuo por segundo acoplado a compra.
  4. **Seguridad y código:** storage `instance` + `persistent` con TTL (`touch`), `require_auth` por rol, 9 eventos, **41 tests** y **auditoría independiente** (`docs/AUDITORIA.md`).

#### Diseño sonoro
- Base rítmica firme y precisa, transmitiendo solidez técnica sin volverse fría.

#### Sugerencia de guion para hablar (~62 palabras)
> *«Todo es verificable en nuestra sección de **Evidencia** y en **Stellar Expert**, con dos contratos en Testnet —demo y reloj real de 24 horas— y doce transacciones auditables.*
> *Elegimos Stellar porque sus comisiones de fracción de centavo hacen viable liquidar por día, guardando solo estados livianos on-chain sobre **SAC/SEP-41** y **Freighter**.*
> *Contrastamos la arquitectura con **Stellar Raven**: descartamos Trustless Work porque su esquema por hitos y 0,3 % rompe el alquiler diario continuo, evitamos NFTs innecesarios y respaldamos el contrato con 41 tests y auditoría independiente.»*

---

### BLOQUE 07 · Modelo de negocio y cierre
- **Tiempo:** `02:26 – 02:40`
- **Duración:** **14 segundos**
- **Qué se aborda:** Sostenibilidad del proyecto (0 % en MVP; monetización alineada al éxito en producción) y cierre emocional memorable que conecta con la mística de **FLAT 2026** (Hilma af Klint) y deja fijado el lema y la URL de Muro.

#### Qué se muestra de la app y dirección visual
- **`02:26 – 02:33` (Modelo de negocio — placa limpia sobre papel `#fdfbf4`):** Tres ítems sobrios con bullet dorado:
  - **Hoy (MVP):** `0 %` de comisión en el contrato.
  - **Producción:** `1–2 %` solo sobre compras completadas + servicios físicos para espacios (cartelas, logística y seguro) y curaduría verificada.
  - **Siguiente paso:** validar disposición de pago diario con bares y bodegas de Mendoza y el NEA.
- **`02:33 – 02:40` (Footer de la landing — `Landing.tsx`):** Scroll hasta el pie oscuro de Muro. Se enciende la cita de FLAT 2026 vinculada al *Retablo n.º 1* de Hilma af Klint: **«ANTES DE EXISTIR EN EL MUNDO, EXISTIÓ EN LA IMAGINACIÓN DE ALGUIEN.»** Debajo se ilumina el wordmark gigante **MURO** en dorado suave (`#e8d282`) y aparece la URL limpia: **`muro.asymmetric.com.ar`** · `FLAT Stellar 2026 · BAF × Stellar`. Hold final de 2,5 segundos.

#### Diseño sonoro
- La música resuelve en un acorde cálido y abierto (fade out limpio de 2 segundos sobre el wordmark **MURO**).

#### Sugerencia de guion para hablar (~31 palabras)
> *«Hoy el contrato cobra cero comisión; hacia producción el modelo se sostiene con un uno o dos por ciento solo cuando una obra se vende, más servicios físicos para espacios.*
> *Somos **Muro**. La obra cobra por día. Si se enamoran, es suya.»*

---

## 5. Texto completo de locución (listo para teleprompter o agente TTS)

> **Total:** ~382 palabras · **Velocidad sugerida:** ~145 palabras/minuto · **Duración estimada con pausas:** `02:40`

**[00:00]**
Imaginá una obra colgada hace un mes en la pared de un bar o una bodega. ¿Cuánto cobró su artista?
*(pausa 1.2 s)*
Nada. Ni un peso, ni un contrato, ni un registro de dónde estuvo.
*(pausa 2.5 s — intro pincelada MURO)*
Eso cambia con Muro: la obra cobra por día. Y si se enamoran, es suya.

**[00:20]**
En Muro, el artista publica su obra con tres números: precio de venta, alquiler por día y un depósito en garantía.
Cuando un bar, una bodega o un hotel decide colgarla, deposita la garantía y prepaga días en un contrato inteligente sobre Stellar.
Cada día colgada genera alquiler para el artista y, al mismo tiempo, descuenta como cuota del precio final.
En Argentina todo se compra en cuotas, menos el arte. Hasta ahora.

**[00:48]**
Salimos a validar la idea con Laura Zapata, artista visual con taller propio en Resistencia, Chaco.
Nos confirmó cuánta obra terminada queda guardada sin circuito, vio justo el alquiler como cuota y nos dio un ajuste clave: que colgar sea una elección genuina del local, nunca un favor.

**[01:06]**
Veámoslo funcionando en vivo en Stellar Testnet.
El artista carga su obra y fija sus tres números con vista previa inmediata.
En La pared, cada cuadro muestra en tiempo real cuánto lleva cobrado.
Al abrir una obra colgada, podés inspeccionar cada pincelada con lupa y ver el contador correr segundo a segundo —acelerado a un minuto por día para esta demo.
Cualquiera puede liquidar lo devengado: el dinero va directo al artista y baja el saldo para comprarla.

**[01:36]**
Junto al cuadro físico va esta cartela con QR, lista para imprimir como en un museo.
Cualquier cliente del bar la escanea, ve cuánto lleva cobrado y deja una propina directa al artista, sin instalar extensiones gracias al modo invitado en Testnet.
Y si el espacio decide devolver la obra, el artista confirma que la recibió, el depósito regresa y esa exposición queda grabada para siempre en un currículum que nadie puede editar.

**[02:02]**
Todo es verificable en nuestra sección de Evidencia y en Stellar Expert, con dos contratos en Testnet —demo y reloj real de 24 horas— y doce transacciones auditables.
Elegimos Stellar porque sus comisiones de fracción de centavo hacen viable liquidar por día, guardando solo estados livianos on-chain sobre SAC/SEP-41 y Freighter.
Contrastamos la arquitectura con Stellar Raven: descartamos Trustless Work porque su esquema por hitos y cero coma tres por ciento rompe el alquiler diario continuo, evitamos NFTs innecesarios y respaldamos el contrato con cuarenta y un tests y auditoría independiente.

**[02:26]**
Hoy el contrato cobra cero comisión; hacia producción el modelo se sostiene con un uno o dos por ciento solo cuando una obra se vende, más servicios físicos para espacios.
Somos Muro. La obra cobra por día. Si se enamoran, es suya.

---

## 6. Reglas de oro para el agente de video IA (qué cuidar y qué evitar)

1. **Dejar brillar la UI real:** la aplicación ya tiene dirección de arte, micro-interacciones físicas (pincelada, cinta adhesiva, caída elástica, lupa 2.6×, scroll horizontal, simulador) y tipografía de estudio. **No** tapar la interfaz con gráficos genéricos, neones "crypto" ni transiciones estridentes.
2. **No acelerar la intro (`Intro.tsx`):** dura exactamente 3,4 segundos y es el golpe visual más memorable del proyecto. Respetar su tempo original.
3. **Honestidad radical (coherente con `docs/MURO.md`):**
   - Aclarar siempre que el reloj de la demo corre a `1 día = 1 minuto` (y que la instancia real de 24 h también está desplegada).
   - No afirmar que ya entrevistamos a dueños de bares/bodegas: presentar a Laura Zapata como validación real del lado artista y el contraste con locales como siguiente paso en calle.
   - Aclarar que las obras del catálogo de demo son obras de dominio público (Wikimedia Commons) usadas como ejemplo.
   - Mencionar "NFT" únicamente para explicar que **no** lo agregamos a propósito (siguiendo a Stellar Raven y la visión de no tokenizar arte porque sí).
4. **Legibilidad de las pruebas en Stellar Expert:** al mostrar `/#/evidencia` y Stellar Expert (`02:02 – 02:11`), hacer un ligero *push-in* (zoom 115–125 %) sobre el ID del contrato, la función invocada y los eventos emitidos para que sean legibles incluso si el jurado ve el video sin pantalla completa.
