#![no_std]
//! Muro: alquiler diario de obras con depósito en garantía, acreditación hacia la compra
//! ("obra en cuotas") y currículum público de exposiciones.
//!
//! Un contrato por despliegue. Sin admin, sin upgrade, sin comisión.
//!
//! Invariantes de fondos (el contrato solo custodia lo siguiente por obra con lease):
//!   custodia = lease.deposit + lease.prepaid
//! - `prepaid` solo sale hacia el artista (devengado) o de vuelta al venue (stop / venta).
//! - `deposit` solo sale hacia el venue (confirm_return / venta) o hacia el artista (seize).
//! Todas las funciones aplican checks-effects-interactions: primero se escribe el estado y
//! recién después se transfiere. Ninguna transferencia depende de la cooperación del venue:
//! `claim` puede llamarla cualquiera, así que el venue no puede trabar el cobro del artista.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, token,
    Address, Env, String, Vec,
};

// ---------------------------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------------------------

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    BadState = 2,
    BadAmount = 3,
    /// Todavía no transcurrió el plazo necesario (p. ej. gracia de `seize`).
    Early = 4,
    Unauthorized = 5,
    BadMeta = 6,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Status {
    Available,
    Hung,
    Returning,
    Sold,
    Lost,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Outcome {
    Returned,
    Bought,
    Seized,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Work {
    pub id: u32,
    pub artist: Address,
    /// Igual a `artist` hasta la venta.
    pub owner: Address,
    pub price: i128,
    /// Monto por día.
    pub rate: i128,
    pub deposit: i128,
    /// Slug que la web resuelve a título/imagen.
    pub meta: String,
    pub status: Status,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Lease {
    pub venue: Address,
    pub start: u64,
    /// Último instante liquidado.
    pub from: u64,
    /// Alquiler adelantado todavía no cobrado por el artista.
    pub prepaid: i128,
    /// Alquiler ya cobrado por el artista = crédito hacia la compra.
    pub paid: i128,
    pub deposit: i128,
    /// 0 si sigue activo.
    pub ended_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Record {
    pub venue: Address,
    pub start: u64,
    pub end: u64,
    pub paid: i128,
    pub outcome: Outcome,
}

#[contracttype]
enum DataKey {
    // instance
    Token,
    DaySecs,
    GraceDays,
    Count,
    // persistent, por obra
    Work(u32),
    Lease(u32),
    History(u32),
    Tips(u32),
}

// ---------------------------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------------------------

#[contractevent]
pub struct Published {
    #[topic]
    pub work_id: u32,
    pub artist: Address,
    pub price: i128,
    pub rate: i128,
    pub deposit: i128,
}

#[contractevent]
pub struct Hung {
    #[topic]
    pub work_id: u32,
    pub venue: Address,
    pub days: u32,
    pub deposit: i128,
    pub prepaid: i128,
}

#[contractevent]
pub struct Claimed {
    #[topic]
    pub work_id: u32,
    pub amount: i128,
    pub paid: i128,
}

#[contractevent]
pub struct Sold {
    #[topic]
    pub work_id: u32,
    pub venue: Address,
    pub price: i128,
}

#[contractevent]
pub struct Stopped {
    #[topic]
    pub work_id: u32,
    pub settled: i128,
    pub refunded: i128,
}

#[contractevent]
pub struct Returned {
    #[topic]
    pub work_id: u32,
    pub venue: Address,
    pub deposit: i128,
}

#[contractevent]
pub struct Seized {
    #[topic]
    pub work_id: u32,
    pub venue: Address,
    pub deposit: i128,
}

#[contractevent]
pub struct Tipped {
    #[topic]
    pub work_id: u32,
    pub from: Address,
    pub amount: i128,
}

// ---------------------------------------------------------------------------------------------
// TTL
// ---------------------------------------------------------------------------------------------

const DAY_LEDGERS: u32 = 17_280; // ~5 s por ledger
const TTL_THRESHOLD: u32 = 30 * DAY_LEDGERS;
const TTL_EXTEND: u32 = 60 * DAY_LEDGERS;
const MAX_META_LEN: u32 = 64;

// ---------------------------------------------------------------------------------------------
// Almacenamiento
// ---------------------------------------------------------------------------------------------

fn bump_instance(e: &Env) {
    e.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_EXTEND);
}

fn get_work(e: &Env, id: u32) -> Result<Work, Error> {
    e.storage().persistent().get(&DataKey::Work(id)).ok_or(Error::NotFound)
}

fn put_work(e: &Env, w: &Work) {
    let k = DataKey::Work(w.id);
    e.storage().persistent().set(&k, w);
    e.storage().persistent().extend_ttl(&k, TTL_THRESHOLD, TTL_EXTEND);
}

fn find_lease(e: &Env, id: u32) -> Option<Lease> {
    e.storage().persistent().get(&DataKey::Lease(id))
}

fn get_lease(e: &Env, id: u32) -> Result<Lease, Error> {
    find_lease(e, id).ok_or(Error::BadState)
}

fn put_lease(e: &Env, id: u32, l: &Lease) {
    let k = DataKey::Lease(id);
    e.storage().persistent().set(&k, l);
    e.storage().persistent().extend_ttl(&k, TTL_THRESHOLD, TTL_EXTEND);
}

fn history_of(e: &Env, id: u32) -> Vec<Record> {
    e.storage().persistent().get(&DataKey::History(id)).unwrap_or(Vec::new(e))
}

fn push_record(e: &Env, id: u32, r: Record) {
    let mut h = history_of(e, id);
    h.push_back(r);
    let k = DataKey::History(id);
    e.storage().persistent().set(&k, &h);
    e.storage().persistent().extend_ttl(&k, TTL_THRESHOLD, TTL_EXTEND);
}

fn tips_of(e: &Env, id: u32) -> i128 {
    e.storage().persistent().get(&DataKey::Tips(id)).unwrap_or(0)
}

fn token_client(e: &Env) -> token::Client<'_> {
    let addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
    token::Client::new(e, &addr)
}

fn day_secs(e: &Env) -> i128 {
    let d: u64 = e.storage().instance().get(&DataKey::DaySecs).unwrap();
    d as i128
}

fn grace_secs(e: &Env) -> u64 {
    let d: u64 = e.storage().instance().get(&DataKey::DaySecs).unwrap();
    let g: u32 = e.storage().instance().get(&DataKey::GraceDays).unwrap();
    d.saturating_mul(g as u64)
}

/// Transfiere desde el contrato; omite montos cero.
fn pay_out(e: &Env, to: &Address, amount: i128) {
    if amount > 0 {
        token_client(e).transfer(&e.current_contract_address(), to, &amount);
    }
}

// ---------------------------------------------------------------------------------------------
// Matemática de devengo
// ---------------------------------------------------------------------------------------------

/// `min(floor((now-from)*rate/day_secs), prepaid, price-paid)`, nunca negativo.
/// `saturating_mul` es seguro: el resultado se acota enseguida por `prepaid`.
fn calc_accrued(e: &Env, w: &Work, l: &Lease) -> i128 {
    let elapsed = e.ledger().timestamp().saturating_sub(l.from) as i128;
    let raw = elapsed.saturating_mul(w.rate) / day_secs(e);
    raw.min(l.prepaid).min(w.price - l.paid).max(0)
}

/// Liquida lo devengado sobre `l` (solo estado, sin transferir) y devuelve el monto a pagar
/// al artista. `from` avanza lo que "compra" el monto pagado, redondeando hacia abajo: nunca
/// se cobra de más.
fn settle(e: &Env, w: &Work, l: &mut Lease) -> i128 {
    let due = calc_accrued(e, w, l);
    if due > 0 {
        l.prepaid -= due;
        l.paid += due;
        // due*day_secs/rate <= elapsed, entra en u64. Overflow imposible: due <= elapsed*rate/day.
        let advance = due.checked_mul(day_secs(e)).unwrap() / w.rate;
        l.from += advance as u64;
    }
    due
}

/// Efectos de la venta (estado, historial, evento). Devuelve lo que hay que reembolsar al
/// venue (depósito + prepaid sobrante). El llamador transfiere después de este punto.
fn complete_sale(e: &Env, w: &mut Work, l: &Lease) -> i128 {
    w.owner = l.venue.clone();
    w.status = Status::Sold;
    put_work(e, w);
    e.storage().persistent().remove(&DataKey::Lease(w.id));
    push_record(
        e,
        w.id,
        Record {
            venue: l.venue.clone(),
            start: l.start,
            end: e.ledger().timestamp(),
            paid: w.price,
            outcome: Outcome::Bought,
        },
    );
    Sold { work_id: w.id, venue: l.venue.clone(), price: w.price }.publish(e);
    l.deposit + l.prepaid
}

fn require_venue(l: &Lease, venue: &Address) -> Result<(), Error> {
    if &l.venue != venue {
        return Err(Error::Unauthorized);
    }
    Ok(())
}

// ---------------------------------------------------------------------------------------------
// Contrato
// ---------------------------------------------------------------------------------------------

#[contract]
pub struct Muro;

#[contractimpl]
impl Muro {
    pub fn __constructor(e: Env, token: Address, day_secs: u64, grace_days: u32) {
        if day_secs == 0 {
            panic_with_error!(&e, Error::BadAmount);
        }
        let s = e.storage().instance();
        s.set(&DataKey::Token, &token);
        s.set(&DataKey::DaySecs, &day_secs);
        s.set(&DataKey::GraceDays, &grace_days);
        s.set(&DataKey::Count, &0u32);
    }

    pub fn publish(
        e: Env,
        artist: Address,
        price: i128,
        rate: i128,
        deposit: i128,
        meta: String,
    ) -> Result<u32, Error> {
        artist.require_auth();
        if price <= 0 || rate <= 0 || deposit < 0 {
            return Err(Error::BadAmount);
        }
        if meta.len() == 0 || meta.len() > MAX_META_LEN {
            return Err(Error::BadMeta);
        }
        bump_instance(&e);
        let id: u32 = e.storage().instance().get(&DataKey::Count).unwrap();
        e.storage().instance().set(&DataKey::Count, &(id + 1));
        put_work(
            &e,
            &Work {
                id,
                artist: artist.clone(),
                owner: artist.clone(),
                price,
                rate,
                deposit,
                meta,
                status: Status::Available,
            },
        );
        Published { work_id: id, artist, price, rate, deposit }.publish(&e);
        Ok(id)
    }

    pub fn hang(e: Env, venue: Address, work_id: u32, days: u32) -> Result<(), Error> {
        venue.require_auth();
        if days == 0 {
            return Err(Error::BadAmount);
        }
        let mut w = get_work(&e, work_id)?;
        if w.status != Status::Available {
            return Err(Error::BadState);
        }
        let prepaid = w.rate.checked_mul(days as i128).ok_or(Error::BadAmount)?;
        let total = prepaid.checked_add(w.deposit).ok_or(Error::BadAmount)?;
        let now = e.ledger().timestamp();

        // Efectos
        w.status = Status::Hung;
        put_work(&e, &w);
        put_lease(
            &e,
            work_id,
            &Lease {
                venue: venue.clone(),
                start: now,
                from: now,
                prepaid,
                paid: 0,
                deposit: w.deposit,
                ended_at: 0,
            },
        );
        Hung { work_id, venue: venue.clone(), days, deposit: w.deposit, prepaid }.publish(&e);

        // Interacción
        token_client(&e).transfer(&venue, &e.current_contract_address(), &total);
        Ok(())
    }

    pub fn top_up(e: Env, venue: Address, work_id: u32, days: u32) -> Result<(), Error> {
        venue.require_auth();
        if days == 0 {
            return Err(Error::BadAmount);
        }
        let w = get_work(&e, work_id)?;
        if w.status != Status::Hung {
            return Err(Error::BadState);
        }
        let mut l = get_lease(&e, work_id)?;
        require_venue(&l, &venue)?;
        let add = w.rate.checked_mul(days as i128).ok_or(Error::BadAmount)?;
        l.prepaid = l.prepaid.checked_add(add).ok_or(Error::BadAmount)?;
        put_lease(&e, work_id, &l);
        token_client(&e).transfer(&venue, &e.current_contract_address(), &add);
        Ok(())
    }

    pub fn accrued(e: Env, work_id: u32) -> Result<i128, Error> {
        let w = get_work(&e, work_id)?;
        if w.status != Status::Hung {
            return Ok(0);
        }
        let l = get_lease(&e, work_id)?;
        Ok(calc_accrued(&e, &w, &l))
    }

    /// Cualquiera puede llamarla: solo mueve fondos hacia el artista (o al venue en la venta).
    pub fn claim(e: Env, work_id: u32) -> Result<i128, Error> {
        let mut w = get_work(&e, work_id)?;
        if w.status != Status::Hung {
            return Ok(0);
        }
        let mut l = get_lease(&e, work_id)?;
        let due = settle(&e, &w, &mut l);
        if due == 0 {
            return Ok(0);
        }
        Claimed { work_id, amount: due, paid: l.paid }.publish(&e);
        if l.paid == w.price {
            let refund = complete_sale(&e, &mut w, &l);
            pay_out(&e, &w.artist, due);
            pay_out(&e, &l.venue, refund);
        } else {
            put_lease(&e, work_id, &l);
            pay_out(&e, &w.artist, due);
        }
        Ok(due)
    }

    pub fn buy_now(e: Env, venue: Address, work_id: u32) -> Result<(), Error> {
        venue.require_auth();
        let mut w = get_work(&e, work_id)?;
        if w.status != Status::Hung {
            return Err(Error::BadState);
        }
        let mut l = get_lease(&e, work_id)?;
        require_venue(&l, &venue)?;
        let due = settle(&e, &w, &mut l);
        let remaining = w.price - l.paid; // >= 0 por el tope de calc_accrued
        l.paid = w.price;
        let refund = complete_sale(&e, &mut w, &l);
        if due > 0 {
            Claimed { work_id, amount: due, paid: w.price - remaining }.publish(&e);
        }
        pay_out(&e, &w.artist, due);
        if remaining > 0 {
            token_client(&e).transfer(&venue, &w.artist, &remaining);
        }
        pay_out(&e, &venue, refund);
        Ok(())
    }

    pub fn stop(e: Env, venue: Address, work_id: u32) -> Result<(), Error> {
        venue.require_auth();
        let mut w = get_work(&e, work_id)?;
        if w.status != Status::Hung {
            return Err(Error::BadState);
        }
        let mut l = get_lease(&e, work_id)?;
        require_venue(&l, &venue)?;
        let due = settle(&e, &w, &mut l);
        if due > 0 {
            Claimed { work_id, amount: due, paid: l.paid }.publish(&e);
        }
        if l.paid == w.price {
            // Lo devengado completó el precio: es una venta, no una devolución.
            let refund = complete_sale(&e, &mut w, &l);
            pay_out(&e, &w.artist, due);
            pay_out(&e, &venue, refund);
            return Ok(());
        }
        let refund = l.prepaid;
        l.prepaid = 0;
        l.ended_at = e.ledger().timestamp();
        w.status = Status::Returning;
        put_lease(&e, work_id, &l);
        put_work(&e, &w);
        Stopped { work_id, settled: due, refunded: refund }.publish(&e);
        pay_out(&e, &w.artist, due);
        pay_out(&e, &venue, refund);
        Ok(())
    }

    pub fn confirm_return(e: Env, artist: Address, work_id: u32) -> Result<(), Error> {
        artist.require_auth();
        let mut w = get_work(&e, work_id)?;
        if w.artist != artist {
            return Err(Error::Unauthorized);
        }
        if w.status != Status::Returning {
            return Err(Error::BadState);
        }
        let l = get_lease(&e, work_id)?;
        w.status = Status::Available;
        put_work(&e, &w);
        e.storage().persistent().remove(&DataKey::Lease(work_id));
        push_record(
            &e,
            work_id,
            Record {
                venue: l.venue.clone(),
                start: l.start,
                end: l.ended_at,
                paid: l.paid,
                outcome: Outcome::Returned,
            },
        );
        Returned { work_id, venue: l.venue.clone(), deposit: l.deposit }.publish(&e);
        pay_out(&e, &l.venue, l.deposit);
        Ok(())
    }

    pub fn seize(e: Env, artist: Address, work_id: u32) -> Result<(), Error> {
        artist.require_auth();
        let mut w = get_work(&e, work_id)?;
        if w.artist != artist {
            return Err(Error::Unauthorized);
        }
        let mut l = get_lease(&e, work_id)?;
        let now = e.ledger().timestamp();
        let grace = grace_secs(&e);
        let mut payout = 0i128; // prepaid remanente que pasa al artista

        match w.status {
            Status::Hung => {
                // runout = from + prepaid*day_secs/rate; saturamos: "nunca" si desborda.
                let span = l.prepaid.saturating_mul(day_secs(&e)) / w.rate;
                let runout = (l.from as i128).saturating_add(span);
                if (now as i128) < runout.saturating_add(grace as i128) {
                    return Err(Error::Early);
                }
                // Vencido el runout todo el prepaid está devengado. Si cobrarlo completaría el
                // precio, corresponde la venta (claim), no el embargo.
                if l.paid + l.prepaid >= w.price {
                    return Err(Error::BadState);
                }
                payout = l.prepaid;
                l.paid += payout;
                l.prepaid = 0;
            }
            Status::Returning => {
                if now < l.ended_at.saturating_add(grace) {
                    return Err(Error::Early);
                }
            }
            _ => return Err(Error::BadState),
        }

        let deposit = l.deposit;
        l.deposit = 0;
        l.ended_at = now;
        w.status = Status::Lost;
        put_work(&e, &w);
        put_lease(&e, work_id, &l);
        push_record(
            &e,
            work_id,
            Record {
                venue: l.venue.clone(),
                start: l.start,
                end: now,
                paid: l.paid,
                outcome: Outcome::Seized,
            },
        );
        Seized { work_id, venue: l.venue.clone(), deposit }.publish(&e);
        pay_out(&e, &artist, payout + deposit);
        Ok(())
    }

    pub fn tip(e: Env, from: Address, work_id: u32, amount: i128) -> Result<(), Error> {
        from.require_auth();
        if amount <= 0 {
            return Err(Error::BadAmount);
        }
        let w = get_work(&e, work_id)?;
        let total = tips_of(&e, work_id).checked_add(amount).ok_or(Error::BadAmount)?;
        let k = DataKey::Tips(work_id);
        e.storage().persistent().set(&k, &total);
        e.storage().persistent().extend_ttl(&k, TTL_THRESHOLD, TTL_EXTEND);
        Tipped { work_id, from: from.clone(), amount }.publish(&e);
        token_client(&e).transfer(&from, &w.artist, &amount);
        Ok(())
    }

    // --- vistas ---

    pub fn work(e: Env, id: u32) -> Result<Work, Error> {
        get_work(&e, id)
    }

    pub fn lease(e: Env, id: u32) -> Option<Lease> {
        find_lease(&e, id)
    }

    pub fn history(e: Env, id: u32) -> Vec<Record> {
        history_of(&e, id)
    }

    pub fn count(e: Env) -> u32 {
        e.storage().instance().get(&DataKey::Count).unwrap_or(0)
    }

    pub fn tips(e: Env, id: u32) -> i128 {
        tips_of(&e, id)
    }

    pub fn config(e: Env) -> (Address, u64, u32) {
        let s = e.storage().instance();
        (
            s.get(&DataKey::Token).unwrap(),
            s.get(&DataKey::DaySecs).unwrap(),
            s.get(&DataKey::GraceDays).unwrap(),
        )
    }
}

mod test;
