#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    Env, String,
};

// Unidades chicas para que la matemática sea legible:
// día = 100 s, gracia = 2 días (200 s), precio 1000, tarifa 10/día, depósito 50.
const DAY: u64 = 100;
const GRACE: u64 = 200;
const PRICE: i128 = 1_000;
const RATE: i128 = 10;
const DEPOSIT: i128 = 50;
const T0: u64 = 1_000;

struct S {
    e: Env,
    muro: MuroClient<'static>,
    tok: TokenClient<'static>,
    artist: Address,
    venue: Address,
    guest: Address,
    contract: Address,
}

fn setup() -> S {
    let e = Env::default();
    e.mock_all_auths();
    e.ledger().set_timestamp(T0);
    let admin = Address::generate(&e);
    let sac = e.register_stellar_asset_contract_v2(admin);
    let tok = TokenClient::new(&e, &sac.address());
    let mint = StellarAssetClient::new(&e, &sac.address());
    let contract = e.register(Muro, (sac.address(), DAY, 2u32));
    let muro = MuroClient::new(&e, &contract);
    let artist = Address::generate(&e);
    let venue = Address::generate(&e);
    let guest = Address::generate(&e);
    mint.mint(&venue, &100_000);
    mint.mint(&guest, &100_000);
    S { e, muro, tok, artist, venue, guest, contract }
}

impl S {
    fn publish(&self) -> u32 {
        self.muro.publish(&self.artist, &PRICE, &RATE, &DEPOSIT, &String::from_str(&self.e, "manet-bar"))
    }
    fn at(&self, t: u64) {
        self.e.ledger().set_timestamp(t);
    }
    fn bal(&self, a: &Address) -> i128 {
        self.tok.balance(a)
    }
}

// --- publish ---------------------------------------------------------------------------------

#[test]
fn publish_creates_work() {
    let s = setup();
    let id = s.publish();
    assert_eq!(id, 0);
    assert_eq!(s.muro.count(), 1);
    let w = s.muro.work(&id);
    assert_eq!(w.status, Status::Available);
    assert_eq!(w.owner, s.artist);
    assert_eq!((w.price, w.rate, w.deposit), (PRICE, RATE, DEPOSIT));
    assert_eq!(s.muro.lease(&id), None);
    assert_eq!(s.muro.config(), (s.tok.address.clone(), DAY, 2));
    // el siguiente id es 1
    assert_eq!(s.publish(), 1);
}

#[test]
fn publish_validation() {
    let s = setup();
    let m = String::from_str(&s.e, "x");
    assert_eq!(s.muro.try_publish(&s.artist, &0, &RATE, &DEPOSIT, &m), Err(Ok(Error::BadAmount)));
    assert_eq!(s.muro.try_publish(&s.artist, &PRICE, &0, &DEPOSIT, &m), Err(Ok(Error::BadAmount)));
    assert_eq!(s.muro.try_publish(&s.artist, &PRICE, &RATE, &-1, &m), Err(Ok(Error::BadAmount)));
    let empty = String::from_str(&s.e, "");
    assert_eq!(s.muro.try_publish(&s.artist, &PRICE, &RATE, &DEPOSIT, &empty), Err(Ok(Error::BadMeta)));
    // depósito 0 es válido
    assert!(s.muro.try_publish(&s.artist, &PRICE, &RATE, &0, &m).is_ok());
    assert_eq!(s.muro.count(), 1);
}

#[test]
#[should_panic]
fn constructor_rejects_zero_day() {
    let e = Env::default();
    let t = Address::generate(&e);
    e.register(Muro, (t, 0u64, 1u32));
}

// --- hang ------------------------------------------------------------------------------------

#[test]
fn hang_transfers_deposit_and_prepaid() {
    let s = setup();
    let id = s.publish();
    let before = s.bal(&s.venue);
    s.muro.hang(&s.venue, &id, &5);
    assert_eq!(s.bal(&s.venue), before - DEPOSIT - 5 * RATE);
    assert_eq!(s.bal(&s.contract), DEPOSIT + 5 * RATE);
    let l = s.muro.lease(&id).unwrap();
    assert_eq!(l.venue, s.venue);
    assert_eq!((l.start, l.from, l.prepaid, l.paid, l.deposit, l.ended_at), (T0, T0, 50, 0, DEPOSIT, 0));
    assert_eq!(s.muro.work(&id).status, Status::Hung);
}

#[test]
fn hang_rejects_zero_days_missing_and_double_lease() {
    let s = setup();
    let id = s.publish();
    assert_eq!(s.muro.try_hang(&s.venue, &id, &0), Err(Ok(Error::BadAmount)));
    assert_eq!(s.muro.try_hang(&s.venue, &99, &1), Err(Ok(Error::NotFound)));
    s.muro.hang(&s.venue, &id, &1);
    let other = Address::generate(&s.e);
    assert_eq!(s.muro.try_hang(&other, &id, &1), Err(Ok(Error::BadState)));
    assert_eq!(s.muro.try_hang(&s.venue, &id, &1), Err(Ok(Error::BadState)));
}

#[test]
fn hang_overflow_is_rejected() {
    let s = setup();
    let id = s.muro.publish(&s.artist, &PRICE, &(i128::MAX / 2), &0, &String::from_str(&s.e, "big"));
    assert_eq!(s.muro.try_hang(&s.venue, &id, &10), Err(Ok(Error::BadAmount)));
}

// --- accrual / claim -------------------------------------------------------------------------

#[test]
fn accrual_math_and_rounding() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &5);
    assert_eq!(s.muro.accrued(&id), 0);
    s.at(T0 + 10); // 10*10/100 = 1
    assert_eq!(s.muro.accrued(&id), 1);
    s.at(T0 + 19); // 190/100 = 1,9 -> 1 (hacia abajo)
    assert_eq!(s.muro.accrued(&id), 1);
    s.at(T0 + 250); // 2,5 días -> 25
    assert_eq!(s.muro.accrued(&id), 25);
    // tope por prepaid (50) aunque pasen 10 días
    s.at(T0 + 1_000);
    assert_eq!(s.muro.accrued(&id), 50);
    // obra no colgada
    let id2 = s.publish();
    assert_eq!(s.muro.accrued(&id2), 0);
    assert_eq!(s.muro.try_accrued(&77), Err(Ok(Error::NotFound)));
}

#[test]
fn claim_pays_artist_and_advances_from_without_overcharging() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &5);
    s.at(T0 + 19); // devengado 1 (exacto serían 1,9)
    assert_eq!(s.muro.claim(&id), 1);
    assert_eq!(s.bal(&s.artist), 1);
    let l = s.muro.lease(&id).unwrap();
    assert_eq!((l.prepaid, l.paid), (49, 1));
    assert_eq!(l.from, T0 + 10); // avanza 1*100/10 = 10 s, no 19: el resto no se pierde
    // 9 s sobrantes cuentan para el próximo claim: a T0+20 ya hay 1 más
    s.at(T0 + 20);
    assert_eq!(s.muro.accrued(&id), 1);
    assert_eq!(s.muro.claim(&id), 1);
    assert_eq!(s.bal(&s.artist), 2);
    // claim sin nada devengado: 0 y sin cambios
    assert_eq!(s.muro.claim(&id), 0);
    // la contabilidad cierra: custodia = depósito + prepaid restante
    assert_eq!(s.bal(&s.contract), DEPOSIT + 48);
}

#[test]
fn claim_is_permissionless_and_noop_when_not_hung() {
    let s = setup();
    let id = s.publish();
    assert_eq!(s.muro.claim(&id), 0); // Available
    assert_eq!(s.muro.try_claim(&5), Err(Ok(Error::NotFound)));
    s.muro.hang(&s.venue, &id, &3);
    s.at(T0 + 100);
    // sin mock de auth de nadie en particular: cualquiera la llama (mock_all_auths no exige
    // que el llamador sea venue/artista; la función no pide require_auth).
    assert_eq!(s.muro.claim(&id), 10);
    assert_eq!(s.bal(&s.artist), 10);
}

#[test]
fn claim_stops_at_prepaid_and_never_exceeds_it() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &2); // prepaid 20
    s.at(T0 + 10_000);
    assert_eq!(s.muro.claim(&id), 20);
    assert_eq!(s.muro.lease(&id).unwrap().prepaid, 0);
    assert_eq!(s.muro.claim(&id), 0);
    assert_eq!(s.bal(&s.artist), 20);
    assert_eq!(s.bal(&s.contract), DEPOSIT);
    assert_eq!(s.muro.work(&id).status, Status::Hung);
}

// --- venta automática ------------------------------------------------------------------------

#[test]
fn claim_completing_price_sells_automatically() {
    let s = setup();
    let id = s.publish();
    let venue0 = s.bal(&s.venue);
    // prepaid 120 días = 1200 > precio 1000: sobran 200 que se reembolsan
    s.muro.hang(&s.venue, &id, &120);
    s.at(T0 + 100 * 100); // 100 días -> 1000 devengados
    assert_eq!(s.muro.claim(&id), PRICE);
    let w = s.muro.work(&id);
    assert_eq!(w.status, Status::Sold);
    assert_eq!(w.owner, s.venue);
    assert_eq!(s.bal(&s.artist), PRICE);
    // el venue pagó solo el precio: depósito y prepaid sobrante vuelven
    assert_eq!(s.bal(&s.venue), venue0 - PRICE);
    assert_eq!(s.bal(&s.contract), 0);
    assert_eq!(s.muro.lease(&id), None);
    let h = s.muro.history(&id);
    assert_eq!(h.len(), 1);
    let r = h.get(0).unwrap();
    assert_eq!(r.outcome, Outcome::Bought);
    assert_eq!(r.paid, PRICE);
    assert_eq!(r.venue, s.venue);
    assert_eq!((r.start, r.end), (T0, T0 + 10_000));
    // la obra vendida es terminal
    assert_eq!(s.muro.try_hang(&s.venue, &id, &1), Err(Ok(Error::BadState)));
    assert_eq!(s.muro.claim(&id), 0);
}

#[test]
fn accrued_is_capped_at_remaining_price() {
    let s = setup();
    let id = s.muro.publish(&s.artist, &100, &RATE, &0, &String::from_str(&s.e, "cheap"));
    s.muro.hang(&s.venue, &id, &50); // prepaid 500, precio 100
    s.at(T0 + 5_000);
    assert_eq!(s.muro.accrued(&id), 100);
    assert_eq!(s.muro.claim(&id), 100);
    assert_eq!(s.muro.work(&id).status, Status::Sold);
    assert_eq!(s.bal(&s.contract), 0);
}

#[test]
fn buy_now_after_partial_accrual() {
    let s = setup();
    let id = s.publish();
    let venue0 = s.bal(&s.venue);
    let artist0 = s.bal(&s.artist);
    s.muro.hang(&s.venue, &id, &10); // prepaid 100
    s.at(T0 + 300); // 3 días devengados = 30 (sin claim previo)
    s.muro.buy_now(&s.venue, &id);
    let w = s.muro.work(&id);
    assert_eq!((w.status, w.owner.clone()), (Status::Sold, s.venue.clone()));
    assert_eq!(s.bal(&s.artist) - artist0, PRICE);
    assert_eq!(s.bal(&s.venue), venue0 - PRICE); // total gastado = precio exacto
    assert_eq!(s.bal(&s.contract), 0);
    let r = s.muro.history(&id).get(0).unwrap();
    assert_eq!((r.outcome, r.paid), (Outcome::Bought, PRICE));
}

#[test]
fn buy_now_requires_venue_and_hung() {
    let s = setup();
    let id = s.publish();
    assert_eq!(s.muro.try_buy_now(&s.venue, &id), Err(Ok(Error::BadState)));
    s.muro.hang(&s.venue, &id, &1);
    let other = Address::generate(&s.e);
    assert_eq!(s.muro.try_buy_now(&other, &id), Err(Ok(Error::Unauthorized)));
}

// --- top_up ----------------------------------------------------------------------------------

#[test]
fn top_up_extends_prepaid() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &1);
    let b = s.bal(&s.venue);
    s.muro.top_up(&s.venue, &id, &4);
    assert_eq!(s.bal(&s.venue), b - 40);
    assert_eq!(s.muro.lease(&id).unwrap().prepaid, 50);
    assert_eq!(s.bal(&s.contract), DEPOSIT + 50);
    // validaciones
    assert_eq!(s.muro.try_top_up(&s.venue, &id, &0), Err(Ok(Error::BadAmount)));
    let other = Address::generate(&s.e);
    assert_eq!(s.muro.try_top_up(&other, &id, &1), Err(Ok(Error::Unauthorized)));
    let id2 = s.publish();
    assert_eq!(s.muro.try_top_up(&s.venue, &id2, &1), Err(Ok(Error::BadState)));
}

#[test]
fn top_up_prevents_seize() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &1); // runout = T0+100
    s.at(T0 + 100 + GRACE - 1);
    s.muro.top_up(&s.venue, &id, &10);
    s.at(T0 + 100 + GRACE);
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::Early)));
}

// --- stop / confirm_return -------------------------------------------------------------------

#[test]
fn stop_refunds_unspent_prepaid_and_retains_deposit() {
    let s = setup();
    let id = s.publish();
    let venue0 = s.bal(&s.venue);
    s.muro.hang(&s.venue, &id, &10); // prepaid 100
    s.at(T0 + 250); // 25 devengados
    s.muro.stop(&s.venue, &id);
    assert_eq!(s.bal(&s.artist), 25);
    // venue: gastó 25 de alquiler + depósito retenido
    assert_eq!(s.bal(&s.venue), venue0 - 25 - DEPOSIT);
    assert_eq!(s.bal(&s.contract), DEPOSIT);
    let l = s.muro.lease(&id).unwrap();
    assert_eq!((l.prepaid, l.paid, l.ended_at), (0, 25, T0 + 250));
    assert_eq!(s.muro.work(&id).status, Status::Returning);
    // ya no devenga ni se puede stop de nuevo ni top_up
    s.at(T0 + 5_000);
    assert_eq!(s.muro.accrued(&id), 0);
    assert_eq!(s.muro.try_stop(&s.venue, &id), Err(Ok(Error::BadState)));
    assert_eq!(s.muro.try_top_up(&s.venue, &id, &1), Err(Ok(Error::BadState)));
}

#[test]
fn stop_only_by_lease_venue() {
    let s = setup();
    let id = s.publish();
    assert_eq!(s.muro.try_stop(&s.venue, &id), Err(Ok(Error::BadState)));
    s.muro.hang(&s.venue, &id, &1);
    let other = Address::generate(&s.e);
    assert_eq!(s.muro.try_stop(&other, &id), Err(Ok(Error::Unauthorized)));
}

#[test]
fn stop_that_completes_price_is_a_sale() {
    let s = setup();
    let id = s.muro.publish(&s.artist, &100, &RATE, &DEPOSIT, &String::from_str(&s.e, "c"));
    let venue0 = s.bal(&s.venue);
    s.muro.hang(&s.venue, &id, &50);
    s.at(T0 + 10_000);
    s.muro.stop(&s.venue, &id);
    assert_eq!(s.muro.work(&id).status, Status::Sold);
    assert_eq!(s.bal(&s.venue), venue0 - 100);
    assert_eq!(s.bal(&s.artist), 100);
}

#[test]
fn confirm_return_refunds_deposit_and_records_history() {
    let s = setup();
    let id = s.publish();
    let venue0 = s.bal(&s.venue);
    s.muro.hang(&s.venue, &id, &10);
    s.at(T0 + 300);
    s.muro.stop(&s.venue, &id);
    s.at(T0 + 400);
    s.muro.confirm_return(&s.artist, &id);
    assert_eq!(s.bal(&s.venue), venue0 - 30); // solo pagó 3 días
    assert_eq!(s.bal(&s.artist), 30);
    assert_eq!(s.bal(&s.contract), 0);
    assert_eq!(s.muro.work(&id).status, Status::Available);
    assert_eq!(s.muro.lease(&id), None);
    let r = s.muro.history(&id).get(0).unwrap();
    assert_eq!(
        r,
        Record { venue: s.venue.clone(), start: T0, end: T0 + 300, paid: 30, outcome: Outcome::Returned }
    );
    // disponible otra vez
    s.muro.hang(&s.venue, &id, &1);
}

#[test]
fn confirm_return_auth_and_state() {
    let s = setup();
    let id = s.publish();
    assert_eq!(s.muro.try_confirm_return(&s.artist, &id), Err(Ok(Error::BadState)));
    s.muro.hang(&s.venue, &id, &1);
    s.muro.stop(&s.venue, &id);
    // ni el venue ni un tercero pueden "confirmar" (y llevarse el depósito)
    assert_eq!(s.muro.try_confirm_return(&s.venue, &id), Err(Ok(Error::Unauthorized)));
    let other = Address::generate(&s.e);
    assert_eq!(s.muro.try_confirm_return(&other, &id), Err(Ok(Error::Unauthorized)));
}

// --- seize -----------------------------------------------------------------------------------

#[test]
fn seize_when_prepaid_runs_out_after_grace() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &3); // prepaid 30, runout = T0+300, seizable desde T0+500
    s.at(T0 + 300 + GRACE - 1);
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::Early)));
    s.at(T0 + 300 + GRACE);
    s.muro.seize(&s.artist, &id);
    assert_eq!(s.bal(&s.artist), 30 + DEPOSIT); // alquiler devengado + depósito
    assert_eq!(s.bal(&s.contract), 0);
    assert_eq!(s.muro.work(&id).status, Status::Lost);
    let r = s.muro.history(&id).get(0).unwrap();
    assert_eq!((r.outcome, r.paid), (Outcome::Seized, 30));
    // terminal
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::BadState)));
    assert_eq!(s.muro.try_hang(&s.venue, &id, &1), Err(Ok(Error::BadState)));
}

#[test]
fn seize_runout_accounts_for_prior_claims() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &3);
    s.at(T0 + 100);
    s.muro.claim(&id); // from = T0+100, prepaid 20 -> runout = T0+300 igual
    s.at(T0 + 300 + GRACE - 1);
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::Early)));
    s.at(T0 + 300 + GRACE);
    s.muro.seize(&s.artist, &id);
    assert_eq!(s.bal(&s.artist), 30 + DEPOSIT);
}

#[test]
fn seize_rejected_while_prepaid_remains() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &10);
    s.at(T0 + 500); // todavía quedan 5 días pagados
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::Early)));
}

#[test]
fn seize_after_stop_requires_grace() {
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &10);
    s.at(T0 + 100);
    s.muro.stop(&s.venue, &id); // ended_at = T0+100, devengó 10
    s.at(T0 + 100 + GRACE - 1);
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::Early)));
    s.at(T0 + 100 + GRACE);
    s.muro.seize(&s.artist, &id);
    assert_eq!(s.bal(&s.artist), 10 + DEPOSIT);
    assert_eq!(s.bal(&s.contract), 0);
    assert_eq!(s.muro.work(&id).status, Status::Lost);
    assert_eq!(s.muro.history(&id).get(0).unwrap().outcome, Outcome::Seized);
}

#[test]
fn seize_auth_and_state() {
    let s = setup();
    let id = s.publish();
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::BadState))); // sin lease
    s.muro.hang(&s.venue, &id, &1);
    s.at(T0 + 10_000);
    assert_eq!(s.muro.try_seize(&s.venue, &id), Err(Ok(Error::Unauthorized)));
}

#[test]
fn seize_defers_to_sale_when_prepaid_would_complete_price() {
    let s = setup();
    let id = s.muro.publish(&s.artist, &20, &RATE, &DEPOSIT, &String::from_str(&s.e, "c"));
    s.muro.hang(&s.venue, &id, &3); // prepaid 30 >= precio 20
    s.at(T0 + 10_000);
    assert_eq!(s.muro.try_seize(&s.artist, &id), Err(Ok(Error::BadState)));
    // el depósito no se pierde: claim vende y reembolsa
    s.muro.claim(&id);
    assert_eq!(s.muro.work(&id).status, Status::Sold);
}

// --- tip -------------------------------------------------------------------------------------

#[test]
fn tip_pays_artist_and_accumulates() {
    let s = setup();
    let id = s.publish();
    let g = s.bal(&s.guest);
    s.muro.tip(&s.guest, &id, &25);
    s.muro.tip(&s.venue, &id, &5);
    assert_eq!(s.bal(&s.artist), 30);
    assert_eq!(s.bal(&s.guest), g - 25);
    assert_eq!(s.muro.tips(&id), 30);
    assert_eq!(s.muro.try_tip(&s.guest, &id, &0), Err(Ok(Error::BadAmount)));
    assert_eq!(s.muro.try_tip(&s.guest, &9, &1), Err(Ok(Error::NotFound)));
    assert_eq!(s.muro.tips(&9), 0);
}

// --- auth ------------------------------------------------------------------------------------

fn no_auth_env() -> (Env, MuroClient<'static>, Address, Address) {
    let e = Env::default(); // sin mock_all_auths
    let admin = Address::generate(&e);
    let sac = e.register_stellar_asset_contract_v2(admin);
    let c = e.register(Muro, (sac.address(), DAY, 2u32));
    (e.clone(), MuroClient::new(&e, &c), Address::generate(&e), Address::generate(&e))
}

#[test]
#[should_panic(expected = "Auth")]
fn publish_requires_artist_auth() {
    let (e, m, a, _) = no_auth_env();
    m.publish(&a, &PRICE, &RATE, &DEPOSIT, &String::from_str(&e, "x"));
}

#[test]
#[should_panic(expected = "Auth")]
fn hang_requires_venue_auth() {
    let (e, m, a, v) = no_auth_env();
    e.mock_all_auths();
    let id = m.publish(&a, &PRICE, &RATE, &DEPOSIT, &String::from_str(&e, "x"));
    // quitar mocks: nueva llamada sin autorización
    e.set_auths(&[]);
    m.hang(&v, &id, &1);
}

#[test]
#[should_panic(expected = "Auth")]
fn tip_requires_sender_auth() {
    let (e, m, a, v) = no_auth_env();
    e.mock_all_auths();
    let id = m.publish(&a, &PRICE, &RATE, &DEPOSIT, &String::from_str(&e, "x"));
    e.set_auths(&[]);
    m.tip(&v, &id, &1);
}

// --- historial en varios venues --------------------------------------------------------------

#[test]
fn history_accumulates_across_venues() {
    let s = setup();
    let id = s.publish();
    let v2 = Address::generate(&s.e);
    let v3 = Address::generate(&s.e);
    StellarAssetClient::new(&s.e, &s.tok.address).mint(&v2, &10_000);
    StellarAssetClient::new(&s.e, &s.tok.address).mint(&v3, &10_000);

    // venue 1: devuelve
    s.muro.hang(&s.venue, &id, &2);
    s.at(T0 + 100);
    s.muro.stop(&s.venue, &id);
    s.muro.confirm_return(&s.artist, &id);

    // venue 2: no paga y es embargado
    s.at(T0 + 1_000);
    s.muro.hang(&v2, &id, &1);
    s.at(T0 + 1_000 + 100 + GRACE);
    s.muro.seize(&s.artist, &id);
    // Lost es terminal: el v3 ya no puede. Rehacemos con otra obra para la compra:
    assert_eq!(s.muro.try_hang(&v3, &id, &1), Err(Ok(Error::BadState)));

    let h = s.muro.history(&id);
    assert_eq!(h.len(), 2);
    assert_eq!(h.get(0).unwrap().venue, s.venue);
    assert_eq!(h.get(0).unwrap().outcome, Outcome::Returned);
    assert_eq!(h.get(1).unwrap().venue, v2);
    assert_eq!(h.get(1).unwrap().outcome, Outcome::Seized);
}

#[test]
fn history_returned_then_bought() {
    let s = setup();
    let id = s.publish();
    let v2 = Address::generate(&s.e);
    StellarAssetClient::new(&s.e, &s.tok.address).mint(&v2, &10_000);

    s.muro.hang(&s.venue, &id, &2);
    s.at(T0 + 200);
    s.muro.stop(&s.venue, &id);
    s.muro.confirm_return(&s.artist, &id);

    s.at(T0 + 300);
    s.muro.hang(&v2, &id, &5);
    s.muro.buy_now(&v2, &id);

    let h = s.muro.history(&id);
    assert_eq!(h.len(), 2);
    assert_eq!(h.get(0).unwrap().outcome, Outcome::Returned);
    assert_eq!(h.get(1).unwrap().outcome, Outcome::Bought);
    assert_eq!(h.get(1).unwrap().venue, v2);
    assert_eq!(s.muro.work(&id).owner, v2);
    // el contrato no retiene nada
    assert_eq!(s.bal(&s.contract), 0);
}

#[test]
fn contract_never_holds_more_than_lease_funds() {
    // Barrido de claims irregulares: custodia == depósito + prepaid en todo momento.
    let s = setup();
    let id = s.publish();
    s.muro.hang(&s.venue, &id, &7);
    let mut t = T0;
    for step in [3u64, 17, 41, 99, 1, 250] {
        t += step;
        s.at(t);
        s.muro.claim(&id);
        let l = s.muro.lease(&id).unwrap();
        assert_eq!(s.bal(&s.contract), l.deposit + l.prepaid);
        assert_eq!(s.bal(&s.artist), l.paid);
    }
}
