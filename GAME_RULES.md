# Zain Ludo — Fixed Game Rules

**Project:** Zain Ludo  
**Creator:** Zahid Khan Mandan  
**Repository:** https://github.com/tahreekawamihaqpk-cell/Zain-ludo  
**Policy:** Continue in this repository. Do not create a replacement project.

## Product direction
- Android-first; iOS later.
- Languages: Urdu, Arabic, English, Hindi.
- Premium Ludo King-like 3D board, dice and tokens; mobile-first interface.
- Local play first; online friends/rooms, accounts and server validation are later phases.

## Seats and board
- Four colors: Green, Red, Blue, Yellow.
- Red faces Yellow; Green faces Blue.
- Red and Green positions must follow the owner's corrected orientation, not an arbitrary default.
- 2-player and 4-player games; optional teams in supported modes.

## Modes
- **Quick:** 2 or 4 players, team-up supported, no magic, first token home wins; teammate assistance allowed.
- **Classic:** 2 or 4 players, team-up supported, magic enabled once its powers are explicitly defined.
- **Master:** 2 or 4 players, team-up supported; exact special/double-token rules are not yet defined. Do not invent them.
- **Tournament:** admin manually announces and starts it; participant count is set by admin.
- **Tournament Pro:** admin manually announces and starts it; participant count and format are set by admin.

## Dice and turn rules (owner's latest correction)
- A 6 does **not** force a token out or force an immediate move.
- A 6 grants another roll. The player rolls again first.
- After the final non-6 roll, the player may choose which pending dice value to spend and which legal token to move.
- A third consecutive 6 ends the turn and discards the pending values.
- If no legal move exists for any pending value, the turn passes.
- Turn timer: 20 seconds; when it expires, the turn passes automatically.

## Progression and social features (later phases)
- Login: mobile number, User ID, Facebook, WhatsApp, X/Twitter, TikTok.
- Friends, online rooms, reconnect, chat and notifications.
- VIP, diamonds, daily rewards, gifts, collectible tokens/dice and wallet ledger.
- Real-money payments require a suitable payment provider and compliance review.
- Voice chat requires a separate provider.
- Admin dashboard controls tournaments and economy.

## Implementation safeguards
- Keep game rules pure and testable, separate from rendering.
- Do not claim online multiplayer, secure accounts, payments, or full 3D are complete until implemented and tested.
- Do not invent Master or magic rules; ask the owner when those decisions become necessary.
