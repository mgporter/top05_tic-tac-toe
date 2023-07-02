// Tic tac toe game

function getOptions() {
  const selectPlayersPanel = document.getElementById('options-pane1');
  const selectGridPanel = document.getElementById('options-pane2');
  const selectItemsPanel = document.getElementById('options-pane3');
  const optionsContainer = document.getElementById('options-container');

  let numberOfPlayers = 2;
  let gridSize = [3, 3];
  let itemsNeededToWin = 3;

  function startOptions() {
    setupNumberOfPlayers();
  }

  function setupNumberOfPlayers() {
    selectPlayersPanel.classList.remove('options-hidden');
    selectPlayersPanel.classList.add('options-visible');
  }

  function setupGrid() {
    selectPlayersPanel.classList.remove('options-visible');
    selectPlayersPanel.classList.add('options-hidden');

    selectGridPanel.classList.remove('options-hidden');
    selectGridPanel.classList.add('options-visible');
  }

  function setupItems() {
    selectGridPanel.classList.remove('options-visible');
    selectGridPanel.classList.add('options-hidden');

    selectItemsPanel.classList.remove('options-hidden');
    selectItemsPanel.classList.add('options-visible');
  }

  function startGame() {
    selectItemsPanel.classList.remove('options-visible');
    selectItemsPanel.classList.add('options-hidden');

    optionsContainer.classList.add('roll-up');
    optionsContainer.addEventListener('animationend', removeOptionsContainer);

    game = gameController(numberOfPlayers, gridSize, itemsNeededToWin);
  }

  function removeOptionsContainer() {
    optionsContainer.style.display = 'none';
    optionsContainer.removeEventListener(
      'animationend',
      removeOptionsContainer
    );
  }

  function quickStart() {
    selectItemsPanel.classList.remove('options-visible');
    selectItemsPanel.classList.add('options-hidden');

    optionsContainer.style.display = 'none';
    game = gameController(numberOfPlayers, gridSize, itemsNeededToWin);
  }

  function restartGame() {
    optionsContainer.classList.remove('roll-up');
    optionsContainer.style.display = 'grid';
    document.getElementById('game-container').remove();

    startOptions();
  }

  // Add Event Listeners
  // Panel 1
  const numberOfPlayersInput = document.getElementById('number-of-players');
  const numberOfPlayersButton = document.querySelector('#options-pane1 button');
  numberOfPlayersButton.addEventListener('click', () => {
    numberOfPlayers = numberOfPlayersInput.value
      ? numberOfPlayersInput.value
      : 2;
    setupGrid();
  });

  // Panel 2
  const gridSizeX = document.getElementById('custom-grid-size-x');
  const gridSizeY = document.getElementById('custom-grid-size-y');
  gridSizeX.addEventListener('click', addCheckToRadio);
  gridSizeY.addEventListener('click', addCheckToRadio);

  function addCheckToRadio() {
    if (!radioButtonOther.checked) radioButtonOther.checked = true;
  }

  const gridSizeButton = document.querySelector('#options-pane2 button');
  const radioButtonOther = document.getElementById('other');
  gridSizeButton.addEventListener('click', () => {
    let response = document.querySelector(
      'input[name="grid-size"]:checked'
    ).value;

    if (response === 'other') {
      gridSize = [+gridSizeX.value, +gridSizeY.value];
    } else {
      gridSize = [+response, +response];
    }

    gridSizeX.removeEventListener('click', addCheckToRadio);
    gridSizeY.removeEventListener('click', addCheckToRadio);

    setupItems();
  });

  // Panel 3
  const itemsInput = document.getElementById('items-in-a-row');
  const itemsButton = document.querySelector('#options-pane3 button');
  itemsButton.addEventListener('click', () => {
    itemsNeededToWin = itemsInput.value ? itemsInput.value : 3;

    if (gridSize[0] - itemsNeededToWin < 0) itemsNeededToWin = gridSize[0];
    if (gridSize[1] - itemsNeededToWin < 0) itemsNeededToWin = gridSize[1];
    startGame();
  });

  return { startOptions, quickStart, restartGame };
}

function boardController(gridSize, numberOfItemsToWin) {
  let rows = gridSize[0];
  let columns = gridSize[1];

  let board = [];

  const neighbors = {
    // we will use this values when checking win conditions
    dl: [1, -1],
    d: [1, 0],
    dr: [1, 1],
    r: [0, 1],
  };

  function initialize() {
    board = [];

    for (let i = 0; i < rows; i++) {
      board.push([]);
      for (let j = 0; j < columns; j++) {
        board[i].push(0);
      }
    }
  }

  function getBoard() {
    return board;
  }

  function resetBoard() {
    initialize();
  }

  function addMark(row, column, playerNum) {
    if (board[row][column]) return 'taken'; // return an error if the spot is already taken
    board[row][column] = playerNum;
    return 0;
  }

  function checkForWin() {
    let emptySpaces = 0;

    for (let i = 0; i < rows; i++) {
      // loop over the rows
      columnLoop: for (let j = 0; j < columns; j++) {
        // loop over the columns

        // if there is a no value here yet, just go on to the next cell
        const startingValue = board[i][j];
        if (startingValue === 0) {
          emptySpaces++; // we count the number of empty spaces to use later
          continue columnLoop;
        }

        // loop over each direction defined in neighbors. A direction is an offset value like [1,0] that
        // tells the program to look at the cell one row down and 0 columns over. We only need to define
        // 4 directions instead of 8, because we don't need to look backwards over the cells we already
        // looped over.
        directionLoop: for (let dir in neighbors) {
          // We look ahead to the next cell. If there isn't a row there yet, we need to
          // terminate the loop early or else the program will through an error when trying
          // to access the column of a row that is undefined
          let nextCellX = board[i + neighbors[dir][0]];
          if (nextCellX === undefined) continue directionLoop;

          let nextCell = nextCellX[j + neighbors[dir][1]];

          // if the next cell doesn't exist, or is value 0, or doesn't match the starting cell's value,
          // we can just quit going in this direction
          if (
            nextCell === undefined ||
            nextCell === 0 ||
            board[i + neighbors[dir][0]][j + neighbors[dir][1]] !==
              startingValue
          ) {
            continue directionLoop;
          }

          // ...but if there is a match, then we can keep trying to find matches that extend
          // in the same direction. The con variable is for consecutive, and is multiplied by
          // the offsets. So a direction like [1, -1] would become [2, -2] with a con value of 2
          for (let con = 2; con < numberOfItemsToWin; con++) {
            // make sure the next row exists first
            let nextnextCellX = board[i + con * neighbors[dir][0]];
            if (nextnextCellX === undefined) continue directionLoop;

            let nextnextCell = nextnextCellX[j + con * neighbors[dir][1]];
            if (
              nextnextCell === undefined ||
              nextnextCell === 0 ||
              nextnextCell !== startingValue
            ) {
              continue directionLoop;
            }
          }

          // if we made it this far without a 'continue', then we found a win!
          // Now we'll construct the information that will be returned to the gameController

          let winArray = [startingValue, [i, j]]; // the winning player's value and first winning cell

          // then we push in the [rownum, colnum] of all of the other winning cells
          for (let con = 1; con < numberOfItemsToWin; con++) {
            winArray.push([
              i + con * neighbors[dir][0],
              j + con * neighbors[dir][1],
            ]);
          }

          console.log(`There is a win in direction: ${dir}`);
          return winArray;
        }

        continue columnLoop;
      }
    }

    // If we get here, we finished the loops and didn't find a win.
    // If there aren't any empty spaces, then it's a draw
    if (emptySpaces === 0) {
      return 'draw';
    } else {
      return null;
    }
  }

  return { initialize, addMark, checkForWin, getBoard, resetBoard };
}

// Player factory function
function Player(num) {
  let mark = '';

  function getNum() {
    return num;
  }

  function getMark() {
    return mark;
  }

  function setMarkByIndex(idx) {
    mark = idx;
  }

  return { getNum, getMark, setMarkByIndex };
}

function DOMController() {
  const marks = ['X', 'O', '✓', '😊', '$', '!', 'π', '∞'];
  const colors = [
    '#FF7B7B',
    '#BDFF7B',
    '#7BFFFF',
    '#BD7BFF',
    '#FFD06C',
    '#6CFF87',
    '#6C9BFF',
    '#FF6CE4',
  ];

  function getMarks() {
    return marks;
  }

  function appendGameContainer() {
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';

    const leftPanel = document.createElement('div');
    leftPanel.id = 'left-panel';
    const playerSelections = document.createElement('div');
    playerSelections.id = 'player-selections';

    const resetGameWrapper = document.createElement('div');
    resetGameWrapper.id = 'reset-game-wrapper';
    const resetGame = document.createElement('button');
    resetGame.id = 'reset-game';
    const resetGameSpan = document.createElement('span');
    resetGameSpan.textContent = 'Reset spaces';
    resetGame.appendChild(resetGameSpan);
    resetGameWrapper.appendChild(resetGame);

    const backToOptionsWrapper = document.createElement('div');
    backToOptionsWrapper.id = 'back-to-options-wrapper';
    const backToOptions = document.createElement('button');
    backToOptions.id = 'back-to-options';
    const backToOptionsSpan = document.createElement('span');
    backToOptionsSpan.textContent = 'Game options';
    backToOptions.appendChild(backToOptionsSpan);
    backToOptionsWrapper.appendChild(backToOptions);

    const gameTitle = document.createElement('div');
    gameTitle.id = 'game-title';
    gameTitle.textContent = 'Ultimate Tic-Tac-Toe';

    leftPanel.append(
      playerSelections,
      resetGameWrapper,
      backToOptionsWrapper,
      gameTitle
    );

    const rightPanel = document.createElement('div');
    rightPanel.id = 'right-panel';

    const gridContainer = document.createElement('div');
    gridContainer.id = 'grid-container';
    const messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    rightPanel.append(gridContainer, messageContainer);

    gameContainer.append(leftPanel, rightPanel);
    document.body.append(gameContainer);

    // Turn on hover effects in the game Container
    gameContainer.classList.add('hover-on');
  }

  function setActivePlayer(num) {
    const activePlayerBoxes = document.querySelectorAll('.player-name-box');

    activePlayerBoxes.forEach((box) => {
      // loop through and remove the class current-player
      if (box.className.includes('current-player')) {
        box.classList.remove('current-player');
      }
    });

    const activePlayerBox = document.querySelector(
      `.player-name-box[data-player="${num}"]`
    );
    activePlayerBox.classList.add('current-player');

    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<p>It's <span style="color: ${
      colors[num - 1]
    };">Player ${num}'s</span> turn.</p>`;
  }

  function markBoxListener(e) {
    const playerNum = e.target.dataset.player;
    const newMark = e.target.dataset.mark;
    const oldMark = game.getPlayer(playerNum).getMark();

    // Change the selected mark in the mark-box
    const markBoxOld = document.querySelector(
      `.mark-selection.selected[data-player="${playerNum}"]`
    );
    markBoxOld.classList.remove('selected');

    const markBoxNew = document.querySelector(
      `.mark-selection[data-player="${playerNum}"][data-mark="${newMark}"]`
    );
    markBoxNew.classList.add('selected');

    // Query all of the cells that have the player's old marks
    let playerCells = Array.from(
      document.querySelectorAll(`.cell[data-ownedby="${playerNum}"]`)
    );

    // And change them to the new mark
    playerCells.forEach((cell) => (cell.textContent = marks[newMark]));

    // Update the Player object with the new mark
    game.getPlayer(playerNum).setMarkByIndex(newMark);
  }

  function setupPlayers(num) {
    const players = [];

    for (let i = 1; i <= num; i++) {
      const newPlayer = Player(i);
      newPlayer.setMarkByIndex(i - 1);
      players.push(newPlayer);
    }

    // Create the left-side menu with player names, colors, and mark selection box in the DOM
    const playerSelectionsDiv = document.getElementById('player-selections');
    playerSelectionsDiv.textContent = '';

    for (let i = 1; i <= num; i++) {
      const nameBox = document.createElement('div');
      nameBox.classList.add('player-name-box');
      nameBox.setAttribute('data-player', i);
      nameBox.innerHTML = `<span style="background-color:${
        colors[i - 1]
      };" class="player-color"></span>Player ${i}`;
      playerSelectionsDiv.appendChild(nameBox);

      const markBox = document.createElement('div');
      markBox.classList.add('player-mark-box');
      playerSelectionsDiv.appendChild(markBox);

      for (let j = 0; j < marks.length; j++) {
        const markSelection = document.createElement('div');
        markSelection.classList.add('mark-selection');
        markSelection.setAttribute('data-player', i);
        markSelection.setAttribute('data-mark', j);
        markSelection.textContent = marks[j];
        if (j === i - 1) {
          markSelection.classList.add('selected');
        }
        markBox.addEventListener('click', markBoxListener);

        markBox.appendChild(markSelection);
      }
    }

    setActivePlayer(1);

    return players;
  }

  function createGameGrid(gridSize) {
    let rows = gridSize[0];
    let columns = gridSize[1];
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = ''; // Delete anything there

    gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const gridSpace = document.createElement('div');
        gridSpace.classList.add('grid-space');

        // set borders
        if (i === 0) gridSpace.classList.add('no-top-border');
        if (i === rows - 1) gridSpace.classList.add('no-bottom-border');
        if (j === 0) gridSpace.classList.add('no-left-border');
        if (j === columns - 1) gridSpace.classList.add('no-right-border');

        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-row', i);
        cell.setAttribute('data-column', j);
        cell.setAttribute('data-ownedby', 0);
        cell.addEventListener('click', handleCellClick);

        gridSpace.appendChild(cell);
        gridContainer.appendChild(gridSpace);
      }
    }
  }

  function handleCellClick(e) {
    game.playRound(e.target.dataset.row, e.target.dataset.column);
  }

  function removeClickHandlers() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => cell.removeEventListener('click', handleCellClick));

    const markBoxes = document.querySelectorAll('mark-selection');
    markBoxes.forEach((box) =>
      box.removeEventListener('click', markBoxListener)
    );

    const resetButton = document.getElementById('reset-game');
    resetButton.disabled = true;
  }

  function addMarkToBoard(row, column, activePlayer) {
    const cell = document.querySelector(
      `[data-row="${row}"][data-column="${column}"]`
    );
    cell.style.backgroundColor = colors[activePlayer - 1];
    cell.setAttribute('data-ownedby', activePlayer);
    cell.textContent = marks[game.getPlayer(activePlayer).getMark()];
  }

  function setWinScreen(winArray) {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('hover-on');

    const winningPlayer = winArray.splice(0, 1)[0];
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
            <p style="font-weight:bold;"><span style="color: ${
              colors[winningPlayer - 1]
            };"> Player ${winningPlayer}</span> wins!</p>`;

    let winningCells = [];
    for (let i = 0; i < winArray.length; i++) {
      winningCells.push(
        document.querySelector(
          `div.cell[data-row="${winArray[i][0]}"][data-column="${winArray[i][1]}"]`
        )
      );
    }

    winningCells.forEach((cell) => {
      cell.classList.add('win');
    });

    document.getElementById('back-to-options').classList.add('flashing');
  }

  function setDrawScreen() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<p style="font-weight:bold;">It's a draw 🥵</p>`;

    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('hover-on');

    document.getElementById('back-to-options').classList.add('flashing');
  }

  function resetGrid() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.setAttribute('data-ownedby', 0);
      cell.style.backgroundColor = 'transparent';
      cell.textContent = '';
    });
  }

  return {
    appendGameContainer,
    setupPlayers,
    createGameGrid,
    setActivePlayer,
    addMarkToBoard,
    removeClickHandlers,
    setWinScreen,
    getMarks,
    setDrawScreen,
    resetGrid,
  };
}

function gameController(numberOfPlayers, gridSize, itemsNeededToWin) {
  let activePlayer = 1;

  //initialize board and DOM Controller
  const DOMControl = DOMController();
  DOMControl.appendGameContainer();
  const players = DOMControl.setupPlayers(numberOfPlayers);
  const gameBoard = boardController(gridSize, itemsNeededToWin);
  gameBoard.initialize();
  DOMControl.createGameGrid(gridSize);
  initializeButtons();

  function playRound(row, column) {
    let result = gameBoard.addMark(row, column, activePlayer);

    if (result === 'taken') {
      const messageContainer = document.getElementById('message-container');
      messageContainer.textContent = 'That spot is taken. Try another one.';
      return;
    }

    DOMControl.addMarkToBoard(row, column, activePlayer);

    // increment to the next active player
    activePlayer++;

    // but if the next player is beyond the total number of players, go back to player 1
    if (activePlayer > players.length) {
      activePlayer = 1;
    }

    DOMControl.setActivePlayer(activePlayer);

    const winningCells = gameBoard.checkForWin();
    if (winningCells === 'draw') displayDraw(winningCells);
    if (Array.isArray(winningCells) === true) displayWinner(winningCells);
  }

  function initializeButtons() {
    const resetButton = document.getElementById('reset-game');
    const restartGameButton = document.getElementById('back-to-options');

    resetButton.addEventListener('click', () => {
      gameBoard.resetBoard();
      DOMControl.resetGrid();
      DOMControl.setActivePlayer(1);
    });

    restartGameButton.addEventListener('click', () => {
      getOptionsModule.restartGame();
    });
  }

  function displayWinner(winArray) {
    DOMControl.removeClickHandlers();
    DOMControl.setWinScreen(winArray);
  }

  function displayDraw() {
    DOMControl.removeClickHandlers();
    DOMControl.setDrawScreen();
  }

  function getPlayer(num) {
    return players[num - 1];
  }

  return { playRound, getPlayer };
}

let game;

let getOptionsModule = getOptions();
getOptionsModule.startOptions();
