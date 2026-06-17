const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 物理演算の設定
const GRAVITY = 0.6;
const FRICTION = 0.8;
const JUMP_POWER = -12;
const SPEED = 5;

// キー入力の管理
const keys = {
    right: false,
    left: false,
    up: false
};

// プレイヤーの設定
const player = {
    x: 50,
    y: 350,
    width: 32,
    height: 32,
    color: '#ff4757', // 赤色
    velocityX: 0,
    velocityY: 0,
    isGrounded: false
};

// 足場（プラットフォーム）の設定
const platforms = [
    { x: 0, y: 410, width: 800, height: 40, color: '#2ed573' }, // 地面
    { x: 200, y: 330, width: 100, height: 20, color: '#ffa502' },
    { x: 350, y: 250, width: 80, height: 20, color: '#ffa502' },
    { x: 500, y: 180, width: 80, height: 20, color: '#ffa502' },
    { x: 680, y: 120, width: 80, height: 20, color: '#1e90ff' }  // ゴール（青）
];

// 雲（背景用）
const clouds = [
    { x: 100, y: 50, w: 60, h: 30 },
    { x: 300, y: 80, w: 80, h: 40 },
    { x: 600, y: 60, w: 70, h: 35 }
];

let goalReached = false;

// イベントリスナー
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp' || e.code === 'Space') {
        if (player.isGrounded) {
            player.velocityY = JUMP_POWER;
            player.isGrounded = false;
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
});

// ゲームの更新
function update() {
    // 左右の移動
    if (keys.right) {
        player.velocityX = SPEED;
    } else if (keys.left) {
        player.velocityX = -SPEED;
    } else {
        player.velocityX *= FRICTION; // 摩擦で減速
    }

    // 重力の適用
    player.velocityY += GRAVITY;

    // 位置の更新
    player.x += player.velocityX;
    player.y += player.velocityY;

    // 画面外（左右）に出ないようにする
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // 落下（ゲームオーバー）
    if (player.y > canvas.height) {
        resetGame();
    }

    player.isGrounded = false;

    // 当たり判定（プラットフォーム）
    for (let i = 0; i < platforms.length; i++) {
        let plat = platforms[i];
        
        // プレイヤーが落下中で、プラットフォームの上部に乗った時
        if (player.y + player.height <= plat.y + player.velocityY && 
            player.y + player.height + player.velocityY >= plat.y &&
            player.x + player.width > plat.x && 
            player.x < plat.x + plat.width) {
            
            player.velocityY = 0;
            player.y = plat.y - player.height;
            player.isGrounded = true;
            
            // ゴール判定
            if (plat.color === '#1e90ff' && !goalReached) {
                goalReached = true;
                setTimeout(() => {
                    alert('ゴール！クリアおめでとう！\nもう一度プレイしますか？');
                    resetGame();
                }, 100);
            }
        }
    }
}

function resetGame() {
    player.x = 50;
    player.y = 350;
    player.velocityY = 0;
    goalReached = false;
}

// 描画処理
function draw() {
    // 背景のクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 雲の描画
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.h/2, 0, Math.PI*2);
        ctx.arc(cloud.x + cloud.w/2, cloud.y - cloud.h/4, cloud.h/2, 0, Math.PI*2);
        ctx.arc(cloud.x + cloud.w, cloud.y, cloud.h/2, 0, Math.PI*2);
        ctx.fillRect(cloud.x, cloud.y - cloud.h/2, cloud.w, cloud.h/2);
        ctx.fill();
        
        // 雲を少しずつ動かす
        cloud.x -= 0.2;
        if (cloud.x + cloud.w < 0) cloud.x = canvas.width + 50;
    });

    // プラットフォームの描画
    platforms.forEach(plat => {
        ctx.fillStyle = plat.color;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        // 装飾（草や模様など）
        if(plat.color === '#2ed573') { // 地面の場合
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(plat.x, plat.y, plat.width, 10);
        } else if(plat.color === '#1e90ff') { // ゴールの場合
            ctx.fillStyle = 'white';
            ctx.font = '14px sans-serif';
            ctx.fillText('GOAL', plat.x + 20, plat.y + 15);
        }
    });

    // プレイヤーの描画
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // プレイヤーの顔（ちょっとかわいく）
    ctx.fillStyle = 'white';
    // 左目
    ctx.fillRect(player.x + (keys.left ? 4 : (keys.right ? 16 : 8)), player.y + 8, 8, 8);
    // 右目
    ctx.fillRect(player.x + (keys.left ? 16 : (keys.right ? 28 : 20)), player.y + 8, 8, 8);
    
    ctx.fillStyle = 'black';
    // 黒目
    ctx.fillRect(player.x + (keys.left ? 4 : (keys.right ? 20 : 10)), player.y + 10, 4, 4);
    ctx.fillRect(player.x + (keys.left ? 16 : (keys.right ? 32 : 22)), player.y + 10, 4, 4);
}

// ゲームループ
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();
