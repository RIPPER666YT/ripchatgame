const chatMessageElement = document.getElementById('chatMessage');
const character = document.getElementById('character');
const gameArea = document.getElementById('gameArea');
const aiCube = document.getElementById('aiCube');
let position = 0;

const TWITCH_CHANNEL = 'ripper_cmertanoc';
const OAUTH_TOKEN = 'wtqar5p5yx9uwavudwm75n8w9negpy';

const chatSocket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

chatSocket.addEventListener('open', () => {
    chatSocket.send(`CAP REQ :twitch.tv/membership`);
    chatSocket.send(`PASS ${OAUTH_TOKEN}`);
    chatSocket.send(`NICK justinfan12345`);
    chatSocket.send(`JOIN #${TWITCH_CHANNEL}`);
});

const userCubes = {};
let aiPosition = { x: 0, y: 0 };

function initAiCube() {
    aiCube.style.backgroundColor = 'blue';
    aiPosition.x = Math.random() * (gameArea.clientWidth - 30);
    aiPosition.y = Math.random() * (gameArea.clientHeight - 30);
    aiCube.style.left = aiPosition.x + 'px';
    aiCube.style.top = aiPosition.y + 'px';
}

chatSocket.addEventListener('message', (event) => {
    const message = event.data;

    if (message.includes('PRIVMSG')) {
        const parts = message.split(':');
        const chatMessage = parts[parts.length - 1].trim();
        const username = parts[1].split('!')[0];

        chatMessageElement.innerText = chatMessage;

        if (chatMessage === '!left') {
            moveCharacter(-10, 0);
        } else if (chatMessage === '!right') {
            moveCharacter(10, 0);
        } else if (chatMessage === '!up') {
            moveCharacter(0, -10);
        } else if (chatMessage === '!down') {
            moveCharacter(0, 10);
        } else if (chatMessage.startsWith('!create ')) {
            const color = chatMessage.split(' ')[1];
            createCube(color, username);
        } else if (chatMessage.startsWith('!move ')) {
            const direction = chatMessage.split(' ')[1];
            moveCube(username, direction);
        }
    }
});

function moveCharacter(xChange, yChange) {
    position += xChange;
    position = Math.max(0, Math.min(position, 370));
    character.style.left = position + 'px';
    let currentTop = parseInt(character.style.top) || 0;
    currentTop += yChange;
    currentTop = Math.max(0, Math.min(currentTop, gameArea.clientHeight - 30));
    character.style.top = currentTop + 'px';
}

function createCube(color, username) {
    const cube = document.createElement('div');
    cube.classList.add('cube');
    cube.style.backgroundColor = color;
    cube.style.left = Math.random() * (gameArea.clientWidth - 30) + 'px';
    cube.style.top = Math.random() * (gameArea.clientHeight - 30) + 'px';

    const usernameLabel = document.createElement('div');
    usernameLabel.classList.add('username');
    usernameLabel.innerText = username;

    cube.appendChild(usernameLabel);
    gameArea.appendChild(cube);
    userCubes[username] = cube;
}

function moveCube(username, direction) {
    const cube = userCubes[username];
    if (cube) {
        let cubePositionX = parseInt(cube.style.left);
        let cubePositionY = parseInt(cube.style.top);
        switch (direction) {
            case 'left':
                cubePositionX -= 10;
                break;
            case 'right':
                cubePositionX += 10;
                break;
            case 'up':
                cubePositionY -= 10;
                break;
            case 'down':
                cubePositionY += 10;
                break;
        }
        cubePositionX = Math.max(0, Math.min(cubePositionX, gameArea.clientWidth - 30));
        cubePositionY = Math.max(0, Math.min(cubePositionY, gameArea.clientHeight - 30));
        cube.style.left = cubePositionX + 'px';
        cube.style.top = cubePositionY + 'px';
    }
}

function moveAiCube() {
    const direction = Math.floor(Math.random() * 4);
    switch (direction) {
        case 0:
            aiPosition.x -= 10;
            break;
        case 1:
            aiPosition.x += 10;
            break;
        case 2:
            aiPosition.y -= 10;
            break;
        case 3:
            aiPosition.y += 10;
            break;
    }
    aiPosition.x = Math.max(0, Math.min(aiPosition.x, gameArea.clientWidth - 30));
    aiPosition.y = Math.max(0, Math.min(aiPosition.y, gameArea.clientHeight - 30));
    aiCube.style.left = aiPosition.x + 'px';
    aiCube.style.top = aiPosition.y + 'px';
}

setInterval(moveAiCube, 1000);
initAiCube();

chatSocket.addEventListener('error', (error) => {
    console.error('Ошибка WebSocket:', error);
});

chatSocket.addEventListener('close', () => {
    console.log('Отключено от чата Twitch');
});
