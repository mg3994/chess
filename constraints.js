
import Piece from './piece.js';

class Constraints {
    /**
     * Generates the possible moves and captures for a piece.
     * @param {object} args - The arguments for generating constraints.
     * @param {function} resultingChecks - The function to check resulting moves.
     * @returns {object} - The possible moves and captures.
     */
    static generate(args, resultingChecks) {
        let method;
        const { piecePositions, piece } = args;
        if (piecePositions[piece.data.id].active) {
            switch (piece.data.type) {
                case "BISHOP":
                    method = Constraints.constraintsBishop;
                    break;
                case "KING":
                    method = Constraints.constraintsKing;
                    break;
                case "KNIGHT":
                    method = Constraints.constraintsKnight;
                    break;
                case "PAWN":
                    method = Constraints.constraintsPawn;
                    break;
                case "QUEEN":
                    method = Constraints.constraintsQueen;
                    break;
                case "ROOK":
                    method = Constraints.constraintsRook;
                    break;
            }
        }
        const result = method ? method(args) : { moves: [], captures: [] };
        if (resultingChecks) {
            const moveIndex = args.moveIndex + 1;
            result.moves = result.moves.filter((location) => !resultingChecks({ piece, location, capture: false, moveIndex }).length);
            result.captures = result.captures.filter((location) => !resultingChecks({ piece, location, capture: true, moveIndex }).length);
        }
        return result;
    }
    /**
     * Generates the possible moves and captures for a bishop.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsBishop(args) {
        return Constraints.constraintsDiagonal(args);
    }
    /**
     * Generates the possible moves and captures for a piece that moves diagonally.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsDiagonal(args) {
        const response = { moves: [], captures: [] };
        const { piece } = args;
        Constraints.runUntil(piece.dirNW.bind(piece), response, args);
        Constraints.runUntil(piece.dirNE.bind(piece), response, args);
        Constraints.runUntil(piece.dirSW.bind(piece), response, args);
        Constraints.runUntil(piece.dirSE.bind(piece), response, args);
        return response;
    }
    /**
     * Generates the possible moves and captures for a king.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsKing(args) {
        const { piece, kingCastles, piecePositions } = args;
        const moves = [];
        const captures = [];
        const locations = [
            piece.dirN(1, piecePositions),
            piece.dirNE(1, piecePositions),
            piece.dirE(1, piecePositions),
            piece.dirSE(1, piecePositions),
            piece.dirS(1, piecePositions),
            piece.dirSW(1, piecePositions),
            piece.dirW(1, piecePositions),
            piece.dirNW(1, piecePositions),
        ];
        if (kingCastles) {
            const castles = kingCastles(piece);
            castles.forEach((position) => moves.push(position));
        }
        locations.forEach((location) => {
            const value = Constraints.relationshipToTile(location, args);
            if (value === "BLANK") {
                moves.push(location);
            }
            else if (value === "ENEMY") {
                captures.push(location);
            }
        });
        return { moves, captures };
    }
    /**
     * Generates the possible moves and captures for a knight.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsKnight(args) {
        const { piece, piecePositions } = args;
        const moves = [];
        const captures = [];
        const locations = [
            piece.dir(1, 2, piecePositions),
            piece.dir(1, -2, piecePositions),
            piece.dir(2, 1, piecePositions),
            piece.dir(2, -1, piecePositions),
            piece.dir(-1, 2, piecePositions),
            piece.dir(-1, -2, piecePositions),
            piece.dir(-2, 1, piecePositions),
            piece.dir(-2, -1, piecePositions),
        ];
        locations.forEach((location) => {
            const value = Constraints.relationshipToTile(location, args);
            if (value === "BLANK") {
                moves.push(location);
            }
            else if (value === "ENEMY") {
                captures.push(location);
            }
        });
        return { moves, captures };
    }
    /**
     * Generates the possible moves and captures for a piece that moves orthagonally.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsOrthangonal(args) {
        const { piece } = args;
        const response = { moves: [], captures: [] };
        Constraints.runUntil(piece.dirN.bind(piece), response, args);
        Constraints.runUntil(piece.dirE.bind(piece), response, args);
        Constraints.runUntil(piece.dirS.bind(piece), response, args);
        Constraints.runUntil(piece.dirW.bind(piece), response, args);
        return response;
    }
    /**
     * Generates the possible moves and captures for a pawn.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsPawn(args) {
        const { piece, piecePositions } = args;
        const moves = [];
        const captures = [];
        const locationN1 = piece.dirN(1, piecePositions);
        const locationN2 = piece.dirN(2, piecePositions);
        if (Constraints.relationshipToTile(locationN1, args) === "BLANK") {
            moves.push(locationN1);
            if (!piece.moves.length && Constraints.relationshipToTile(locationN2, args) === "BLANK") {
                moves.push(locationN2);
            }
        }
        [
            [piece.dirNW(1, piecePositions), piece.dirW(1, piecePositions)],
            [piece.dirNE(1, piecePositions), piece.dirE(1, piecePositions)],
        ].forEach(([location, enPassant]) => {
            const standardCaptureRelationship = Constraints.relationshipToTile(location, args);
            const enPassantCaptureRelationship = Constraints.relationshipToTile(enPassant, args);
            if (standardCaptureRelationship === "ENEMY") {
                captures.push(location);
            }
            else if (piece.moves.length > 0 && enPassantCaptureRelationship === "ENEMY") {
                const enPassantRow = enPassant.row === (piece.playerWhite() ? "5" : "4");
                const other = Constraints.locationToPiece(enPassant, args);
                if (enPassantRow && other && other.data.type === "PAWN") {
                    if (other.moves.length === 1 && other.moves[0] === args.moveIndex - 1) {
                        location.capture = Object.assign({}, enPassant);
                        captures.push(location);
                    }
                }
            }
        });
        return { moves, captures };
    }
    /**
     * Generates the possible moves and captures for a queen.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsQueen(args) {
        const diagonal = Constraints.constraintsDiagonal(args);
        const orthagonal = Constraints.constraintsOrthangonal(args);
        return {
            moves: diagonal.moves.concat(orthagonal.moves),
            captures: diagonal.captures.concat(orthagonal.captures),
        };
    }
    /**
     * Generates the possible moves and captures for a rook.
     * @param {object} args - The arguments for generating constraints.
     * @returns {object} - The possible moves and captures.
     */
    static constraintsRook(args) {
        return Constraints.constraintsOrthangonal(args);
    }
    /**
     * Returns the piece occupying a given location, or undefined if the location is unoccupied.
     * @param {Location} location - The location to check.
     * @param {object} args - The arguments for generating constraints.
     * @returns {Piece} - The piece occupying the location, or undefined if the location is unoccupied.
     */
    static locationToPiece(location, args) {
        if (!location) {
            return undefined;
        }
        const { state, pieces } = args;
        const row = state[location.row];
        const occupyingId = row === undefined ? undefined : row[location.col];
        return pieces[occupyingId];
    }
    /**
     * Returns the relationship between a piece and a given location.
     * @param {Location} location - The location to check.
     * @param {object} args - The arguments for generating constraints.
     * @returns {string} - The relationship between the piece and the location, either "FRIEND", "ENEMY", or "BLANK".
     */
    static relationshipToTile(location, args) {
        if (!location) {
            return undefined;
        }
        const { piece } = args;
        const occupying = Constraints.locationToPiece(location, args);
        if (occupying) {
            return occupying.data.player === piece.data.player ? "FRIEND" : "ENEMY";
        }
        else {
            return "BLANK";
        }
    }
    /**
     * Runs a given function until it returns undefined, adding all locations to the given response.
     * @param {function} locationFunction - The function to run, which takes an incrementing number and the piece positions as arguments.
     * @param {object} response - The response object to add the moves and captures to.
     * @param {object} args - The arguments for generating constraints.
     */
    static runUntil(locationFunction, response, args) {
        const { piecePositions } = args;
        let inc = 1;
        let location = locationFunction(inc++, piecePositions);
        while (location) {
            let abort = false;
            const relations = Constraints.relationshipToTile(location, args);
            if (relations === "ENEMY") {
                response.captures.push(location);
                abort = true;
            }
            else if (relations === "FRIEND") {
                abort = true;
            }
            else {
                response.moves.push(location);
            }
            if (abort) {
                location = undefined;
            }
            else {
                location = locationFunction(inc++, piecePositions);
            }
        }
    }
}


export default Constraints;