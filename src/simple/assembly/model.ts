import { context, logging, PersistentUnorderedMap, u128 } from "near-sdk-as";
export enum GameState {
  created,
  inProgress,
  completed,
}

@nearBindgen
export class Player {
  id: string;
  turnScore: number;
  totalScore: number;

  constructor() {
    this.id = "";
    this.turnScore = 0;
    this.totalScore = 0;
  }
}

@nearBindgen
export class Game {
  id: string;
  gameState: GameState;
  player1: Player;
  player2: Player;
  nextPlayer: Player;
  totalAmount: u128;
  creationAmount: u128;

  constructor() {
    this.id = context.blockIndex.toString().slice(2, 8);
    logging.log(this.id);
    this.gameState = GameState.created;
    this.player1 = new Player();
    this.player2 = new Player();
    this.player1.id = context.sender;
    this.nextPlayer = this.player1;
    this.totalAmount = context.attachedDeposit;
    this.creationAmount = context.attachedDeposit;
  }
}

export const games = new PersistentUnorderedMap<string, Game>("g");
