const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};
let currentDifficulty = 'easy';
let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let gameStarted = false;
const boardElement = document.getElementById('board');
const mineCountElement = document.getElementById('mineCount');
const restartBtn = document.getElementById('restartBtn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
initGame();
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
        initGame();
    });
});
restartBtn.addEventListener('click', initGame);
function initGame() {
    const settings = difficulties[currentDifficulty];
    gameOver = false;
    gameStarted = false;
    board = [];
    revealed = [];
    flagged = [];
    for (let i = 0; i < settings.rows; i++) {
        board[i] = [];
        revealed[i] = [];
        flagged[i] = [];
        for (let j = 0; j < settings.cols; j++) {
            board[i][j] = 0;
            revealed[i][j] = false;
            flagged[i][j] = false;
        }
    }
    mineCountElement.textContent = settings.mines;
    renderBoard();
}
function placeMines(firstRow, firstCol) {
    const settings = difficulties[currentDifficulty];
    let minesPlaced = 0;
    while (minesPlaced < settings.mines) {
        const row = Math.floor(Math.random() * settings.rows);
        const col = Math.floor(Math.random() * settings.cols);
        if (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) {
            continue;
        }

        if (board[row][col] !== -1) {
            board[row][col] = -1;
            minesPlaced++;
        }
    }
    for (let i = 0; i < settings.rows; i++) {
        for (let j = 0; j < settings.cols; j++) {
            if (board[i][j] !== -1) {
                board[i][j] = countAdjacentMines(i, j);
            }
        }
    }
}
function countAdjacentMines(row, col) {
    const settings = difficulties[currentDifficulty];
    let count = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;

            if (newRow >= 0 && newRow < settings.rows && 
                newCol >= 0 && newCol < settings.cols &&
                board[newRow][newCol] === -1) {
                count++;
            }
        }
    }

    return count;
}
function renderBoard() {
    const settings = difficulties[currentDifficulty];
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${settings.cols}, 35px)`;

    for (let i = 0; i < settings.rows; i++) {
        for (let j = 0; j < settings.cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;

            cell.addEventListener('click', () => handleClick(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(i, j);
            });

            boardElement.appendChild(cell);
        }
    }
}
function handleClick(row, col) {
    if (gameOver || revealed[row][col] || flagged[row][col]) {
        return;
    }
    if (!gameStarted) {
        gameStarted = true;
        placeMines(row, col);
    }

    revealCell(row, col);
    checkWin();
}
function handleRightClick(row, col) {
    if (gameOver || revealed[row][col]) {
        return;
    }

    const settings = difficulties[currentDifficulty];
    flagged[row][col] = !flagged[row][col];

    const cell = getCellElement(row, col);
    if (flagged[row][col]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
    } else {
        cell.classList.remove('flagged');
        cell.textContent = '';
    }
    const flagCount = flagged.flat().filter(f => f).length;
    mineCountElement.textContent = settings.mines - flagCount;
}
function revealCell(row, col) {
    const settings = difficulties[currentDifficulty];

    if (row < 0 || row >= settings.rows || 
        col < 0 || col >= settings.cols ||
        revealed[row][col] || flagged[row][col]) {
        return;
    }
    revealed[row][col] = true;
    const cell = getCellElement(row, col);
    cell.classList.add('revealed');

    if (board[row][col] === -1) {
        cell.classList.add('mine');
        cell.textContent = '💣';
        gameOver = true;
        revealAllMines();
        return;
    }

    if (board[row][col] > 0) {
        cell.textContent = board[row][col];
        cell.dataset.num = board[row][col];
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    }
}
function getCellElement(row, col) {
    return boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}
function revealAllMines() {
    const settings = difficulties[currentDifficulty];
    for (let i = 0; i < settings.rows; i++) {
        for (let j = 0; j < settings.cols; j++) {
            if (board[i][j] === -1) {
                const cell = getCellElement(i, j);
                cell.classList.add('revealed', 'mine');
                cell.textContent = '💣';
            }
        }
    }
}
function checkWin() {
    const settings = difficulties[currentDifficulty];
    let revealedCount = 0;

    for (let i = 0; i < settings.rows; i++) {
        for (let j = 0; j < settings.cols; j++) {
            if (revealed[i][j]) {
                revealedCount++;
            }
        }
    }

    if (revealedCount === settings.rows * settings.cols - settings.mines) {
        gameOver = true;
        alert('Поздравляем! Вы победили!');
    }
}
