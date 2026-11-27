# Oficio

*Oficio* es el oficio artesanal y la línea por la que se transmite, de maestro a aprendiz. Es un **certificado de origen para artesanías hechas a mano**, firmado en **Stellar (Soroban)** por la entidad que avala a los artesanos. Quien compra escanea un QR en la pieza y ve quién la hizo, con qué técnica, de quién aprendió el oficio, y la prueba de que la foto y la ficha son las que se firmaron.

Proyecto para la Hackathon FLAT 2026 · BAF × Stellar. Ejes: **territorio** (economía de las ferias artesanales), **memoria** (la línea del oficio de maestro a aprendiz) y **arte** (la obra hecha a mano).

Reglas del hackathon: [docs/hackathon.md](docs/hackathon.md) · Ideas evaluadas: [docs/ideas-proyecto.md](docs/ideas-proyecto.md) · Spec: [.scratch/sello-de-origen/spec.md](.scratch/sello-de-origen/spec.md)

## El problema

En ferias y mercados de artesanías se venden productos industriales como si fueran hechos a mano. Quien compra, sobre todo el turista, no tiene cómo distinguirlos, y el artesano que trabaja a mano compite contra algo más barato. "Artesanal" es una palabra que cualquiera puede poner en una etiqueta.

**Primer caso: Plaza de las Artes, Mendoza.** 150 puestos en Plaza Independencia, desde 1989, con una ordenanza municipal de 1999 y fiscalización semanal. Los artesanos están agrupados en la Asociación Plaza de las Artes. **Prueba con usuarios: artesanos de Corrientes**, donde vive el equipo y donde la artesanía y la producción propia son parte de la cultura local.

## Cómo funciona

1. **El artesano presenta la pieza.** Foto, técnica, materiales. Su ficha dice de quién aprendió el oficio.
2. **La entidad que fiscaliza la avala.** Desde un panel con contraseña emite el certificado. La app firma en Stellar con la cuenta de la entidad: nadie en el panel ve ni maneja una wallet.
3. **Quien compra lo comprueba.** La pieza lleva una etiqueta con QR. La página pública vuelve a calcular la huella (sha256) de la foto y la ficha y la compara con la que quedó en el contrato. Si alguien cambió algo, lo dice.

Estados del certificado: **vigente** (coincide), **revocado** (la entidad lo dio de baja), **no coincide** (la foto o la ficha fueron alteradas).

## Por qué blockchain

El problema no es de pagos, así que la comparación honesta no es con Mercado Pago sino con una base de datos con QR. Esa base funcionaría, pero:

- **Quien compra tendría que confiar en quien administra la base**, que puede editar o borrar cualquier ficha. Acá el certificado lo firma la entidad, queda con fecha cierta y nadie, ni siquiera nosotros, puede cambiarlo después.
- **La línea del oficio queda firmada**: el vínculo maestro-aprendiz está en el contrato, no en un texto editable.
- **El certificado sobrevive a la app**: si Oficio deja de existir, el contrato y su registro siguen en la red y cualquiera puede verificar una pieza.
- **Es un token estándar** (NFT SEP-50 de OpenZeppelin): a futuro puede transferirse al comprador y acompañar a la pieza si se revende.

En cadena va lo mínimo (ids, huellas, vínculo maestro-aprendiz, fechas, estado). Fotos y textos van fuera de la cadena.

## Modelo de negocio (hipótesis)

- **Quien paga:** la entidad que avala (asociación, cooperativa o municipio), con una cuota fija mensual por feria. El costo de red por certificado es de fracciones de centavo de dólar.
- **Qué gana el artesano:** poder cobrar lo que vale una pieza hecha a mano frente a la copia, y una vidriera con su historia.
- **Qué gana la entidad:** que su fiscalización se vea en cada pieza vendida, y un registro del oficio de su región.
- **Escala:** el mismo sistema sirve para cualquier feria o mercado con una entidad que avale a sus artesanos.

## Stack de Stellar usado

**Soroban** (contrato en Rust con constructor, eventos, errores tipados, storage instance/persistent con TTL, autorización por función) · **OpenZeppelin Stellar Contracts** (`stellar-tokens`, NFT no fungible SEP-50) · **Stellar SDK** (TypeScript, firma del lado del servidor) · **Soroban RPC** · **Stellar CLI** · **Stellar Expert**.

## Datos en testnet

_Se completa después de la prueba de punta a punta._

## Arquitectura

```
Panel (contraseña) ──► API Next.js ──firma con la cuenta de la entidad──► contrato `sello` (Soroban, testnet)
                           │                                                 • register_artisan (admin)
                           ▼                                                 • issue → NFT SEP-50 (admin)
                   Almacenamiento (fotos y fichas)                           • revoke (admin)
                           ▲                                                 • artisan / piece (lectura)
Página pública /p/[id] ────┴── recalcula sha256 y compara con lo que lee del contrato
```

- Contrato: [contracts/sello/src/lib.rs](contracts/sello/src/lib.rs) · tests: [contracts/sello/src/test.rs](contracts/sello/src/test.rs)
- Web: [web/](web/) (Next.js 16). El almacenamiento está detrás de una interfaz ([web/src/lib/store/index.ts](web/src/lib/store/index.ts)); hoy es disco local, y pasar a la nube es una implementación nueva de esa interfaz.

## Cómo correrlo

Requisitos: Docker (el contrato se compila y despliega dentro de un contenedor, sin instalar Rust) y Node 20+. Los scripts corren en Git Bash.

```sh
scripts/contract-test.sh       # tests del contrato
scripts/deploy-testnet.sh      # crea y fondea la cuenta de la entidad, despliega y escribe web/.env.local

cd web
npm install
npm run dev -- -p 3100         # http://localhost:3100 · panel en /panel (contraseña en web/.env.local)
```

## Limitaciones (dichas de frente)

- **La app custodia la clave de la entidad.** Es la decisión que permite que nadie vea una wallet. El paso siguiente es una cuenta con passkey o multifirma de la comisión directiva.
- **El QR se puede copiar** y pegar en otra pieza. Lo frena que la página muestra la foto de esa pieza exacta y el puesto; no es infalible.
- **El sello vale lo que vale la fiscalización** que lo respalda.
- **Almacenamiento local:** fotos y fichas viven en el servidor de la demo. Para producción, almacenamiento en la nube detrás de la misma interfaz.
- **No confirmamos quién fiscaliza la feria de Mendoza** (asociación, municipalidad o ambas).
- Testnet únicamente.

## Créditos de imágenes

Fotos de Wikimedia Commons usadas en la portada:

- Tejedoras en la Fiesta Nacional del Poncho, Catamarca. Autor: GtPLzcat89. CC0.
- Artesanías de la Cooperativa de Artesanas Qom. Autor: Ashazam. CC BY-SA 4.0.
- Feria artesanal y comercial de Tilcara, Jujuy. Autora: Eugenialodi. CC BY-SA 4.0.
- Poncho del Bicentenario 2010. Autor: Museo de la Fiesta Nacional del Poncho. CC BY-SA 4.0.

## Uso de IA (declarado)

Construido con **Claude Code** (Anthropic): investigación, spec, contrato, web y documentación. Las decisiones de alcance fueron del equipo.
