document.addEventListener('DOMContentLoaded', () => {
    // Lista de palavras-alvo (5 letras)
    const words = [
        "ABRIR", "AMIGO", "BANHO", "CAIXA", "DIZER",
        "FALAR", "GOSTO", "HORAS", "JOGAR", "LIVRO",
        "NOITE", "OCUPA", "PAPEL", "QUASE",
        "RADIO", "SABER", "TARDE", "UNIDO", "VIVER"
    ];

    // Elementos do DOM
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const usedLettersContainer = document.getElementById('used-letters');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.querySelector('.close');

    // Novos elementos para placar e modo dark
    const darkBtn = document.getElementById('dark-btn');
    const vitoriasEl = document.getElementById('vitorias');
    const derrotasEl = document.getElementById('derrotas');

    // Variáveis do jogo
    let targetWord = '';
    let currentRow = 0;
    let currentCell = 0;
    let gameOver = false;
    let usedLetters = new Set();
    let activeCell = null;

    // Variáveis de placar
    let vitorias = 0;
    let derrotas = 0;

    function atualizarPlacar() {
        const total = vitorias + derrotas;
        const porcentagem = total > 0 ? ((vitorias / total) * 100).toFixed(1) : 0;
        vitoriasEl.textContent = `Vitórias: ${vitorias} (${porcentagem}%)`;
        derrotasEl.textContent = `Derrotas: ${derrotas}`;
    }

    // Alternar modo dark
    darkBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });

    // Inicializar o jogo
    function initGame() {
        targetWord = words[Math.floor(Math.random() * words.length)];
        console.log("Palavra");

        currentRow = 0;
        currentCell = 0;
        gameOver = false;
        usedLetters = new Set();
        message.textContent = '';
        usedLettersContainer.textContent = '';

        board.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            row.dataset.row = i;
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.cell = j;

                cell.addEventListener('click', () => {
                    if (!gameOver && parseInt(cell.dataset.row) === currentRow) {
                        document.querySelectorAll('.cell.active').forEach(c => c.classList.remove('active'));

                        if (cell.textContent && j < 4) {
                            const nextCell = row.querySelector(`.cell[data-cell="${j + 1}"]`);
                            nextCell.classList.add('active');
                            activeCell = nextCell;
                            currentCell = j + 1;
                        } else {
                            cell.classList.add('active');
                            activeCell = cell;
                            currentCell = j;
                        }
                    }
                });

                row.appendChild(cell);
            }
            board.appendChild(row);
        }

        activeCell = document.querySelector('.cell');
        activeCell.classList.add('active');
    }

    function handleKeyPress(key) {
        if (gameOver) return;

        const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
        const currentRowCells = currentRowElement ? Array.from(currentRowElement.querySelectorAll('.cell')) : [];

        if (key === 'Enter') {
            const allFilled = currentRowCells.every(cell => cell.textContent);
            if (allFilled) {
                checkGuess();
            } else {
                message.textContent = "Preencha todas as letras!";
                setTimeout(() => message.textContent = '', 2000);
            }
        } else if (key === 'Backspace') {
            if (activeCell && activeCell.textContent) {
                activeCell.textContent = '';
                activeCell.classList.remove('filled');
            } else if (currentCell > 0) {
                currentCell--;
                activeCell = currentRowCells[currentCell];
                activeCell.classList.add('active');
                if (activeCell.textContent) {
                    activeCell.textContent = '';
                    activeCell.classList.remove('filled');
                }
            }
        } else if (/^[A-Za-z]$/.test(key)) {
            if (activeCell) {
                activeCell.textContent = key.toUpperCase();
                activeCell.classList.add('filled');
                if (currentCell < 4) {
                    activeCell.classList.remove('active');
                    currentCell++;
                    activeCell = currentRowCells[currentCell];
                    activeCell.classList.add('active');
                }
            }
        }
    }

    function checkGuess() {
        const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
        const currentRowCells = currentRowElement.querySelectorAll('.cell');
        let guess = '';

        currentRowCells.forEach(cell => { guess += cell.textContent; });

        if (guess.length !== 5) {
            message.textContent = "A palavra deve ter 5 letras!";
            shakeRow(currentRow);
            return;
        }

        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');
        const result = Array(5).fill('');

        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'right';
                targetLetters[i] = null;
            }
        }

        for (let i = 0; i < 5; i++) {
            if (result[i] === 'right') continue;
            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = 'place';
                targetLetters[index] = null;
            } else {
                result[i] = 'wrong';
                usedLetters.add(guessLetters[i]);
            }
        }

        for (let i = 0; i < 5; i++) {
            currentRowCells[i].classList.add(result[i]);
        }

        updateUsedLetters();

        if (guess === targetWord) {
            message.textContent = "Acertou!";
            vitorias++;            // Incrementa vitórias
            atualizarPlacar();      // Atualiza placar
            gameOver = true;
            setTimeout(() => { initGame(); }, 2000);
            return;
        }

        currentRow++;
        currentCell = 0;

        if (currentRow < 6) {
            activeCell = document.querySelector(`.row[data-row="${currentRow}"] .cell`);
            activeCell.classList.add('active');
        }

        if (currentRow === 6) {
            message.textContent = `Tente novamente! A palavra era ${targetWord}`;
            derrotas++;            // Incrementa derrotas
            atualizarPlacar();      // Atualiza placar
            gameOver = true;
            setTimeout(() => { initGame(); }, 2000);
        }
    }

    function updateUsedLetters() {
        if (usedLetters.size > 0) {
            usedLettersContainer.textContent = 'Letras não usadas: ' +
                [...usedLetters].sort().join(', ');
        }
    }

    function shakeRow(row) {
        const rowElement = document.querySelector(`.row[data-row="${row}"]`);
        rowElement.style.animation = 'shake 0.5s';
        setTimeout(() => { rowElement.style.animation = ''; }, 500);
    }

    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        handleKeyPress(e.key);
    });

    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'flex';
        helpModal.classList.add('align-center-flex');
    });

    closeBtn.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    initGame();
});