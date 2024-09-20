import Utils from './utils.js';
 class View {
    constructor(element, game, perspective) {
        this.element = element;
        this.game = game;
        this.setPerspective(perspective || this.game.turn);
        this.tiles = Utils.getInitialBoardTiles(this.element, this.handleTileClick.bind(this));
        this.pieces = Utils.getInitialBoardPieces(this.element, this.game.board.pieces);
        this.drawPiecePositions();
    }
    drawActivePiece(activePieceId) {
        const { row, col } = this.game.board.piecePositions[activePieceId];
        this.tiles[row][col].classList.add("highlight-active");
        this.pieces[activePieceId].classList.add("highlight-active");
    }
    drawCapturedPiece(capturedPieceId) {
        const piece = this.pieces[capturedPieceId];
        piece.style.setProperty("--transition-delay", "var(--transition-duration)");
        piece.style.removeProperty("--pos-col");
        piece.style.removeProperty("--pos-row");
        piece.style.setProperty("--scale", "0");
    }
    drawPiecePositions(moves = [], moveInner = "") {
        document.body.style.setProperty("--color-background", `var(--color-${this.game.turn.toLowerCase()}`);
        const other = this.game.turn === "WHITE" ? "turn-black" : "turn-white";
        const current = this.game.turn === "WHITE" ? "turn-white" : "turn-black";
        this.element.classList.add(current);
        this.element.classList.remove(other);
        if (moves.length) {
            this.element.classList.add("touching");
        }
        else {
            this.element.classList.remove("touching");
        }
        const key = (row, col) => `${row}-${col}`;
        const moveKeys = moves.map(({ row, col }) => key(row, col));
        this.game.board.tileEach(({ row, col }, piece, pieceMoves, pieceCaptures) => {
            const tileElement = this.tiles[row][col];
            const move = moveKeys.includes(key(row, col)) ? moveInner : "";
            const format = (id, className) => this.game.board.pieces[id].shape();
            tileElement.innerHTML = `
        <div class="move">${move}</div>
        <div class="moves">
          ${this.game.board.tilesPiecesBlackMoves[row][col].map((id) => format(id, "black")).join("")}
          ${this.game.board.tilesPiecesWhiteMoves[row][col].map((id) => format(id, "white")).join("")}
        </div>
        <div class="captures">
          ${this.game.board.tilesPiecesBlackCaptures[row][col].map((id) => format(id, "black")).join("")}
          ${this.game.board.tilesPiecesWhiteCaptures[row][col].map((id) => format(id, "white")).join("")}
        </div>
      `;
            if (piece) {
                tileElement.classList.add("occupied");
                const pieceElement = this.pieces[piece.data.id];
                pieceElement.style.setProperty("--pos-col", Utils.colToInt(col).toString());
                pieceElement.style.setProperty("--pos-row", Utils.rowToInt(row).toString());
                pieceElement.style.setProperty("--scale", "1");
                pieceElement.classList[(pieceMoves === null || pieceMoves === void 0 ? void 0 : pieceMoves.length) ? "add" : "remove"]("can-move");
                pieceElement.classList[(pieceCaptures === null || pieceCaptures === void 0 ? void 0 : pieceCaptures.length) ? "add" : "remove"]("can-capture");
                if (piece.updateShape) {
                    piece.updateShape = false;
                    pieceElement.innerHTML = piece.shape();
                }
            }
            else {
                tileElement.classList.remove("occupied");
            }
        });
    }
    drawPositions(moves, captures) {
        moves === null || moves === void 0 ? void 0 : moves.forEach(({ row, col }) => {
            var _a, _b;
            this.tiles[row][col].classList.add("highlight-move");
            (_b = this.pieces[(_a = this.game.board.tileFind({ row, col })) === null || _a === void 0 ? void 0 : _a.data.id]) === null || _b === void 0 ? void 0 : _b.classList.add("highlight-move");
        });
        captures === null || captures === void 0 ? void 0 : captures.forEach(({ row, col, capture }) => {
            var _a, _b;
            if (capture) {
                row = capture.row;
                col = capture.col;
            }
            this.tiles[row][col].classList.add("highlight-capture");
            (_b = this.pieces[(_a = this.game.board.tileFind({ row, col })) === null || _a === void 0 ? void 0 : _a.data.id]) === null || _b === void 0 ? void 0 : _b.classList.add("highlight-capture");
        });
    }
    drawResetClassNames() {
        document.querySelectorAll(".highlight-active").forEach((element) => element.classList.remove("highlight-active"));
        document.querySelectorAll(".highlight-capture").forEach((element) => element.classList.remove("highlight-capture"));
        document.querySelectorAll(".highlight-move").forEach((element) => element.classList.remove("highlight-move"));
    }
    handleTileClick(location) {
        const { activePieceId, capturedPieceId, moves = [], captures = [], type } = this.game.activate(location);
        this.drawResetClassNames();
        if (type === "TOUCH") {
            const enPassant = captures.find((capture) => !!capture.capture);
            const passingMoves = enPassant ? moves.concat([enPassant]) : moves;
            this.drawPiecePositions(passingMoves, this.game.board.pieces[activePieceId].shape());
        }
        else {
            this.drawPiecePositions();
        }
        if (type === "CANCEL" || type === "INVALID") {
            return;
        }
        if (type === "MOVE" || type === "CAPTURE") {
        }
        else {
            this.drawActivePiece(activePieceId);
        }
        if (type === "TOUCH") {
            this.drawPositions(moves, captures);
        }
        else if (type === "CAPTURE") {
            this.drawCapturedPiece(capturedPieceId);
        }
        // crazy town
        // this.setPerspective(this.game.turn);
    }
    setPerspective(perspective) {
        const other = perspective === "WHITE" ? "perspective-black" : "perspective-white";
        const current = perspective === "WHITE" ? "perspective-white" : "perspective-black";
        this.element.classList.add(current);
        this.element.classList.remove(other);
    }
}

export default View;