#![cfg(test)]
extern crate std;

use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, Events as _, Ledger as _, MockAuth, MockAuthInvoke},
    Address, BytesN, Env, Event as _, IntoVal, String,
};
use stellar_tokens::non_fungible::Mint;

use crate::{Artisan, ArtisanRegistered, Error, Piece, PieceIssued, PieceRevoked, Sello, SelloClient};

const BASE_URI: &str = "http://localhost:3100/p/";

fn setup() -> (Env, Address, Address, SelloClient<'static>) {
    let env = Env::default();
    env.ledger().set_timestamp(1_700_000_000);
    let admin = Address::generate(&env);
    let id = env.register(
        Sello,
        (
            admin.clone(),
            String::from_str(&env, BASE_URI),
            String::from_str(&env, "Oficio · Origen verificado"),
            String::from_str(&env, "OFICIO"),
        ),
    );
    let client = SelloClient::new(&env, &id);
    (env, admin, id, client)
}

fn h(env: &Env, b: u8) -> BytesN<32> {
    BytesN::from_array(env, &[b; 32])
}

#[test]
fn constructor_sets_admin_counters_and_metadata() {
    let (env, admin, _, c) = setup();
    assert_eq!(c.admin(), admin);
    assert_eq!(c.artisan_count(), 0);
    assert_eq!(c.piece_count(), 0);
    assert_eq!(c.name(), String::from_str(&env, "Oficio · Origen verificado"));
    assert_eq!(c.symbol(), String::from_str(&env, "OFICIO"));
}

#[test]
fn register_without_and_with_master() {
    let (env, _, _, c) = setup();
    env.mock_all_auths();

    let a1 = c.register_artisan(&h(&env, 1), &None);
    assert_eq!(a1, 1);
    let a2 = c.register_artisan(&h(&env, 2), &Some(a1));
    assert_eq!(a2, 2);
    assert_eq!(c.artisan_count(), 2);

    assert_eq!(
        c.artisan(&1),
        Artisan { meta_hash: h(&env, 1), master: None, registered_at: 1_700_000_000 }
    );
    assert_eq!(
        c.artisan(&2),
        Artisan { meta_hash: h(&env, 2), master: Some(1), registered_at: 1_700_000_000 }
    );
}

#[test]
fn register_with_missing_master_fails() {
    let (env, _, _, c) = setup();
    env.mock_all_auths();
    assert_eq!(c.try_register_artisan(&h(&env, 1), &Some(7)), Err(Ok(Error::MasterNotFound)));
    assert_eq!(c.artisan_count(), 0);
}

#[test]
fn missing_artisan_and_piece_reads_fail() {
    let (_, _, _, c) = setup();
    assert_eq!(c.try_artisan(&1), Err(Ok(Error::ArtisanNotFound)));
    assert_eq!(c.try_piece(&1), Err(Ok(Error::PieceNotFound)));
}

#[test]
fn issue_stores_piece_and_mints_nft_to_admin() {
    let (env, admin, _, c) = setup();
    env.mock_all_auths();
    let a = c.register_artisan(&h(&env, 1), &None);

    env.ledger().set_timestamp(1_700_000_500);
    let p = c.issue(&a, &h(&env, 10), &h(&env, 11));
    assert_eq!(p, 1);
    assert_eq!(c.piece_count(), 1);
    assert_eq!(
        c.piece(&1),
        Piece {
            artisan: a,
            photo_hash: h(&env, 10),
            meta_hash: h(&env, 11),
            issued_at: 1_700_000_500,
            revoked: false,
        }
    );

    // NFT: id = id de la pieza, dueño = admin.
    assert_eq!(c.owner_of(&1), admin);
    assert_eq!(c.balance(&admin), 1);
    assert_eq!(c.token_uri(&1), String::from_str(&env, "http://localhost:3100/p/1"));

    let p2 = c.issue(&a, &h(&env, 12), &h(&env, 13));
    assert_eq!(p2, 2);
    assert_eq!(c.owner_of(&2), admin);
    assert_eq!(c.balance(&admin), 2);
}

#[test]
fn issue_with_missing_artisan_fails() {
    let (env, _, _, c) = setup();
    env.mock_all_auths();
    assert_eq!(c.try_issue(&1, &h(&env, 10), &h(&env, 11)), Err(Ok(Error::ArtisanNotFound)));
    assert_eq!(c.piece_count(), 0);
}

#[test]
fn revoke_and_double_revoke() {
    let (env, _, _, c) = setup();
    env.mock_all_auths();
    let a = c.register_artisan(&h(&env, 1), &None);
    let p = c.issue(&a, &h(&env, 10), &h(&env, 11));

    c.revoke(&p);
    assert!(c.piece(&p).revoked);
    assert_eq!(c.try_revoke(&p), Err(Ok(Error::AlreadyRevoked)));
    assert_eq!(c.try_revoke(&99), Err(Ok(Error::PieceNotFound)));
}

#[test]
fn events_are_emitted() {
    let (env, admin, id, c) = setup();
    env.mock_all_auths();

    c.register_artisan(&h(&env, 1), &None);
    assert_eq!(
        env.events().all(),
        std::vec![ArtisanRegistered { id: 1, master: None }.to_xdr(&env, &id)]
    );

    c.register_artisan(&h(&env, 2), &Some(1));
    assert_eq!(
        env.events().all(),
        std::vec![ArtisanRegistered { id: 2, master: Some(1) }.to_xdr(&env, &id)]
    );

    c.issue(&2, &h(&env, 10), &h(&env, 11));
    assert_eq!(
        env.events().all(),
        std::vec![
            Mint { to: admin.clone(), token_id: 1 }.to_xdr(&env, &id),
            PieceIssued { id: 1, artisan: 2 }.to_xdr(&env, &id),
        ]
    );

    c.revoke(&1);
    assert_eq!(env.events().all(), std::vec![PieceRevoked { id: 1 }.to_xdr(&env, &id)]);
}

/// Sin `mock_all_auths`: cada escritura exige la firma exacta del admin, y una
/// firma de otra cuenta no alcanza.
#[test]
fn writes_require_admin_auth() {
    let (env, admin, id, c) = setup();
    let intruder = Address::generate(&env);

    // Sin ninguna auth: las tres escrituras fallan.
    assert!(c.try_register_artisan(&h(&env, 1), &None).is_err());
    assert!(c.try_issue(&1, &h(&env, 10), &h(&env, 11)).is_err());
    assert!(c.try_revoke(&1).is_err());

    // Firma de otra cuenta: falla.
    env.mock_auths(&[MockAuth {
        address: &intruder,
        invoke: &MockAuthInvoke {
            contract: &id,
            fn_name: "register_artisan",
            args: (h(&env, 1), None::<u32>).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    assert!(c.try_register_artisan(&h(&env, 1), &None).is_err());
    assert_eq!(c.artisan_count(), 0);

    // Firma del admin, específica para cada llamada: funciona.
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &id,
            fn_name: "register_artisan",
            args: (h(&env, 1), None::<u32>).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    assert_eq!(c.register_artisan(&h(&env, 1), &None), 1);
    let auths = env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, admin);
    match &auths[0].1.function {
        AuthorizedFunction::Contract((cid, f, _)) => {
            assert_eq!(cid, &id);
            assert_eq!(f, &soroban_sdk::Symbol::new(&env, "register_artisan"));
        }
        _ => panic!("auth inesperada"),
    }

    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &id,
            fn_name: "issue",
            args: (1u32, h(&env, 10), h(&env, 11)).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    assert_eq!(c.issue(&1, &h(&env, 10), &h(&env, 11)), 1);
    assert_eq!(env.auths()[0].0, admin);

    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &id,
            fn_name: "revoke",
            args: (1u32,).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    c.revoke(&1);
    assert_eq!(env.auths()[0].0, admin);
    assert!(c.piece(&1).revoked);

    // Una firma de admin para `issue` no sirve para `revoke`.
    env.mock_auths(&[MockAuth {
        address: &admin,
        invoke: &MockAuthInvoke {
            contract: &id,
            fn_name: "issue",
            args: (1u32, h(&env, 10), h(&env, 11)).into_val(&env),
            sub_invokes: &[],
        },
    }]);
    assert!(c.try_revoke(&1).is_err());
}

#[test]
fn writes_extend_ttl() {
    use soroban_sdk::testutils::storage::Persistent as _;
    let (env, _, id, c) = setup();
    env.mock_all_auths();
    c.register_artisan(&h(&env, 1), &None);
    c.issue(&1, &h(&env, 10), &h(&env, 11));
    let (ta, tp) = env.as_contract(&id, || {
        (
            env.storage().persistent().get_ttl(&crate::DataKey::Artisan(1)),
            env.storage().persistent().get_ttl(&crate::DataKey::Piece(1)),
        )
    });
    assert!(ta >= 100 * 17_280);
    assert!(tp >= 100 * 17_280);
}
