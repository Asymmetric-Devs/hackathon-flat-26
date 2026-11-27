//! Oficio · Origen verificado (contrato `sello`).
//!
//! La asociación de artesanos (admin) registra artesanos, con la relación
//! maestro-aprendiz, y emite un certificado por pieza. Cada certificado es un
//! NFT SEP-50 (OpenZeppelin `stellar-tokens`) cuyo id es el id de la pieza,
//! minteado a la cuenta admin. En cadena van solo ids, hashes, fechas y estado.
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address,
    BytesN, Env, String,
};
use stellar_tokens::non_fungible::{Base, NonFungibleToken};

const DAY_IN_LEDGERS: u32 = 17_280;
const BUMP_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const BUMP_TO: u32 = 120 * DAY_IN_LEDGERS;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Artisan {
    /// sha256 de la ficha JSON del artesano.
    pub meta_hash: BytesN<32>,
    /// Id del artesano que le enseñó, si está registrado.
    pub master: Option<u32>,
    /// Timestamp del ledger al registrarlo.
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Piece {
    pub artisan: u32,
    /// sha256 de los bytes de la foto.
    pub photo_hash: BytesN<32>,
    /// sha256 de los bytes de la ficha JSON de la pieza.
    pub meta_hash: BytesN<32>,
    pub issued_at: u64,
    pub revoked: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    ArtisanCount,
    PieceCount,
    Artisan(u32),
    Piece(u32),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    ArtisanNotFound = 1,
    PieceNotFound = 2,
    MasterNotFound = 3,
    AlreadyRevoked = 4,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArtisanRegistered {
    #[topic]
    pub id: u32,
    pub master: Option<u32>,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PieceIssued {
    #[topic]
    pub id: u32,
    #[topic]
    pub artisan: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PieceRevoked {
    #[topic]
    pub id: u32,
}

#[contract]
pub struct Sello;

fn bump_instance(env: &Env) {
    env.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_TO);
}

fn require_admin(env: &Env) -> Address {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth();
    admin
}

fn count(env: &Env, key: &DataKey) -> u32 {
    env.storage().instance().get(key).unwrap_or(0)
}

fn load_artisan(env: &Env, id: u32) -> Option<Artisan> {
    env.storage().persistent().get(&DataKey::Artisan(id))
}

fn load_piece(env: &Env, id: u32) -> Option<Piece> {
    env.storage().persistent().get(&DataKey::Piece(id))
}

fn save_persistent<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(env: &Env, key: &DataKey, value: &V) {
    env.storage().persistent().set(key, value);
    env.storage().persistent().extend_ttl(key, BUMP_THRESHOLD, BUMP_TO);
}

#[contractimpl]
impl Sello {
    pub fn __constructor(env: Env, admin: Address, base_uri: String, name: String, symbol: String) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ArtisanCount, &0u32);
        env.storage().instance().set(&DataKey::PieceCount, &0u32);
        Base::set_metadata(&env, base_uri, name, symbol);
        bump_instance(&env);
    }

    /// Registra un artesano. Ids desde 1. `master` debe existir si se pasa.
    pub fn register_artisan(env: Env, meta_hash: BytesN<32>, master: Option<u32>) -> Result<u32, Error> {
        require_admin(&env);
        if let Some(m) = master {
            if !env.storage().persistent().has(&DataKey::Artisan(m)) {
                return Err(Error::MasterNotFound);
            }
        }
        let id = count(&env, &DataKey::ArtisanCount) + 1;
        let artisan = Artisan { meta_hash, master, registered_at: env.ledger().timestamp() };
        save_persistent(&env, &DataKey::Artisan(id), &artisan);
        env.storage().instance().set(&DataKey::ArtisanCount, &id);
        bump_instance(&env);
        ArtisanRegistered { id, master }.publish(&env);
        Ok(id)
    }

    /// Emite el certificado de una pieza y mintea el NFT con ese id a `admin`.
    pub fn issue(env: Env, artisan: u32, photo_hash: BytesN<32>, meta_hash: BytesN<32>) -> Result<u32, Error> {
        let admin = require_admin(&env);
        if !env.storage().persistent().has(&DataKey::Artisan(artisan)) {
            return Err(Error::ArtisanNotFound);
        }
        let id = count(&env, &DataKey::PieceCount) + 1;
        let piece = Piece {
            artisan,
            photo_hash,
            meta_hash,
            issued_at: env.ledger().timestamp(),
            revoked: false,
        };
        save_persistent(&env, &DataKey::Piece(id), &piece);
        env.storage().instance().set(&DataKey::PieceCount, &id);
        Base::mint_with_id(&env, &admin, id);
        bump_instance(&env);
        PieceIssued { id, artisan }.publish(&env);
        Ok(id)
    }

    /// Revoca un certificado. El NFT queda (el estado vive en `Piece.revoked`).
    pub fn revoke(env: Env, id: u32) -> Result<(), Error> {
        require_admin(&env);
        let mut piece = load_piece(&env, id).ok_or(Error::PieceNotFound)?;
        if piece.revoked {
            return Err(Error::AlreadyRevoked);
        }
        piece.revoked = true;
        save_persistent(&env, &DataKey::Piece(id), &piece);
        bump_instance(&env);
        PieceRevoked { id }.publish(&env);
        Ok(())
    }

    pub fn artisan(env: Env, id: u32) -> Result<Artisan, Error> {
        load_artisan(&env, id).ok_or(Error::ArtisanNotFound)
    }

    pub fn piece(env: Env, id: u32) -> Result<Piece, Error> {
        load_piece(&env, id).ok_or(Error::PieceNotFound)
    }

    pub fn artisan_count(env: Env) -> u32 {
        count(&env, &DataKey::ArtisanCount)
    }

    pub fn piece_count(env: Env) -> u32 {
        count(&env, &DataKey::PieceCount)
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

/// Interfaz NFT SEP-50 de OpenZeppelin: balance, owner_of, transfer,
/// transfer_from, approve, approve_for_all, get_approved, is_approved_for_all,
/// name, symbol, token_uri (= base_uri + id).
#[contractimpl(contracttrait)]
impl NonFungibleToken for Sello {
    type ContractType = Base;
}

#[cfg(test)]
mod test;
