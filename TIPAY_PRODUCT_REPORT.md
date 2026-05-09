# Executive Report — Tipay

## 1. What is Tipay?

Tipay is an accountability application for groups of friends, families, or small communities who want to make their social gatherings more exciting and equitable. Participants pool USDC before a meeting, and at the end, the smart contract automatically determines who gets what based on attendance. It's not just a bet — it's a tool to encourage attendance and resolve disputes fairly, automatically, and transparently.

The app runs on **Stellar Soroban**, a fast and efficient blockchain, making it secure, transparent, and accessible from any device. It's a "smart social contract" that eliminates arguments about who missed out or who should compensate whom.

## 2. The Problem It Solves

Organizing meetups with friends or colleagues can be frustrating:

- **Unexpected Absences:** Someone confirms but doesn't show up, leaving others covering extra costs.
- **Awkward Discussions:** Who pays for the person who didn't show? This often leads to resentment.
- **Lack of Incentive:** No real motivation to attend, especially if the group is large or the distance is far.

Tipay solves this by turning gatherings into positive, incentivized experiences: attendance is rewarded, flaking is penalized, and everything is handled by code — no drama.

## 3. How Tipay Works

1. **Create Session** — A host invites 3–5 friends, sets an amount per person (e.g., 5 USDC), a deadline to confirm, and a voting window after the event.
2. **Deposit** — Each participant transfers the agreed amount before the deadline via the Stellar Asset Contract. No separate token approval is needed.
3. **The Event** — The gathering takes place as planned.
4. **Vote** — After the deadline, attendees vote on who was absent during a voting window. Majority rules.
5. **Finalize** — Anyone can resolve the session. The contract calculates:
   - Who was absent (based on votes)
   - 10% of absentees' deposits go to the platform owner (fabricante)
   - The remaining 90% is split among attendees
   - If everyone attended, all deposits are refunded in full

Everything is transparent, recorded on-chain, and visible to all participants.

## 4. Key Benefits

- **Fairness & Transparency** — No arguments; the contract decides based on clear rules.
- **Attendance Incentive** — Showing up becomes profitable if others flake.
- **Easy to Use** — No technical knowledge required; works from a browser.
- **Secure & Private** — Uses USDC stablecoin on the Stellar network.
- **Scalable for Small Groups** — Designed for 3–5 person sessions.
- **Extra Fun** — Turns routine meetings into something exciting.

## 5. Market & Target Users

- **Primary Users:** Young adults (20–35), friend groups, coworking teams, student organizations.
- **Market Opportunity:** Informal gatherings represent significant spending globally. Tipay targets a niche in communities seeking innovative, fair, and fun ways to organize events.
- **Growth Potential:** Start with beta users, expand with integrations to messaging apps for invitations and reminders.

## 6. Innovation & Differentiation

Tipay is unique because it combines social accountability with financial incentives in a simple, automated way:

- **Innovation:** Soroban smart contracts automate social decisions based on democratic voting.
- **Creativity:** It's not just a payment app — it's an "attendance game" that makes meetings more engaging.
- **Protocol Economics:** The 10% owner fee creates a sustainable revenue model while keeping the application free for users.
- **Technical Edge:** Single-step deposits (no approve + transfer pattern), fast settlement on Stellar, and minimal transaction costs.

Compared to alternatives (expense splitting apps, lotteries, or manual pools), Tipay adds accountability, automation, and transparency.

## 7. Technology Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Rust + Soroban SDK v25.0.1 |
| Blockchain | Stellar (testnet / mainnet) |
| Token | USDC via Stellar Asset Contract (SAC) |
| Frontend | Next.js 15 + React 19 |
| Wallet | Freighter |
| Styling | Tailwind CSS v4 — "Vanguard Brutalist Terminal" |
| I18n | Built-in English / Spanish |

## 8. Next Steps & Recommendations

- **Validation:** Test with real groups to measure engagement and gather feedback.
- **Improvements:** Add reminders (email / push), calendar integration, and session history.
- **Social Integrations:** Allow invitations from WhatsApp, Telegram, or Discord.
- **Monetization:** The 10% owner fee is already built into the protocol.
- **Risks:** Educate users about Stellar and Freighter; ensure USDC trustlines are properly set up.
- **Expansion:** Consider multi-token support and larger group sessions.

## 9. Demo Experience

To support presentations and first-time users, Tipay offers:

- A **brutalist landing page** at `/` with clear section-based storytelling (tagline, features, metrics, flow, CTA).
- A **dashboard** at `/sessions` with session grid, stats, and wallet integration.
- **Session detail** at `/session/[id]` with deposit, voting, and finalization.
- **i18n toggle** in the header dropdown for English/Spanish.
- **Subtle grid background** reinforcing the technical identity.
- **Orange accent color** for CTAs and active states, contrasting with black structure.

Tipay has the potential to change how groups handle social commitments — making them fairer, more fun, and completely automated. Ready for the pitch.
