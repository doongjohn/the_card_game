class Layer {
    static bg = null;
    static board = null;
    static permanent = null;
    static ui = null;

    static init() {
        Layer.bg = Game.spawn.container().setDepth(0);
        Layer.board = Game.spawn.container().setDepth(1);
        Layer.permanent = Game.spawn.container().setDepth(2);
        Layer.ui = Game.spawn.container().setDepth(3);

        Game.addToWorld(
            Layer.bg,
            Layer.board,
            Layer.permanent,
            Layer.ui
        );
    }
}