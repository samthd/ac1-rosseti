const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuração do Canvas para pixel art
canvas.width = 800;
canvas.height = 600;
ctx.imageSmoothingEnabled = false;

const keys = {};
let gameActive = false;
let map, player, grinch, camera;

const cameraObj = {
    x: 0,
    y: 0,
    update(target) {
        this.x = target.x - canvas.width / 2;
        this.y = target.y - canvas.height / 2;
    }
};

async function init() {
    await Assets.loadAll();

    map = new GameMap();
    player = new Player(400, 300);
    grinch = new Grinch(100, 100);
    camera = cameraObj;

    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
    window.addEventListener('keydown', e => { if (e.key === 'Shift') keys['Shift'] = true; });
    window.addEventListener('keyup', e => { if (e.key === 'Shift') keys['Shift'] = false; });

    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('overlay').classList.add('hidden');
        gameActive = true;
        gameLoop();
    });

    document.getElementById('retry-btn').addEventListener('click', () => {
        location.reload();
    });
}

function update() {
    if (!gameActive) return;

    player.update(keys, map);
    grinch.update(player, map);
    camera.update(player);

    // Checar Game Over
    const dist = Math.hypot(player.x - grinch.x, player.y - grinch.y);
    if (dist < 20) {
        gameOver();
    }
}

function render() {
    // Limpar fundo (cor de floresta profunda)
    ctx.fillStyle = '#0a0f0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.render(ctx, camera);
    player.render(ctx, camera);
    grinch.render(ctx, camera);

    // Efeito de Lanterna e Noite
    drawLighting();
}

function drawLighting() {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const octx = offscreen.getContext('2d');

    octx.fillStyle = 'rgba(5, 5, 20, 0.9)';
    octx.fillRect(0, 0, canvas.width, canvas.height);

    // Lógica de Flicker
    const dist = Math.hypot(player.x - grinch.x, player.y - grinch.y);
    let flickerRadius = 150;
    let flickerOpacity = 0.8;

    if (dist < 100) {
        // Oscilação rápida e errática
        flickerRadius = 150 + (Math.random() * 40 - 20);
        flickerOpacity = 0.4 + Math.random() * 0.4;
    }

    // Círculo de luz (lanterna)
    const gradient = octx.createRadialGradient(
        player.x + 16 - camera.x, player.y + 16 - camera.y, 10,
        player.x + 16 - camera.x, player.y + 16 - camera.y, flickerRadius
    );
    gradient.addColorStop(0, `rgba(255, 255, 220, ${flickerOpacity})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    octx.globalCompositeOperation = 'destination-out';
    octx.fillStyle = gradient;
    octx.beginPath();
    octx.arc(player.x + 16 - camera.x, player.y + 16 - camera.y, flickerRadius, 0, Math.PI * 2);
    octx.fill();

    ctx.drawImage(offscreen, 0, 0);
    ctx.restore();
}

function gameOver() {
    gameActive = false;
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
}

function gameLoop() {
    if (gameActive) {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }
}

// Iniciar
init();
