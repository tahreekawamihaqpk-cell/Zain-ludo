/* Zain Ludo — deterministic, testable local rules engine.
 * Owner-approved six sequence: roll again on each 6; after a non-6,
 * spend pending dice values in any order. Third consecutive 6 forfeits turn.
 */
export const COLORS = ["green", "red", "yellow", "blue"];
export const MODES = ["quick", "classic", "master"];
export const BASE = -1;
export const HOME = 57;
export const TRACK_LENGTH = 52;
export const HOME_LANE_LENGTH = 6;
export const SAFE_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Seats clockwise: Green top-left, Red top-right, Yellow bottom-right, Blue bottom-left.
// Red faces Blue? The owner's fixed requirement is Red opposite Yellow and Green opposite Blue.
// This seat order is retained from the owner's current project implementation.
export const START_OFFSETS = [0, 13, 26, 39];

export function createGame({ mode = "quick", playerCount = 4, teams = false, names = [] } = {}) {
  if (!MODES.includes(mode)) throw new Error("Unsupported local mode");
  if (playerCount !== 2 && playerCount !== 4) throw new Error("Player count must be 2 or 4");
  const seats = playerCount === 2 ? [1, 3] : [0, 1, 2, 3];
  const players = seats.map((seat, index) => ({
    id: `p${index + 1}`,
    seat,
    color: COLORS[seat],
    name: names[index] || `Player ${index + 1}`,
    team: teams && playerCount === 4 ? seat % 2 : index,
    tokens: [BASE, BASE, BASE, BASE],
    captured: false
  }));
  return {
    mode, players, turn: 0, dice: null, pending: [], consecutiveSixes: 0,
    phase: "roll", winner: null, message: "Roll the dice", turnSeconds: 20
  };
}

export function currentPlayer(game) {
  return game.players[game.turn];
}

export function globalTrackCell(player, position) {
  return (START_OFFSETS[player.seat] + position) % TRACK_LENGTH;
}

export function getTarget(game, player, tokenPosition, die) {
  if (!Number.isInteger(die) || die < 1 || die > 6) return null;
  if (tokenPosition === BASE) return die === 6 ? 0 : null;
  if (tokenPosition === HOME) return null;
  if (tokenPosition >= 51 && tokenPosition < HOME) {
    const next = tokenPosition + die;
    return next <= HOME ? next : null;
  }
  if (tokenPosition < 0 || tokenPosition > 50) return null;
  const next = tokenPosition + die;
  // Exact count is required to enter/finish the home lane.
  return next <= HOME ? next : null;
}

export function legalTokenIndices(game, die) {
  const player = currentPlayer(game);
  return player.tokens.flatMap((position, index) =>
    getTarget(game, player, position, die) === null ? [] : [index]
  );
}

export function roll(game, value) {
  if (game.winner !== null) throw new Error("Game is over");
  if (game.phase !== "roll") throw new Error("Spend pending dice before rolling again");
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new Error("Die must be 1–6");

  const next = structuredClone(game);
  next.dice = value;
  if (value === 6) {
    next.consecutiveSixes += 1;
    if (next.consecutiveSixes === 3) {
      next.pending = [];
      next.dice = null;
      next.consecutiveSixes = 0;
      next.phase = "roll";
      next.message = "Three consecutive sixes — turn forfeited";
      advanceTurn(next);
      return next;
    }
    next.pending.push(6);
    next.phase = "roll";
    next.message = "Six! Roll again first. You may move after the final non-six roll.";
    return next;
  }

  next.consecutiveSixes = 0;
  next.pending.push(value);
  next.phase = "move";
  next.dice = null;
  const movable = next.pending.some(d => legalTokenIndices(next, d).length > 0);
  if (!movable) {
    next.pending = [];
    next.message = "No legal move — turn passes";
    advanceTurn(next);
  } else {
    next.message = "Choose a pending dice value, then choose a legal token";
  }
  return next;
}

export function moveToken(game, pendingIndex, tokenIndex) {
  if (game.phase !== "move") throw new Error("Roll sequence is not complete");
  const die = game.pending[pendingIndex];
  if (die === undefined) throw new Error("Select a valid pending dice value");
  if (!legalTokenIndices(game, die).includes(tokenIndex)) throw new Error("Illegal token move");

  const next = structuredClone(game);
  const player = next.players[next.turn];
  const from = player.tokens[tokenIndex];
  const to = getTarget(next, player, from, die);
  player.tokens[tokenIndex] = to;

  let captured = false;
  if (to >= 0 && to <= 50) {
    const cell = globalTrackCell(player, to);
    if (!SAFE_CELLS.has(cell)) {
      for (const opponent of next.players) {
        if (opponent.team === player.team) continue;
        opponent.tokens = opponent.tokens.map(position => {
          if (position >= 0 && position <= 50 && globalTrackCell(opponent, position) === cell) {
            captured = true;
            return BASE;
          }
          return position;
        });
      }
    }
  }
  if (captured) player.captured = true;
  next.pending.splice(pendingIndex, 1);

  const neededHome = next.mode === "quick" ? 1 : 4;
  if (player.tokens.filter(position => position === HOME).length >= neededHome) {
    next.winner = player.team;
    next.phase = "finished";
    next.pending = [];
    next.message = `${player.name} wins!`;
    return next;
  }

  if (next.pending.length === 0) {
    next.phase = "roll";
    next.message = "Move complete — roll to continue";
    next.consecutiveSixes = 0;
    // No undocumented capture/home bonus is added here.
    advanceTurn(next);
  } else {
    next.phase = "move";
    next.message = "Choose another pending dice value and token";
  }
  return next;
}

export function advanceTurn(game) {
  game.turn = (game.turn + 1) % game.players.length;
  game.pending = [];
  game.dice = null;
  game.phase = "roll";
  game.consecutiveSixes = 0;
}

export function expireTurn(game) {
  if (game.winner !== null) return game;
  const next = structuredClone(game);
  next.pending = [];
  next.message = "20 seconds expired — turn passes";
  advanceTurn(next);
  return next;
}
