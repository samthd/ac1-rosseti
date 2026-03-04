const Assets = {
    images: {},
    isLoaded: false,

    files: {
        tileset: 'assets/tileset.png',
        player: 'assets/player.png',
        grinch: 'assets/grinch.png'
    },

    loadAll() {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalFiles = Object.keys(this.files).length;

            for (let key in this.files) {
                const img = new Image();
                img.src = this.files[key];
                img.onload = () => {
                    this.images[key] = img;
                    loadedCount++;
                    if (loadedCount === totalFiles) {
                        this.isLoaded = true;
                        resolve();
                    }
                };
                img.onerror = () => {
                    console.error(`Falha ao carregar asset: ${key}`);
                    loadedCount++;
                    if (loadedCount === totalFiles) {
                        this.isLoaded = true;
                        resolve();
                    }
                }
            }
        });
    }
};
