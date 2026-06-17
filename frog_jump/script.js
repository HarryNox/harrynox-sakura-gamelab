const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stageDisplay = document.getElementById('stageDisplay');

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
    color: '#2ed573', // カエルの緑色
    velocityX: 0,
    velocityY: 0,
    isGrounded: false
};

// 10ステージの定義
const stages = [
    // Stage 1 (基本)
    [
        { x: 0, y: 410, width: 800, height: 40, color: '#2ed573' }, 
        { x: 200, y: 330, width: 100, height: 20, color: '#ffa502' },
        { x: 350, y: 250, width: 80, height: 20, color: '#ffa502' },
        { x: 500, y: 180, width: 80, height: 20, color: '#ffa502' },
        { x: 680, y: 120, width: 80, height: 20, color: '#1e90ff' }  // ゴール
    ],
    // Stage 2 (少し間隔が広い)
    [
        { x: 0, y: 410, width: 200, height: 40, color: '#2ed573' },
        { x: 300, y: 410, width: 150, height: 40, color: '#2ed573' },
        { x: 550, y: 350, width: 100, height: 20, color: '#ffa502' },
        { x: 680, y: 250, width: 80, height: 20, color: '#1e90ff' }
    ],
    // Stage 3 (階段状)
    [
        { x: 0, y: 410, width: 150, height: 40, color: '#2ed573' },
        { x: 200, y: 350, width: 80, height: 20, color: '#ffa502' },
        { x: 350, y: 290, width: 80, height: 20, color: '#ffa502' },
        { x: 500, y: 230, width: 80, height: 20, color: '#ffa502' },
        { x: 650, y: 170, width: 80, height: 20, color: '#ffa502' },
        { x: 700, y: 100, width: 80, height: 20, color: '#1e90ff' }
    ],
    // Stage 4 (ジグザグ)
    [
        { x: 0, y: 410, width: 100, height: 40, color: '#2ed573' },
        { x: 150, y: 320, width: 60, height: 20, color: '#ffa502' },
        { x: 50, y: 230, width: 60, height: 20, color: '#ffa502' },
        { x: 150, y: 140, width: 60, height: 20, color: '#ffa502' },
        { x: 300, y: 100, width: 60, height: 20, color: '#ffa502' },
        { x: 500, y: 100, width: 60, height: 20, color: '#ffa502' },
        { x: 700, y: 100, width: 80, height: 20, color: '#1e90ff' }
    ],
    // Stage 5 (小さな足場)
    [
        { x: 0, y: 410, width: 100, height: 40, color: '#2ed573' },
        { x: 200, y: 410, width: 40, height: 20, color: '#ffa502' },
        { x: 350, y: 410, width: 40, height: 20, color: '#ffa502' },
        { x: 500, y: 350, width: 40, height: 20, color: '#ffa502' },
        { x: 650, y: 280, width: 80, height: 20, color: '#1e90ff' }
    ],
    // Stage 6 (下っていく)
    [
        { x: 0, y: 150, width: 100, height: 40, color: '#2ed573' },
        { x: 200, y: 220, width: 80, height: 20, color: '#ffa502' },
        { x: 400, y: 290, width: 80, height: 20, color: '#ffa502' },
        { x: 600, y: 360, width: 80, height: 20, color: '#ffa502' },
        { x: 720, y: 410, width: 80, height: 20, color: '#1e90ff' }
    ],
    // Stage 7 (長いジャンプ)
    [
        { x: 0, y: 410, width: 150, height: 40, color: '#2ed573' },
        { x: 250, y: 380, width: 100, height: 20, color: '#ffa502' },
        { x: 450, y: 340, width: 100, height: 20, color: '#ffa502' },
        { x: 650, y: 300, width: 150, height: 20, color: '#1e90ff' }
    ],
    // Stage 8 (壁登り風)
    [
        { x: 0, y: 410, width: 100, height: 40, color: '#2ed573' },
        { x: 150, y: 350, width: 50, height: 20, color: '#ffa502' },
        { x: 250, y: 280, width: 50, height: 20, color: '#ffa502' },
        { x: 150, y: 210, width: 50, height: 20, color: '#ffa502' },
        { x: 250, y: 140, width: 50, height: 20, color: '#ffa502' },
        { x: 400, y: 100, width: 100, height: 20, color: '#1e90ff' }
    ],
    // Stage 9 (高難易度)
    [
        { x: 0, y: 410, width: 50, height: 40, color: '#2ed573' },
        { x: 150, y: 360, width: 40, height: 20, color: '#ffa502' },
        { x: 300, y: 310, width: 40, height: 20, color: '#ffa502' },
        { x: 450, y: 260, width: 40, height: 20, color: '#ffa502' },
        { x: 600, y: 210, width: 40, height: 20, color: '#ffa502' },
        { x: 720, y: 150, width: 80, height: 20, color: '#1e90ff' }
    ],
    // Stage 10 (最終ステージ)
    [
        { x: 0, y: 410, width: 50, height: 40, color: '#2ed573' },
        { x: 150, y: 250, width: 30, height: 20, color: '#ffa502' },
        { x: 350, y: 100, width: 30, height: 20, color: '#ffa502' },
        { x: 550, y: 300, width: 30, height: 20, color: '#ffa502' },
        { x: 700, y: 150, width: 100, height: 20, color: '#1e90ff' }
    ]
];

let currentStage = 0;
let platforms = stages[currentStage];

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
        resetGame(false);
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
                    if (currentStage < stages.length - 1) {
                        alert(`ステージ ${currentStage + 1} クリア！\n次のステージへ進みます。`);
                        currentStage++;
                        resetGame(true);
                    } else {
                        alert('全10ステージクリア！\nおめでとうございます！');
                        currentStage = 0;
                        resetGame(true);
                    }
                }, 100);
            }
        }
    }
}

function resetGame(nextStage) {
    if (stages[currentStage][0].y < 200) {
        player.x = 20;
        player.y = 50;
    } else {
        player.x = 50;
        player.y = stages[currentStage][0].y - 100;
    }
    player.velocityY = 0;
    goalReached = false;
    platforms = stages[currentStage];
    stageDisplay.innerText = `フロッグジャンプ！ - Stage ${currentStage + 1}`;
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
        
        cloud.x -= 0.2;
        if (cloud.x + cloud.w < 0) cloud.x = canvas.width + 50;
    });

    // プラットフォームの描画
    platforms.forEach(plat => {
        ctx.fillStyle = plat.color;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        if(plat.color === '#2ed573') { 
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(plat.x, plat.y, plat.width, 10);
        } else if(plat.color === '#1e90ff') { 
            ctx.fillStyle = 'white';
            ctx.font = '14px sans-serif';
            ctx.fillText('GOAL', plat.x + 10, plat.y + 15);
        }
    });

    // プレイヤーの描画
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // カエルの目
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + (keys.left ? 2 : (keys.right ? 18 : 6)), player.y - 4, 10, 10);
    ctx.fillRect(player.x + (keys.left ? 14 : (keys.right ? 30 : 18)), player.y - 4, 10, 10);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + (keys.left ? 2 : (keys.right ? 22 : 8)), player.y, 4, 4);
    ctx.fillRect(player.x + (keys.left ? 14 : (keys.right ? 34 : 20)), player.y, 4, 4);
}

// ゲームループ
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
resetGame(true);
gameLoop();
