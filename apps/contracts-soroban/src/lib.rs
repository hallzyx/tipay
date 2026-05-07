// ============================================================
// Tipay — Accountability Session Smart Contract (Soroban / Rust)
// soroban-sdk 25.0.1 — Stellar Testnet
// ============================================================
// Migrated from Tozlow (Arbitrum Stylus)
// Key changes:
//   - XLM (native) replaces USDC (ERC-20)
//   - Soroban SDK replaces Stylus SDK
//   - Single-step deposit (SAC transfer) replaces approve+transferFrom
//   - Soroban events replace Solidity events
//   - Persistent/instance storage replaces StorageMap
// ============================================================

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype,
    token, Address, Env, Vec,
};

// ── TTL constants ─────────────────────────────────────────
const INSTANCE_TTL_THRESHOLD: u32 = 17280; // ~1 day at 5s ledgers
const INSTANCE_TTL_EXTEND: u32 = 518400; // ~30 days
const PERSISTENT_TTL_THRESHOLD: u32 = 17280;
const PERSISTENT_TTL_EXTEND: u32 = 518400;

// ── Errors ────────────────────────────────────────────────
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotParticipant = 2,
    AlreadyDeposited = 3,
    DeadlineNotReached = 4,
    DeadlineReached = 5,
    AlreadyFinalized = 6,
    NotEnoughParticipants = 7,
    TooManyParticipants = 8,
    TransferFailed = 9,
    AlreadyVoted = 10,
    InvalidAbsent = 11,
    NotAllDeposited = 12,
    VotingNotOpen = 13,
    VotingClosed = 14,
    SessionNotActive = 15,
    CannotVoteSelf = 16,
    NotInitialized = 17,
    SessionNotFound = 18,
}

// ── Events ────────────────────────────────────────────────
#[contractevent(topics = ["session_created"])]
pub struct SessionCreatedEvent {
    pub session_id: u64,
    pub host: Address,
    pub amount: i128,
    pub deadline: u64,
    pub voting_period: u64,
    pub participant_count: u32,
}

#[contractevent(topics = ["deposited"])]
pub struct DepositedEvent {
    pub session_id: u64,
    pub participant: Address,
}

#[contractevent(topics = ["vote_cast"])]
pub struct VoteCastEvent {
    pub session_id: u64,
    pub voter: Address,
    pub absent: Address,
}

#[contractevent(topics = ["finalized"])]
pub struct FinalizedEvent {
    pub session_id: u64,
    pub absentee_count: u32,
    pub reward_per_attendee: i128,
    pub fee: i128,
}

#[contractevent(topics = ["refunded"])]
pub struct RefundedEvent {
    pub session_id: u64,
}

// ── Storage keys ──────────────────────────────────────────
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Initialized,
    Owner,
    NativeSac,
    NextSessionId,
    Session(u64),          // session_id → Session
    Participant(u64, u32), // (session_id, index) → Address
    Deposited(u64, Address), // (session_id, address) → bool
    Voted(u64, Address),    // (session_id, address) → bool
    AbsenceVote(u64, Address), // (session_id, address) → u32
}

// ── Session data struct ───────────────────────────────────
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Session {
    pub host: Address,
    pub amount: i128,
    pub deadline: u64,
    pub voting_period: u64,
    pub finalized: bool,
    pub active: bool,
    pub participant_count: u32,
}

// ── Contract ──────────────────────────────────────────────
#[contract]
pub struct TipayContract;

#[contractimpl]
impl TipayContract {
    // ═══════════════════════════════════════════════════════
    // Initialize — one-time setup (post-deploy)
    /// @param owner     — contract admin address
    /// @param token_sac — Stellar Asset Contract address for
    ///                    the token used (e.g., native XLM SAC)
    // ═══════════════════════════════════════════════════════
    pub fn initialize(env: Env, owner: Address, token_sac: Address) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(ContractError::AlreadyInitialized);
        }

        owner.require_auth();

        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage()
            .instance()
            .set(&DataKey::NativeSac, &token_sac);
        env.storage().instance().set(&DataKey::NextSessionId, &0u64);
        env.storage().instance().set(&DataKey::Initialized, &true);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND);
        Ok(())
    }

    // ═══════════════════════════════════════════════════════
    // create_session
    // ═══════════════════════════════════════════════════════
    /// Creates a new accountability session.
    /// @param host       — session creator (must match auth)
    /// @param amount     — XLM amount per participant (in stroops, 1 XLM = 10^7)
    /// @param deadline   — Unix timestamp when deposits close
    /// @param voting_period — seconds after deadline to vote
    /// @param participants — list of participant addresses (including host)
    /// @returns session_id
    pub fn create_session(
        env: Env,
        host: Address,
        amount: i128,
        deadline: u64,
        voting_period: u64,
        participants: Vec<Address>,
    ) -> Result<u64, ContractError> {
        host.require_auth();
        Self::require_initialized(&env)?;

        let n = participants.len();
        if n < 3 {
            return Err(ContractError::NotEnoughParticipants);
        }
        if n > 5 {
            return Err(ContractError::TooManyParticipants);
        }

        let sid: u64 = env.storage().instance().get(&DataKey::NextSessionId).unwrap_or(0);
        env.storage().instance().set(&DataKey::NextSessionId, &(sid + 1));

        let session = Session {
            host: host.clone(),
            amount,
            deadline,
            voting_period,
            finalized: false,
            active: false,
            participant_count: n as u32,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Session(sid), &session);

        for (idx, addr) in participants.iter().enumerate() {
            env.storage().persistent().set(
                &DataKey::Participant(sid, idx as u32),
                &addr,
            );
        }

        SessionCreatedEvent {
            session_id: sid,
            host,
            amount,
            deadline,
            voting_period,
            participant_count: n as u32,
        }
        .publish(&env);

        env.storage().persistent().extend_ttl(
            &DataKey::Session(sid),
            PERSISTENT_TTL_THRESHOLD,
            PERSISTENT_TTL_EXTEND,
        );

        Ok(sid)
    }

    // ═══════════════════════════════════════════════════════
    // deposit
    // ═══════════════════════════════════════════════════════
    /// Deposits XLM into a session.
    /// The caller authorizes the XLM transfer from their wallet
    /// to the contract via the Stellar Asset Contract (SAC).
    /// Single-step — no separate approve needed.
    /// @param from       — depositor's address (must match auth)
    /// @param session_id — session to join
    pub fn deposit(
        env: Env,
        from: Address,
        session_id: u64,
    ) -> Result<(), ContractError> {
        from.require_auth();
        Self::require_initialized(&env)?;

        let mut session = Self::get_session_or_err(&env, session_id)?;

        if session.finalized {
            return Err(ContractError::AlreadyFinalized);
        }

        let now = env.ledger().timestamp();
        if now >= session.deadline {
            return Err(ContractError::DeadlineReached);
        }

        if !Self::is_participant_internal(&env, session_id, &from, session.participant_count) {
            return Err(ContractError::NotParticipant);
        }

        if env
            .storage()
            .persistent()
            .get(&DataKey::Deposited(session_id, from.clone()))
            .unwrap_or(false)
        {
            return Err(ContractError::AlreadyDeposited);
        }

        // Transfer XLM from user to this contract via SAC
        let native_sac: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeSac)
            .unwrap();
        let token_client = token::Client::new(&env, &native_sac);
        token_client.transfer(
            &from,
            &env.current_contract_address(),
            &session.amount,
        );

        // Mark deposit
        env.storage()
            .persistent()
            .set(&DataKey::Deposited(session_id, from.clone()), &true);

        // Check if all deposited → activate session
        if Self::all_deposited_internal(&env, session_id, session.participant_count) {
            session.active = true;
            env.storage()
                .persistent()
                .set(&DataKey::Session(session_id), &session);
        }

        DepositedEvent {
            session_id,
            participant: from.clone(),
        }
        .publish(&env);

        env.storage().persistent().extend_ttl(
            &DataKey::Deposited(session_id, from),
            PERSISTENT_TTL_THRESHOLD,
            PERSISTENT_TTL_EXTEND,
        );

        Ok(())
    }

    // ═══════════════════════════════════════════════════════
    // cast_vote
    // ═══════════════════════════════════════════════════════
    /// Vote for who was absent. Only during the voting window
    /// [deadline, deadline + voting_period).
    /// Cannot vote for yourself.
    /// @param voter      — voter's address (must match auth)
    /// @param session_id — session to vote in
    /// @param absent     — who the voter claims was absent
    pub fn cast_vote(
        env: Env,
        voter: Address,
        session_id: u64,
        absent: Address,
    ) -> Result<(), ContractError> {
        voter.require_auth();
        Self::require_initialized(&env)?;

        let session = Self::get_session_or_err(&env, session_id)?;

        if session.finalized {
            return Err(ContractError::AlreadyFinalized);
        }
        if !session.active {
            return Err(ContractError::SessionNotActive);
        }

        let now = env.ledger().timestamp();
        let vote_end = session.deadline + session.voting_period;

        if now < session.deadline {
            return Err(ContractError::VotingNotOpen);
        }
        if now >= vote_end {
            return Err(ContractError::VotingClosed);
        }

        if !Self::is_participant_internal(&env, session_id, &voter, session.participant_count) {
            return Err(ContractError::NotParticipant);
        }
        if !Self::is_participant_internal(&env, session_id, &absent, session.participant_count) {
            return Err(ContractError::InvalidAbsent);
        }
        if voter == absent {
            return Err(ContractError::CannotVoteSelf);
        }

        if env
            .storage()
            .persistent()
            .get(&DataKey::Voted(session_id, voter.clone()))
            .unwrap_or(false)
        {
            return Err(ContractError::AlreadyVoted);
        }

        // Record vote
        env.storage()
            .persistent()
            .set(&DataKey::Voted(session_id, voter.clone()), &true);

        let prev: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::AbsenceVote(session_id, absent.clone()))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::AbsenceVote(session_id, absent.clone()), &(prev + 1));

        VoteCastEvent {
            session_id,
            voter: voter.clone(),
            absent,
        }
        .publish(&env);

        env.storage().persistent().extend_ttl(
            &DataKey::Voted(session_id, voter),
            PERSISTENT_TTL_THRESHOLD,
            PERSISTENT_TTL_EXTEND,
        );

        Ok(())
    }

    // ═══════════════════════════════════════════════════════
    // finalize_session
    // ═══════════════════════════════════════════════════════
    /// Finalize after the voting period ends.
    ///
    /// Resolution logic:
    ///   1. If NOT all deposited → refund depositors only.
    ///   2. Non-voters → auto-absent.
    ///   3. Voters with majority votes against them → absent.
    ///   4. No absentees or zero attendees → refund all.
    ///   5. Absentees present:
    ///      - 10% of absentee pool → contract owner (fab fee).
    ///      - 90% of absentee pool → split among attendees on
    ///        top of their own deposit.
    ///
    /// @param caller     — anyone can call (no auth required)
    /// @param session_id — session to finalize
    pub fn finalize_session(
        env: Env,
        session_id: u64,
    ) -> Result<(), ContractError> {
        Self::require_initialized(&env)?;

        let mut session = Self::get_session_or_err(&env, session_id)?;

        let now = env.ledger().timestamp();
        let vote_end = session.deadline + session.voting_period;
        if now < vote_end {
            return Err(ContractError::VotingNotOpen);
        }
        if session.finalized {
            return Err(ContractError::AlreadyFinalized);
        }

        let all_addrs =
            Self::collect_participants(&env, session_id, session.participant_count);
        let amount = session.amount;

        let native_sac: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeSac)
            .unwrap();
        let token_client = token::Client::new(&env, &native_sac);
        let contract_addr = env.current_contract_address();

        // ── Case 1: Not all deposited → refund depositors ──
        if !Self::all_deposited_internal(&env, session_id, session.participant_count) {
            for addr in &all_addrs {
                let deposited: bool = env
                    .storage()
                    .persistent()
                    .get(&DataKey::Deposited(session_id, addr.clone()))
                    .unwrap_or(false);
                if deposited {
                    token_client.transfer(&contract_addr, &addr, &amount);
                }
            }
            session.finalized = true;
            env.storage()
                .persistent()
                .set(&DataKey::Session(session_id), &session);

            RefundedEvent { session_id }.publish(&env);
            return Ok(());
        }

        // ── Case 2: All deposited → resolve voters ──
        let mut voter_count: u32 = 0;
        for addr in &all_addrs {
            let voted: bool = env
                .storage()
                .persistent()
                .get(&DataKey::Voted(session_id, addr.clone()))
                .unwrap_or(false);
            if voted {
                voter_count += 1;
            }
        }

        // Threshold = majority of voters (more than half, min 1)
        let threshold: u32 = if voter_count > 0 {
            (voter_count / 2) + 1
        } else {
            1
        };

        let mut absentees: Vec<Address> = Vec::new(&env);
        let mut attendees: Vec<Address> = Vec::new(&env);

        for addr in &all_addrs {
            let voted: bool = env
                .storage()
                .persistent()
                .get(&DataKey::Voted(session_id, addr.clone()))
                .unwrap_or(false);

            if !voted {
                // Auto-absent: didn't vote at all
                absentees.push_back(addr.clone());
            } else {
                let votes_against: u32 = env
                    .storage()
                    .persistent()
                    .get(&DataKey::AbsenceVote(session_id, addr.clone()))
                    .unwrap_or(0);
                if votes_against >= threshold {
                    absentees.push_back(addr.clone());
                } else {
                    attendees.push_back(addr.clone());
                }
            }
        }

        let absentee_count = absentees.len() as u32;
        let reward_per_attendee: i128;
        let fee_collected: i128;

        if absentee_count == 0 || attendees.is_empty() {
            // No absentees or everyone absent → refund all
            for addr in &all_addrs {
                token_client.transfer(&contract_addr, &addr, &amount);
            }
            reward_per_attendee = 0;
            fee_collected = 0;
        } else {
            // ── Absentee pool and 10% fab fee ──
            let absentee_pool = amount
                .checked_mul(absentee_count as i128)
                .ok_or(ContractError::TransferFailed)?;

            // 10 % fee to contract owner
            let fee = absentee_pool
                .checked_mul(10)
                .and_then(|v| v.checked_div(100))
                .ok_or(ContractError::TransferFailed)?;

            let owner: Address = env
                .storage()
                .instance()
                .get(&DataKey::Owner)
                .unwrap();
            if fee > 0 {
                token_client.transfer(&contract_addr, &owner, &fee);
            }
            fee_collected = fee;

            // 90 % → bonus split among attendees (on top of deposit)
            let attendee_pool = absentee_pool
                .checked_sub(fee)
                .ok_or(ContractError::TransferFailed)?;

            let bonus_per_attendee = attendee_pool
                .checked_div(attendees.len() as i128)
                .ok_or(ContractError::TransferFailed)?;

            let per_attendee = amount
                .checked_add(bonus_per_attendee)
                .ok_or(ContractError::TransferFailed)?;

            reward_per_attendee = per_attendee;

            for addr in &attendees {
                token_client.transfer(&contract_addr, &addr, &per_attendee);
            }
        }

        session.finalized = true;
        env.storage()
            .persistent()
            .set(&DataKey::Session(session_id), &session);

        FinalizedEvent {
            session_id,
            absentee_count,
            reward_per_attendee,
            fee: fee_collected,
        }
        .publish(&env);

        Ok(())
    }

    // ═══════════════════════════════════════════════════════
    // Views (read-only)
    // ═══════════════════════════════════════════════════════

    /// Returns session metadata.
    pub fn get_session(env: Env, session_id: u64) -> Result<Session, ContractError> {
        Self::get_session_or_err(&env, session_id)
    }

    /// Returns participant address at the given index.
    pub fn get_participant(
        env: Env,
        session_id: u64,
        index: u32,
    ) -> Result<Address, ContractError> {
        Self::get_session_or_err(&env, session_id)?;
        env.storage()
            .persistent()
            .get(&DataKey::Participant(session_id, index))
            .ok_or(ContractError::SessionNotFound)
    }

    /// Checks if an address has deposited in a session.
    pub fn has_deposited(env: Env, session_id: u64, addr: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Deposited(session_id, addr))
            .unwrap_or(false)
    }

    /// Checks if an address has voted in a session.
    pub fn has_voted(env: Env, session_id: u64, addr: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Voted(session_id, addr))
            .unwrap_or(false)
    }

    /// Returns how many votes an address received as "absent".
    pub fn absence_vote_count(env: Env, session_id: u64, addr: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::AbsenceVote(session_id, addr))
            .unwrap_or(0)
    }

    /// Returns the voting deadline (deadline + voting_period).
    pub fn voting_deadline(env: Env, session_id: u64) -> Result<u64, ContractError> {
        let session = Self::get_session_or_err(&env, session_id)?;
        Ok(session.deadline + session.voting_period)
    }

    /// Total number of sessions created.
    pub fn session_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::NextSessionId)
            .unwrap_or(0)
    }

    /// Returns the token SAC address stored at init.
    pub fn token_sac_address(env: Env) -> Result<Address, ContractError> {
        Self::require_initialized(&env)?;
        Ok(env.storage().instance().get(&DataKey::NativeSac).unwrap())
    }

    // ═══════════════════════════════════════════════════════
    // Internal helpers
    // ═══════════════════════════════════════════════════════

    fn require_initialized(env: &Env) -> Result<(), ContractError> {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(ContractError::NotInitialized);
        }
        Ok(())
    }

    fn get_session_or_err(env: &Env, session_id: u64) -> Result<Session, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Session(session_id))
            .ok_or(ContractError::SessionNotFound)
    }

    fn is_participant_internal(
        env: &Env,
        session_id: u64,
        addr: &Address,
        count: u32,
    ) -> bool {
        for i in 0..count {
            let p: Option<Address> = env
                .storage()
                .persistent()
                .get(&DataKey::Participant(session_id, i));
            if p.as_ref() == Some(addr) {
                return true;
            }
        }
        false
    }

    fn all_deposited_internal(env: &Env, session_id: u64, count: u32) -> bool {
        for i in 0..count {
            let addr: Address = env
                .storage()
                .persistent()
                .get(&DataKey::Participant(session_id, i))
                .unwrap();
            let deposited: bool = env
                .storage()
                .persistent()
                .get(&DataKey::Deposited(session_id, addr))
                .unwrap_or(false);
            if !deposited {
                return false;
            }
        }
        true
    }

    fn collect_participants(env: &Env, session_id: u64, count: u32) -> Vec<Address> {
        let mut out = Vec::new(env);
        for i in 0..count {
            if let Some(addr) = env
                .storage()
                .persistent()
                .get(&DataKey::Participant(session_id, i))
            {
                out.push_back(addr);
            }
        }
        out
    }
}

// ═══════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════
#[cfg(test)]
mod tests;
