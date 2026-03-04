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
                    // Processar transparência
                    if (key === 'player') {
                        this.images[key] = this.removeBackground(img, [136, 17, 72]); // Magenta/Roxo do fundo
                    } else if (key === 'grinch') {
                        this.images[key] = this.removeBackground(img, [255, 255, 255]); // Branco do fundo
                    } else {
                        this.images[key] = img;
                    }

                    loadedCount++;
                    if (loadedCount === totalFiles) {
                        this.isLoaded = true;
                        resolve();
                    }
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === totalFiles) resolve();
                }
            }
        });
    },

    removeBackground(img, colorToReplace) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Comparar cores com uma pequena tolerância
            const diff = Math.abs(r - colorToReplace[0]) + Math.abs(g - colorToReplace[1]) + Math.abs(b - colorToReplace[2]);
            if (diff < 60) {
                data[i + 3] = 0; // Transparente
            }
        }

        ctx.putImageData(imageData, 0, 0);
        const newImg = new Image();
        newImg.src = canvas.toDataURL();
        return newImg;
    }
};
