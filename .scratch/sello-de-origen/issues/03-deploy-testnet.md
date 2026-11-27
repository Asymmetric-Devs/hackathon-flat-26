# Script de despliegue en testnet

Status: resolved
Blocked by: 02

Script que genera y fondea la cuenta de la asociación (friendbot), compila, despliega con el constructor y escribe web/.env.local. Idempotente respecto de la clave: si ya existe ASSOCIATION_SECRET, la reutiliza.

## Answer

`scripts/deploy-testnet.sh` (Git Bash): reutiliza `ASSOCIATION_SECRET` de `web/.env.local` o genera una cuenta nueva y la fondea con friendbot, compila y despliega con `admin`, `base_uri=${PUBLIC_BASE_URL:-http://localhost:3100}/p/`, `name="Oficio · Origen verificado"`, `symbol="OFICIO"`; actualiza las claves de `.env.local` sin tocar otras, y `PANEL_PASSWORD` solo si falta. Reintenta friendbot y el deploy ante errores de red.
Contrato vigente: `CCY2TQH574SYQYEY66ENE3FNU2ZWSMSPF7GZIOYPRVM7A7V4VEWNRV3C`, admin `GBZU3JNWXNYUR67EGMGAXVDXLJPJ5EFJJFQYISADYSQZJ324DJDACPI5`. La prueba con datos (register_artisan x2, issue, piece 1) se hizo en `CDEKBKKVFP5TIT7LW2JSO64ECEGHOHFNURD7UHWWAICUN4LFBE4DGTPT`, que queda descartado.
