"use strict";
import Control from './control.js';
import Game from './game.js';
import Utils from './utils.js';
import View from './view.js';
console.clear();
const DEMOS = {
    castle1: "XD8B3,B1X,C1X,D1X,F1X,G1X",
    castle2: "XD8B3,B1X,C1X,C2X,D1X,F1X,G1X",
    castle3: "XD8E3,B1X,C1X,F2X,D1X,F1X,G1X",
    promote1: "E1,E8,C2C7",
    promote2: "E1,E8E7,PC2C8",
    start: "XE7E6,F7F5,D2D4,E2E5",
    test2: "C8E2,E8,G8H1,D7E4,H7H3,PA2H7,PB2G7,D2D6,E2E39,A1H2,E1B3",
    test: "C8E2,E8,G8H1,D7E4,H7H3,D1H7,PB2G7,D2D6,E2E39,A1H2,E1B3",
};
const initialPositions = Utils.getInitialPiecePositions();
// const initialPositions = Utils.getPositionsFromShortCode(DEMOS.castle1);
const initialTurn = "WHITE";
const perspective = "WHITE";
const game = new Game(Utils.getInitialPieces(), initialPositions, initialTurn);
const view = new View(document.getElementById("board"), game, perspective);
const control = new Control(game, view);
control.autoplay();