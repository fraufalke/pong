let leftPad, rightPad, pongTable, pongNet, ball;
const VW_TO_ADD = 3;
const RANDOM_BALL_WIDTH = 20;
const EVENTS = {
    UP: 'UP',
    DOWN: 'DOWN'
};

const DIRECTIONS = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
}

const SPEED = {
    ballX: 12,
    ballY: 5
}

let currentBallPosition = {
    x: 0,
    y: 0
};

let score = {
    player1: 0,
    player2: 0
};

const getRandomDirection = () => {
    const directions = Object.values(DIRECTIONS);
    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
}

window.addEventListener("load", function() { 
    leftPad = document.getElementById('left-paddle');
    rightPad = document.getElementById('right-paddle');
    pongTable = document.getElementById('pong-table');
    pongNet = document.getElementById('pong-net');
    ball = document.getElementById('ball');
    initBall();
});

const initBall = () => {
    placeBallOnANet();
    setCurrentBallPosition();
    moveBall(getRandomDirection(), getRandomValue(-45, 45));
}

const getRandomValue = (min, max) =>{
    return Math.random() * (max - min) + min;
}

const isElementTouchingAnotherElement = (element, anotherElement) => {
    const elementRect = element.getBoundingClientRect();
    const anotherElementRect = anotherElement.getBoundingClientRect();
    const isTouchingTop = elementRect.top <= anotherElementRect.top;
    const isTouchingBottom = elementRect.bottom >= anotherElementRect.bottom;
    const isTouchingLeft = elementRect.left <= anotherElementRect.left;
    const isTouchingRight = elementRect.right >= anotherElementRect.right;

    const areColliding = elementRect.left < anotherElementRect.right &&
    elementRect.right > anotherElementRect.left &&
    elementRect.top < anotherElementRect.bottom &&
    elementRect.bottom > anotherElementRect.top;

    return {isTouchingTop, isTouchingBottom, isTouchingLeft, isTouchingRight, areColliding};
}

const placeBallOnANet = () => {
    const pongNetRect = pongNet.getBoundingClientRect();
    const topValue = getRandomValue(pongNetRect.top * 1.3, pongNetRect.bottom) / 2;
    const leftValue = pongNetRect.left - 10;
    ball.style.top = `${topValue}px`;
    ball.style.left = `${leftValue}px`;
}

const setCurrentBallPosition = () => {
    const computedStyle = getComputedStyle(ball);
    currentBallPosition.x = parseFloat(computedStyle.left);
    currentBallPosition.y = parseFloat(computedStyle.top);
}

const moveBall = (direction, angle) => {
    const elementTouchingTable = isElementTouchingAnotherElement(ball, pongTable);
    if (elementTouchingTable.isTouchingLeft) {
        // calculate points
        score.player2++;
        document.getElementById('score-player-2').innerHTML = score.player2;
        initBall();
        return;
    } else if (elementTouchingTable.isTouchingRight) {
        // calculate points
        score.player1++;
        document.getElementById('score-player-1').innerHTML = score.player1;
        initBall();
        return;
    } else if (elementTouchingTable.isTouchingTop) {
        angle = getRandomValue(0, 45);
    } else if (elementTouchingTable.isTouchingBottom) {
        angle = getRandomValue(-45, 0);
    }

    const elementTouchingLeftPad = isElementTouchingAnotherElement(ball, leftPad);

    if (elementTouchingLeftPad.areColliding) {
        direction = DIRECTIONS.RIGHT;
    }
    const elementTouchingRightPad = isElementTouchingAnotherElement(ball, rightPad);

    if (elementTouchingRightPad.areColliding) {
        direction = DIRECTIONS.LEFT;
    }


    moveRightPaddleToBall();

    let radians;
    let deltaX = SPEED.ballX;
    let deltaY = SPEED.ballY;

    if (angle) {
        radians = angle * (Math.PI / 180); 
        deltaX = Math.cos(radians) * SPEED.ballX;
        deltaY = Math.sin(radians) * SPEED.ballY;
    }

    if (direction === DIRECTIONS.LEFT) {
        currentBallPosition.x -= deltaX;
        currentBallPosition.y -= deltaY;
    } else if (direction === DIRECTIONS.RIGHT) {
        currentBallPosition.x += deltaX;
        currentBallPosition.y += deltaY;
    }

    ball.style.left = currentBallPosition.x + 'px';
    ball.style.top = currentBallPosition.y + 'px';

    requestAnimationFrame(() => moveBall(direction, angle));
}

const moveRightPaddleToBall = () => {
    const ballRect = ball.getBoundingClientRect();
    const netRect = pongNet.getBoundingClientRect();
    const rightPadRect = rightPad.getBoundingClientRect();

    if (ballRect.x < netRect.x) {
        return;
    }

    const distanceBetweenPadAndBall = ballRect.left - rightPadRect.left;

    if (distanceBetweenPadAndBall >= 20) {
        return;
    }
    rightPad.style.top = `${ballRect.top}px`;
}

const calculateTopToAddValue = (event) => {
    const elementTouchingTable = isElementTouchingAnotherElement(leftPad, pongTable);
    if (elementTouchingTable.isTouchingTop &&  event === EVENTS.UP) {
        return;
    }
    if (elementTouchingTable.isTouchingBottom && event === EVENTS.DOWN) {
        return;
    }

    const computedStyle = getComputedStyle(leftPad);
    const currentTop = parseFloat(computedStyle.top) || 0;
    const viewportWidth = window.innerWidth;
    const topInVw = (currentTop / viewportWidth) * 100;

    return event === EVENTS.UP ? topInVw - VW_TO_ADD : topInVw + VW_TO_ADD;
}

const handleLeftPadEvents = (event) => {
    let updatedTopInVw;

    switch (event.code) {
        case 'KeyW':
            updatedTopInVw = calculateTopToAddValue(EVENTS.UP);
        break;
        case 'KeyS':
            updatedTopInVw = calculateTopToAddValue(EVENTS.DOWN);
        break;
        default:
        break;
    }

    if (updatedTopInVw) {
        leftPad.style.top = `${updatedTopInVw}vw`;
    }
}

document.addEventListener('keydown', handleLeftPadEvents);
