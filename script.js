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

    const neighbors = {            // we will use this values when checking win conditions
        dl: [1,-1],
        d: [1,0],
        dr: [1,1],
        r: [0,1],
    }

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


    function checkForWin() {

        for (let i = 0; i < rows; i++) {   // loop over the rows
            columnLoop:
            for (let j = 0; j < columns; j++) {    // loop over the columns

                // if there is a no value here yet, just go on to the next cell
                const startingValue = board[i][j]
                if (startingValue === 0) continue columnLoop

                // loop over each direction defined in neighbors. A direction is an offset value like [1,0] that
                // tells the program to look at the cell one row down and 0 columns over. We only need to define
                // 4 directions instead of 8, because we don't need to look backwards over the cells we already
                // looped over.
                directionLoop:
                for (let dir in neighbors) {

                    // We look ahead to the next cell. If there isn't a row there yet, we need to 
                    // terminate the loop early or else the program will through an error when trying
                    // to access the column of a row that is undefined
                    let nextCellX = board[i + neighbors[dir][0]]
                    if (nextCellX === undefined) continue directionLoop

                    let nextCell = nextCellX[j + neighbors[dir][1]]
                    
                    // if the next cell doesn't exist, or is value 0, or doesn't match the starting cell's value,
                    // we can just quit going in this direction
                    if (nextCell === undefined || nextCell === 0 || board[i + neighbors[dir][0]][j + neighbors[dir][1]] !== startingValue) {
                        continue directionLoop;
                    }

                    // ...but if there is a match, then we can keep trying to find matches that extend
                    // in the same direction. The con variable is for consecutive, and is multiplied by 
                    // the offsets. So a direction like [1, -1] would become [2, -2] with a con value of 2
                    for (let con = 2; con < numberOfItemsToWin; con++) {
                        
                        // make sure the next row exists first
                        let nextnextCellX = board[i + (con * neighbors[dir][0])]
                        if (nextnextCellX === undefined) continue directionLoop
                        
                        let nextnextCell = nextnextCellX[j + (con * neighbors[dir][1])]
                        if (nextnextCell === undefined || nextnextCell === 0 || nextnextCell !== startingValue) {
                            continue directionLoop;
                        }
                    }

                    // if we made it this far without a 'continue', then we found a win!
                    // Now we'll construct the information that will be returned to the gameController

                    let winArray = [startingValue, [i, j]]      // the winning player's value and first winning cell
                    
                    // then we push in the [rownum, colnum] of all of the other winning cells
                    for (let con = 1; con < numberOfItemsToWin; con++) {
                        winArray.push([i + (con * neighbors[dir][0]), j + (con * neighbors[dir][1])])
                    }

                    console.log(`There is a win in direction: ${dir}`)
                    return winArray

                }

                continue columnLoop;
            }
        }
        console.log("no win")
        // if we get here, we finished the loops and didn't find a win, so return null
        return null      
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

    function setWinScreen(winArray) {
        const gameContainer = document.getElementById('game-container')
        gameContainer.classList.remove('hover-on')

        const winningPlayer = winArray.splice(0, 1)[0]
        const messageContainer = document.getElementById('message-container')
        messageContainer.innerHTML = `<span style="color: ${colors[winningPlayer - 1]}"> Player ${winningPlayer}</span> wins!`;

        let winningCells = []
        for (let i = 0; i < winArray.length; i++) {
            winningCells.push(document.querySelector(`div.cell[data-row="${winArray[i][0]}"][data-column="${winArray[i][1]}"]`))
        }

        winningCells.forEach((cell) => {
            cell.classList.add('win')
        })
    }

    return {setupPlayers, createGameGrid, setActivePlayer, addMarkToBoard, removeHandleCellClick, setWinScreen}
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

    }

    

    function displayWinner(winArray) {
        
        DOMControl.removeHandleCellClick()
        DOMControl.setWinScreen(winArray)

    }

    return {playRound, activePlayer}
}

let game;

getOptions().startOptions()

// getOptions().quickStart()






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