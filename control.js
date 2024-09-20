
 class Control {
    constructor(game, view) {
        this.inputSpeedAsap = document.getElementById("speed-asap");
        this.inputSpeedFast = document.getElementById("speed-fast");
        this.inputSpeedMedium = document.getElementById("speed-medium");
        this.inputSpeedSlow = document.getElementById("speed-slow");
        this.inputRandomBlack = document.getElementById("black-random");
        this.inputRandomWhite = document.getElementById("white-random");
        this.inputPerspectiveBlack = document.getElementById("black-perspective");
        this.inputPerspectiveWhite = document.getElementById("white-perspective");
        this.game = game;
        this.view = view;
        this.inputPerspectiveBlack.addEventListener("change", this.updateViewPerspective.bind(this));
        this.inputPerspectiveWhite.addEventListener("change", this.updateViewPerspective.bind(this));
        this.updateViewPerspective();
    }
    get speed() {
        if (this.inputSpeedAsap.checked) {
            return 50;
        }
        if (this.inputSpeedFast.checked) {
            return 250;
        }
        if (this.inputSpeedMedium.checked) {
            return 500;
        }
        if (this.inputSpeedSlow.checked) {
            return 1000;
        }
    }
    autoplay() {
        const input = this.game.turn === "WHITE" ? this.inputRandomWhite : this.inputRandomBlack;
        if (!input.checked) {
            setTimeout(this.autoplay.bind(this), this.speed);
            return;
        }
        const position = this.game.randomMove();
        this.view.handleTileClick(position);
        setTimeout(this.autoplay.bind(this), this.speed);
    }
    updateViewPerspective() {
        this.view.setPerspective(this.inputPerspectiveBlack.checked ? "BLACK" : "WHITE");
    }
}


export default Control;