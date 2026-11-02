import test from "node:test";
import assert from "node:assert/strict";
import { createGame, roll, moveToken, legalTokenIndices, HOME, getTarget, currentPlayer } from "../game-engine.js";

test("a six grants another roll and does not force a token out", () => {
  let game = createGame({ mode: "quick", playerCount: 4 });
  game = roll(game, 6);
  assert.equal(game.phase, "roll");
  assert.deepEqual(currentPlayer(game).tokens, [-1, -1, -1, -1]);
  game = roll(game, 4);
  assert.equal(game.phase, "move");
  assert.deepEqual(game.pending, [6, 4]);
  assert.deepEqual(legalTokenIndices(game, 6), [0, 1, 2, 3]);
});

test("the player can spend the saved six after the final non-six roll", () => {
  let game = createGame({ mode: "quick", playerCount: 4 });
  game = roll(roll(game, 6), 2);
  game = moveToken(game, 0, 0);
  assert.equal(currentPlayer(game).tokens[0], 0);
  assert.deepEqual(game.pending, [2]);
  game = moveToken(game, 0, 0);
  assert.equal(currentPlayer(game).tokens[0], 2);
  assert.equal(game.turn, 1);
});

test("three consecutive sixes forfeit the turn and clear pending dice", () => {
  let game = createGame({ mode: "classic", playerCount: 4 });
  game = roll(game, 6);
  game = roll(game, 6);
  game = roll(game, 6);
  assert.equal(game.turn, 1);
  assert.deepEqual(game.pending, []);
  assert.equal(game.phase, "roll");
});

test("home requires an exact count", () => {
  const game = createGame();
  const player = currentPlayer(game);
  assert.equal(getTarget(game, player, 55, 1), HOME);
  assert.equal(getTarget(game, player, 55, 2), null);
});
