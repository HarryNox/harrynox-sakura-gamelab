const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;
let gameOver = false;
let score = 0;
let gravity = 1; // 1 = 下向き, -1 = 上向き
let player = {
    x: 100,
    y: 200,
    width: 30,
    height: 30,
    velocityY: 0
};

let obstacles = [];
let gameSpeed = 6;
let frameCount = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') handleInput();
});
document.addEventListener('click', handleInput);

function handleInput() {
    if (gameOver) {
        document.location.reload();
        return;
    }
    if (!gameStarted) {
        gameStarted = true;
        return;
    }
    gravity *= -1; // 重力を反転
    player.velocityY = 0; // 勢いをリセット
}

function spawnObstacle() {
    let sizeWidth = 30 + Math.random() * 20;
    let sizeHeight = 50 + Math.random() * 150; // ランダムな高さ
    let isTop = Math.random() > 0.5;
    
    obstacles.push({
        x: canvas.width,
        y: isTop ? 0 : canvas.height - sizeHeight,
        width: sizeWidth,
        height: sizeHeight
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted && !gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "24px Inter";
        ctx.textAlign = "center";
        ctx.fillText("クリックまたはスペースでスタート！", canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(draw);
        return;
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "32px Inter";
        ctx.textAlign = "center";
        ctx.fillText("ゲームオーバー！", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "24px Inter";
        ctx.fillText("Score: " + Math.floor(score / 10), canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText("クリックでリトライ", canvas.width / 2, canvas.height / 2 + 60);
        return;
    }

    // プレイヤーの物理演算
    player.velocityY += gravity * 0.8;
    player.y += player.velocityY;

    // 天井と床の判定
    if (player.y <= 0) {
        player.y = 0;
        player.velocityY = 0;
    }
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
    }

    // 障害物の生成
    frameCount++;
    if (frameCount % 60 === 0) {
        spawnObstacle();
        gameSpeed += 0.05; // 徐々にスピードアップ
    }

    // 障害物の更新と描画
    ctx.fillStyle = "#ef4444";
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // 当たり判定
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            gameOver = true;
        }
    }

    // 画面外の障害物を削除
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    // プレイヤーの描画
    ctx.fillStyle = "#818cf8";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 目の描画
    ctx.fillStyle = "white";
    if(gravity === 1) {
        ctx.fillRect(player.x + 20, player.y + 5, 5, 5);
    } else {
        ctx.fillRect(player.x + 20, player.y + 20, 5, 5);
    }

    // スコアの描画
    score++;
    ctx.fillStyle = "white";
    ctx.font = "20px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + Math.floor(score / 10), 20, 30);

    requestAnimationFrame(draw);
}

draw();
