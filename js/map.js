class GameMap {
    constructor(canvasWidth, canvasHeight) {
        this.tileSize = 32;
        this.cols = 40; // 40 * 32 = 1280 (maior que o canvas para scroll ou apenas preencher)
        this.rows = 40;
        this.data = [];
        this.generate();
    }

    generate() {
        // 0: Grama, 1: Árvore (colisão), 2: Tenda, 3: Entrada da Caverna
        for (let r = 0; r < this.rows; r++) {
            this.data[r] = [];
            for (let c = 0; c < this.cols; c++) {
                // Bordas de árvores
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    this.data[r][c] = 1;
                } else {
                    // Grama com árvores aleatórias
                    this.data[r][c] = Math.random() < 0.1 ? 1 : 0;
                }
            }
        }

        // Adicionar elementos fixos
        this.data[5][5] = 2; // Tenda
        this.data[2][this.cols - 3] = 3; // Caverna
    }

    render(ctx, camera) {
        if (!Assets.images.tileset) return;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * this.tileSize - camera.x;
                const y = r * this.tileSize - camera.y;

                // Só renderiza se estiver na tela
                if (x + this.tileSize < 0 || x > ctx.canvas.width ||
                    y + this.tileSize < 0 || y > ctx.canvas.height) continue;

                // Desenha grama como base
                ctx.drawImage(Assets.images.tileset, 0, 0, 32, 32, x, y, this.tileSize, this.tileSize);

                const tile = this.data[r][c];
                if (tile === 1) { // Árvore
                    ctx.drawImage(Assets.images.tileset, 32, 0, 32, 32, x, y, this.tileSize, this.tileSize);
                } else if (tile === 2) { // Tenda
                    ctx.drawImage(Assets.images.tileset, 64, 0, 32, 32, x, y, this.tileSize, this.tileSize);
                } else if (tile === 3) { // Caverna
                    ctx.drawImage(Assets.images.tileset, 96, 0, 32, 32, x, y, this.tileSize, this.tileSize);
                }
            }
        }
    }

    isSolid(x, y) {
        const c = Math.floor(x / this.tileSize);
        const r = Math.floor(y / this.tileSize);
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
        return this.data[r][c] === 1; // Árvores são sólidas
    }
}
