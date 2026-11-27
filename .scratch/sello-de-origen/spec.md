# Spec: Hilo · sello de origen con historia del oficio (MVP)

Proyecto C de [docs/ideas-proyecto.md](../../docs/ideas-proyecto.md). Nombre de trabajo: **Hilo**.

## Objetivo del MVP

Una demo que funcione de punta a punta en Stellar testnet: la asociación de artesanos registra artesanos (con quién les enseñó el oficio) y emite un certificado por pieza; el comprador escanea un QR y ve la pieza, el artesano, la línea del oficio y la verificación en cadena. Todo conectado de verdad; lo único local es el almacenamiento de fotos y fichas, detrás de una interfaz reemplazable.

**Por confirmar con usuarios:** existe la Asociación Plaza de las Artes (representante en 2020: Adriana Lois), y la feria se rige por la Ordenanza Municipal 3.382/15436/99 de la Ciudad de Mendoza, con fiscalización semanal (viernes 15 h). No está confirmado si fiscaliza la asociación, la municipalidad o ambas. El emisor del certificado es "la entidad que fiscaliza"; en la app se nombra como la asociación.

Fuera del MVP: transferir el certificado a la wallet del comprador, varias asociaciones, edición de fichas, hosting en la nube (queda preparado, no hecho).

## Usuarios

- **Fiscalizador de la asociación**: entra al panel con contraseña. Registra artesanos y emite certificados. Nunca ve una wallet: la app firma con la clave de la asociación guardada en el servidor.
- **Comprador o visitante**: abre la página pública de la pieza desde el QR, sin registrarse.

## Arquitectura

```
web/ (Next.js, App Router, TypeScript)
  panel (contraseña) ──► API del servidor ──► firma con ASSOCIATION_SECRET ──► contrato `sello` en testnet
                              │
                              └──► store local (web/.data/): fichas JSON y fotos
  página pública /p/[id] ──► lee el certificado del contrato (simulación) + archivos del store
                          └──► recalcula los hashes y muestra si coinciden
contracts/sello/ (Rust, soroban-sdk 28 + OpenZeppelin stellar-tokens 0.8, NFT SEP-50)
docker/ imagen con Rust + stellar-cli para compilar, testear y desplegar sin instalar nada en Windows
```

En cadena va lo mínimo: ids, hashes, relación maestro-aprendiz, fechas y estado. Fotos y textos van fuera de la cadena; su hash en el contrato prueba que no se editaron.

## Contrato `sello`

Base: NFT no fungible de OpenZeppelin (`stellar-tokens` 0.8, estándar SEP-50). Cada certificado es un token cuyo id es el id de la pieza, minteado a la cuenta de la asociación. Si la integración con OpenZeppelin no compila, se cae a un contrato propio con la misma interfaz de abajo y se documenta por qué.

### Constructor

`__constructor(admin: Address, base_uri: String, name: String, symbol: String)`

- `admin`: cuenta de la asociación. Única que puede escribir.
- `base_uri`: URL base de la página pública (`<PUBLIC_BASE_URL>/p/`), usada como metadata del NFT.

### Tipos

```rust
#[contracttype]
pub struct Artisan {
    pub meta_hash: BytesN<32>,   // sha256 de la ficha JSON del artesano
    pub master: Option<u32>,     // id del artesano que le enseñó, si está registrado
    pub registered_at: u64,      // timestamp del ledger
}

#[contracttype]
pub struct Piece {
    pub artisan: u32,
    pub photo_hash: BytesN<32>,  // sha256 de los bytes de la foto
    pub meta_hash: BytesN<32>,   // sha256 de los bytes de la ficha JSON de la pieza
    pub issued_at: u64,
    pub revoked: bool,
}
```

### Funciones

| Función | Auth | Comportamiento |
|---|---|---|
| `register_artisan(meta_hash, master: Option<u32>) -> u32` | admin | Ids desde 1. Falla con `MasterNotFound` si `master` no existe. Emite `ArtisanRegistered`. |
| `issue(artisan: u32, photo_hash, meta_hash) -> u32` | admin | Ids desde 1. Falla con `ArtisanNotFound`. Mintea el NFT con ese id a `admin`. Emite `PieceIssued`. |
| `revoke(id: u32)` | admin | Marca `revoked = true`. Falla con `PieceNotFound` o `AlreadyRevoked`. Emite `PieceRevoked`. |
| `artisan(id) -> Artisan` | — | Falla con `ArtisanNotFound`. |
| `piece(id) -> Piece` | — | Falla con `PieceNotFound`. |
| `artisan_count() -> u32`, `piece_count() -> u32`, `admin() -> Address` | — | Lecturas. |
| Interfaz NFT de OpenZeppelin | según la librería | `owner_of`, `balance`, `name`, `symbol`, `token_uri`, etc. |

### Errores

`ArtisanNotFound = 1`, `PieceNotFound = 2`, `MasterNotFound = 3`, `AlreadyRevoked = 4`.

### Eventos

- `ArtisanRegistered { #[topic] id: u32, master: Option<u32> }`
- `PieceIssued { #[topic] id: u32, #[topic] artisan: u32 }`
- `PieceRevoked { #[topic] id: u32 }`

### Storage

- Instance: admin, contadores, metadata del NFT. TTL extendido en cada escritura.
- Persistent: `Artisan(u32)`, `Piece(u32)`. TTL extendido al escribir.

### Tests

Registro con y sin maestro, maestro inexistente, emisión, artesano inexistente, revocación y doble revocación, auth requerida en las tres escrituras (sin `mock_all_auths` en al menos un test), eventos emitidos, dueño del NFT igual a admin.

## Hashes fuera de la cadena

- `photo_hash` = sha256 de los bytes exactos del archivo de foto guardado.
- `meta_hash` = sha256 de los bytes exactos del archivo JSON guardado. El JSON se guarda tal cual se hasheó; nunca se re-serializa para verificar.

## Ficha del artesano (JSON)

`{ "name", "craft", "stall", "city", "bio", "learnedFrom": { "artisanId"?: number, "name": string, "note"?: string }, "since": number }`

`learnedFrom.artisanId` se usa como `master` en el contrato cuando el maestro está registrado; si no, queda solo el nombre (memoria del oficio aunque el maestro no esté en la app).

## Ficha de la pieza (JSON)

`{ "title", "technique", "materials", "year", "story", "artisanId" }`

## Web

### Rutas públicas

- `/`: qué es Hilo, cómo se verifica una pieza, para quién es (artesanos de la Plaza de las Artes, Mendoza).
- `/p/[id]`: foto, título, técnica y materiales, artesano y puesto, línea del oficio (maestro → artesano), y bloque de verificación: estado (vigente, revocado, alterado), hashes en cadena vs recalculados, enlaces a la transacción y al contrato en stellar.expert.
- `/a/[id]`: perfil del artesano, línea del oficio hacia atrás y hacia adelante (aprendices), piezas certificadas.

### Panel (`/panel`, protegido por `PANEL_PASSWORD` en cookie httpOnly)

- Lista de artesanos y piezas.
- Alta de artesano: nombre, oficio, puesto, ciudad, bio, de quién aprendió (artesano registrado o nombre libre), desde qué año.
- Emisión de certificado: artesano, foto, título, técnica, materiales, año, historia.
- Después de emitir: etiqueta imprimible con QR hacia `/p/[id]` (`/p/[id]/etiqueta`).
- Revocar un certificado.

### API (servidor)

- `POST /api/login`, `POST /api/logout`
- `POST /api/artisans` (form) → registra en cadena, guarda ficha, devuelve `{ id, txHash }`
- `POST /api/pieces` (multipart) → guarda foto y ficha, emite en cadena, devuelve `{ id, txHash }`
- `POST /api/pieces/[id]/revoke`
- `GET /api/files/[...path]` sirve fotos del store local

### Store

Interfaz única en `web/src/lib/store/` (guardar y leer fichas, fotos y registros con `txHash`). Implementación local en `web/.data/` (ignorado por git). Cambiar a Vercel Blob u otro servicio = nueva implementación de la misma interfaz.

### Configuración (`web/.env.local`, ignorado por git)

`STELLAR_RPC_URL`, `STELLAR_NETWORK_PASSPHRASE`, `SELLO_CONTRACT_ID`, `ASSOCIATION_SECRET`, `PANEL_PASSWORD`, `PUBLIC_BASE_URL`. Un `web/.env.example` documenta cada una.

## Diseño

Referencia de calidad (no de estilo): la página ganadora del ideathon. Dirección propia: **ficha de catálogo de archivo / rótulo de museo**. Papel cálido, tinta casi negra, filetes finos, una sola tinta de acento color lacre (el sello). Tipografía serif editorial para contenido y monoespaciada para números de catálogo y datos en cadena. Sin gradientes, sin glassmorphism, sin emojis como íconos, sin sombras difusas. Mucho aire, grilla estricta, jerarquía por tamaño y peso, no por color. Claro y oscuro.

## Criterios de aceptación

1. Contrato desplegado en testnet con tests pasando; id del contrato en `.env.local`.
2. Desde el panel se registra un artesano con maestro y se emite un certificado; ambas operaciones producen un hash de transacción verificable en stellar.expert.
3. La página pública muestra "vigente" cuando los hashes coinciden, "alterado" si se edita la ficha guardada a mano y "revocado" tras revocar.
4. La etiqueta con QR se imprime y el QR abre la página pública.
5. `npm run build` pasa en `web/`. La página funciona a 400px de ancho.
6. Hay un script que, desde cero, genera y fondea la cuenta de la asociación, compila, despliega y escribe `.env.local`.
