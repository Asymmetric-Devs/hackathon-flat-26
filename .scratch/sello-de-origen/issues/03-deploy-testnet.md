# Script de despliegue en testnet

Status: ready-for-agent
Blocked by: 02

Script que genera y fondea la cuenta de la asociación (friendbot), compila, despliega con el constructor y escribe web/.env.local. Idempotente respecto de la clave: si ya existe ASSOCIATION_SECRET, la reutiliza.
