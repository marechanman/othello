document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const messageElement = document.getElementById('message');
    const whiteScoreElement = document.getElementById('white-score');
    const blackScoreElement = document.getElementById('black-score'); 
    const playAgainButton = document.getElementById('play-again-button');

    const boardSize = 8;
    let board = [];
    let currentPlayer = 'black';
    const COMPUTER_PLAYER = 'black';
    const HUMAN_PLAYER = 'white';

    const directions = [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
        { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
    ];

    function initializeGame() {
        board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
        board[3][3] = 'white';
        board[3][4] = 'black';
        board[4][3] = 'black';
        board[4][4] = 'white';

        currentPlayer = HUMAN_PLAYER;

        playAgainButton.style.display = 'none';
        renderBoard();
        updateGameStatus();
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (board[r][c]) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece', board[r][c]);
                    piece.textContent = (board[r][c] === 'white') ? '' : '👾';
                    cell.appendChild(piece);
                }

                if (currentPlayer === HUMAN_PLAYER && isValidMove(r, c, HUMAN_PLAYER).length > 0) {
                    cell.classList.add('playable');
                    cell.removeEventListener('click', handleCellClick);
                    cell.addEventListener('click', handleCellClick);
                } else {
                    cell.removeEventListener('click', handleCellClick);
                }

                boardElement.appendChild(cell);
            }
        }
    }

    function handleCellClick(event) {
        if (currentPlayer !== HUMAN_PLAYER) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        const flippedPieces = isValidMove(row, col, HUMAN_PLAYER);

        if (flippedPieces.length > 0) {
            placePiece(row, col, HUMAN_PLAYER);
            flipPieces(flippedPieces, HUMAN_PLAYER);
            
            switchPlayer();
            
            renderBoard();
            updateGameStatus();
            checkGameOver();
        }
    }

    function placePiece(row, col, player) {
        board[row][col] = player;
    }

    function flipPieces(piecesToFlip, player) {
        piecesToFlip.forEach(p => {
            board[p.r][p.c] = player;
            const pieceElement = boardElement.querySelector(`.cell[data-row="${p.r}"][data-col="${p.c}"] .piece`);
            if (pieceElement) {
                pieceElement.classList.remove('white', 'black');
                pieceElement.classList.add(player);
                pieceElement.classList.add('flipped');
                pieceElement.textContent = (player === 'white') ? '' : '👾';
                pieceElement.addEventListener('animationend', () => {
                    pieceElement.classList.remove('flipped');
                }, { once: true });
            }
        });
    }

    function isValidMove(row, col, player) {
        if (board[row][col] !== null) return [];

        const opponent = (player === 'white') ? 'black' : 'white';
        let piecesToFlip = [];

        for (const dir of directions) {
            let r = row + dir.dr;
            let c = col + dir.dc;
            let currentPathFlips = [];

            while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === opponent) {
                currentPathFlips.push({ r, c }); 
                r += dir.dr;
                c += dir.dc;
            }

            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player && currentPathFlips.length > 0) {
                piecesToFlip = piecesToFlip.concat(currentPathFlips);
            }
        }
        return piecesToFlip;
    }

    function canPlayerMove(player) {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (isValidMove(r, c, player).length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';

        if (!canPlayerMove(currentPlayer)) {
            const previousPlayer = (currentPlayer === 'white') ? 'black' : 'white';
            messageElement.textContent = `${(previousPlayer === COMPUTER_PLAYER ? 'Cavity' : 'Tooth')} passes!`;
            currentPlayer = previousPlayer;

            if (!canPlayerMove(HUMAN_PLAYER) && !canPlayerMove(COMPUTER_PLAYER)) {
                checkGameOver();
                return;
            }
            setTimeout(() => {
                updateGameStatus();
                renderBoard();
                if (currentPlayer === COMPUTER_PLAYER) {
                    checkComputerTurn(); 
                }
            }, 1500);
        } else {
            updateGameStatus();
            renderBoard();
            if (currentPlayer === COMPUTER_PLAYER) {
                checkComputerTurn(); 
            }
        }
    }

    function updateGameStatus() {
        const playerText = (currentPlayer === HUMAN_PLAYER) ? 'Tooth' : 'Cavity';
        messageElement.textContent = `${playerText}'s turn.`;
        updateScores();
    }

    function updateScores() {
        let whiteCount = 0;
        let blackCount = 0;

        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === 'white') whiteCount++;
                else if (board[r][c] === 'black') blackCount++;
            }
        }
        whiteScoreElement.innerHTML = `<span></span> ${whiteCount}`; // spanタグを挿入
        blackScoreElement.innerHTML = `👾 ${blackCount}`;
    }

    function checkGameOver() {
        const canHumanMove = canPlayerMove(HUMAN_PLAYER);
        const canComputerMove = canPlayerMove(COMPUTER_PLAYER);

        let emptyCells = 0;
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === null) {
                    emptyCells++;
                }
            }
        }

        if (emptyCells === 0 || (!canHumanMove && !canComputerMove)) {
            let whiteCount = 0;
            let blackCount = 0;

            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (board[r][c] === 'white') whiteCount++;
                    else if (board[r][c] === 'black') blackCount++;
                }
            }

            let finalMessage = '';
            if (whiteCount > blackCount) {
                finalMessage = 'Good job!';
            } else if (blackCount > whiteCount) {
                finalMessage = 'Brush your teeth more.';
            } else {
                finalMessage = 'It\'s a Draw!';
            }
            
            messageElement.textContent = finalMessage; 
            
            const cells = boardElement.querySelectorAll('.cell');
            cells.forEach(cell => cell.removeEventListener('click', handleCellClick));

            playAgainButton.style.display = 'block';
        }
    }

    function checkComputerTurn() {
        if (currentPlayer === COMPUTER_PLAYER) {
            messageElement.textContent = 'Cavity is thinking...';
            renderBoard();

            setTimeout(() => {
                const availableMoves = [];
                for (let r = 0; r < boardSize; r++) {
                    for (let c = 0; c < boardSize; c++) {
                        const flips = isValidMove(r, c, COMPUTER_PLAYER);
                        if (flips.length > 0) {
                            availableMoves.push({ row: r, col: c, flips: flips });
                        }
                    }
                }

                if (availableMoves.length > 0) {
                    availableMoves.sort((a, b) => b.flips.length - a.flips.length);
                    const bestMove = availableMoves[0];

                    placePiece(bestMove.row, bestMove.col, COMPUTER_PLAYER);
                    flipPieces(bestMove.flips, COMPUTER_PLAYER);
                    
                    switchPlayer();
                    
                    renderBoard();
                    updateGameStatus();
                    checkGameOver();
                } else {
                    switchPlayer();
                    renderBoard();
                    updateGameStatus();
                    checkGameOver();
                }
            }, 1000);
        }
    }

    playAgainButton.addEventListener('click', initializeGame);

    initializeGame();
});
