import Piece from './piece.js';
import Utils from './utils.js';
class Board {
    /**
     * Initializes a new Board object.
     * @param {Object<string, Piece>} pieces - A mapping of piece IDs to Piece objects.
     * @param {Object<string, {row: number, col: number}>} piecePositions - A mapping of piece IDs to their positions.
     */
    constructor(pieces, piecePositions) {
        this.checksBlack = [];
        this.checksWhite = [];
        this.piecesTilesCaptures = {};
        this.piecesTilesMoves = {};
        this.tilesPiecesBlackCaptures = Utils.getInitialBoardState(() => []);
        this.tilesPiecesBlackMoves = Utils.getInitialBoardState(() => []);
        this.tilesPiecesWhiteCaptures = Utils.getInitialBoardState(() => []);
        this.tilesPiecesWhiteMoves = Utils.getInitialBoardState(() => []);
        this.pieceIdsBlack = [];
        this.pieceIdsWhite = [];
        this.state = Utils.getInitialBoardState();
        this.pieces = pieces;
        for (let id in pieces) {
            if (pieces[id].playerWhite()) {
                this.pieceIdsWhite.push(id);
            }
            else {
                this.pieceIdsBlack.push(id);
            }
        }
        this.initializePositions(piecePositions);
    }
    /**
     * Initializes the positions of the pieces.
     * @param {Object<string, {row: number, col: number, active: boolean, _moves?: number, _promoted?: boolean}>} piecePositions - A mapping of piece IDs to their positions.
     */
    initializePositions(piecePositions) {
        this.piecePositions = piecePositions;
        this.initializeState();
        this.piecesUpdate(0);
    }
    /**
     * Initializes the state of the board from the piece positions.
     * It sets the active pieces in the state and promotes them if they are promoted.
     */
    initializeState() {
        for (let pieceId in this.pieces) {
            const { row, col, active, _moves, _promoted } = this.piecePositions[pieceId];
            if (typeof _moves === "number") {
                delete this.piecePositions[pieceId]._moves;
                this.pieces[pieceId].moves = new Array(_moves);
                //TODO: this.pieces[pieceId].options(0, this.state, this.pieces, this.piecePositions, this.resultingChecks, this.kingCastles);
            }
            if (_promoted) {
                delete this.piecePositions[pieceId]._promoted;
                this.pieces[pieceId].promote();
            }
            if (active) {
                this.state[row] = this.state[row] || [];
                this.state[row][col] = pieceId;
            }
        }
    }
    /**
     * Checks if the king can castle and returns the positions of the possible castlings.
     * @param {Piece} king - The king piece.
     * @return {Array<{col: string, row: string, castles: string}>} - An array of positions of the possible castlings.
     */
    kingCastles(king) {
        const castles = [];
        // king has to not have moved
        if (king.moves.length) {
            return castles;
        }
        const kingIsWhite = king.playerWhite();
        const moves = kingIsWhite ? this.tilesPiecesBlackMoves : this.tilesPiecesWhiteMoves;
        /**
         * Checks if the king can castle with the rook at `rookCol` and row `row`.
         * @param {string} row - The row of the rook.
         * @param {string} rookCol - The column of the rook.
         * @param {Array<{col: string, row: string, castles: string}>} castles - The array of the possible castlings.
         */
        const checkPositions = (row, rookCol, castles) => {
            const cols = rookCol === "A" ? ["D", "C", "B"] : ["F", "G"];
            // rook has to not have moved
            const rookId = `${rookCol}${row}`;
            const rook = this.pieces[rookId];
            const { active } = this.piecePositions[rookId];
            if (active && rook.moves.length === 0) {
                let canCastle = true;
                cols.forEach((col) => {
                    // each tile has to be empty
                    if (this.state[row][col]) {
                        canCastle = false;
                        // each tile cant be in the path of the other team
                    }
                    else if (moves[row][col].length) {
                        canCastle = false;
                    }
                });
                if (canCastle) {
                    castles.push({ col: cols[1], row, castles: rookCol });
                }
            }
        };
        const row = kingIsWhite ? "1" : "8";
        if (!this.pieces[`A${row}`].moves.length) {
            checkPositions(row, "A", castles);
        }
        if (!this.pieces[`H${row}`].moves.length) {
            checkPositions(row, "H", castles);
        }
        return castles;
    }
    kingCheckStates(kingPosition, captures, piecePositions) {
        const { col, row } = kingPosition;
        return captures[row][col].map((id) => piecePositions[id]).filter((pos) => pos.active);
    }
    pieceCalculateMoves(pieceId, moveIndex, state, piecePositions, piecesTilesCaptures, piecesTilesMoves, tilesPiecesCaptures, tilesPiecesMoves, resultingChecks, kingCastles) {
        const { captures, moves } = this.pieces[pieceId].options(moveIndex, state, this.pieces, piecePositions, resultingChecks, kingCastles);
        piecesTilesCaptures[pieceId] = Array.from(captures);
        piecesTilesMoves[pieceId] = Array.from(moves);
        captures.forEach(({ col, row }) => tilesPiecesCaptures[row][col].push(pieceId));
        moves.forEach(({ col, row }) => tilesPiecesMoves[row][col].push(pieceId));
    }
    pieceCapture(piece) {
        const pieceId = piece.data.id;
        const { col, row } = this.piecePositions[pieceId];
        this.state[row][col] = undefined;
        delete this.piecePositions[pieceId].col;
        delete this.piecePositions[pieceId].row;
        this.piecePositions[pieceId].active = false;
    }
    pieceMove(piece, location) {
        const pieceId = piece.data.id;
        const { row, col } = this.piecePositions[pieceId];
        this.state[row][col] = undefined;
        this.state[location.row][location.col] = pieceId;
        this.piecePositions[pieceId].row = location.row;
        this.piecePositions[pieceId].col = location.col;
        if (piece.data.type === "PAWN" && (location.row === "8" || location.row === "1")) {
            piece.promote();
        }
    }
    piecesUpdate(moveIndex) {
        this.tilesPiecesBlackCaptures = Utils.getInitialBoardState(() => []);
        this.tilesPiecesBlackMoves = Utils.getInitialBoardState(() => []);
        this.tilesPiecesWhiteCaptures = Utils.getInitialBoardState(() => []);
        this.tilesPiecesWhiteMoves = Utils.getInitialBoardState(() => []);
        this.pieceIdsBlack.forEach((id) => this.pieceCalculateMoves(id, moveIndex, this.state, this.piecePositions, this.piecesTilesCaptures, this.piecesTilesMoves, this.tilesPiecesBlackCaptures, this.tilesPiecesBlackMoves, this.resultingChecks.bind(this), this.kingCastles.bind(this)));
        this.pieceIdsWhite.forEach((id) => this.pieceCalculateMoves(id, moveIndex, this.state, this.piecePositions, this.piecesTilesCaptures, this.piecesTilesMoves, this.tilesPiecesWhiteCaptures, this.tilesPiecesWhiteMoves, this.resultingChecks.bind(this), this.kingCastles.bind(this)));
        this.checksBlack = this.kingCheckStates(this.piecePositions.E1, this.tilesPiecesBlackCaptures, this.piecePositions);
        this.checksWhite = this.kingCheckStates(this.piecePositions.E8, this.tilesPiecesWhiteCaptures, this.piecePositions);
    }
    resultingChecks({ piece, location, capture, moveIndex }) {
        const tilesPiecesCaptures = Utils.getInitialBoardState(() => []);
        const tilesPiecesMoves = Utils.getInitialBoardState(() => []);
        const piecesTilesCaptures = {};
        const piecesTilesMoves = {};
        const state = JSON.parse(JSON.stringify(this.state));
        const piecePositions = JSON.parse(JSON.stringify(this.piecePositions));
        if (capture) {
            const loc = location.capture || location;
            const capturedId = state[loc.row][loc.col];
            if (this.pieces[capturedId].data.type === "KING") {
                // this is a checking move
            }
            else {
                delete piecePositions[capturedId].col;
                delete piecePositions[capturedId].row;
                piecePositions[capturedId].active = false;
            }
        }
        const pieceId = piece.data.id;
        const { row, col } = piecePositions[pieceId];
        state[row][col] = undefined;
        state[location.row][location.col] = pieceId;
        piecePositions[pieceId].row = location.row;
        piecePositions[pieceId].col = location.col;
        const ids = piece.playerWhite() ? this.pieceIdsBlack : this.pieceIdsWhite;
        const king = piece.playerWhite() ? piecePositions.E1 : piecePositions.E8;
        ids.forEach((id) => this.pieceCalculateMoves(id, moveIndex, state, piecePositions, piecesTilesCaptures, piecesTilesMoves, tilesPiecesCaptures, tilesPiecesMoves));
        return this.kingCheckStates(king, tilesPiecesCaptures, piecePositions);
    }

    tileEach(callback) {
        Board.ROWS.forEach((row) => {
            Board.COLS.forEach((col) => {
                const piece = this.tileFind({ row, col });
                const moves = piece ? this.piecesTilesMoves[piece.data.id] : undefined;
                const captures = piece ? this.piecesTilesCaptures[piece.data.id] : undefined;
                callback({ row, col }, piece, moves, captures);
            });
        });
    }
    tileFind({ row, col }) {
        const id = this.state[row][col];
        return this.pieces[id];
    }
    toShortCode() {
        const positionsAbsolute = [];
        const positionsDefaults = [];
        for (let id in this.piecePositions) {
            const { active, col, row } = this.piecePositions[id];
            const pos = `${col}${row}`;
            const moves = this.pieces[id].moves;
            const promotedCode = this.pieces[id].promoted ? "P" : "";
            const movesCode = moves > 9 ? "9" : moves > 1 ? moves.toString() : "";
            if (active) {
                positionsAbsolute.push(`${promotedCode}${id}${id === pos ? "" : pos}${movesCode}`);
                if (id !== pos || moves > 0) {
                    positionsDefaults.push(`${promotedCode}${id}${pos}${movesCode}`);
                }
            }
            else {
                if (id !== "BQ" && id !== "WQ") {
                    positionsDefaults.push(`${promotedCode}${id}X`);
                }
            }
        }
        const pA = positionsAbsolute.join(",");
        const pD = positionsDefaults.join(",");
        return pA.length > pD.length ? `X${pD}` : pA;
    }
}
Board.COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];
Board.ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"];


export default Board;