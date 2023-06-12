// Tic tac toe game


function getOptions() {
    const selectPlayersPanel = document.getElementById('options-pane1')
    const selectGridPanel = document.getElementById('options-pane2')
    const selectItemsPanel = document.getElementById('options-pane3')
    const optionsContainer = document.getElementById('options-container')
    const gameContainer = document.getElementById('game-container')

    let numberOfPlayers = 2;
    let gridSize = [3, 3];
    let itemsNeededToWin = 3;

    function startOptions() {
        setupNumberOfPlayers()
    }

    function setupNumberOfPlayers() {
        const numberOfPlayersInput = document.getElementById('number-of-players')
        const numberOfPlayersButton = document.querySelector('#options-pane1 button')

        selectPlayersPanel.classList.remove('options-hidden')
        selectPlayersPanel.classList.add('options-visible')

        numberOfPlayersButton.addEventListener('click', () => {
            numberOfPlayers = numberOfPlayersInput.value ? numberOfPlayersInput.value : 2;
            setupGrid()
        })
    }

    function setupGrid() {
        selectPlayersPanel.classList.remove('options-visible')
        selectPlayersPanel.classList.add('options-hidden')

        const gridSizeButton = document.querySelector('#options-pane2 button')
        const gridSizeX = document.getElementById('custom-grid-size-x')
        const gridSizeY = document.getElementById('custom-grid-size-y')
        const radioButtonOther = document.getElementById('other')

        gridSizeX.addEventListener('click', addCheckToRadio)
        gridSizeY.addEventListener('click', addCheckToRadio)
        
        function addCheckToRadio() {
            if (!radioButtonOther.checked) radioButtonOther.checked = true
        }

        selectGridPanel.classList.remove('options-hidden')
        selectGridPanel.classList.add('options-visible')

        gridSizeButton.addEventListener('click', () => {
            let response = document.querySelector('input[name="grid-size"]:checked').value

            if (response === 'other') {
                gridSize = [+gridSizeX.value, +gridSizeY.value]
            } else {
                gridSize = [+response, +response]
            }

            gridSizeX.removeEventListener('click', addCheckToRadio)
            gridSizeY.removeEventListener('click', addCheckToRadio)

            setupItems()
        })
    }

    function setupItems() {

        selectGridPanel.classList.remove('options-visible')
        selectGridPanel.classList.add('options-hidden')

        const itemsInput = document.getElementById('items-in-a-row')
        const itemsButton = document.querySelector('#options-pane3 button')

        selectItemsPanel.classList.remove('options-hidden')
        selectItemsPanel.classList.add('options-visible')

        itemsButton.addEventListener('click', () => {
            itemsNeededToWin = itemsInput.value ? itemsInput.value : 3;
            startGame()
        })
    }

    function startGame() {
        optionsContainer.classList.add('roll-up')
        optionsContainer.addEventListener('animationend', removeOptionsContainer)
        gameContainer.classList.add('hover-on')

        game = gameController(numberOfPlayers, gridSize, itemsNeededToWin)
    }

    function removeOptionsContainer() {
        optionsContainer.style.display = 'none'
        optionsContainer.removeEventListener('animationend', removeOptionsContainer)
    }

    function quickStart() {
        optionsContainer.style.display = 'none'
        gameContainer.classList.add('hover-on')
        game = gameController(numberOfPlayers, gridSize, itemsNeededToWin)
    }

    return {startOptions, quickStart}

}



function boardController(gridSize, numberOfItemsToWin) {

    let rows = gridSize[0];
    let columns = gridSize[1];

    board = [];

    function initialize() {

        for (let i = 0; i < rows; i++) {
            board.push([])
            for (let j = 0; j < columns; j++) {
                board[i].push(0)
            }
        }
    }

    function addMark(row, column, playerNum) {
        if (board[row][column]) return "taken";   // return an error if the spot is already taken
        board[row][column] = playerNum;
        return 0;
    }

    // this function takes the gameBoard as an argument and returns the winner's number, or 0 if none
    // we will first convert the gameboard into a string so we can quickly check it with Regex
    // for consecutive numbers. We have to use four different string patterns because a victory can
    // be horizontal, vertical, diagonal moving forward, and diagonal moving backward
    function checkForWin() {   

        // this function makes a string from each column. We'll use it for everything but the horizontal win condition.
        function makeStringFromColumns(board) {
            return board[0].map((_, col) => {
                return board.reduce((prev, next) => {
                    return `${prev}${next[col]}`
                }, "")
            }).join(",")
        }

        // make a string from the board to represent the horizontal win condition by
        // making strings from each row
        const horizontalWinString = board.reduce((prev, next) => {
            let nextStr = next.join("")
            return `${prev},${nextStr}`
        }, "")

        // make a string from the board to represent the vertical win condition
        const verticalWinString = makeStringFromColumns(board)

        // make a string from the board to represent the diagonal forward win condition
        // In order to check for diagonals, we first shift the rows based on their position,
        // for example:
        // 1, 2, 3             0, 0, 1, 2, 3
        // 4, 5, 6   becomes:  0, 4, 5, 6, 0
        // 7, 8, 9             7, 8, 9, 0, 0
        let shiftedForwardBoard = board.map((row, i) => {
            let startingArr = Array.from(Array(board.length - i - 1), () => "X")
            let endingArr = Array.from(Array(i), () => "X")
            return [...startingArr, ...row, ...endingArr]
        })

        // After the shift, we can just check the board vertically
        const diagforwardWinString = makeStringFromColumns(shiftedForwardBoard)


        // make a string from the board to represent the diagonal backward win condition
        // Same idea as above, but shifted so that the bottom rows move the most:
        // 1, 2, 3             1, 2, 3, 0, 0
        // 4, 5, 6   becomes:  0, 4, 5, 6, 0
        // 7, 8, 9             0, 0, 7, 8, 9 
        let shiftedBackwardBoard = board.map((row, i) => {
            let startingArr = Array.from(Array(i), () => "X")
            let endingArr = Array.from(Array(board.length - i - 1), () => "X")
            return [...startingArr, ...row, ...endingArr]
        })

        const diagbackWinString = makeStringFromColumns(shiftedBackwardBoard)



        // the checkStr function checks each string for a victory condition
        function checkStr(h, v, df, db) {

            // create the Regex string to use to match the array strings
            // it will find the first case of numberOfItemsToWin consecutive items
            let victoryRegex = "([1-9])"
            for (let i = 0; i < (numberOfItemsToWin - 1); i++) {
                victoryRegex += "\\1"
            }
            let re = new RegExp(victoryRegex)

            // search the strings for regex match (which is the victory condition)
            let winnerIndexH = h.search(re)
            let winnerIndexV = v.search(re)
            let winnerIndexDF = df.search(re)
            let winnerIndexDB = db.search(re)

            // check if there is a win in any of them. If not (the most frequent case), we just return 0
            if (winnerIndexH === -1 && winnerIndexV === -1 && winnerIndexDF === -1 && winnerIndexDB === -1) {
                return 0
            }
            
            // However if there is a match of the victory Regex, then we need to get the winning cells
            // We'll define the functions first, then call them at the end

            function getCellsFromHorizontalWin(idx) {
                const winningPlayer = h[idx];          // get the winning players number
                const adjustedIdx = idx - (Math.floor(idx/columns) + 1);       // calculate the index as if the string had no commas
                const winnerStartCell = [Math.floor(adjustedIdx/columns), adjustedIdx % columns];   // get the first winning cell
                
                let winnerCells = [];
                winnerCells.push(winningPlayer)        // push the winning players number in first
                winnerCells.push(winnerStartCell)      // then push the first winning cell

                for (let i = 1; i < numberOfItemsToWin; i++) {
                    const newCell = [winnerStartCell[0], winnerStartCell[1] + i]
                    winnerCells.push(newCell)           // then calculate and push the rest of the winning cells
                }

                return winnerCells
            }

            function getCellsFromVerticalWin(idx) {
                const winningPlayer = v[idx];
                const adjustedIdx = idx - (Math.floor(idx/rows));
                // const winnerStartCell = [Math.floor(adjustedIdx/rows), adjustedIdx % rows];
                const winnerStartCell = [adjustedIdx % rows, Math.floor(adjustedIdx/rows)];

                
                let winnerCells = [];
                winnerCells.push(winningPlayer)
                winnerCells.push(winnerStartCell)

                for (let i = 1; i < numberOfItemsToWin; i++) {
                    const newCell = [winnerStartCell[0] + i, winnerStartCell[1]]
                    winnerCells.push(newCell)
                }

                return winnerCells
            }

            function getCellsFromDiagforwardWin(idx) {
                const winningPlayer = df[idx];
                const adjustedIdx = idx - (Math.floor(idx/rows) - 1);
                const winnerStartCell = [adjustedIdx % rows, (Math.floor(adjustedIdx/rows) - ((rows - 1) - adjustedIdx % rows))];
                
                let winnerCells = [];
                winnerCells.push(winningPlayer)
                winnerCells.push(winnerStartCell)

                for (let i = 1; i < numberOfItemsToWin; i++) {
                    const newCell = [winnerStartCell[0] + i, winnerStartCell[1] + i]
                    winnerCells.push(newCell)
                }

                return winnerCells
            }

            function getCellsFromDiagbackwardWin(idx) {
                const winningPlayer = db[idx];
                const adjustedIdx = idx - (Math.floor(idx/rows));
                const winnerStartCell = [adjustedIdx % rows, Math.floor(adjustedIdx/rows) - (adjustedIdx % rows)];
                
                let winnerCells = [];
                winnerCells.push(winningPlayer)
                winnerCells.push(winnerStartCell)

                for (let i = 1; i < numberOfItemsToWin; i++) {
                    const newCell = [winnerStartCell[0] + i, winnerStartCell[1] - i]
                    winnerCells.push(newCell)
                }

                return winnerCells
            }

            // call the relevant function. Note that the string can only have one type of victory at a time
            if (winnerIndexH !== -1) return getCellsFromHorizontalWin(winnerIndexH);
            if (winnerIndexV !== -1) return getCellsFromVerticalWin(winnerIndexV);
            if (winnerIndexDF !== -1) return getCellsFromDiagforwardWin(winnerIndexDF);
            if (winnerIndexDB !== -1) return getCellsFromDiagbackwardWin(winnerIndexDB);
        }

        // check the strings for a winner, and report back the winner and the coordinates if found, or 0 if not found
        let winningCells = checkStr(horizontalWinString, verticalWinString, diagforwardWinString, diagbackWinString)

        return winningCells

    }

    return {initialize, addMark, checkForWin}
}


// Player factory function
function Player(num) {
    
    let mark = "X"

    function getNum() {
        return num;
    }

    function getMark() {
        return mark;
    }

    return {getNum, getMark};
}




function DOMController() {
    
    const marks = ["X", "O", "!", ":)", ":O", "!", "M", "8"]
    const colors = ["#FF7B7B", "#BDFF7B", "#7BFFFF", "#BD7BFF", "#FFD06C", "#6CFF87", "#6C9BFF", "#FF6CE4"]

    function setActivePlayer(num) {
        const activePlayerBoxes = document.querySelectorAll('.player-name-box')
        
        activePlayerBoxes.forEach((box) => {            // loop through and remove the class current-player
            if (box.className.includes('current-player')) {
                box.classList.remove('current-player')
            }
        })

        const activePlayerBox = document.querySelector(`.player-name-box[data-player="${num}"]`)

        
        activePlayerBox.classList.add('current-player')
    }

    function setupPlayers(num) {
        const players = []
        

        for (let i = 1; i <= num; i++) {
            players.push(Player(i))
        }

        function updateDOM() {
            const playerSelectionsDiv = document.getElementById('player-selections')
            playerSelectionsDiv.textContent = "";

            for (let i = 1; i <= num; i++) {
                const nameBox = document.createElement('div')
                nameBox.classList.add('player-name-box')
                nameBox.setAttribute('data-player', i)
                nameBox.innerHTML = 
                    `<span style="background-color:${colors[i-1]};" class="player-color"></span>Player ${i}`;
                playerSelectionsDiv.appendChild(nameBox)

                const markBox = document.createElement('div')
                markBox.classList.add('player-mark-box')
                playerSelectionsDiv.appendChild(markBox)

                for (let j = 0; j < marks.length; j++) {
                    const markSelection = document.createElement('div')
                    markSelection.classList.add('mark-selection')
                    markSelection.setAttribute('data-player', (i))
                    markSelection.setAttribute('data-mark', j)
                    markSelection.textContent = marks[j]

                    markBox.appendChild(markSelection)
                }
            }
        }

        updateDOM()

        setActivePlayer(1)

        return players
    }

    function createGameGrid(gridSize) {

        let rows = gridSize[0];
        let columns = gridSize[1];
        const gridContainer = document.getElementById('grid-container')

        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const gridSpace = document.createElement('div')
                gridSpace.classList.add('grid-space')

                // set borders
                if (i === 0) gridSpace.classList.add('no-top-border');
                if (i === (rows - 1)) gridSpace.classList.add('no-bottom-border');
                if (j === 0) gridSpace.classList.add('no-left-border');
                if (j === (columns - 1)) gridSpace.classList.add('no-right-border');
    
                const cell = document.createElement('div')
                cell.classList.add('cell')
                cell.setAttribute('data-row', i)
                cell.setAttribute('data-column', j)
                cell.addEventListener('click', handleCellClick)

                gridSpace.appendChild(cell)
                gridContainer.appendChild(gridSpace)
            }
        }


    }

    function handleCellClick(e) {
        game.playRound(e.target.dataset.row, e.target.dataset.column)
    }

    function removeHandleCellClick() {
        const cells = document.querySelectorAll('.cell')
        cells.forEach((cell) => cell.removeEventListener('click', handleCellClick))
    }

    function addMarkToBoard(row, column, activePlayer) {
        const cell = document.querySelector(`[data-row="${row}"][data-column="${column}"]`)
        cell.style.backgroundColor = colors[activePlayer - 1]
        cell.textContent = marks[activePlayer]
    }

    return {setupPlayers, createGameGrid, setActivePlayer, addMarkToBoard, removeHandleCellClick}
}





function gameController(numberOfPlayers, gridSize, itemsNeededToWin) {

    let activePlayer = 1

    //initialize board and DOM Controller
    const DOMControl = DOMController()
    const players = DOMControl.setupPlayers(numberOfPlayers)
    const gameBoard = boardController(gridSize, itemsNeededToWin)
    gameBoard.initialize()
    DOMControl.createGameGrid(gridSize)

    function playRound(row, column) {

        let result = gameBoard.addMark(row, column, activePlayer);
        if (result === "taken") return console.log("That space is taken!");

        DOMControl.addMarkToBoard(row, column, activePlayer)

        // increment to the next active player
        activePlayer++

        // but if the next player is beyond the total number of players, go back to player 1
        if (activePlayer > players.length) {
            activePlayer = 1;
        }

        DOMControl.setActivePlayer(activePlayer)
        
        const winningCells = gameBoard.checkForWin()
        if (winningCells) displayWinner(winningCells)

        console.log(winningCells)

        // if (winnerNum) displayWinner(winnerNum)

    }

    

    function displayWinner(winner) {
        
        DOMControl.removeHandleCellClick()
        const gameContainer = document.getElementById('game-container')
        gameContainer.classList.remove('hover-on')
        console.log("removed")
        // do stuff here
    }

    return {playRound, activePlayer}
}

let game;

// getOptions().startOptions()

getOptions().quickStart()






// This code represents another way to find the win conditions by using loops

/*         // check for a win horizontally
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns - 2; j++) {

                if (board[i][j] === 0) continue;
                
                if (board[i][j] === board[i][j+1] && board[i][j] === board[i][j+2]) {
                    console.log('there is a horizontal win!')
                    return board[i][j]
                }
            }
        }

        // check for a win vertically
        for (let i = 0; i < rows - 2; i++) {
            for (let j = 0; j < columns; j++) {

                if (board[i][j] === 0) continue;
                
                if (board[i][j] === board[i+1][j] && board[i][j] === board[i+2][j]) {
                    console.log('there is a vertical win!')
                    return board[i][j]
                }
            }
        }

        // check for a win diagonally (right then down)
        for (let i = 0; i < rows - 2; i++) {
            for (let j = 0; j < columns - 2; j++) {

                if (board[i][j] === 0) continue;
                
                if (board[i][j] === board[i+1][j+1] && board[i][j] === board[i+2][j+2]) {
                    console.log('there is a forward diagonal win!')
                    return board[i][j]
                }
            }
        }

        // check for a win diagonally (left then down)
        for (let i = 0; i < rows - 2; i++) {
            for (let j = 2; j < columns; j++) {

                if (board[i][j] === 0) continue;
                
                if (board[i][j] === board[i+1][j-1] && board[i][j] === board[i+2][j-2]) {
                    console.log('there is a backward diagonal win!')
                    return board[i][j]
                }
            }
        }

        return 0;
    } */




    let testBoard1 = [
        [2, 1, 0, 1, 2],
        [1, 1, 1, 2, 1],
        [0, 2, 0, 0, 2],
        [2, 1, 0, 1, 1],
    ]
    
    let testBoard2 = [
        [2, 2, 0, 1, 2],
        [1, 2, 1, 2, 1],
        [0, 2, 0, 0, 2],
        [2, 1, 0, 1, 1],
    ]
    
    let testBoard2a = [
        [2, 2, 1, 1, 2],
        [1, 3, 1, 2, 1],
        [0, 2, 1, 0, 2],
        [2, 1, 0, 1, 1],
    ]
    
    let testBoard3 = [
        [2, 2, 0, 1, 2],
        [1, 0, 1, 2, 1],
        [0, 2, 0, 1, 2],
        [2, 1, 0, 1, 1],
    ]
    
    let testBoard3a = [
        [2, 1, 0, 1, 2],
        [1, 0, 1, 2, 1],
        [0, 2, 0, 1, 2],
        [2, 1, 0, 1, 2],
    ]
    
    let testBoard4 = [
        [2, 1, 0, 1, 2],
        [1, 0, 1, 2, 1],
        [0, 1, 0, 2, 2],
        [2, 1, 0, 1, 1],
    ]