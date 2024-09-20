import Board from './board.js';


class Game {
    constructor(pieces, piecePositions, turn = "WHITE") {
        this.active = null;
        this.activePieceOptions = [];
        this.moveIndex = 0;
        this.moves = [];
        this.turn = turn;
        this.board = new Board(pieces, piecePositions);
    }
    activate(location) {
        const tilePiece = this.board.tileFind(location);
        if (tilePiece && !this.active && tilePiece.data.player !== this.turn) {
            this.active = null;
            return { type: "INVALID" };
            // a piece is active rn
        }
        else if (this.active) {
            const activePieceId = this.active.data.id;
            this.active = null;
            const validatedPosition = this.activePieceOptions.find((option) => option.col === location.col && option.row === location.row);
            const positionIsValid = !!validatedPosition;
            this.activePieceOptions = [];
            const capturePiece = (validatedPosition === null || validatedPosition === void 0 ? void 0 : validatedPosition.capture) ? this.board.tileFind(validatedPosition.capture) : tilePiece;
            // a piece is on the tile
            if (capturePiece) {
                const capturedPieceId = capturePiece.data.id;
                // cancelling the selected piece on invalid location
                if (capturedPieceId === activePieceId) {
                    return { type: "CANCEL" };
                }
                else if (positionIsValid) {
                    // capturing the selected piece
                    this.capture(activePieceId, capturedPieceId, location);
                    return {
                        type: "CAPTURE",
                        activePieceId,
                        capturedPieceId,
                        captures: [location],
                    };
                    // cancel
                }
                else if (capturePiece.data.player !== this.turn) {
                    return { type: "CANCEL" };
                }
                else {
                    // proceed to TOUCH or CANCEL
                }
            }
            else if (positionIsValid) {
                // moving will return castled if that happens (only two move)
                const castledId = this.move(activePieceId, location);
                return { type: "MOVE", activePieceId, moves: [location], castledId };
                // invalid spot. cancel.
            }
            else {
                return { type: "CANCEL" };
            }
        }
        // no piece selected or new CANCEL + TOUCH
        if (tilePiece) {
            const tilePieceId = tilePiece.data.id;
            const moves = this.board.piecesTilesMoves[tilePieceId];
            const captures = this.board.piecesTilesCaptures[tilePieceId];
            if (!moves.length && !captures.length) {
                return { type: "INVALID" };
            }
            this.active = tilePiece;
            this.activePieceOptions = moves.concat(captures);
            return { type: "TOUCH", captures, moves, activePieceId: tilePieceId };
            // cancelling
        }
        else {
            this.activePieceOptions = [];
            return { type: "CANCEL" };
        }
    }
    capture(capturingPieceId, capturedPieceId, location) {
        const captured = this.board.pieces[capturedPieceId];
        this.board.pieceCapture(captured);
        this.move(capturingPieceId, location, true);
    }
    handleCastling(piece, location) {
        if (piece.data.type !== "KING" ||
            piece.moves.length ||
            location.row !== (piece.playerWhite() ? "1" : "8") ||
            (location.col !== "C" && location.col !== "G")) {
            return;
        }
        return `${location.col === "C" ? "A" : "H"}${location.row}`;
    }
    move(pieceId, location, capture = false) {
        const piece = this.board.pieces[pieceId];
        const castledId = this.handleCastling(piece, location);
        piece.move(this.moveIndex);
        if (castledId) {
            const castled = this.board.pieces[castledId];
            castled.move(this.moveIndex);
            this.board.pieceMove(castled, { col: location.col === "C" ? "D" : "F", row: location.row });
            this.moves.push(`${pieceId}O${location.col}${location.row}`);
        }
        else {
            this.moves.push(`${pieceId}${capture ? "x" : ""}${location.col}${location.row}`);
        }
        this.moveIndex++;
        this.board.pieceMove(piece, location);
        this.turn = this.turn === "WHITE" ? "BLACK" : "WHITE";
        this.board.piecesUpdate(this.moveIndex);
        const state = this.moveResultState();
        console.log(state);
        if (!state.moves && !state.captures) {
            alert(state.stalemate ? "Stalemate!" : `${this.turn === "WHITE" ? "Black" : "White"} Wins!`);
            // Show A PopUp to Restart The game
        }
        return castledId;
    }
    moveResultState() {
        let movesWhite = 0;
        let capturesWhite = 0;
        let movesBlack = 0;
        let capturesBlack = 0;
        this.board.tileEach(({ row, col }) => {
            movesWhite += this.board.tilesPiecesWhiteMoves[row][col].length;
            capturesWhite += this.board.tilesPiecesWhiteCaptures[row][col].length;
            movesBlack += this.board.tilesPiecesBlackMoves[row][col].length;
            capturesBlack += this.board.tilesPiecesBlackCaptures[row][col].length;
        });
        const activeBlack = this.board.pieceIdsBlack.filter((pieceId) => this.board.piecePositions[pieceId].active).length;
        const activeWhite = this.board.pieceIdsWhite.filter((pieceId) => this.board.piecePositions[pieceId].active).length;
        const moves = this.turn === "WHITE" ? movesWhite : movesBlack;
        const captures = this.turn === "WHITE" ? capturesWhite : capturesBlack;
        const noMoves = movesWhite + capturesWhite + movesBlack + capturesBlack === 0;
        const checked = !!this.board[this.turn === "WHITE" ? "checksBlack" : "checksWhite"].length;
        const onlyKings = activeBlack === 1 && activeWhite === 1;
        const stalemate = onlyKings || noMoves || ((moves + captures === 0) && !checked);
        const code = this.board.toShortCode();
        return { turn: this.turn, checked, moves, captures, code, stalemate };
    }
    randomMove() {
        if (this.active) {
            if (this.activePieceOptions.length) {
                const { col, row } = this.activePieceOptions[Math.floor(Math.random() * this.activePieceOptions.length)];
                return { col, row };
            }
            else {
                const { col, row } = this.board.piecePositions[this.active.data.id];
                return { col, row };
            }
        }
        else {
            const ids = this.turn === "WHITE" ? this.board.pieceIdsWhite : this.board.pieceIdsBlack;
            const positions = ids.map((pieceId) => {
                const moves = this.board.piecesTilesMoves[pieceId];
                const captures = this.board.piecesTilesCaptures[pieceId];
                return (moves.length || captures.length) ? this.board.piecePositions[pieceId] : undefined;
            }).filter((position) => position === null || position === void 0 ? void 0 : position.active);
            const remaining = positions[Math.floor(Math.random() * positions.length)];
            const { col, row } = remaining || { col: "E", row: "1" };
            return { col, row };
        }
    }
}


export default Game;