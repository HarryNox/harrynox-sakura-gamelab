const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let frames = 0;
let gameStarted = false;
let gameOver = false;
let score = 0;

// Bird
const bird = {
    x: 50,
    y: 150,
    w: 24,
    h: 24,
    gravity: 0.4,
    velocity: 0,
    jump: -6,
    color: "#fcd34d",
    draw: function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        // eye
        ctx.fillStyle = "white";
        ctx.fillRect(this.x + 14, this.y + 4, 6, 6);
        ctx.fillStyle = "black";
        ctx.fillRect(this.x + 16, this.y + 6, 2, 2);
    },
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        
        if (this.y + this.h >= canvas.height - 50) { // Floor
            this.y = canvas.height - 50 - this.h;
            gameOver = true;
        }
    },
    flap: function() {
        this.velocity = this.jump;
    }
};

// Pipes
const pipes = {
    position: [],
    w: 40,
    gap: 120,
    dx: 3,
    color: "#22c55e",
    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let topYPos = p.y;
            let bottomYPos = p.y + this.gap;
            
            // Top pipe
            ctx.fillStyle = this.color;
            ctx.fillRect(p.x, 0, this.w, topYPos);
            // Bottom pipe
            ctx.fillRect(p.x, bottomYPos, this.w, canvas.height - bottomYPos - 50);
        }
    },
    update: function() {
        if (frames % 100 === 0) {
            this.position.push({
                x: canvas.width,
                y: Math.max(50, Math.random() * (canvas.height - this.gap - 100))
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let bottomPipeYPos = p.y + this.gap;

            // Collision
            if (bird.x + bird.w > p.x && bird.x < p.x + this.w && 
                (bird.y < p.y || bird.y + bird.h > bottomPipeYPos)) {
                gameOver = true;
            }

            p.x -= this.dx;

            if (p.x + this.w < 0) {
                this.position.shift();
                score++;
                i--;
            }
        }
    }
};

// Floor
const floor = {
    h: 50,
    draw: function() {
        ctx.fillStyle = "#d97706";
        ctx.fillRect(0, canvas.height - this.h, canvas.width, this.h);
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(0, canvas.height - this.h, canvas.width, 10);
    }
};

document.addEventListener("keydown", (e) => {
    if(e.code === "Space") handleInput();
});
document.addEventListener("click", handleInput);

function handleInput() {
    if (gameOver) {
        document.location.reload();
    } else if (!gameStarted) {
        gameStarted = true;
        bird.flap();
    } else {
        bird.flap();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    pipes.draw();
    floor.draw();
    bird.draw();

    ctx.fillStyle = "white";
    ctx.font = "24px Inter";
    
    if (!gameStarted) {
        ctx.textAlign = "center";
        ctx.fillText("クリックでスタート", canvas.width / 2, canvas.height / 2);
    } else if (gameOver) {
        ctx.textAlign = "center";
        ctx.fillText("ゲームオーバー", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 30);
    } else {
        ctx.textAlign = "left";
        ctx.fillText("Score: " + score, 10, 30);
        pipes.update();
        bird.update();
        frames++;
    }

    requestAnimationFrame(draw);
}

draw();
