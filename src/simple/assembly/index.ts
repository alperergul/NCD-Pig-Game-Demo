import { logging, context, u128, RNG, ContractPromiseBatch } from "near-sdk-as";
import { Game, games, GameState } from "./model";

//Return game which is its id is id
export function viewGame(id: string): Game {
  return games.getSome(id);
}

//Return created all games
export function viewAllGames(): Array<Game> {
  return games.values();
}

export function deleteCompletedGames(): string {
  games.values().forEach((game: Game) => {
    if (game.gameState == GameState.completed) {
      games.delete(game.id);
    }
  });

  return `Completed games deleted. ${games.length} game is in progress.`;
}

export function showScoreStatus(id: string): string {
  let game = games.getSome(id);

  return `🚩${game.player1.id}: ${game.player1.totalScore} | 🚩${game.player2.id}: ${game.player2.totalScore}`;
}

export function createGame(): string {
  assert(
    context.attachedDeposit == u128.fromString("1000000000000000000000000"),
    "Please deposit exactly 1 NEAR to create a game!"
  );
  const game = new Game();
  games.set(game.id, game);

  return game.id;
}

export function joinGame(id: string): string {
  assert(games.contains(id), "Game does not exist!");
  assert(
    context.attachedDeposit == u128.fromString("1000000000000000000000000"),
    "Please deposit exactly 1 NEAR to join the game!"
  );

  const game = games.getSome(id);
  assert(game.player2.id == "", "This game already has two players! 🎮");
  assert(
    game.player1.id != context.sender,
    "You can not play with yourself! 😥"
  );

  game.totalAmount = u128.add(game.totalAmount, context.attachedDeposit);
  game.player2.id = context.sender;
  game.gameState = GameState.inProgress;
  games.set(id, game);

  return `✅ Joined the game ${game.player2.id}, waiting for your opponent to make the first move. 🎲 ${game.player1.id} will roll dice!`;
}

export function rollDice(id: string): string {
  assert(games.contains(id), "❌ Game ID is not found!");

  let game = games.getSome(id);
  let currentPlayerId = context.sender;
  let currentPlayer =
    currentPlayerId == game.player1.id ? game.player1 : game.player2;

  assert(game.gameState == GameState.inProgress, "⛔ Game is not in progress!");
  assert(game.nextPlayer.id == currentPlayerId, "❌ It is not your turn!");

  let rng = new RNG<u8>(6, 6);
  let dice = rng.next() + 1;
  logging.log(dice);
  let message = "";

  if (dice == 1) {
    currentPlayer.turnScore = 0;
    setNextPlayer(currentPlayerId, game);
    message = `${currentPlayerId}'s dice rolled ${dice}. It is ${
      currentPlayerId == game.player1.id ? game.player2.id : game.player1.id
    } turn`;
  } else {
    currentPlayer.turnScore += dice;
    message = `${currentPlayerId}'s dice rolled ${dice}. It is still ${currentPlayerId} turn`;
  }
  games.set(game.id, game);
  let turnScoreMessage = showTurnScores(currentPlayerId, game);
  return message + turnScoreMessage;
}

export function holdScore(id: string): string {
  assert(games.contains(id), "❌ Game ID is not found!");

  let game = games.getSome(id);
  let currentPlayerId = context.sender;
  let currentPlayer =
    currentPlayerId == game.player1.id ? game.player1 : game.player2;

  assert(game.nextPlayer.id == currentPlayerId, "❌ It is not your turn!");
  assert(game.gameState == GameState.inProgress, "⛔ Game is not in progress!");

  currentPlayer.totalScore = currentPlayer.totalScore + currentPlayer.turnScore;
  currentPlayer.turnScore = 0;

  let message = "";

  if (currentPlayer.totalScore >= 10) {
    message = finishGame(game, currentPlayerId, currentPlayer.totalScore);
  } else {
    setNextPlayer(currentPlayerId, game);
    message = `${currentPlayerId}'s total score is ${
      currentPlayer.totalScore
    }. It is ${
      currentPlayerId == game.player1.id ? game.player2.id : game.player1.id
    } turn`;
  }
  games.set(game.id, game);

  let totalScoreMessage = showTotalScores(game);

  return message + totalScoreMessage;
}

export function setNextPlayer(playerId: string, game: Game): void {
  game.nextPlayer = playerId == game.player1.id ? game.player2 : game.player1;
  games.set(game.id, game);
}

export function showTotalScores(game: Game): string {
  return ` | 🚩${game.player1.id}: ${game.player1.totalScore} vs 🚩${game.player2.id}: ${game.player2.totalScore}`;
}

export function showTurnScores(playerId: string, game: Game): string {
  let player = game.player1.id == playerId ? game.player1 : game.player2;

  return ` | 🚩${player.id}' turn score is ${player.turnScore}`;
}

export function finishGame(game: Game, player: string, score: number): string {
  game.gameState = GameState.completed;
  const toWinner = ContractPromiseBatch.create(player);
  const amountToReceive = game.totalAmount;

  toWinner.transfer(amountToReceive);
  game.winner = player;

  games.set(game.id, game);
  return `🥳🎉 Congratulations ${player}! ${player}'s total score reached 10. ${player} received ${amountToReceive} yocto!`;
}
