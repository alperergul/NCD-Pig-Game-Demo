# NEAR Certified Developer Course

## 🐷 Pig Game

This project is a game of chance. It is played with two players. Players must deposit 1 NEAR to create or join the game. The player who created the game starts and rolls dice. As long as the dice do not roll 1, the player continues to roll the dice.. If the dice rolls 1, the score collected during that turns is reset. Players can keep the score in their total score before the dice rolls 1, but the turn passes to the other player. The game continues in this way and whoever collects 10 points wins.

## 🚀 Clone and Build

### 🤸‍♂️ To clone

    git clone https://github.com/alperergul/NCD-Pig-Game-Demo.git

### 🧰 To build

    yarn build:release
    near dev-deploy ./build/release/simple.wasm
    near login
    export CONTRACT=<accountId>

    - accountId is in this file -> ./neardev/dev-account
    - accountId looks like "dev-1231231231231-45645645645645"

## Contract Functions and How to Run Them?

### View All Games

    $ near view $CONTRACT viewAllGames

### Create Game

    $ near call $CONTRACT createGame --accountId <accountId> --amount 1

    - This function returns a number like "726061". This numbers is your GAME_ID.

### Joing Game

    $ near call $CONTRACT joinGame '{"id":"<GAME_ID>"}' --accountId <accountId2> --amount 1

### View Single Game Details with Game Id

    $ near view $CONTRACT viewGame '{"id":"<GAME_ID>"}'

### Roll Dice

    $ near call $CONTRACT rollDice '{"id":"<GAME_ID>"}' --accountId <accountId>

### Hold Score

    $ near call $CONTRACT holdScore '{"id":"<GAME_ID>"}' --accountId <accountId>

### Delete Completed Games

    $ near call $CONTRACT deleteCompletedGames '{"id":"<GAME_ID>"}' --accountId <accountId>

### Show Score Status

    $ near view $CONTRACT showScoreStatus '{"id":"<GAME_ID>"}'
