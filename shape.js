class Shape {
    /**
     * Generates the SVG shape for a piece.
     * @param {string} player - The player color.
     * @param {string} piece - The piece type.
     * @returns {string} - The SVG shape.
     */
    static shape(player, piece) {
        return `<svg class="${player}" width="170" height="170" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <use href="#${piece}" />
    </svg>`;
    }
    /**
     * Generates the SVG shape for a bishop.
     * @param {string} player - The player color.
     * @returns {string} - The SVG shape for a bishop.
     */
    static shapeBishop(player) {
        return Shape.shape(player, "bishop");
    }
    /**
     * Generates the SVG shape for a king.
     * @param {string} player - The player color.
     * @returns {string} - The SVG shape for a king.
     */
    static shapeKing(player) {
        return Shape.shape(player, "king");
    }
    /**
     * Generates the SVG shape for a knight.
     * @param {string} player - The player color.
     * @returns {string} - The SVG shape for a knight.
     */
    static shapeKnight(player) {
        return Shape.shape(player, "knight");
    }
    /**
     * Generates the SVG shape for a pawn.
     * @param {string} player - The player color.
     * @returns {string} - The SVG shape for a pawn.
     */
    static shapePawn(player) {
        return Shape.shape(player, "pawn");
    }
    /**
     * Generates the SVG shape for a queen.
     * @param {string} player - The player color.
     * @returns {string} - The SVG shape for a queen.
     */
    static shapeQueen(player) {
        return Shape.shape(player, "queen");
    }
    /**
     * Generates the SVG shape for a rook.
     * @param {string} player - The player color.
     * @returns {string} - The SVG shape for a rook.
     */
    static shapeRook(player) {
        return Shape.shape(player, "rook");
    }
}


export default Shape;