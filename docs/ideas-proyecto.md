# Ideas de proyecto · Hackathon FLAT 2026

Documento de trabajo del equipo para elegir qué construir. Entrega: sábado 28/11 a las 23:59 en Apex.

Arriba están los cinco proyectos principales, descritos en detalle. Más abajo queda el material de apoyo: la lista completa de 14 ideas con su ranking, la comparación con Mercado Pago, el problema de la wallet y las fuentes.

## Con qué vara se eligieron

El jurado puntúa cuatro cosas, 25% cada una: problema real, conexión con los ejes, producto validado por alguien de afuera, ejecución técnica en Stellar. El desempate es por ejecución técnica.

Un proyecto puede trabajar un solo eje (arte, memoria, territorio) o unir dos o tres. Unir ejes suma solo si la unión sale sola del producto; forzar un eje para decir que están los tres resta. Además, cada proyecto principal pasa tres filtros:

1. **Eje:** si le sacás el arte, la memoria o el territorio, deja de tener sentido.
2. **Cuenta:** solo necesitan cuenta unas pocas personas, registradas y con un motivo fuerte (cobrar, o proteger plata propia). La app se la crea, sin wallet ni frase semilla. El resto del público solo mira, escaneando un QR o abriendo un link.
3. **Mercado Pago:** el centro del proyecto es algo que Mercado Pago no hace: retener plata bajo condición, repartirla entre varios, compartir el control, o dejar un registro que no dependa de un servidor propio.

## Los cinco proyectos principales

| | Proyecto | Ejes | Quién necesita cuenta | El público | Lo que Mercado Pago no hace |
|---|---|---|---|---|---|
| A | **Mural con historia** | Arte, Memoria, Territorio | Artista y cliente | Lee la historia del mural por QR | Retener el pago por etapas; registro de autoría |
| B | **Cachet asegurado** | Arte, Territorio | Organizador y artistas | No participa | Retener el pago hasta el show y repartirlo a cada artista |
| C | **Sello de origen con historia del oficio** | Territorio, Memoria, Arte | La entidad que avala a los artesanos | Lee el certificado por QR | Certificado que no se puede falsificar |
| D | **Archivo del barrio con guardianes** | Memoria, Territorio | Tres a cinco guardianes | Lee y escucha el archivo | Control compartido y consentimiento verificable |
| E | **Fondo con rendición por etapas** | Territorio, Arte | Quien financia y el espacio | Ve en qué se gastó | Retener el fondo y liberarlo contra rendición |

**Elegido para el MVP:** el C (rama `propuesta-tobias`). Antes la recomendación era el A, con el B como alternativa.

---

### A. Mural con historia

**Qué es:** una app para encargar un mural con el pago asegurado por etapas, que al terminar deja una página pública con la historia de la obra.

**Para quién:** muralistas mendocinos contratados por comercios, bodegas o consorcios, y esos clientes.

**El problema:** los encargos se arreglan de palabra. El artista corre el riesgo de pintar y no cobrar, o cobrar tarde; el cliente no quiere pagar todo por adelantado sin ver avances. Además, el mural terminado no dice quién lo hizo, y si lo tapan no queda registro. El cobro tardío y sin contrato está documentado para artistas contratados por el Estado en Mendoza; para muralistas con clientes privados hay que confirmarlo hablando con ellos.

**Cómo funciona:**

1. Artista y cliente cargan el acuerdo: precio total, tres etapas (boceto, mitad de pared, obra terminada) y quién decide si hay conflicto, por ejemplo un colectivo de muralistas.
2. El cliente deposita el total. La plata queda retenida: no la tiene el artista ni la app.
3. El artista sube la foto de cada etapa. El cliente aprueba y se libera esa parte del pago.
4. Al terminar, la app publica la página del mural con autor, fecha, historia y las fotos del proceso, que ya se cargaron en el paso 3.
5. Una placa con QR al lado del mural lleva a esa página. Cualquiera la abre sin registrarse.

**Qué pasa en Stellar:** el pago retenido es un escrow multi-release de Trustless Work, en USDC. El registro de la obra (autor, fecha, hash de las fotos) se guarda en un contrato chico propio.

**Quién necesita cuenta:** el artista y el cliente. La app se la crea al registrarse y paga las comisiones de red.

**Por qué no Mercado Pago:** no retiene un pago condicionado a que se aprueben etapas. Habría que cobrar todo y que la app guarde la plata, que es el intermediario que se quiere evitar. En pesos, además, el depósito pierde valor durante las semanas de obra.

**Qué se construye para el hackathon:** crear el encargo, depositar con USDC de testnet, subir evidencia, aprobar, liberar, y la página pública del mural. La resolución de conflictos puede quedar mostrada pero sin construir.

**Cómo validarlo:** un muralista real y alguien que haga de cliente recorren el flujo completo, sin explicarles nada de blockchain.

**Puntos débiles:**

- Sin la página del mural es un escrow de freelancers cualquiera. La historia pública es lo que lo ata a los ejes.
- La entrada y salida de pesos se simula en testnet, y hay que decirlo.

---

### B. Cachet asegurado

**Qué es:** el organizador de un show deposita el pago de los artistas antes de la función, y después del show le llega a cada uno su parte. El cachet es lo que cobra un artista por una presentación.

**Para quién:** bandas, elencos y técnicos contratados para un ciclo o una fiesta, y quien los contrata.

**El problema:** se actúa primero y se cobra después, a veces meses después y sin contrato firmado. En 2025 la comuna de San Martín debía 30 millones de pesos a 280 artistas y técnicos de la Vendimia departamental. Cuando se paga, la plata suele llegar a un representante que después reparte.

**Cómo funciona:**

1. El organizador crea el evento y carga la lista de artistas y técnicos con el monto de cada uno.
2. Deposita el total antes de la función.
3. Cada artista ve en su teléfono que su pago ya está depositado.
4. Después del show, el organizador confirma que se hizo y a cada uno le llega su parte directo, sin pasar por nadie.
5. Si el show se suspende o hay conflicto, decide un tercero acordado al crear el evento, por ejemplo la asociación de actores o de músicos.

**Qué pasa en Stellar:** escrow de Trustless Work fondeado antes del evento. Su versión multi-release permite un receptor distinto por etapa, lo que serviría para pagarle a cada persona. Hay que confirmarlo probándolo; si no alcanza, se hace un contrato repartidor propio.

**Quién necesita cuenta:** el organizador y cada artista. Son más cuentas que en el A, pero todos están registrados y tienen el mejor motivo posible: cobrar.

**Por qué no Mercado Pago:** no retiene un pago hasta que ocurra el show ni lo reparte entre veinte personas. En pesos, el cachet pierde valor mientras espera.

**Qué se construye para el hackathon:** crear un evento con tres o cuatro artistas, depositar, vista del artista con su pago asegurado, confirmar el show y liberar a cada uno.

**Cómo validarlo:** una banda real y alguien que haga de organizador. Lo que hay que observar es si a los músicos les cambia algo ver la plata depositada antes de tocar.

**Puntos débiles:**

- Un organismo público no va a depositar por adelantado. El primer usuario realista es privado: un bar, una productora, una bodega con ciclo de música.
- Es el que más cuesta atar al eje. Hay que construirlo para una fiesta o escena concreta, no "para artistas".

---

### C. Sello de origen con historia del oficio

**Qué es:** un certificado digital que le da valor a la artesanía hecha a mano de verdad. Cada pieza lleva un QR: quien la compra ve quién la hizo, con qué técnica, de quién aprendió el oficio, y la prueba de que una entidad que fiscaliza a los artesanos la avaló.

**La idea central:** hoy "artesanal" es una palabra que cualquiera puede poner en una etiqueta. El sello la convierte en algo comprobable. Al artesano que trabaja a mano le da una forma de distinguirse de la copia industrial, y al comprador, una razón para pagar lo que vale. Suma además lo que ningún certificado de autenticidad cuenta: la línea del oficio, de maestro a aprendiz.

**Para quién:** artesanos que venden en ferias y mercados, la entidad que los agrupa o fiscaliza (asociación, cooperativa, municipio), y quienes compran, sobre todo turistas que no conocen el oficio y no pueden distinguir una pieza real de una copia.

**El problema:** en ferias y mercados de artesanías se venden productos industriales como si fueran hechos a mano. El comprador no tiene cómo distinguirlos, y el artesano real compite contra algo más barato. Lo que hoy existe para avalar el origen es informal: la palabra del vendedor, o que el puesto esté en una feria fiscalizada, cosa que el comprador no ve en la pieza que se lleva.

**Primer caso: Plaza de las Artes, Mendoza.** La feria de Plaza Independencia tiene 150 puestos, funciona desde 1989 y se rige por una ordenanza municipal de 1999 escrita con participación de los artesanos, con fiscalización semanal. Los artesanos están agrupados en la Asociación Plaza de las Artes. Vende mucho a turistas extranjeros, justo el comprador que menos puede distinguir una pieza real de una copia. Sobre la competencia industrial, una nota de La Nación sostiene que el 95% de lo que se vende en ferias regionales se fabrica en serie en el Gran Buenos Aires; la nota no tiene fecha clara y hay que confirmarlo con los artesanos. Falta confirmar también si fiscaliza la asociación, la municipalidad o ambas.

**Prueba local: Corrientes.** El equipo está en Corrientes, donde hay muchos artesanos y la artesanía y la producción propia son parte de la cultura correntina. Eso permite validar con artesanos reales antes de la entrega, sin depender de llegar a Mendoza: que un artesano cargue una pieza, que alguien de afuera escanee el QR, y anotar qué entendieron y qué no. Como antecedente de que el oficio está organizado en la provincia, la Expo Feria Artesanal de Empedrado nació en 1993 impulsada por artesanos junto con la municipalidad, según un proyecto de la Cámara de Diputados correntina. La validación en Corrientes no reemplaza a Mendoza como caso: muestra que el mismo sistema sirve en otra región con otra tradición.

**Cómo funciona:**

1. El artesano pide el sello: sube una foto de la pieza y completa técnica y materiales.
2. Un fiscalizador de la entidad revisa y emite el certificado. Solo esa entidad puede emitir.
3. La pieza lleva un QR en una etiqueta.
4. El comprador escanea y, sin registrarse, ve la foto de la pieza, el artesano, el puesto, la técnica y la historia del oficio: de quién aprendió y hace cuánto trabaja.

**Qué pasa en Stellar:** cada certificado es un token no fungible emitido desde la cuenta de la entidad, con el estándar SEP-50. En cadena van el identificador de la pieza, el artesano, la fecha, el vínculo maestro-aprendiz y la huella de la foto y la ficha. Las fotos y los textos van fuera.

**Quién necesita cuenta:** solo la entidad que emite. El artesano tiene un perfil sin cuenta y el comprador solo lee. Es el proyecto con menos barrera de entrada.

**Por qué no una base de datos:** acá el problema no es de pagos, así que la comparación no es con Mercado Pago. Una base de datos con QR funcionaría, y hay que decirlo así. La diferencia es que el certificado queda firmado por la entidad, nadie puede editarlo después y sigue existiendo aunque la entidad deje de pagar el sitio. Es una ventaja real, pero más chica que en los proyectos de pago retenido.

**Cómo escala:** el mismo sistema sirve para cualquier feria o mercado con una entidad que avale a sus artesanos: otras ferias de Mendoza, mercados artesanales de otras provincias, cooperativas de tejedoras o ceramistas.

**Qué se construye para el hackathon:** un panel para que la entidad emita, una página pública por pieza y el contrato.

**Cómo validarlo:** con artesanos de Corrientes: uno carga una pieza real y alguien de afuera escanea el QR en el puesto, sin que nadie le explique nada de blockchain.

**Puntos débiles:**

- El QR se puede copiar y pegar en una pieza falsa. Lo frena que la página muestra la foto de esa pieza exacta y el puesto donde se vende; no es infalible.
- Certificar pieza por pieza es mucho trabajo para algo barato. Conviene un sello por puesto para lo barato y por pieza para lo caro.
- El sello vale tanto como la fiscalización que lo respalda: si la entidad avala cualquier cosa, el sello no significa nada.

---

### D. Archivo del barrio con guardianes

**Qué es:** un archivo de relatos, fotos y grabaciones de un barrio, donde un grupo de vecinos decide qué entra y cada pieza guarda el consentimiento de quien la aportó.

**Para quién:** un barrio o comunidad con memoria en riesgo (vecinos mayores, casetes, fotos familiares) y los vecinos referentes que la cuidan.

**El problema:** los archivos comunitarios se pierden por falta de fondos y de estructura. Cuando una institución los recoge, la comunidad deja de decidir qué se publica, y quien cuenta su historia no tiene cómo dejar asentado para qué la autoriza. La pérdida de archivos está documentada en otras provincias; no encontré un caso mendocino.

**Cómo funciona:**

1. Un vecino propone una pieza (audio, foto o relato) y marca qué autoriza: publicarla, usarla en escuelas, o solo guardarla.
2. Los guardianes, de tres a cinco vecinos, la revisan. Entra al archivo cuando la aprueba la mayoría.
3. La pieza queda publicada con fecha, quién la aportó y quiénes la aprobaron.
4. Quien la aportó puede retirar el consentimiento. La pieza se despublica y el retiro queda asentado.
5. El público recorre el archivo sin registrarse.

**Qué pasa en Stellar:** un contrato guarda el hash de cada pieza, las aprobaciones de los guardianes y el estado del consentimiento. Los archivos van fuera de la cadena.

**Quién necesita cuenta:** solo los guardianes. El vecino que aporta no necesita una: el retiro del consentimiento lo ejecuta un guardián a su pedido.

**Por qué no un sitio web común:** tampoco es un problema de pagos. Un sitio con un administrador funciona, pero el control queda en una sola persona o institución, que es la dependencia que se quiere evitar. Acá ninguna persona sola puede agregar, cambiar ni borrar una pieza.

**Qué se construye para el hackathon:** proponer una pieza, aprobarla con dos de tres guardianes, la página pública del archivo y el retiro de consentimiento.

**Cómo validarlo:** cargar un relato real de un vecino mayor con dos o tres personas del barrio haciendo de guardianes.

**Puntos débiles:**

- Es el que menos hace en cadena, y la ejecución técnica es el criterio de desempate.
- La entrega pide usar al menos un componente existente de Stellar. Para este proyecto no identifiqué cuál; hay que resolverlo antes de elegirlo.
- Los guardianes pueden ser gente mayor: hay que acompañarlos en la prueba.

---

### E. Fondo con rendición por etapas

**Qué es:** quien financia un proyecto cultural deposita el total, y el espacio lo recibe por etapas a medida que muestra en qué lo gastó.

**Para quién:** un centro cultural, biblioteca popular o colectivo que recibe plata de un sponsor, una fundación o un mecenas, incluso de afuera del país.

**El problema:** quien financia no sabe si la plata se usó para lo prometido. El espacio recibe los fondos tarde, y en pesos que ya perdieron valor. La crisis de financiamiento de los espacios independientes está documentada; la desconfianza de quienes financian es un problema conocido que no verifiqué con una fuente.

**Cómo funciona:**

1. El espacio publica el proyecto con sus etapas y montos, por ejemplo: materiales, armado, inauguración.
2. Quien financia deposita el total. Queda retenido.
3. El espacio sube el comprobante de cada etapa (factura o foto). Quien financia aprueba y se libera esa parte.
4. Una página pública muestra las etapas, los comprobantes y cuánto se liberó.

**Qué pasa en Stellar:** escrow multi-release de Trustless Work y una vista pública de las etapas. Técnicamente es casi igual al proyecto A; lo que cambia es para quién se construye.

**Quién necesita cuenta:** quien financia y una persona del espacio.

**Por qué no Mercado Pago:** no retiene un fondo contra rendición, no muestra los movimientos a terceros y no recibe aportes del exterior.

**Qué se construye para el hackathon:** publicar el proyecto, depositar, subir comprobantes, aprobar, liberar y la página pública de rendición.

**Cómo validarlo:** un espacio cultural real carga un proyecto verdadero y alguien hace de financiador.

**Puntos débiles:**

- Para validar de verdad hace falta alguien dispuesto a financiar, difícil de conseguir en un día.
- Sin un espacio concreto se vuelve un escrow de subsidios genérico.

---

## Cómo elegir entre los cinco

- **A** es el más completo: une los tres ejes sin forzar nada, porque el encargo ya produce las fotos y la historia que después se publican.
- **B** tiene el problema mejor documentado y usa dos cosas que Mercado Pago no hace. Su punto débil es la conexión con el eje.
- **C** le da valor a lo hecho a mano de verdad y casi no tiene barrera de cuenta. Su primer caso es la Plaza de las Artes de Mendoza; conviene si el equipo puede llegar a esos artesanos.
- **D** es el mejor proyecto de memoria pura, y el que menos hace en Stellar.
- **E** es el más simple de explicar a un jurado, y el más difícil de validar en un día.

A, B y E comparten el mismo componente (el escrow de Trustless Work). Si a mitad de camino hay que cambiar de público, el trabajo técnico se conserva.

## Qué hacer antes de elegir

1. Consultar Raven para cada candidata: el jurado espera verlo.
2. Pedir ya la API key de Trustless Work si se elige la 1, la 4, la 7, la 12 o la 14.
3. Decidir cómo se crean las cuentas (por la app o con passkey) antes de escribir la interfaz, y probar temprano que el escrow acepta esa cuenta como firmante.
4. Hablar hoy con dos o tres personas del público objetivo. Confirma el problema y cuenta como validación.
5. Hacer la prueba con alguien de afuera sin explicarle nada de blockchain. Si pregunta qué es una wallet, hay algo que arreglar.

---

# Material de apoyo

## Todas las ideas

Lista completa de las 14 ideas evaluadas. Los proyectos principales salen de acá: A une las ideas 1 y 2, B es la 12, C une la 6 y la 11, D es la 13 y E es la 14.

Al lado de cada problema se indica de dónde sale:

- **Documentado**: encontré notas o estudios que lo respaldan (links al final).
- **Conocido**: es un problema reconocido del sector, pero no lo verifiqué con una fuente puntual. Hay que confirmarlo hablando con alguien real antes de afirmarlo en el pitch.

### Ranking

Puntaje del 1 al 5 por criterio; es mi estimación, no un dato. La tabla está ordenada por total y ya descuenta dos cosas: lo que Mercado Pago resuelve igual o mejor (baja "Problema") y cuánta gente tiene que tener una cuenta para que la prueba con usuarios funcione (baja "Validable").

| # | Idea | Ejes | Quién necesita cuenta | Problema | Conexión | Validable | Técnica | Total |
|---|------|------|------|:---:|:---:|:---:|:---:|:---:|
| 1 | Encargo de mural con pago por etapas | Arte, Memoria | Artista y cliente | 5 | 4 | 4 | 5 | 18 |
| 12 | Cachet asegurado con reparto al elenco | Arte, Territorio | Organizador y artistas | 5 | 4 | 4 | 5 | 18 |
| 14 | Fondo con rendición por etapas para un espacio cultural | Territorio, Arte | Quien financia y el espacio | 4 | 4 | 3 | 5 | 16 |
| 4 | Vaquita del barrio para una obra | Arte, Territorio | Cada aportante | 4 | 5 | 2 | 5 | 16 |
| 6 | Sello de origen para la feria | Territorio, Arte | Solo la asociación | 4 | 4 | 4 | 4 | 16 |
| 2 | QR en el mural: historia y autoría | Arte, Memoria, Territorio | Solo el artista | 3 | 5 | 4 | 3 | 15 |
| 5 | Caja transparente del centro cultural | Territorio | Los que firman | 4 | 4 | 3 | 4 | 15 |
| 13 | Archivo del barrio con guardianes | Memoria, Territorio | Solo los guardianes | 4 | 5 | 3 | 3 | 15 |
| 10 | Archivo oral del barrio | Memoria | Quien sube relatos | 4 | 5 | 3 | 2 | 14 |
| 11 | Linaje de oficios | Memoria | Maestro y aprendiz | 3 | 5 | 3 | 3 | 14 |
| 3 | Gorra digital con reparto automático | Arte, Territorio | Todo el público | 3 | 4 | 2 | 4 | 13 |
| 9 | Regalía por reventa de obra | Arte | Artista y compradores | 4 | 3 | 2 | 4 | 13 |
| 7 | Preventa de un disco, fanzine o corto | Arte | Cada comprador | 3 | 3 | 2 | 4 | 12 |
| 8 | Pasaporte cultural del circuito | Territorio | Cada visitante | 3 | 4 | 2 | 2 | 11 |

### 1. Encargo de mural con pago por etapas

- **Para quién:** muralistas mendocinos contratados por comercios, bodegas o consorcios.
- **Problema (documentado):** los encargos se arreglan de palabra, sin contrato, y se cobra tarde o no se cobra. El cliente tampoco quiere pagar todo por adelantado.
- **Qué hace:** el cliente deposita el total al acordar. El pago se libera en tres etapas (boceto, mitad de pared, obra terminada) cuando el artista sube la foto y el cliente aprueba. Si hay conflicto, decide un tercero acordado de antemano, por ejemplo un colectivo de muralistas.
- **En Stellar:** escrow multi-release de Trustless Work en testnet, pagos en USDC. La app le crea una cuenta a cada parte al registrarse y paga las comisiones de red.
- **Por qué blockchain:** ninguna de las partes tiene que confiar en la otra ni en un intermediario que retenga la plata.
- **Con Mercado Pago:** no se puede. Mercado Pago no retiene plata condicionada a que un tercero apruebe etapas de un servicio; su protección al comprador es para productos y la decide Mercado Pago. Habría que cobrar todo y que la app guarde la plata, que es justo el intermediario que se quiere evitar. Además el depósito quedaría en pesos durante semanas de obra.
- **Factibilidad:** alta. El escrow ya existe; el trabajo es la interfaz y el flujo.
- **Riesgo:** sin el mural es un escrow de freelancers cualquiera. La evidencia fotográfica por etapa y la página pública de la obra son lo que lo ata al eje. Artista y cliente no tienen wallet: si la app no se la crea de forma invisible, no lo prueba nadie.

### 2. QR en el mural: historia y autoría

- **Para quién:** muralistas con obra en la calle y la gente que pasa, sobre todo turistas.
- **Problema (conocido):** el mural no dice quién lo hizo ni por qué, y cuando lo tapan no queda registro. El artista tampoco recibe nada de quienes lo disfrutan.
- **Qué hace:** una placa con QR al lado del mural abre una página con autor, historia y fotos del proceso, sin registrarse. Si el mural se borra, la página queda. La propina es un extra: por Mercado Pago para el público local y en USDC para quien ya tenga wallet.
- **En Stellar:** registro de la obra en un contrato (autor, fecha, hash de las fotos), firmado desde la cuenta del artista.
- **Por qué blockchain:** el registro de autoría tiene fecha cierta, lo firma el artista y no depende de que un sitio siga pagando el hosting.
- **Con Mercado Pago:** la propina de un argentino se resuelve igual o mejor con un QR de Mercado Pago, porque todos lo tienen. Lo que no cubre es el turista extranjero sin cuenta argentina ni el registro de autoría, que quedaría en una base de datos propia. Por eso la propina deja de ser el centro de la idea: la ventaja real de Stellar acá es el registro permanente.
- **Factibilidad:** alta.
- **Riesgo:** sola, la integración con Stellar es delgada (un registro). Rinde más como segunda parte de la idea 1 que como proyecto aparte.

### 3. Gorra digital con reparto automático

- **Para quién:** bandas independientes que tocan en bares y centros culturales.
- **Problema (conocido):** se toca "a la gorra" o por un porcentaje de la puerta que nadie puede verificar, y el reparto entre músicos, sonidista y lugar se arregla de palabra.
- **Qué hace:** antes del show se cargan los porcentajes. El público paga escaneando un QR y cada pago se reparte solo entre todos según lo acordado.
- **En Stellar:** contrato repartidor (splitter) que recibe USDC y distribuye en la misma transacción.
- **Por qué blockchain:** el reparto es automático y visible para todos; nadie "maneja la caja".
- **Con Mercado Pago:** es la idea donde Mercado Pago compite más fuerte. El público ya lo tiene, y su API permite dividir un cobro entre un vendedor y la plataforma. Lo que no hace es repartir un mismo pago entre cinco o seis personas con porcentajes libres, ni mostrarle a todos el total recaudado: la plata entra a la cuenta de uno y ese reparte. La diferencia es real pero chica frente a la fricción de la wallet.
- **Factibilidad:** alta. El contrato es chico y fácil de testear.
- **Riesgo:** es la idea más castigada por la barrera de la wallet. Paga gente de paso que no se va a registrar para poner plata en una gorra, y ya tiene Mercado Pago en el teléfono. Solo cierra si el público paga con Mercado Pago y Stellar queda para el reparto, y eso exige una conversión de pesos a USDC que en el hackathon solo se puede simular.

### 4. Vaquita del barrio para una obra

- **Para quién:** vecinos y comerciantes de una cuadra que quieren financiar un mural, una escultura o un escenario.
- **Problema (conocido):** juntar plata entre muchos genera desconfianza sobre quién la guarda y si la obra se termina.
- **Qué hace:** se publica el proyecto con una meta. Los aportes quedan retenidos; si no se llega a la meta, se devuelven. Si se llega, se liberan al artista por etapas.
- **En Stellar:** escrow de Trustless Work con varios aportantes, o contrato propio de meta y devolución.
- **Por qué blockchain:** muchos aportantes que no se conocen y un organizador que no puede tocar la plata.
- **Con Mercado Pago:** se puede juntar plata con un link de pago, pero cae en la cuenta del organizador, que puede gastarla cuando quiera. No hay devolución automática si no se llega a la meta ni liberación por etapas, y los aportantes no ven el saldo. Es exactamente la desconfianza que la idea busca resolver.
- **Factibilidad:** media. Es la idea 1 más la lógica de meta y devolución.
- **Riesgo:** cada aportante necesita una cuenta, así que la barrera de la wallet se multiplica por la cantidad de vecinos. Validar con un caso real en un día es difícil; habría que simularlo con un grupo chico y cuentas creadas por la app.

### 5. Caja transparente del centro cultural

- **Para quién:** un centro cultural, biblioteca popular o asociación de feriantes.
- **Problema (documentado en parte):** los espacios independientes están en crisis de financiamiento y dependen de aportes de socios y vecinos, que quieren saber en qué se gasta.
- **Qué hace:** la caja común es una cuenta que solo mueve fondos con la firma de varios miembros. Cualquiera ve entradas, salidas y para qué fue cada gasto.
- **En Stellar:** cuenta multifirma nativa, sin contrato propio, más una vista pública de movimientos.
- **Por qué blockchain:** la transparencia no depende de que el tesorero publique una planilla.
- **Con Mercado Pago:** la cuenta es de una sola persona o de una entidad con CUIT, y solo su titular ve los movimientos y puede moverlos. No existe la firma conjunta ni la vista pública. Muchos espacios chicos no tienen personería jurídica, así que hoy usan la cuenta personal de alguien.
- **Factibilidad:** alta.
- **Riesgo:** técnicamente es simple; el jurado puede verlo como poca integración. Conviene sumar un contrato de presupuesto por rubros. Los que firman necesitan cuenta (son pocos y se los puede acompañar); los socios aportan por el medio de siempre y solo miran la caja, sin cuenta.

### 6. Sello de origen para la feria

- **Para quién:** artesanos de la Plaza de las Artes de Mendoza (150 puestos) y turistas que compran.
- **Problema (documentado en parte):** productos industriales se venden como artesanales y el turista no puede distinguirlos.
- **Qué hace:** la asociación de artesanos, que ya fiscaliza los puestos, emite un certificado por pieza. El comprador escanea el QR y ve quién la hizo, con qué técnica y dónde.
- **En Stellar:** certificado como NFT (estándar SEP-50) emitido solo por la cuenta de la asociación.
- **Por qué blockchain:** el certificado no se puede falsificar ni duplicar, y sigue a la pieza si se regala o revende.
- **Con Mercado Pago:** no aplica, porque el problema no es el cobro sino la autenticidad. La alternativa real es una base de datos de la asociación con un QR. Funciona, pero el comprador tiene que confiar en que nadie la editó y el certificado no se puede traspasar a otro dueño.
- **Factibilidad:** media-alta.
- **Riesgo:** el dato más fuerte que encontré (95% de productos en serie) viene de una nota sin fecha clara. Hay que confirmarlo con los artesanos. A favor: el comprador solo escanea y lee, sin cuenta; la única que necesita una es la asociación.

### 7. Preventa de un disco, fanzine o corto

- **Para quién:** una banda, editorial o realizador que necesita plata para producir.
- **Problema (conocido):** las plataformas de financiamiento colectivo cobran comisión alta, pagan tarde y no garantizan que el proyecto se entregue.
- **Qué hace:** la gente compra por adelantado. La plata se libera por etapas (grabación, mezcla, entrega) y quien compró recibe un comprobante que después canjea por la obra.
- **En Stellar:** escrow por etapas más un token de comprobante.
- **Por qué blockchain:** fondos retenidos sin plataforma intermediaria y comprobante verificable.
- **Con Mercado Pago:** la preventa simple ya se hace hoy con un link de pago, y funciona. Lo que falta es la retención por etapas y la devolución si el proyecto no avanza: el comprador paga y queda a la buena fe del artista. Si el público confía en el artista, Mercado Pago alcanza.
- **Factibilidad:** media.
- **Riesgo:** es la más genérica; cuesta responder "si le sacás el eje, ¿sigue igual?". Además cada comprador necesita cuenta para algo que hoy paga con un link de Mercado Pago.

### 8. Pasaporte cultural del circuito

- **Para quién:** talleres, galerías y bodegas con arte de una zona (por ejemplo, Chacras de Coria) y sus visitantes.
- **Problema (conocido):** los espacios chicos no tienen cómo derivarse público entre sí ni medir quién los visita.
- **Qué hace:** el visitante junta sellos en cada espacio y, al completar el circuito, obtiene un beneficio en cualquiera de ellos.
- **En Stellar:** cada sello es un token emitido por el espacio; un contrato verifica el circuito completo.
- **Por qué blockchain:** espacios independientes comparten un sistema sin que uno sea dueño de los datos.
- **Con Mercado Pago:** no tiene sellos ni programas de fidelidad compartidos entre comercios distintos. Pero la alternativa real es una app común con base de datos, que resuelve casi todo. Es la idea donde menos diferencia hace la blockchain.
- **Factibilidad:** media.
- **Riesgo:** la justificación de blockchain es la más discutible de la lista, y cada visitante necesita una cuenta para juntar sellos.

### 9. Regalía por reventa de obra

- **Para quién:** artistas plásticos que venden obra física.
- **Problema (documentado):** Argentina no tiene ley de derecho de participación; el artista no cobra nada cuando su obra se revende más cara.
- **Qué hace:** cada obra tiene un certificado digital. Al transferirlo en una reventa, un porcentaje va automáticamente al artista.
- **En Stellar:** NFT con regalía en el contrato de transferencia.
- **Por qué blockchain:** la regalía se ejecuta sola, sin ley ni sociedad de gestión.
- **Con Mercado Pago:** no se puede. Mercado Pago no sabe que una venta es una reventa ni quién fue el autor original, y no puede desviar un porcentaje a un tercero que no participa de la operación.
- **Factibilidad:** media en lo técnico.
- **Riesgo:** nada obliga a revender la obra física junto con el certificado, y no se puede validar una reventa real en un día. Cada comprador de la cadena necesita una cuenta.

### 10. Archivo oral del barrio

- **Para quién:** un barrio o comunidad con archivo en riesgo (casetes, VHS, fotos, relatos de vecinos mayores).
- **Problema (documentado):** los archivos comunitarios se pierden por falta de fondos y de estructura.
- **Qué hace:** los vecinos suben relatos y fotos; cada pieza queda con sello de fecha y autor. Quien quiera puede aportar para sostener el archivo.
- **En Stellar:** hash de cada pieza anclado en cadena y aportes a una cuenta común.
- **Por qué blockchain:** prueba de que el registro existía y no fue alterado.
- **Con Mercado Pago:** los aportes se resuelven perfectamente con un link de pago. El sello de fecha y autoría no tiene equivalente, pero es la parte menos urgente del problema.
- **Factibilidad:** alta, pero la integración es delgada.
- **Riesgo:** el archivo en sí vive fuera de la cadena, así que la blockchain resuelve la parte menos urgente del problema.

### 11. Linaje de oficios

- **Para quién:** maestros artesanos (telar, cerámica, luthería, talabartería) y sus aprendices.
- **Problema (conocido):** los oficios se transmiten sin ningún registro; cuando el maestro muere, se pierde quién enseñó qué a quién.
- **Qué hace:** el maestro emite una constancia a cada aprendiz. Se arma un árbol público del oficio en la región.
- **En Stellar:** constancias intransferibles emitidas desde la cuenta del maestro.
- **Por qué blockchain:** la constancia la firma el maestro, no una institución, y no se pierde.
- **Con Mercado Pago:** no aplica, no hay pagos. La alternativa es un sitio web con el árbol del oficio, que depende de que alguien lo mantenga.
- **Factibilidad:** media.
- **Riesgo:** deseo más que dolor; hay que confirmar que a alguien le importa lo suficiente como para usarlo. Los maestros suelen ser gente mayor: la cuenta tiene que crearse sola o con ayuda de un tercero.

### 12. Cachet asegurado con reparto al elenco

- **Para quién:** elencos, bandas y técnicos contratados para una fiesta o ciclo (por ejemplo, las Vendimias departamentales de Mendoza) y quien los contrata.
- **Problema (documentado):** se actúa primero y se cobra meses después, a veces sin contrato firmado. Cuando se paga, la plata suele llegar a un representante que después reparte.
- **Qué hace:** el organizador deposita el cachet antes de la función. Después del show se libera y le llega a cada artista y técnico su parte, sin pasar por nadie.
- **En Stellar:** escrow de Trustless Work fondeado antes del evento. El escrow multi-release permite un receptor distinto por etapa, lo que serviría para pagarle a cada persona; hay que confirmarlo en la documentación antes de diseñar sobre eso. Si no alcanza, un contrato repartidor propio.
- **Por qué blockchain:** el artista ve que la plata existe antes de subir al escenario, y nadie puede retenerla ni repartirla distinto de lo acordado.
- **Con Mercado Pago:** no se puede. No retiene un pago hasta que ocurra el show ni lo reparte entre veinte personas, y en pesos el cachet pierde valor mientras espera.
- **Factibilidad:** alta. Es el mismo componente que la idea 1.
- **Riesgo:** un organismo público no va a depositar por adelantado; el primer usuario realista es un organizador privado (bar, productora, bodega con ciclo de música). Todos los artistas necesitan cuenta, pero están registrados y tienen el mejor motivo posible: cobrar.

### 13. Archivo del barrio con guardianes

- **Para quién:** un barrio o comunidad con relatos, fotos y grabaciones en riesgo, y los vecinos referentes que los cuidan.
- **Problema (documentado en parte):** los archivos comunitarios se pierden por falta de estructura, y cuando una institución los recoge, la comunidad deja de decidir qué se publica. Quien cuenta su historia no tiene cómo dejar asentado para qué la autoriza.
- **Qué hace:** cualquiera propone una pieza. Entra al archivo cuando la aprueban varios guardianes, junto con el consentimiento de quien la aportó (qué uso permite, y la posibilidad de retirarlo). El público recorre el archivo sin registrarse.
- **En Stellar:** contrato que guarda el hash de cada pieza, las aprobaciones de los guardianes y el estado del consentimiento. Los archivos van fuera de la cadena.
- **Por qué blockchain:** el control es compartido entre los guardianes y no de quien administra el servidor, y el consentimiento queda con fecha y firma.
- **Con Mercado Pago:** no aplica, no es un problema de pagos. La alternativa es un sitio con un administrador, que es justo la dependencia que se quiere evitar.
- **Factibilidad:** media-alta. Reemplaza a la idea 10 con una integración menos delgada.
- **Riesgo:** sigue siendo el proyecto que menos hace en cadena. Los guardianes pueden ser gente mayor: hay que acompañarlos en la prueba.

### 14. Fondo con rendición por etapas para un espacio cultural

- **Para quién:** un centro cultural, biblioteca popular o colectivo que recibe plata de un sponsor, una fundación o un mecenas, incluso de afuera del país.
- **Problema (conocido):** quien financia no sabe si la plata se usó para lo prometido, y el espacio recibe los fondos tarde y en pesos que ya perdieron valor.
- **Qué hace:** quien financia deposita el total. El espacio lo recibe por etapas (compra de materiales, armado, inauguración) cuando sube el comprobante de cada una. Cualquiera puede ver en qué se gastó.
- **En Stellar:** escrow multi-release de Trustless Work y una vista pública de las etapas.
- **Por qué blockchain:** el fondo está comprometido desde el día uno y no depende de la voluntad de quien financia; la rendición es pública sin que nadie arme un informe.
- **Con Mercado Pago:** no retiene un fondo contra rendición, no muestra los movimientos a terceros y no recibe aportes del exterior.
- **Factibilidad:** alta. Es la versión con un solo aportante de la idea 4, que evita tener que crearle cuenta a cada vecino.
- **Riesgo:** para validar hace falta alguien dispuesto a financiar, difícil de conseguir en un día. Sin un espacio concreto se vuelve un escrow de subsidios genérico.

## Stellar frente a Mercado Pago, en general

El jurado va a preguntar "¿por qué no lo hicieron con Mercado Pago?". La respuesta honesta es que para cobrar en pesos a un argentino, Mercado Pago es mejor: todos lo tienen y no hay nada que instalar. Stellar solo se justifica cuando el proyecto necesita algo de esta lista:

| Necesidad | Mercado Pago | Stellar |
|---|---|---|
| Retener plata hasta que se cumpla una condición | No, salvo que la app la guarde | Sí, con escrow |
| Que nadie pueda tocar la plata retenida | No: la tiene el titular de la cuenta | Sí: la tiene el contrato |
| Repartir un pago entre varios automáticamente | Solo vendedor y plataforma | Sí, entre los que se definan |
| Caja compartida con firma de varios | No | Sí, multifirma nativa |
| Movimientos visibles para cualquiera | No | Sí |
| Cobrar a alguien sin cuenta argentina | Limitado | Sí |
| Guardar valor durante semanas sin inflación | No, es en pesos | Sí, en USDC |
| Certificados o registros que no dependen de un servidor | No | Sí |
| Que el público pague sin instalar nada | Sí | No |

Las condiciones de Mercado Pago (comisiones, plazos de acreditación, pagos de extranjeros, alcance de la división de cobros) cambian seguido y no las verifiqué contra su documentación actual. Hay que revisarlas antes de afirmarlas frente al jurado.

**Conclusión por idea:**

- **Mercado Pago no puede hacerlo:** 1 (encargo por etapas), 4 (vaquita), 5 (caja transparente), 9 (regalía), 12 (cachet asegurado), 14 (fondo con rendición).
- **No es un problema de pagos:** 6 (sello de origen), 11 (linaje de oficios), 13 (archivo con guardianes).
- **Mercado Pago resuelve buena parte:** la propina de la 2, 3 (gorra), 7 (preventa), 8 (pasaporte), los aportes de la 10 (archivo oral).

## Problema transversal: la wallet es una barrera para todos

Un muralista, el dueño de un comercio o un vecino no saben qué es una wallet, no tienen una y no van a instalar una extensión ni anotar doce palabras para probar una app. Esto afecta a **todas** las ideas, incluida la 1: que alguien tenga motivo para usar el producto no significa que vaya a superar ese paso. Si la prueba con alguien de afuera empieza con "instalá Freighter", fracasa.

La regla de diseño es que **el usuario nunca vea la blockchain**: entra como en cualquier app, ve montos y estados ("depositado", "etapa aprobada", "pagado"), y la wallet existe por detrás sin que tenga que saberlo.

Hay tres barreras distintas, no una:

| Barrera | Qué le pasa al usuario | Cómo se resuelve |
|---|---|---|
| Crear la cuenta | No sabe qué es una wallet ni una frase semilla | La app le crea la cuenta al registrarse |
| Pagar comisiones de red | No tiene XLM ni sabe qué es | La app paga las comisiones por él (fee sponsorship) |
| Entrar y salir de pesos | No tiene USDC ni sabe cómo conseguirlo o cobrarlo | En producción, un anchor que convierte pesos a USDC y viceversa; en el hackathon se simula |

### Opciones para crear la cuenta

1. **Cuenta creada por la app, con ingreso por mail (recomendada para el hackathon).** Al registrarse, el servidor genera la cuenta de Stellar y firma por el usuario. Es lo más rápido de construir y funciona seguro con Trustless Work. El costo: la app custodia las claves, y hay que decirlo sin vueltas en el pitch. El escrow sigue siendo real: la plata retenida la tiene el contrato, no la app.
2. **Cuenta con passkey (huella o Face ID).** El usuario es dueño de su cuenta sin frase semilla. Es la respuesta más fuerte ante el jurado, pero no verifiqué que el escrow de Trustless Work acepte este tipo de cuenta como firmante. Hay que probarlo antes de comprometerse. Skill instalada: `.agents/skills/dapp/smart-accounts.md`.
3. **Freighter u otra wallet externa.** Dejarla como opción para quien ya la tenga, nunca como único camino.

### Qué decir sobre los pesos

En testnet no hay conversión real a pesos. Lo honesto es fondear las cuentas de prueba con USDC de testnet, mostrar en la interfaz el paso "pagar con transferencia" y "retirar a mi CBU" como simulado, y explicar que en producción lo cubre un anchor. No hay que presentarlo como si funcionara.

### Cómo cambia esto la elección

- La idea 1 sigue siendo la mejor ubicada: son solo dos usuarios, registrados, con una operación de monto alto. Vale la pena crearles una cuenta.
- Las ideas donde paga un desconocido de paso (3 gorra, la propina de la 2) son las más castigadas: nadie se registra para dejar una propina, y ahí Mercado Pago gana.
- Las ideas donde muchos tienen que tener cuenta (4 vaquita, 7 preventa, 8 pasaporte, 9 regalía) son difíciles de validar en un día.
- En las ideas 2, 6 y 13 el público solo **lee** escaneando un QR, sin cuenta. Solo el emisor necesita una.
- Las ideas 12 y 14 siguen el mismo patrón que la 1: pocos usuarios registrados, con un motivo fuerte para tener cuenta.

## Combinaciones que suman

- **1 + 2:** el encargo genera la página del mural con todo el proceso ya documentado. Es la combinación más fuerte: cubre los tres ejes con un solo producto.
- **3 + 5:** la gorra del show alimenta la caja transparente del centro cultural donde se toca. Hereda el problema de la gorra: el público no tiene wallet.
- **6 + 11:** el sello de la pieza enlaza al linaje del artesano que la hizo. Suma memoria a un proyecto de territorio sin agregar usuarios con cuenta.
- **1 + 12:** mismo escrow, dos públicos (muralistas y elencos). Sirve como visión a futuro en el pitch, no para construir las dos cosas.

## Fuentes de los problemas documentados

- [San Martín debe 30 millones a 280 artistas y técnicos de Vendimia (Los Andes, 2025)](https://www.losandes.com.ar/sociedad/san-martin-les-debe-30-millones-los-artistas-vendimia-y-promete-pagarlos-10-dias-n5941377)
- [Reclamo por falta de pago a artistas en Mendoza (Sitio Andino, 2015)](https://www.sitioandino.com.ar/n/173330-reclamo-en-el-ministerio-de-cultura-por-falta-de-pago-a-los-artistas)
- [Colectivo de muralistas MuraMe (Unidiversidad)](https://www.unidiversidad.com.ar/pintar-el-espacio-publico-una-conquista-para-muralistas-mendocinas)
- [Eliminación de los murales del nudo vial (El Sol)](https://www.elsol.com.ar/el-sol/polemica-por-la-eliminacion-de-los-murales-del-nudo-vial/)
- [Plaza de las Artes, 150 puestos (Gobierno de Mendoza)](https://www.mendoza.gov.ar/catalogoeconomiasocial/plaza-de-las-artes/)
- [Proyecto sobre la Expo Feria Artesanal de Empedrado (Cámara de Diputados de Corrientes)](https://hcdcorrientes.gov.ar/wp-content/uploads/2026/07/Expte-20170.pdf)
- [Asociación Plaza de las Artes y reapertura de la feria (Unidiversidad, 2020)](https://www.unidiversidad.com.ar/volvieron-los-artesanos-a-la-plaza-independencia-fue-dificil-golpeamos-muchas-puertas89)
- [Productos en serie en ferias regionales (La Nación, sin fecha clara)](https://www.lanacion.com.ar/lifestyle/made-in-argentina-nid212736)
- [Centros culturales barriales en crisis (Tiempo Argentino)](https://www.tiempoar.com.ar/ta_article/cultura-barrios-resistencia-crisis/)
- [Archivo Inundación, Santa Fe (Wikimedia)](https://meta.wikimedia.org/wiki/Grants:Programs/Wikimedia_Community_Fund/Rapid_Fund/Digitalizar,_documentar_y_compartir._La_experiencia_de_Archivo_Inundaci%C3%B3n_-_20_a%C3%B1os_como_un_camino_posible_para_construir_archivos_comunitarios_en_Wikimedia_(ID:_22965753))
- [Derecho de reventa en Latinoamérica (Harvard ILJ)](https://journals.law.harvard.edu/ilj/2025/02/the-artists-resale-right-in-latin-america-developments-challenges-and-perspectives)
- [Documentación de Trustless Work](https://docs.trustlesswork.com/trustless-work/llms-full.txt)
- [NFTs y SEP-50 en Meridian 2025 (Stellar)](https://stellar.org/blog/ecosystem/art-smart-contracts-nfts-at-meridian-2025)
