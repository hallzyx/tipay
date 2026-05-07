// ============================================================
// Tipay Smart Contract — Unit Tests
// ============================================================

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{token, Address, Env};

/// Helper: generates a unique test address.
fn addr(env: &Env) -> Address {
    Address::generate(env)
}

/// Helper: creates three unique participant addresses.
fn three_addrs(env: &Env) -> Vec<Address> {
    Vec::from_array(env, [addr(env), addr(env), addr(env)])
}

/// Helper: deploys, registers a real SAC, and initializes the contract.
/// Returns (client, owner, token_sac, participants).
fn setup(
    env: &Env,
) -> (TipayContractClient, Address, Address, Vec<Address>) {
    env.mock_all_auths();

    let contract_id = env.register(TipayContract, ());
    let client = TipayContractClient::new(env, &contract_id);

    let owner = Address::generate(env);
    let token_admin = Address::generate(env);

    // Register a real Stellar Asset Contract for testing
    let token_sac_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_sac = token_sac_contract.address();

    client.initialize(&owner, &token_sac);

    let participants = three_addrs(env);

    // Mint XLM to all participants so they can deposit
    let sac_admin = token::StellarAssetClient::new(env, &token_sac);
    let mint_amount: i128 = 100_000_000i128; // 10 XLM each
    for p in &participants {
        sac_admin.mint(&p, &mint_amount);
    }
    // Also mint to owner
    sac_admin.mint(&owner, &mint_amount);

    (client, owner, token_sac, participants)
}

/// Helper: creates a session and returns session_id.
fn create_default_session(
    client: &TipayContractClient,
    host: &Address,
    participants: &Vec<Address>,
) -> u64 {
    client.create_session(
        host,
        &(10_000_000i128), // 1 XLM in stroops
        &1000u64,          // deadline
        &300u64,           // voting period
        participants,
    )
}

// ── Initialization ────────────────────────────────────────

#[test]
fn test_initialize_sets_owner() {
    let env = Env::default();
    let (client, owner, token_sac, _) = setup(&env);

    assert_eq!(client.session_count(), 0);
    let sac = client.token_sac_address();
    assert_eq!(sac, token_sac);
}

#[test]
#[should_panic]
fn test_initialize_twice_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TipayContract, ());
    let client = TipayContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_sac_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_sac = token_sac_contract.address();

    client.initialize(&owner, &token_sac);
    client.initialize(&owner, &token_sac); // should panic
}

// ── create_session ────────────────────────────────────────

#[test]
fn test_create_session_ok() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let sid = create_default_session(&client, &host, &participants);
    assert_eq!(sid, 0);

    let session = client.get_session(&sid);
    assert_eq!(session.host, host);
    assert_eq!(session.amount, 10_000_000i128);
    assert_eq!(session.deadline, 1000u64);
    assert_eq!(session.voting_period, 300u64);
    assert_eq!(session.finalized, false);
    assert_eq!(session.active, false);
    assert_eq!(session.participant_count, 3);
}

#[test]
fn test_create_session_increments_id() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let s0 = create_default_session(&client, &host, &participants);
    let s1 = create_default_session(&client, &host, &participants);
    let s2 = create_default_session(&client, &host, &participants);

    assert_eq!(s0, 0);
    assert_eq!(s1, 1);
    assert_eq!(s2, 2);
    assert_eq!(client.session_count(), 3);
}

#[test]
#[should_panic]
fn test_create_session_too_few_participants() {
    let env = Env::default();
    let (client, _, _, _) = setup(&env);
    let host = Address::generate(&env);
    let few = Vec::from_array(&env, [host.clone(), Address::generate(&env)]);

    client.create_session(&host, &10_000_000i128, &1000u64, &300u64, &few);
}

#[test]
#[should_panic]
fn test_create_session_too_many_participants() {
    let env = Env::default();
    let (client, _, _, _) = setup(&env);
    let host = Address::generate(&env);
    let many = Vec::from_array(
        &env,
        [
            host.clone(),
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
        ],
    );

    client.create_session(&host, &10_000_000i128, &1000u64, &300u64, &many);
}

#[test]
fn test_get_participant() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let sid = create_default_session(&client, &host, &participants);

    assert_eq!(
        client.get_participant(&sid, &0),
        participants.get(0).unwrap()
    );
    assert_eq!(
        client.get_participant(&sid, &1),
        participants.get(1).unwrap()
    );
    assert_eq!(
        client.get_participant(&sid, &2),
        participants.get(2).unwrap()
    );
}

// ── deposit ───────────────────────────────────────────────

#[test]
fn test_deposit_ok() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let sid = create_default_session(&client, &host, &participants);

    // Deposit as host
    client.deposit(&host, &sid);

    assert!(client.has_deposited(&sid, &host));
}

#[test]
#[should_panic]
fn test_deposit_non_participant_fails() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let sid = create_default_session(&client, &host, &participants);

    let outsider = Address::generate(&env);
    client.deposit(&outsider, &sid);
}

#[test]
#[should_panic]
fn test_deposit_twice_fails() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let sid = create_default_session(&client, &host, &participants);
    client.deposit(&host, &sid);
    client.deposit(&host, &sid); // should panic
}

#[test]
#[should_panic]
fn test_deposit_after_deadline_fails() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let sid = create_default_session(&client, &host, &participants);

    // Advance time past deadline
    env.ledger().set_timestamp(2000);

    client.deposit(&host, &sid); // should panic
}

#[test]
fn test_all_deposited_activates_session() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();
    let p2 = participants.get(2).unwrap();

    let sid = create_default_session(&client, &p0, &participants);

    client.deposit(&p0, &sid);
    client.deposit(&p1, &sid);

    // Not all yet
    let s = client.get_session(&sid);
    assert!(!s.active);

    client.deposit(&p2, &sid);

    // Now active
    let s = client.get_session(&sid);
    assert!(s.active);
}

// ── cast_vote ─────────────────────────────────────────────

#[test]
#[should_panic]
fn test_vote_before_deadline_fails() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();

    let sid = create_default_session(&client, &p0, &participants);
    // Make all deposit
    client.deposit(&p0, &sid);
    client.deposit(&p1, &sid);
    client.deposit(&participants.get(2).unwrap(), &sid);

    // Vote before deadline (timestamp = 0, deadline = 1000)
    client.cast_vote(&p0, &sid, &p1);
}

#[test]
fn test_cast_vote_ok() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();
    let p2 = participants.get(2).unwrap();

    let sid = create_default_session(&client, &p0, &participants);
    client.deposit(&p0, &sid);
    client.deposit(&p1, &sid);
    client.deposit(&p2, &sid);

    // Advance to voting window
    env.ledger().set_timestamp(1100);

    client.cast_vote(&p0, &sid, &p1);
    assert!(client.has_voted(&sid, &p0));
    assert_eq!(client.absence_vote_count(&sid, &p1), 1);
}

#[test]
#[should_panic]
fn test_cannot_vote_self() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();
    let p2 = participants.get(2).unwrap();

    let sid = create_default_session(&client, &p0, &participants);
    client.deposit(&p0, &sid);
    client.deposit(&p1, &sid);
    client.deposit(&p2, &sid);

    env.ledger().set_timestamp(1100);

    client.cast_vote(&p0, &sid, &p0); // voting for self should panic
}

#[test]
#[should_panic]
fn test_vote_in_inactive_session_fails() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();

    // Create but don't deposit all → session stays inactive
    let sid = create_default_session(&client, &p0, &participants);
    client.deposit(&p0, &sid); // only one deposit

    env.ledger().set_timestamp(1100);

    client.cast_vote(&p0, &sid, &p1); // should panic
}

// ── finalize_session ─────────────────────────────────────

#[test]
fn test_finalize_refund_when_not_all_deposited() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();

    let sid = create_default_session(&client, &p0, &participants);
    client.deposit(&p0, &sid); // only one deposits

    // Advance past voting period
    env.ledger().set_timestamp(1500);

    client.finalize_session(&sid);

    let s = client.get_session(&sid);
    assert!(s.finalized);
}

#[test]
fn test_finalize_with_majority_vote() {
    let env = Env::default();
    let (client, owner, token_sac, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();
    let p2 = participants.get(2).unwrap();

    let sid = create_default_session(&client, &p0, &participants);
    client.deposit(&p0, &sid);
    client.deposit(&p1, &sid);
    client.deposit(&p2, &sid);

    // Voting window: p0 and p1 vote p2 as absent (2 out of 2 voters → majority)
    env.ledger().set_timestamp(1100);
    client.cast_vote(&p0, &sid, &p2);
    client.cast_vote(&p1, &sid, &p2);
    // p2 doesn't vote → auto-absent

    // Advance past voting period
    env.ledger().set_timestamp(1500);

    // Record owner balance before finalize
    let token = token::Client::new(&env, &token_sac);
    let owner_balance_before = token.balance(&owner);

    client.finalize_session(&sid);

    let s = client.get_session(&sid);
    assert!(s.finalized);

    // Owner should have received 10% fee of absentee's deposit
    // Amount = 1 XLM = 10_000_000 stroops
    // Fee = 10_000_000 * 10 / 100 = 1_000_000
    let owner_balance_after = token.balance(&owner);
    let fee = owner_balance_after - owner_balance_before;
    assert_eq!(fee, 1_000_000); // 10% of 1 XLM = 0.1 XLM
}

#[test]
fn test_finalize_all_attendees_refund() {
    let env = Env::default();
    let (client, owner, token_sac, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();
    let p2 = participants.get(2).unwrap();

    let sid = create_default_session(&client, &p0, &participants);
    client.deposit(&p0, &sid);
    client.deposit(&p1, &sid);
    client.deposit(&p2, &sid);

    // All 3 vote, no clear majority against anyone
    // 3 voters → threshold = 3/2 + 1 = 2
    // Each gets 1 vote → nobody absent
    env.ledger().set_timestamp(1100);
    client.cast_vote(&p0, &sid, &p1); // p1 gets 1
    client.cast_vote(&p1, &sid, &p2); // p2 gets 1
    client.cast_vote(&p2, &sid, &p0); // p0 gets 1

    let token = token::Client::new(&env, &token_sac);
    let owner_balance_before = token.balance(&owner);

    env.ledger().set_timestamp(1500);
    client.finalize_session(&sid);

    let s = client.get_session(&sid);
    assert!(s.finalized);

    // No fee when everyone attends
    let owner_balance_after = token.balance(&owner);
    assert_eq!(owner_balance_after, owner_balance_before);
}

#[test]
#[should_panic]
fn test_finalize_before_vote_end_fails() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let p0 = participants.get(0).unwrap();
    let p1 = participants.get(1).unwrap();
    let p2 = participants.get(2).unwrap();

    let sid = create_default_session(&client, &p0, &participants);
    client.deposit(&p0, &sid);
    client.deposit(&p1, &sid);
    client.deposit(&p2, &sid);

    // Still in voting window (deadline=1000, voting_period=300, vote_end=1300)
    env.ledger().set_timestamp(1200);

    client.finalize_session(&sid); // should panic
}

// ── Views ─────────────────────────────────────────────────

#[test]
fn test_voting_deadline_calculated() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    let sid = create_default_session(&client, &host, &participants);

    let vd = client.voting_deadline(&sid);
    assert_eq!(vd, 1300); // 1000 + 300
}

#[test]
fn test_session_count() {
    let env = Env::default();
    let (client, _, _, participants) = setup(&env);
    let host = participants.first().unwrap();

    assert_eq!(client.session_count(), 0);
    create_default_session(&client, &host, &participants);
    assert_eq!(client.session_count(), 1);
    create_default_session(&client, &host, &participants);
    assert_eq!(client.session_count(), 2);
}

#[test]
#[should_panic]
fn test_get_nonexistent_session_fails() {
    let env = Env::default();
    let (client, _, _, _) = setup(&env);

    client.get_session(&999);
}
