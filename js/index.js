var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var brickColumnsNum = 4;
var brickRowsNum = 4;
var btnPlay = document.getElementById("play");
var btnRestart = document.getElementById("restart");

var ball;
var paddle;
var bricks;
var isGameOver;

// FUNCTIONS
function initializeGame() {
    ball = {
        x: canvas.width / 2,
        y: canvas.height,
        w: canvas.width / 20, // width (genişlik)
        h: canvas.width / 20, // height (yükseklik)
        vx: random(-400, 400), // velocity (hız: pixel/seconds) x
        vy: -400, // velocity (hız: pixes/seconds) y
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
    paddle = {
        x: canvas.width / 2 - (canvas.width / 5) / 2,
        y: canvas.height * .9 - canvas.width / 20,
        w: canvas.width / 4, // width (genişlik)
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
    bricks = [];
    isGameOver = false;
    loadBricks();
    drawBricks();
    drawBall();
}

function loadBricks() {
    var marginTop = canvas.height / 10;
    var marginX = canvas.width / 12;
    var brickWidth = (canvas.width - 2 * marginX) / brickColumnsNum;
    var brickHeight = canvas.width / 20;
    var brick;
    for (var row = 0; row < brickRowsNum; row++) {
        for (var col = 0; col < brickColumnsNum; col++) {
            brick = createBrick(col * brickWidth + marginX,
                row * brickHeight + marginTop,
                brickWidth, brickHeight);
            bricks.push(brick);
        }
    }

}

function createBrick(x, y, width, height, color = "orange") {
    return {
        x: x,
        y: y,
        w: width,
        h: height,
        color: color,
        xRight: function () {
            return this.x + this.w;
        },
        yBottom: function () {
            return this.y + this.h;
        }
    };
}

function drawBricks() {
    for (var i = 0; i < bricks.length; i++) {
        drawBrick(bricks[i]);
    }
}

function drawBrick(brick) {
    var bw = 2; // border width
    ctx.fillStyle = "black";
    ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x + bw, brick.y + bw, brick.w - 2 * bw, brick.h - 2 * bw);
}

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
var oldBall;
function update(timePassedSec) {
    oldBall = clone(ball);
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
    // top düşerken topun alti paddle'e degiyor mu
    // merkez x'i paddle'in solu/sagi arasinda kaliyor mu
    if (ball.xCenter() >= paddle.x
        && ball.xCenter() <= paddle.xRight()
        && ball.yBottom() >= paddle.y
        && ball.yBottom() <= paddle.yBottom()
        && ball.vy > 0
    ) {
        overflowY = ball.yBottom() - paddle.y;
        ball.y = paddle.y - overflowY - ball.h;
        ball.vy *= -1;

        // paddle'in neresine çarptı
        var ratio = (ball.x - paddle.x) / paddle.w;

        if (ratio < 1 / 5) {
            ball.vx = ball.vy;
        } else if (ratio < 2 / 5) {
            ball.vx = ball.vy / 2;
        } else if (ratio < 3 / 5) {

        } else if (ratio < 4 / 5) {
            ball.vx = -ball.vy / 2;
        } else {
            ball.vx = -ball.vy;
        }
    }
}

function checkBrickCollision() {
    var overflowX, overflowY;

    for (var i = 0; i < bricks.length; i++) {
        var brick = bricks[i];

        // çarptıysa
        if (isColliding(brick)) {
            // alttan çarptıysa
            if (oldBall.y > brick.yBottom()) {
                overflowY = brick.yBottom() - ball.y;
                ball.y = brick.yBottom() + overflowY;
                ball.vy *= -1;
            }
            // üstten çarptıysa
            else if (oldBall.yBottom() < brick.y) {
                overflowY = ball.yBottom() - brick.y;
                ball.y = brick.y - ball.h - overflowY;
                ball.vy *= -1;
            }
            // sağdan çarptıysa
            else if (oldBall.x > brick.xRight()) {
                overflowX = brick.xRight() - ball.x;
                ball.x = brick.xRight() + overflowX;
                ball.vx *= -1;
            }
            // soldan çarptıysa
            else if (oldBall.xRight() < brick.x) {
                overflowX = brick.x - ball.xRight();
                ball.x = brick.x - ball.w - overflowX;
                ball.vx *= -1;
            }

            bricks.splice(i, 1);
            if (bricks.length == 0) {
                isGameOver = true;
            }
            return;
        }
    }

}

function checkBallEscape() {
    if (ball.y > canvas.height) {
        isGameOver = true;
    }
}

function isColliding(brick) {
    return !(
        ball.xRight() < brick.x || ball.x > brick.xRight() ||
        ball.yBottom() < brick.y || ball.y > brick.yBottom()
    );
}

function clean() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// timePassed: son animasyondan bu yana geçen süre (ms)
var oldTimeStamp = 0;
var frameCounter = 0;
function gameLoop(timeStamp) {
    var timePassedMs = timeStamp - oldTimeStamp
    var timePassedSec = Math.min(timePassedMs / 1000, 0.1);
    oldTimeStamp = timeStamp;
    frameCounter++;
    update(timePassedSec);
    checkWallCollision(); // duvara çarpma kontrol
    checkPaddleCollision(); // top paddle'e çarptı mı?
    checkBrickCollision(); // top tuğlaya çarptı mı?
    checkBallEscape(); // top kaçtı mı?
    clean();
    drawBricks();
    drawPaddle();
    drawBall();

    if (isGameOver) {
        setTimeout(function () {
            alert("GAME OVER!");
            btnRestart.style.display = "inline";
        }, 100);
        return;
    }

    if (frameCounter < 6000)
        window.requestAnimationFrame(gameLoop);
}

function clone(obj) {
    return Object.assign({}, obj);
}

// [min, max] inclusive
function random(min, max) {
    var num = max - min + 1;
    return Math.floor(min + Math.random() * num);
}

// EVENTS
document.body.onkeydown = function (event) {
    // klayveden sol oka basıldığında
    if (event.keyCode == 37) {
        paddle.vx = -300;
    }
    // sağ oka basıldığında
    if (event.keyCode == 39) {
        paddle.vx = +300;
    }
};
document.body.onkeyup = function (event) {
    if (event.keyCode == 37 || event.keyCode == 39) {
        paddle.vx = 0;
    }
};
btnPlay.onclick = function (event) {
    this.style.display = "none";
    window.requestAnimationFrame(gameLoop);
};
btnRestart.onclick = function (event) {
    this.style.display = "none";
    initializeGame();
    window.requestAnimationFrame(gameLoop);
};


initializeGame();

