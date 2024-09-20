
import Constraints from './constraints.js';

import Shape from './shape.js';
import Utils from './utils.js';



class Piece {
    /**
     * Creates a new Piece object.
     * @param {object} data - The data for this piece, which must have a player and a type.
     */
    constructor(data) {
        this.moves = [];
        this.promoted = false;
        this.updateShape = false;
        this.data = data;
    }
    //  PIECE_DIR_CALC = 0;
    /**
     * Gets the orientation of this piece, which is 1 for a white piece and -1 for a black piece.
     * @returns {number} The orientation of this piece.
     */
    get orientation() {
        return this.data.player === "BLACK" ? -1 : 1;
    }
    /**
     * Returns the location steps rows above the piece.
     * @param {number} steps - The number of rows above the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps rows above the piece, or undefined if the location is off the board.
     */
    dirN(steps, positions) {
        return this.dir(steps, 0, positions);
    }
    /**
     * Returns the location steps rows below the piece.
     * @param {number} steps - The number of rows below the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps rows below the piece, or undefined if the location is off the board.
     */
    dirS(steps, positions) {
        return this.dir(-steps, 0, positions);
    }
    /**
     * Returns the location steps columns to the left of the piece.
     * @param {number} steps - The number of columns to the left of the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps columns to the left of the piece, or undefined if the location is off the board.
     */
    dirW(steps, positions) {
        return this.dir(0, -steps, positions);
    }
    /**
     * Returns the location steps columns to the right of the piece.
     * @param {number} steps - The number of columns to the right of the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps columns to the right of the piece, or undefined if the location is off the board.
     */
    dirE(steps, positions) {
        return this.dir(0, steps, positions);
    }
    /**
     * Returns the location steps rows above and columns to the left of the piece.
     * @param {number} steps - The number of rows above and columns to the left of the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps rows above and columns to the left of the piece, or undefined if the location is off the board.
     */
    dirNW(steps, positions) {
        return this.dir(steps, -steps, positions);
    }
    /**
     * Returns the location steps rows above and columns to the right of the piece.
     * @param {number} steps - The number of rows above and columns to the right of the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps rows above and columns to the right of the piece, or undefined if the location is off the board.
     */
    dirNE(steps, positions) {
        return this.dir(steps, steps, positions);
    }
    /**
     * Returns the location steps rows below and columns to the left of the piece.
     * @param {number} steps - The number of rows below and columns to the left of the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps rows below and columns to the left of the piece, or undefined if the location is off the board.
     */
    dirSW(steps, positions) {
        return this.dir(-steps, -steps, positions);
    }
    /**
     * Returns the location steps rows below and columns to the right of the piece.
     * @param {number} steps - The number of rows below and columns to the right of the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps rows below and columns to the right of the piece, or undefined if the location is off the board.
     */
    dirSE(steps, positions) {
        return this.dir(-steps, steps, positions);
    }
    /**
     * Returns the location steps rows and columns from the piece.
     * @param {number} stepsRow - The number of rows from the piece.
     * @param {number} stepsColumn - The number of columns from the piece.
     * @param {object} positions - The positions of the pieces.
     * @returns {Location} - The location steps rows and columns from the piece, or undefined if the location is off the board.
     */
    dir(stepsRow, stepsColumn, positions) {
        // PIECE_DIR_CALC++;
        const row = Utils.rowToInt(positions[this.data.id].row) + this.orientation * stepsRow;
        const col = Utils.colToInt(positions[this.data.id].col) + this.orientation * stepsColumn;
        if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
            return { row: Utils.intToRow(row), col: Utils.intToCol(col) };
        }
        return undefined;
    }
    /**
     * Records a move made by the piece.
     * @param {number} moveIndex - The index of the move.
     */
    move(moveIndex) {
        this.moves.push(moveIndex);
    }
    /**
     * Returns the options of the piece at the given move index.
     * @param {number} moveIndex - The index of the move.
     * @param {object} state - The state of the board.
     * @param {object} pieces - The pieces on the board.
     * @param {object} piecePositions - The positions of the pieces.
     * @param {function} resultingChecks - The function to call to get the resulting checks of a move.
     * @param {function} kingCastles - The function to call to get if the king can castle.
     * @returns {object} - The options of the piece, with the moves and captures as arrays of Location objects.
     */
    options(moveIndex, state, pieces, piecePositions, resultingChecks, kingCastles) {
        return Constraints.generate({ moveIndex, state, piece: this, pieces, piecePositions, kingCastles }, resultingChecks);
    }
    /**
     * Returns true if the piece is black, false otherwise.
     * @returns {boolean} - True if the piece is black, false otherwise.
     */
    playerBlack() {
        return this.data.player === "BLACK";
    }
    /**
     * Returns true if the piece is white, false otherwise.
     * @returns {boolean} - True if the piece is white, false otherwise.
     */
    playerWhite() {
        return this.data.player === "WHITE";
    }
    /**
     * Promotes the piece to the given type.
     * @param {string} type - The type to promote to. Defaults to "QUEEN".
     */
    promote(type = "QUEEN") {
        this.data.type = type;
        this.promoted = true;
        this.updateShape = true;
    }
    /**
     * Returns the SVG shape for the piece.
     * @returns {string} - The SVG shape for the piece.
     */
    shape() {
        const player = this.data.player.toLowerCase();
        switch (this.data.type) {
            case "BISHOP":
                return Shape.shapeBishop(player);
            case "KING":
                return Shape.shapeKing(player);
            case "KNIGHT":
                return Shape.shapeKnight(player);
            case "PAWN":
                return Shape.shapePawn(player);
            case "QUEEN":
                return Shape.shapeQueen(player);
            case "ROOK":
                return Shape.shapeRook(player);
        }
    }
}

export default Piece;