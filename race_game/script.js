const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;
let gameOver = false;
let score = 0;
let speed = 5;
let frames = 0;

let car = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 70,
    color: "#3b82f6" // 青
};

let enemies = [];
let roadLines = [];

// センターラインの初期化
for (let i = 0; i < canvas.height; i += 50) {
    roadLines.push(i);
}

document.addEventListener("keydown", (e) => {
    if (!gameStarted) {
        gameStarted = true;
    }
    if (gameOver && e.code === "Space") {
        document.location.reload();
    }
    if (e.code === "ArrowLeft" && car.x > 0) {
        car.x -= 25;
    }
    if (e.code === "ArrowRight" && car.x < canvas.width - car.width) {
        car.x += 25;
    }
});

canvas.addEventListener("click", (e) => {
    if (!gameStarted) {
        gameStarted = true;
        return;
    }
    if (gameOver) {
        document.location.reload();
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < canvas.width / 2 && car.x > 0) {
        car.x -= 30; // 左移動
    } else if (clickX >= canvas.width / 2 && car.x < canvas.width - car.width) {
        car.x += 30; // 右移動
    }
});

function spawnEnemy() {
    let laneWidth = canvas.width / 4;
    let lane = Math.floor(Math.random() * 4);
    let ex = lane * laneWidth + (laneWidth / 2) - 20;
    enemies.push({
        x: ex,
        y: -100,
        width: 40,
        height: 70,
        color: "#ef4444" // 赤
    });
}

function draw() {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "24px Inter";
        ctx.textAlign = "center";
        ctx.fillText("画面タップでスタート！", canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(draw);
        return;
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "32px Inter";
        ctx.textAlign = "center";
        ctx.fillText("クラッシュ！", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "24px Inter";
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText("タップでリトライ", canvas.width / 2, canvas.height / 2 + 60);
        return;
    }

    ctx.fillStyle = "white";
    for (let i = 0; i < roadLines.length; i++) {
        roadLines[i] += speed;
        if (roadLines[i] > canvas.height) {
            roadLines[i] = -50;
        }
        ctx.fillRect(canvas.width / 2 - 5, roadLines[i], 10, 30);
    }

    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);
    // フロントガラスっぽく
    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(car.x + 5, car.y + 10, car.width - 10, 15);

    frames++;
    if (frames % Math.max(30, 80 - Math.floor(score / 50)) === 0) {
        spawnEnemy();
    }

    for (let i = 0; i < enemies.length; i++) {
        let e = enemies[i];
        e.y += speed * 0.8;
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        // フロントガラスっぽく
        ctx.fillStyle = "#fca5a5";
        ctx.fillRect(e.x + 5, e.y + e.height - 25, e.width - 10, 15);

        // Collision
        if (car.x < e.x + e.width &&
            car.x + car.width > e.x &&
            car.y < e.y + e.height &&
            car.y + car.height > e.y) {
            gameOver = true;
        }

        if (e.y > canvas.height) {
            enemies.splice(i, 1);
            score += 10;
            i--;
        }
    }

    speed = 5 + Math.floor(score / 100);

    ctx.fillStyle = "white";
    ctx.font = "20px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 10, 30);

    requestAnimationFrame(draw);
}

draw();
