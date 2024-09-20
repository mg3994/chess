import Board from './board.js';
import Piece from './piece.js';
class Utils {
    /**
    * Converts a column letter to its corresponding index.
    * @param {string} col - The column letter (A-H).
    * @returns {number} - The index of the column.
    */
   static colToInt(col) {
       return Board.COLS.indexOf(col);
   }

    /**
    * Converts a row number to its corresponding index.
    * @param {string} row - The row number (1-8).
    * @returns {number} - The index of the row.
    */
   static rowToInt(row) {
       return Board.ROWS.indexOf(row);
   }
    /**
    * Converts a column index to its corresponding letter.
    * @param {number} int - The index of the column.
    * @returns {string} - The column letter (A-H).
    */
   static intToCol(int) {
       return Board.COLS[int];
   }

   /**
    * Converts a row index to its corresponding number.
    * @param {number} int - The index of the row.
    * @returns {string} - The row number (1-8).
    */
   static intToRow(int) {
       return Board.ROWS[int];
   }
    /**
    * Parses a short code to generate piece positions.
    * @param {string} shortCode - The short code representing the board state.
    * @returns {object} - The positions of the pieces.
    */
   static getPositionsFromShortCode(shortCode) {
       const positions = Utils.getInitialPiecePositions();
       const overrides = {};
       const defaultPositionMode = shortCode.charAt(0) === "X";
       if (defaultPositionMode) {
           shortCode = shortCode.slice(1);
       }
       shortCode.split(",").forEach((string) => {
           const promoted = string.charAt(0) === "P";
           if (promoted) {
               string = string.slice(1);
           }
           if (defaultPositionMode) {
               const inactive = string.length === 3;
               const id = string.slice(0, 2);
               const col = inactive ? undefined : string.charAt(2);
               const row = inactive ? undefined : string.charAt(3);
               const moves = string.charAt(4) || "1";
               overrides[id] = {
                   col,
                   row,
                   active: !inactive,
                   _moves: parseInt(moves),
                   _promoted: promoted,
               };
           }
           else {
               const moved = string.length >= 4;
               const id = string.slice(0, 2);
               const col = string.charAt(moved ? 2 : 0);
               const row = string.charAt(moved ? 3 : 1);
               const moves = string.charAt(4) || moved ? "1" : "0";
               overrides[id] = { col, row, active: true, _moves: parseInt(moves), _promoted: promoted };
           }
       });
       for (let id in positions) {
           if (overrides[id]) {
               positions[id] = overrides[id];
           }
           else {
               positions[id] = defaultPositionMode ? positions[id] : { active: false };
           }
       }
       return positions;
   }
   /**
    * Generates the initial board pieces.
    * @param {HTMLElement} parent - The parent element to append the pieces to.
    * @param {{[key: string]: Piece}} pieces - The pieces to be placed on the board.
    * @returns {{[key: string]: HTMLElement}} - The board pieces.
    */
   static getInitialBoardPieces(parent, pieces) {
       const boardPieces = {};
       const container = document.createElement("div");
       container.className = "pieces";
       parent.appendChild(container);
       for (let pieceId in pieces) {
           const boardPiece = document.createElement("div");
           boardPiece.className = `piece ${pieces[pieceId].data.player.toLowerCase()}`;
           boardPiece.innerHTML = pieces[pieceId].shape();
           container.appendChild(boardPiece);
           boardPieces[pieceId] = boardPiece;
       }
       return boardPieces;
   }
   /**
    * Generates the initial state of the board tiles.
    * @param {HTMLElement} parent - The parent element to append the board to.
    * @param {function({row: string, col: string}): void} handler - The function to run when a tile is clicked.
    * @returns {{[row: string]: {[col: string]: HTMLElement}}} - The board tiles, indexed by row and column.
    */
   static getInitialBoardTiles(parent, handler) {
       const tiles = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {} };
       const board = document.createElement("div");
       board.className = "board";
       parent.appendChild(board);
       for (let i = 0; i < 8; i++) {
           const row = document.createElement("div");
           row.className = "row";
           board.appendChild(row);
           for (let j = 0; j < 8; j++) {
               const tile = document.createElement("button");
               tile.className = "tile";
               const r = Utils.intToRow(i);
               const c = Utils.intToCol(j);
               tile.addEventListener("click", () => handler({ row: r, col: c }));
               row.appendChild(tile);
               tiles[r][c] = tile;
           }
       }
       return tiles;
   }
   /**
    * Generates the initial state of the board.
    * @param {function(): any} [construct=() => undefined] - The function to construct the initial state.
    * @returns {{[row: string]: {[col: string]: any}}} - The initial state of the board.
    */
   static getInitialBoardState(construct = () => undefined) {
       const blankRow = () => ({
           A: construct(),
           B: construct(),
           C: construct(),
           D: construct(),
           E: construct(),
           F: construct(),
           G: construct(),
           H: construct(),
       });
       return {
           1: Object.assign({}, blankRow()),
           2: Object.assign({}, blankRow()),
           3: Object.assign({}, blankRow()),
           4: Object.assign({}, blankRow()),
           5: Object.assign({}, blankRow()),
           6: Object.assign({}, blankRow()),
           7: Object.assign({}, blankRow()),
           8: Object.assign({}, blankRow()),
       };
   }
   /**
    * Generates the initial positions of the pieces.
    * @returns {{[key: string]: {active: boolean, row: string, col: string}}} - The initial positions of the pieces.
    */
   static getInitialPiecePositions() {
       return {
           A8: { active: true, row: "8", col: "A" },
           B8: { active: true, row: "8", col: "B" },
           C8: { active: true, row: "8", col: "C" },
           D8: { active: true, row: "8", col: "D" },
           E8: { active: true, row: "8", col: "E" },
           F8: { active: true, row: "8", col: "F" },
           G8: { active: true, row: "8", col: "G" },
           H8: { active: true, row: "8", col: "H" },
           A7: { active: true, row: "7", col: "A" },
           B7: { active: true, row: "7", col: "B" },
           C7: { active: true, row: "7", col: "C" },
           D7: { active: true, row: "7", col: "D" },
           E7: { active: true, row: "7", col: "E" },
           F7: { active: true, row: "7", col: "F" },
           G7: { active: true, row: "7", col: "G" },
           H7: { active: true, row: "7", col: "H" },
           A2: { active: true, row: "2", col: "A" },
           B2: { active: true, row: "2", col: "B" },
           C2: { active: true, row: "2", col: "C" },
           D2: { active: true, row: "2", col: "D" },
           E2: { active: true, row: "2", col: "E" },
           F2: { active: true, row: "2", col: "F" },
           G2: { active: true, row: "2", col: "G" },
           H2: { active: true, row: "2", col: "H" },
           A1: { active: true, row: "1", col: "A" },
           B1: { active: true, row: "1", col: "B" },
           C1: { active: true, row: "1", col: "C" },
           D1: { active: true, row: "1", col: "D" },
           E1: { active: true, row: "1", col: "E" },
           F1: { active: true, row: "1", col: "F" },
           G1: { active: true, row: "1", col: "G" },
           H1: { active: true, row: "1", col: "H" },
       };
   }
   /**
    * Generates the initial pieces.
    * @returns {{[key: string]: Piece}} - The initial pieces.
    */
   static getInitialPieces() {
       return {
           A8: new Piece({ id: "A8", player: "BLACK", type: "ROOK" }),
           B8: new Piece({ id: "B8", player: "BLACK", type: "KNIGHT" }),
           C8: new Piece({ id: "C8", player: "BLACK", type: "BISHOP" }),
           D8: new Piece({ id: "D8", player: "BLACK", type: "QUEEN" }),
           E8: new Piece({ id: "E8", player: "BLACK", type: "KING" }),
           F8: new Piece({ id: "F8", player: "BLACK", type: "BISHOP" }),
           G8: new Piece({ id: "G8", player: "BLACK", type: "KNIGHT" }),
           H8: new Piece({ id: "H8", player: "BLACK", type: "ROOK" }),
           A7: new Piece({ id: "A7", player: "BLACK", type: "PAWN" }),
           B7: new Piece({ id: "B7", player: "BLACK", type: "PAWN" }),
           C7: new Piece({ id: "C7", player: "BLACK", type: "PAWN" }),
           D7: new Piece({ id: "D7", player: "BLACK", type: "PAWN" }),
           E7: new Piece({ id: "E7", player: "BLACK", type: "PAWN" }),
           F7: new Piece({ id: "F7", player: "BLACK", type: "PAWN" }),
           G7: new Piece({ id: "G7", player: "BLACK", type: "PAWN" }),
           H7: new Piece({ id: "H7", player: "BLACK", type: "PAWN" }),
           A2: new Piece({ id: "A2", player: "WHITE", type: "PAWN" }),
           B2: new Piece({ id: "B2", player: "WHITE", type: "PAWN" }),
           C2: new Piece({ id: "C2", player: "WHITE", type: "PAWN" }),
           D2: new Piece({ id: "D2", player: "WHITE", type: "PAWN" }),
           E2: new Piece({ id: "E2", player: "WHITE", type: "PAWN" }),
           F2: new Piece({ id: "F2", player: "WHITE", type: "PAWN" }),
           G2: new Piece({ id: "G2", player: "WHITE", type: "PAWN" }),
           H2: new Piece({ id: "H2", player: "WHITE", type: "PAWN" }),
           A1: new Piece({ id: "A1", player: "WHITE", type: "ROOK" }),
           B1: new Piece({ id: "B1", player: "WHITE", type: "KNIGHT" }),
           C1: new Piece({ id: "C1", player: "WHITE", type: "BISHOP" }),
           D1: new Piece({ id: "D1", player: "WHITE", type: "QUEEN" }),
           E1: new Piece({ id: "E1", player: "WHITE", type: "KING" }),
           F1: new Piece({ id: "F1", player: "WHITE", type: "BISHOP" }),
           G1: new Piece({ id: "G1", player: "WHITE", type: "KNIGHT" }),
           H1: new Piece({ id: "H1", player: "WHITE", type: "ROOK" }),
       };
   }
}

export default  Utils;