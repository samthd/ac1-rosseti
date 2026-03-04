class Entity {
    constructor(x, y, sprite) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.width = 32;
        this.height = 32;
        this.frame = 0;
        this.direction = 'down'; // down, up, left, right
    }

    render(ctx, camera) {
        if (!Assets.images[this.sprite]) return;

        const img = Assets.images[this.sprite];
        let sx = 0, sy = 0, sw = img.width, sh = img.height;

        if (this.sprite === 'player') {
            // Cada célula é ~256x256 em uma grade 4x4
            sw = 120;
            sh = 150;
            sx = 80;  // Pula o texto "FRONT WALK"
            sy = 30;  // Pula a borda do topo
        } else if (this.sprite === 'grinch') {
            // Centralizar no monstro ignorando as bordas vazias
            sw = img.width * 0.8;
            sh = img.height * 0.8;
            sx = img.width * 0.1;
            sy = img.height * 0.05;
        }

        ctx.drawImage(
            img,
            sx, sy, sw, sh,
            this.x - camera.x, this.y - camera.y,
            this.width, this.height
        );
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 'player');
        this.width = 64;
        this.height = 64;
        this.speed = 2.5;
        this.stamina = 100;
        this.maxStamina = 100;
        this.isRunning = false;
        this.inventory = [];
    }

    update(keys, map) {
        let dx = 0;
        let dy = 0;

        this.isRunning = keys['Shift'] && this.stamina > 0;
        const currentSpeed = this.isRunning ? this.speed * 2 : this.speed;

        if (keys['w'] || keys['ArrowUp']) dy = -currentSpeed;
        if (keys['s'] || keys['ArrowDown']) dy = currentSpeed;
        if (keys['a'] || keys['ArrowLeft']) dx = -currentSpeed;
        if (keys['d'] || keys['ArrowRight']) dx = currentSpeed;

        // Limitar velocidade diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Colisão simples
        if (!map.isSolid(this.x + dx, this.y) && !map.isSolid(this.x + dx + this.width, this.y)) {
            this.x += dx;
        }
        if (!map.isSolid(this.x, this.y + dy) && !map.isSolid(this.x, this.y + dy + this.height)) {
            this.y += dy;
        }

        // Gestão de Estamina
        if (this.isRunning) {
            this.stamina -= 0.5;
            if (this.stamina < 0) this.stamina = 0;
        } else {
            if (this.stamina < this.maxStamina) this.stamina += 0.2;
        }

        // Atualizar UI
        document.getElementById('stamina-bar').style.width = `${(this.stamina / this.maxStamina) * 100}%`;
    }
}

class Grinch extends Entity {
    constructor(x, y) {
        super(x, y, 'grinch');
        this.width = 120; // O Grinch é maior/longo
        this.height = 120;
        this.speed = 1.5;
        this.state = 'patrol'; // patrol, hunt
        this.target = { x: x, y: y };
        this.patrolPoints = [
            { x: 100, y: 100 },
            { x: 600, y: 100 },
            { x: 600, y: 500 },
            { x: 100, y: 500 }
        ];
        this.patrolIndex = 0;
    }

    update(player, map) {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        // Troca de estado baseada em distância ou barulho (correndo)
        if (dist < 200 || (player.isRunning && dist < 350)) {
            this.state = 'hunt';
        } else if (dist > 400) {
            this.state = 'patrol';
        }

        if (this.state === 'hunt') {
            this.speed = 2.2; // Mais rápido que o andar do player, mais lento que o correr
            this.moveTowards(player.x, player.y);
        } else {
            this.speed = 1;
            const p = this.patrolPoints[this.patrolIndex];
            if (Math.hypot(p.x - this.x, p.y - this.y) < 10) {
                this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
            }
            this.moveTowards(p.x, p.y);
        }
    }

    moveTowards(tx, ty) {
        const angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
}
