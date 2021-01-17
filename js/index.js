var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var ball = {
    x: canvas.width / 2,
    y: canvas.height,
    w: canvas.width / 20, // width (genişlik)
    h: canvas.width / 20, // height (yükseklik)
    vx: -300, // velocity (hız: pixel/seconds) x
    vy: -300, // velocity (hız: pixes/seconds) y
    xCenter: function () {
        return this.x + this.w / 2;
    },
    xRight: function () {
        return this.x + this.w;
    },
    yBottom: function () {
        return this.y + this.h;
    }
};
var paddle = {
    x: canvas.width / 2 - (canvas.width / 5) / 2,
    y: canvas.height * .9 - canvas.width / 20,
    w: canvas.width / 5, // width (genişlik)
    h: canvas.width / 20, // height (yükseklik)
    vx: 0, // velocity (hız) x
    vy: 0, // velocity (hız) y,
    xRight: function () {
        return this.x + this.w;
    },
    yBottom: function () {
        return this.y + this.h;
    }
};



// FUNCTIONS
function drawBall() {
    var r = ball.w / 2;
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(ball.x + r, ball.y + r, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawPaddle() {
    ctx.fillStyle = "brown";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
}

// timePassedSec: bir önceki çizimden bu yana geçen süre (saniye)
// d = v * t   (yer değiştirme = hız * geçen süre)
function update(timePassedSec) {
    paddle.x += paddle.vx * timePassedSec;
    ball.x += ball.vx * timePassedSec;
    ball.y += ball.vy * timePassedSec;
}

function checkWallCollision() {
    // paddle sol/sağ duvara çarptı mı?
    if (paddle.x < 0) 
        paddle.x = 0;
    if (paddle.xRight() > canvas.width) 
        paddle.x = canvas.width - paddle.w;

    var overflowX, overflowY;
    // üst duvara topun tepesi çarptı mı?
    if (ball.y < 0) {
        ball.vy = -ball.vy;
        overflowY = -ball.y;
        ball.y = overflowY;
    }
    // sol duvara topun solu çarptı mı?
    if (ball.x < 0) {
        ball.vx = -ball.vx;
        overflowX = -ball.x;
        ball.x = overflowX;
    }
    // sağ duvara topun sağı çarptı mı?
    if (ball.xRight() > canvas.width) {
        ball.vx = -ball.vx;
        overflowX = ball.xRight() - canvas.width;
        ball.x = canvas.width - overflowX - ball.w;
    }
}

function checkPaddleCollision() {
    var overflowY;
    // topun alti paddle'e degiyor mu
    // merkez x'i paddle'in solu/sagi arasinda kaliyor mu
    if (ball.xCenter() >= paddle.x
            && ball.xCenter() <= paddle.xRight()
            && ball.yBottom() >= paddle.y
            && ball.yBottom() <= paddle.yBottom()
        ) {
            overflowY = ball.yBottom() - paddle.y;
            ball.y = paddle.y - overflowY - ball.h;
            ball.vy *= -1;
        }
}

function clean() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// timePassed: son animasyondan bu yana geçen süre (ms)
var oldTimeStamp = 0;
var frameCounter = 0;
function gameLoop(timeStamp) {
    var timePassedMs = timeStamp - oldTimeStamp;
    var timePassedSec = timePassedMs / 1000;
    oldTimeStamp = timeStamp;
    frameCounter++;
    update(timePassedSec);
    checkWallCollision(); // duvara çarpma kontrol
    checkPaddleCollision(); // top paddle'e çarptı mı?
    clean();
    drawPaddle();
    drawBall();

    if (frameCounter < 6000)
        window.requestAnimationFrame(gameLoop);
}

// EVENTS
document.body.onkeydown= function (event) {
    console.log(event);
    // klayveden sol oka basıldığında
    if (event.keyCode == 37) {
        paddle.vx = -300;
    }
    // sağ oka basıldığında
    if (event.keyCode == 39) {
        paddle.vx = +300;
    }
};
document.body.onkeyup= function (event) {
    if (event.keyCode == 37 || event.keyCode == 39) {
        paddle.vx = 0;
    }
};


drawBall();
window.requestAnimationFrame(gameLoop);