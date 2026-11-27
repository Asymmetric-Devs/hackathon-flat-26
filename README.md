# Hackathon FLAT 2026 · BAF × Stellar

Edición virtual · **26 al 28 de noviembre de 2026** · Transmitida desde el Museo de Arte Moderno de Mendoza, abierta a toda Argentina.

Sitio oficial: https://sincoordenada-argentina.netlify.app/

## Datos clave

| | |
|---|---|
| **Entrega final** | Sábado 28 de noviembre, **23:59**, en **Apex** (después no se reciben proyectos) |
| **Modalidad** | Virtual, todo el país |
| **Equipos** | 2 a 5 personas |
| **Premios** | 1° 500 USDC · 2° 300 USDC |
| **Después** | Acompañamiento de BAF, Instawards y Stellar Community Fund para los mejores proyectos |
| **Avisos** | Grupo de WhatsApp: https://chat.whatsapp.com/HuvDTmvUMeo08Xp00uC01B |

## Cronograma

1. **Jueves 26**: inscripción (obligatoria), grupo de WhatsApp, ver la grabación del kickoff, armar equipo.
2. **Viernes 27**: construir con mentorías (producto y técnica).
3. **Sábado 28**: probar la app con alguien de afuera del equipo y entregar en Apex antes de las 23:59.

## El reto

Construir en equipo **una app que funcione, que haga algo real en Stellar y que alguien de afuera ya haya probado**. No maquetas ni slides.

El proyecto debe conectar con al menos uno de tres ejes, y construirse para una persona, comunidad o lugar concreto:

- **Arte**: crear, mostrar, vender o financiar obra (artes visuales, música, diseño, performance, cine).
- **Memoria**: guardar, proteger o transmitir historias, saberes y patrimonio de una comunidad.
- **Territorio**: fortalecer la economía y la cultura de un lugar concreto (barrio, feria, ciudad, región).

**Pregunta guía:** ¿Qué cambia para una persona o comunidad concreta cuando esto existe? Si le sacás el eje y el proyecto sigue igual, todavía no está conectado. Un buen proyecto no dice "para artistas", dice "para muralistas de Mendoza que venden a turistas extranjeros".

## Criterios de evaluación (25% cada uno)

1. **Problema real**: ¿existe un problema o deseo real? ¿El equipo entiende para quién construye y por qué importa?
2. **Conexión con los ejes**: ¿nace del arte, la memoria o el territorio? Si le sacás el eje, ¿deja de tener sentido?
3. **Producto y validación**: ¿funciona y es claro? ¿Lo probó alguien de afuera y qué aprendieron?
4. **Ejecución técnica**: ¿funciona, hace algo real en Stellar y la integración tiene sentido?

**Desempate:** mejor puntaje en ejecución técnica; si sigue empatado, producto y validación.
**Jurado:** jueces del ecosistema Stellar y del mundo del arte y la tecnología. Un juez que mentoreó a un equipo no lo puntúa.

## Checklist de entrega en Apex (según los briefings en `docs/`)

Plataforma: https://stellarapex.org/ (registrarse, crear proyecto, **publicarlo en "FLAT Stellar 2026"** y dejarlo **público** antes del cierre).

- [ ] Alcance y modelo de negocio claros, y justificación de **por qué blockchain**
- [ ] Al menos **un componente existente de Stellar** (ej. Trustless Work para escrow); si se reconstruye algo, justificarlo
- [ ] App funcionando en **testnet** (no solo en local)
- [ ] Al menos **un hash de transacción** en testnet, verificable en https://stellar.expert
- [ ] **Video público de 2 a 3 minutos**
- [ ] README del repo: qué es, modelo de negocio, por qué blockchain, beneficios para el usuario
- [ ] Prueba con alguien de afuera del equipo y qué se aprendió
- [ ] Haber consultado **Raven** (el jurado espera verlo): ¿ya existe algo así en Stellar?

Lo que mira el jurado en el código: costo de recursos (lo mínimo en cadena, el resto off-chain), tipos de storage (instance / persistent / temporary + TTL), autorizaciones por función, eventos, tests.

Sábado 28: tres equipos presentan en vivo. Ganadores por track (Stellar y Hedera), anunciados la semana siguiente.

Stack: Rust, Stellar CLI, Node, Docker, Stellar Scaffold (`stellar scaffold init mi-proyecto`). Ver `docs/Stellar Hackathon.docx` para links.

## Skills instaladas

Instaladas con `npx skills add https://github.com/stellar/stellar-dev-skill` en `.agents/skills/` (enlazadas en `.claude/skills/`):

`agentic-payments`, `assets`, `cross-chain`, `dapp`, `data`, `smart-contracts`, `standards`, `zk-proofs`.

También se usan las skills de Matt Pocock (plugin `mattpocock-skills`: `grilling`, `tdd`, `research`, `prototype`, `diagnosing-bugs`, etc.).

## Estructura del repo

```
.agents/skills/   skills de Stellar
.claude/skills/   symlinks para Claude Code
skills-lock.json  versiones de skills
```
