let rows
let cols
let ballCounterLeft
let ballCollected
let ballInterval
let glueInterval
let gBoard;
let gGamerPos;
let glueLastPos


let isSticky = false
let isGameOn = null

const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE'
const elBallLeftCounter = document.querySelector('.ball-left')
const elBallCollectedCounter = document.querySelector('.ball-collected')
const elWinMsg = document.querySelector('.win-msg')
const elSpawnSpeed = document.querySelector('select[name=ball-spawn-speed]');
const elSpawnCount = document.querySelector('input[name=ball-spawn-count]');
const elBtnGame = document.querySelector('.btn-game-warper')

const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG = '🕸️'



function initGame(row, col) {
	elWinMsg.style.display = 'none'
	elBtnGame.style.display = 'block'
	gGamerPos = { i: 2, j: 9 };
	rows = row
	cols = col
	ballCounter = 0
	ballCollected = 0

	gBoard = buildBoard();
	renderBoard(gBoard);
}

function startGame(ev) {
	ev.preventDefault()
	elBtnGame.style.display = 'none'
	isGameOn = true

	spawnNewGlue(gBoard)
	newGameSpawnBall()

	glueInterval = setInterval(function () { spawnNewGlue(gBoard) }, 3000)
	elBallLeftCounter.innerHTML = `Only ${ballCounter} left!`
	elBallCollectedCounter.innerHTML = `You have Collected ${ballCollected} balls!`
	
	console.log('elBtnGame:', elBtnGame)
}

function newGameSpawnBall() {
	ballInterval = setInterval(function () { spawnNewBall(gBoard) }, elSpawnSpeed.value)
	for (i = 0; i < elSpawnCount.value; i++) {
		spawnNewBall(gBoard)
	}
}

function buildBoard() {
	var board = createMat(rows, cols)
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = { type: FLOOR, gameElement: null };
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			if (i === board.length / 2 || j === board.length / 2) {
				cell.type = FLOOR
			}
			board[i][j] = cell;
		}
	}
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	return board;
}

function spawnNewBall(board) {
	var allEmptyCells = getEmptyCells(board)
	var postionRandom = allEmptyCells[getRandomInt(0, allEmptyCells.length - 1)]
	board[postionRandom.i][postionRandom.j].gameElement = BALL;
	ballCounter += 1
	elBallLeftCounter.innerHTML = `Only ${ballCounter} left!`
	renderCell(postionRandom, BALL_IMG)

}
function spawnNewGlue(board) {
	if (glueLastPos && board[glueLastPos.i][glueLastPos.j].gameElement !== GAMER) {
		board[glueLastPos.i][glueLastPos.j].gameElement = null;
		renderCell(glueLastPos, null)
	}
	var allEmptyCells = getEmptyCells(board)
	var postionRandom = allEmptyCells[getRandomInt(0, allEmptyCells.length - 1)]
	glueLastPos = postionRandom
	board[postionRandom.i][postionRandom.j].gameElement = GLUE;
	renderCell(postionRandom, GLUE_IMG)
}

function getEmptyCells(board) {
	var allEmptyCell = []
	board.length
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			var currCell = board[i][j]
			if (currCell.type === FLOOR && currCell.gameElement === null) {
				allEmptyCell.push({ i: i, j: j })
			}
		}
	}
	return allEmptyCell
}


function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var cellClass = getClassName({ i: i, j: j })
			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall'
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}


	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	console.log('isSticky:', isSticky)
	var targetCell = gBoard[i][j];
	console.log('targetCell:', targetCell)
	if (targetCell.type === WALL) return;


	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			ballCollected++
			ballCounter--
			elBallLeftCounter.innerHTML = `Only ${ballCounter} left!`
			elBallCollectedCounter.innerHTML = `You have Collected ${ballCollected} balls!`
			if (!ballCounter) gameOver()
		}

		if (targetCell.gameElement === GLUE) {
			targetCell.gameElement = GAMER
			isSticky = true
			setTimeout(function () { glueTimeOut(); }, 5000);
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	}

}

function glueTimeOut() {
	return isSticky = false
}


function gameOver() {
	isGameOn = false
	clearInterval(glueInterval)
	clearInterval(ballInterval)

	elWinMsg.style.display = 'flex'
}

function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}


function handleKey(event) {
	if (!isGameOn || isSticky) return
	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

