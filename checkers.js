var checkersArray = [];
//this is just an example variable to get it set in my mind
//started the multiple paths issue from the black piece because that's how it's set up
var path = {};
var toggleTimesCalled = 0;
function setUp() {
    var checkersContainer = document.getElementById('game-board-container');
    for (var r = 0; r < 8; r++) {
        var row = document.createElement('DIV');
        row.setAttribute('id', 'row' + r);
        row.setAttribute('class', 'row');
        var rowArray = [];
        for (var c = 0; c < 8; c++) {
            var cellObject = {
                piece: 'none',
                id: r + "" + c,
                status: 'none'
            }
            var cell = document.createElement('DIV');
            cell.setAttribute('id', r + "" + c);
            cell.setAttribute('class', 'box');
            if (isEven(r)) {
                if (isEven(c)) {
                    cell.className += ' black';
                    cellObject.color = 'black';
                }
                else {
                    cell.className += ' white';
                    cellObject.color = 'white';
                }
            }
            else {
                if (isEven(c)) {
                    cell.className += ' white';
                    cellObject.color = 'white';
                }
                else {
                    cell.className += ' black';
                    cellObject.color = 'white';
                }
            }
            if (r > 4 && cell.classList.contains('white')) {
                cell.className += ' black-piece';
                cellObject.piece = 'black';
                cellObject.status = 'piece';
                cell.addEventListener('click', giveOptions);
            }
            else if (r < 3 && cell.classList.contains('white')) {
                cell.className += ' red-piece';
                cellObject.piece = 'red';
                cellObject.status = 'piece';
                cell.addEventListener('click', giveOptions);
            }
            row.appendChild(cell);
            rowArray.push(cellObject);
        }
        checkersContainer.appendChild(row);
        checkersArray.push(rowArray);
    }
}

function isEven(n) {
    return n % 2 === 0;
}

setUp();

sweetAlert ({
    title: "Who should start the game?",
    type: "info",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Red",
    cancelButtonText: "Black",
    closeOnConfirm: false,
    closeOnCancel: false
},
function(isConfirm) {
if (isConfirm) {
    swal('Sweet!', "Red will start the game.","success");
    turnToMove = 'red';
}
else {
    swal("Nice!", "Black will start the game.", "success");
    turnToMove = 'black';
}
})
//consider removing the array of objects variable to deal with just the DOM
function giveOptions(trigger) {
    var alreadyClicked = document.getElementsByClassName('clicked'); //we'll use alreadySelected and alreadyAvailable to remove the results from the last giveOptions function and to remove the corresponding event listeners -- only one thing selected at a time
    var alreadyAvailable = isEven(toggleTimesCalled) ? document.getElementsByClassName('available') : document.getElementsByClassName('available-no-show');
    var pieceType = trigger.target.classList.contains('red-piece') || trigger.target.classList.contains('black-piece') ? 'normal' : 'king';
    clearThe('clicked');
    clearThe('available');
    clearThe('available-no-show');
    clearThe('possible-jump');
    path = {};
    var row = parseInt(trigger.target.id[0]);  //this gives the row of the item (useful to check the checkersArray.id)
    var column = parseInt(trigger.target.id[1]);  //this gives the column of the item (useful to check the checkersArray.id)
    var divInDOM = document.getElementById(trigger.target.id);
    divInDOM.classList.add('clicked'); //highlights the div background
    //these next lines of code should check just the immediate elements
    var color = divInDOM.classList.contains('red-piece') || divInDOM.classList.contains('red-king-piece') ? 'red' : 'black';
    if (color !== turnToMove) {
        var notTurn = color === 'red' ? 'black' : 'red';
        clearThe('clicked');
        sweetAlert('Oops...', 'It\'s currently ' + notTurn + '\'s turn.', "error");
        return;
    }
    if (pieceType === "king") {
        checkNext(color, row, column, "right", 0, 1, pieceType);
    }
    else {
        checkNext(color, row, column, "right", 0, 1, pieceType); // checks right for options
        checkNext(color, row, column, "left", 0, 1, pieceType); //checks left for options
    }
}

function has(pieceColor) {
    return function(div) {
        if (div.classList.contains(pieceColor + '-king-piece') || div.classList.contains(pieceColor + '-piece')) {
            return true;
        }
        else {
            return false;
        }
    }
}

var hasBlackPiece = has('black');
var hasRedPiece = has('red');

function checkNext(pieceColor, row, column, direction, fail, timesCalled, pieceType, avoidDir, onlyDir) { /*what would need to be passed to this function to make it usable with all clickedPieces? pieceColor, row, direction (right or left) -- we need to call this function twice for the normal pieces or four times for the king pieces (checkAllDirections)*/
    while (fail < 2) { //ensures we can only jump one opposite color and not two
        var upOneRight = document.getElementById((row - 1) + "" + (column + 1));
        var upOneLeft = document.getElementById((row - 1) + "" + (column - 1));
        var downOneLeft = document.getElementById((row + 1) + "" + (column - 1));
        var downOneRight = document.getElementById((row + 1) + "" + (column + 1));
        var upTwoRightTwo = document.getElementById((row - 2) + "" + (column + 2));
        var upTwoLeftTwo = document.getElementById((row - 2) + "" + (column - 2));
        var downTwoRightTwo = document.getElementById((row + 2) + "" + (column + 2));
        var downTwoLeftTwo = document.getElementById((row + 2) + "" + (column - 2));
        var selectedDiv = document.getElementById(row + "" + column);
        var opposite = pieceColor === 'red' ? 'black' : 'red';
        console.log(path);
        if (pieceType === 'normal') {
            if (direction === "right" && pieceColor === "red" && downOneRight !== null) {
                if (hasBlackPiece(downOneRight)) { //if it contains the black piece
                    checkNext('red', parseInt(downOneRight.id[0]), parseInt(downOneRight.id[1]), "right", fail + 1, timesCalled + 1, "normal");
                    return;
                }
                else if (!hasRedPiece(downOneRight) && timesCalled === 1) {
                    whichAvailable(downOneRight);
                    downOneRight.addEventListener('click', movePiece);
                }
                else if (!hasRedPiece(downOneRight) && isEven(timesCalled)) { // if it doesn't contain any piece
                    downOneRight.classList.add('possible-jump');
                    whichAvailable(downOneRight);
                    downOneRight.addEventListener('click', movePiece);
                    if (path[downOneRight.id] === undefined) {
                        path[downOneRight.id] = {prev: upOneLeft.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[downOneRight.id]["prev2"] === undefined){
                        path[downOneRight.id]["prev2"] = upOneLeft.id;
                    }
                    else {
                        return;
                    }
                    checkNext('red', parseInt(downOneRight.id[0]), parseInt(downOneRight.id[1]), "right", 0, timesCalled + 1, "normal");
                    checkNext('red', parseInt(downOneRight.id[0]), parseInt(downOneRight.id[1]), "left", 0, timesCalled + 1, "normal");
                    return;
                }
            }
            else if (direction === "right" && pieceColor === "black" && upOneRight !== null) { //going right and the piece is black
                //then check the piece
                if (hasRedPiece(upOneRight)) { //if it contains the black piece
                    checkNext('black', parseInt(upOneRight.id[0]), parseInt(upOneRight.id[1]), "right", fail + 1, timesCalled + 1, "normal");
                    return;
                }
                else if (!upOneRight.classList.contains('black-piece') && timesCalled === 1) {
                    whichAvailable(upOneRight);
                    upOneRight.addEventListener('click', movePiece);
                }
                else if (!hasBlackPiece(upOneRight) && isEven(timesCalled)) {
                    upOneRight.classList.add('possible-jump');
                    whichAvailable(upOneRight);
                    upOneRight.addEventListener('click', movePiece);
                    if (path[upOneRight.id] === undefined) {
                        path[upOneRight.id] = {prev: downOneLeft.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[upOneRight.id]["prev2"] === undefined) {
                        path[upOneRight.id]["prev2"] = downOneLeft.id;
                    }
                    else {
                        return;
                    }
                    checkNext('black', parseInt(upOneRight.id[0]), parseInt(upOneRight.id[1]), "right", 0, timesCalled + 1, "normal");
                    checkNext('black', parseInt(upOneRight.id[0]), parseInt(upOneRight.id[1]), "left", 0, timesCalled + 1, "normal");
                    //after it investigates to the first instance and find there is an opening
                    return;
                }
            }
            else if (direction === "left" && pieceColor === "red" && downOneLeft !== null) {
                //then c
                if (hasBlackPiece(downOneLeft)) { //if it contains the black piece
                    checkNext('red', parseInt(downOneLeft.id[0]), parseInt(downOneLeft.id[1]), "left", fail + 1, timesCalled + 1, "normal");
                    return;
                }
                else if (!hasRedPiece(downOneLeft) && timesCalled === 1) {
                    whichAvailable(downOneLeft);
                    downOneLeft.addEventListener('click', movePiece);
                }
                else if (!hasRedPiece(downOneLeft) && isEven(timesCalled)) { // if it doesn't contain any piece
                    downOneLeft.classList.add('possible-jump');
                    whichAvailable(downOneLeft);
                    downOneLeft.addEventListener('click', movePiece);
                    if (path[downOneLeft.id] === undefined) {
                        path[downOneLeft.id] = {prev: upOneRight.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[downOneLeft.id]["prev2"] === undefined){
                        path[downOneLeft.id]["prev2"] = upOneRight.id;
                    }
                    else {
                        return;
                    }
                    checkNext('red', parseInt(downOneLeft.id[0]), parseInt(downOneLeft.id[1]), "left", 0, timesCalled + 1, "normal");
                    checkNext('red', parseInt(downOneLeft.id[0]), parseInt(downOneLeft.id[1]), "right", 0, timesCalled + 1, "normal");
                    return;
                }
            }
            else if (direction === "left" && pieceColor === "black" && upOneLeft !== null) {
                if (hasRedPiece(upOneLeft)) { //if it contains the black piece
                    checkNext('black', parseInt(upOneLeft.id[0]), parseInt(upOneLeft.id[1]), "left", fail + 1, timesCalled + 1, "normal");
                    return;
                }
                else if (!hasBlackPiece(upOneLeft) && timesCalled === 1) {
                    whichAvailable(upOneLeft);
                    upOneLeft.addEventListener('click', movePiece);
                }
                else if (!hasBlackPiece(upOneLeft) && isEven(timesCalled)) { // if it doesn't contain any piece
                    upOneLeft.classList.add('possible-jump');
                    whichAvailable(upOneLeft);
                    upOneLeft.addEventListener('click', movePiece);
                    if (path[upOneLeft.id] === undefined) {
                        path[upOneLeft.id] = {prev: downOneRight.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[upOneLeft.id]["prev2"] === undefined){
                        path[upOneLeft.id]["prev2"] = downOneRight.id;
                    }
                    else {
                        return;
                    }
                    checkNext('black', parseInt(upOneLeft.id[0]), parseInt(upOneLeft.id[1]), "left", 0, timesCalled + 1, "normal");
                    checkNext('black', parseInt(upOneLeft.id[0]), parseInt(upOneLeft.id[1]), "right", 0, timesCalled + 1, "normal");
                    return;
                }
            }
            return; //escape from the function
        }
        else if (pieceType === 'king') {
            if ((downOneRight !== null && avoidDir !== downOneRight && onlyDir === undefined) || onlyDir === downOneRight && downOneRight !== null) {
                if (has(opposite)(downOneRight)) { //if it contains the black piece
                    checkNext(pieceColor, parseInt(downOneRight.id[0]), parseInt(downOneRight.id[1]), "right", fail + 1, timesCalled + 1, "king", selectedDiv, downTwoRightTwo);
                }
                else if (!has(pieceColor)(downOneRight)&& timesCalled === 1) {
                    whichAvailable(downOneRight);
                    downOneRight.addEventListener('click', movePiece);
                }
                else if (!has(pieceColor)(downOneRight) && isEven(timesCalled)) { // if it doesn't contain any piece
                    downOneRight.classList.add('possible-jump');
                    whichAvailable(downOneRight);
                    downOneRight.addEventListener('click', movePiece);
                    selectedDiv.classList.add(opposite + '-prison-piece');
                    if (path[downOneRight.id] === undefined) {
                        path[downOneRight.id] = {prev: upOneLeft.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[downOneRight.id]["prev2"] === undefined){
                        path[downOneRight.id]["prev2"] = upOneLeft.id;
                    }
                    else {
                        return;
                    }
                    checkNext(pieceColor, parseInt(downOneRight.id[0]), parseInt(downOneRight.id[1]), "right", 0, timesCalled + 1, "king", selectedDiv);
                }
            }
            if ((upOneRight !== null && avoidDir !== upOneRight  && onlyDir === undefined) || onlyDir === upOneRight && upOneRight !== null) { //going right and the piece is black
                //then check the piece
                if (has(opposite)(upOneRight)) { //if it contains the black piece
                    checkNext(pieceColor, parseInt(upOneRight.id[0]), parseInt(upOneRight.id[1]), "right", fail + 1, timesCalled + 1, "king", selectedDiv, upTwoRightTwo);
                }
                else if (!has(pieceColor)(upOneRight) && timesCalled === 1) {
                    whichAvailable(upOneRight);
                    upOneRight.addEventListener('click', movePiece);
                }
                else if (!has(pieceColor)(upOneRight) && isEven(timesCalled)) {
                    upOneRight.classList.add('possible-jump');
                    whichAvailable(upOneRight);
                    upOneRight.addEventListener('click', movePiece);
                    selectedDiv.classList.add(opposite + '-prison-piece');
                    if (path[upOneRight.id] === undefined) {
                        path[upOneRight.id] = {prev: downOneLeft.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[upOneRight.id]["prev2"] === undefined){
                        path[upOneRight.id]["prev2"] = downOneLeft.id;
                    }
                    else {
                        return;
                    }
                    checkNext(pieceColor, parseInt(upOneRight.id[0]), parseInt(upOneRight.id[1]), "right", 0, timesCalled + 1, "king", selectedDiv);
                    //after it investigates to the first instance and find there is an opening
                }
            }
            if ((downOneLeft !== null && avoidDir !== downOneLeft && onlyDir === undefined) || onlyDir === downOneLeft && downOneLeft !== null) {
                //then c
                if (has(opposite)(downOneLeft)) { //if it contains the black piece
                    checkNext(pieceColor, parseInt(downOneLeft.id[0]), parseInt(downOneLeft.id[1]), "left", fail + 1, timesCalled + 1, "king", selectedDiv, downTwoLeftTwo);
                }
                else if (!has(pieceColor)(downOneLeft) && timesCalled === 1) {
                    whichAvailable(downOneLeft);
                    downOneLeft.addEventListener('click', movePiece);
                }
                else if (!has(pieceColor)(downOneLeft) && isEven(timesCalled)) { // if it doesn't contain any piece
                    downOneLeft.classList.add('possible-jump');
                    whichAvailable(downOneLeft);
                    downOneLeft.addEventListener('click', movePiece);
                    selectedDiv.classList.add(opposite + '-prison-piece');
                    if (path[downOneLeft.id] === undefined) {
                        path[downOneLeft.id] = {prev: upOneRight.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[downOneLeft.id]["prev2"] === undefined){
                        path[downOneLeft.id]["prev2"] = upOneRight.id;
                    }
                    else {
                        return;
                    }
                    checkNext(pieceColor, parseInt(downOneLeft.id[0]), parseInt(downOneLeft.id[1]), "left", 0, timesCalled + 1, "king", selectedDiv);
                }
            }
            if ((upOneLeft !== null && avoidDir !== upOneLeft && onlyDir === undefined) || onlyDir === upOneLeft && upOneLeft !== null) {
                if (has(opposite)(upOneLeft)) { //if it contains the black piece
                    checkNext(pieceColor, parseInt(upOneLeft.id[0]), parseInt(upOneLeft.id[1]), "left", fail + 1, timesCalled + 1, "king", selectedDiv, upTwoLeftTwo);
                }
                else if (!has(pieceColor)(upOneLeft) && timesCalled === 1) {
                    whichAvailable(upOneLeft);
                    upOneLeft.addEventListener('click', movePiece);
                }
                else if (!has(pieceColor)(upOneLeft) && isEven(timesCalled)) { // if it doesn't contain any piece
                    upOneLeft.classList.add('possible-jump');
                    whichAvailable(upOneLeft);
                    upOneLeft.addEventListener('click', movePiece);
                    selectedDiv.classList.add(opposite + '-prison-piece');
                    if (path[upOneLeft.id] === undefined) {
                        path[upOneLeft.id] = {prev: downOneRight.id, jumpedPiece: row + "" + column};
                    }
                    else if (path[upOneLeft.id]["prev2"] === undefined){
                        path[upOneLeft.id]["prev2"] = downOneRight.id;
                    }
                    else {
                        return;
                    }
                    checkNext(pieceColor, parseInt(upOneLeft.id[0]), parseInt(upOneLeft.id[1]), "left", 0, timesCalled + 1, "king", selectedDiv);
                }
            }
            return; //escape from the function
        }
    }
}

function clearThe(className) {
    var arrayOfElements = document.getElementsByClassName(className);
    while (arrayOfElements.length > 0) {
        var element = arrayOfElements[0];
        if ((className === 'available' || className === 'available-no-show') && element !== undefined) {
            element.removeEventListener('click', movePiece);
        }
        if (element !== undefined) {
            element.classList.remove(className);
        }
    }
}

function movePiece(trigger) {
    var clickedElements = document.getElementsByClassName('clicked');
    var clicked = clickedElements[0];
    var triggerElement = document.getElementById(trigger.target.id);
    if (clicked.classList.contains('red-piece')) {
        trigger.target.classList.add('red-piece');
        clicked.classList.remove('red-piece');
    }
    else if (clicked.classList.contains('black-piece')) {
        trigger.target.classList.add('black-piece');
        clicked.classList.remove('black-piece');
    }
    else if (clicked.classList.contains('black-king-piece')) {
        trigger.target.classList.add('black-king-piece');
        clicked.classList.remove('black-king-piece');
    }
    else if (clicked.classList.contains('red-king-piece')) {
        trigger.target.classList.add('red-king-piece');
        clicked.classList.remove('red-king-piece');
    }
    inPrison(trigger.target.id, turnToMove);
    checkForKing();
    clearThe('available');
    clearThe('available-no-show');
    clearThe('clicked');
    clearThe('possible-jump');
    clicked.removeEventListener('click', giveOptions);
    trigger.target.addEventListener('click', giveOptions);
    turnToMove = turnToMove === 'black' ? 'red' : 'black';
}
//this one should only remove the desired path
function inPrison(triggerID, turn) {
    var triggerElem = document.getElementById(triggerID);
    var clickedElem = document.getElementsByClassName('clicked')[0];
    var multipleOptions = false;
    var pieceType = triggerElem.classList.contains('red-piece') ? 'red-piece' : triggerElem.classList.contains('red-king-piece') ? 'red-king-piece' : triggerElem.classList.contains('black-piece') ? 'black-piece' : 'black-king-piece';
    var pris = turn === "red" ? 'black-piece-prison' : 'red-piece-prison';
    prisElement = document.getElementById(pris);
    for (var prop in path) {
        if (triggerID === prop) { //we found the starting spot
            if (path[prop]["prev2"] !== undefined) {
                multipleOptions = true;
                var right = path[prop]["prev2"] > path[prop]["prev"] ? path[prop]["prev2"] : path[prop]["prev"];
                var left = right === path[prop]["prev2"] ? path[prop]["prev"] : path[prop]["prev2"];
                sweetAlert ({
                    title: "Would you like to come from the right or from the left",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Right",
                    cancelButtonText: "Left",
                    closeOnConfirm: false,
                    closeOnCancel: false },
                    function(isConfirm) {
                    if (isConfirm) {
                        path[prop]["prev"] = right;
                    }
                    else {
                        path[prop]["prev"] = left;
                    }
                })
            }
            if (!multipleOptions) {
                if (path[prop]["prev"] === clickedElem.id) {
                    //element that was jumped
                    var jumpedElem = document.getElementById(path[prop]["jumpedPiece"]);
                    //what type of piece was jumped
                    var availableSpot = document.getElementById(prop); //same as trigger element
                    //saves the class to be added to the new div
                    var prisPiece = jumpedElem.classList.contains('red-piece') ? 'red-piece' : jumpedElem.classList.contains('red-king-piece') ? 'red-king-piece' : jumpedElem.classList.contains('black-piece') ? 'black-piece' : 'black-king-piece';
                    //gets rid of the piece that was jumped on the board
                    jumpedElem.classList.remove(prisPiece);
                    //creates a new element and gives it the correct properties
                    var prisonPiece = document.createElement('DIV');
                    prisonPiece.classList.add(prisPiece, 'box', 'white');
                    prisElement.appendChild(prisonPiece);
                    jumpedElem.removeEventListener('click', giveOptions);
                    continue;
                }
                else {
                    var jumpedElem = document.getElementById(path[prop]["jumpedPiece"]);
                    //what type of piece was jumped
                    var availableSpot = document.getElementById(prop); //same as trigger element
                    //saves the class to be added to the new div
                    var prisPiece = jumpedElem.classList.contains('red-piece') ? 'red-piece' : jumpedElem.classList.contains('red-king-piece') ? 'red-king-piece' : jumpedElem.classList.contains('black-piece') ? 'black-piece' : 'black-king-piece';
                    //gets rid of the piece that was jumped on the board
                    jumpedElem.classList.remove(prisPiece);
                    //creates a new element and gives it the correct properties
                    var prisonPiece = document.createElement('DIV');
                    prisonPiece.classList.add(prisPiece, 'box', 'white');
                    prisElement.appendChild(prisonPiece);
                    jumpedElem.removeEventListener('click', giveOptions);
                    inPrison(path[prop]["prev"], turn);
                }
            }
        }
    }
    checkForWinner('red-piece-prison', 'black-piece-prison');
}
function clearInnerHTML(id) {
    for (var x = 0; x < arguments.length; x++) {
        document.getElementById(arguments[x]).innerHTML = '';
    }
}
function checkForWinner(redPrisonID, blackPrisonID) {
    var redPrison = document.getElementById(redPrisonID);
    var blackPrison = document.getElementById(blackPrisonID);
    if (redPrison.childNodes.length === 12) {
        sweetAlert({
                title: "Congrats!",
                text: "Black is the winner!",
                timer: 2000,
                showConfirmButton: false,
                type: "success"
            });
        setTimeout(sweetAlertDef, 3000);
        clearInnerHTML('game-board-container', 'red-piece-prison', 'black-piece-prison');
        setUp();
    }
    else if (blackPrison.childNodes.length === 12) {
        sweetAlert({
            title: "Congrats!",
            text: "Black is the winner!",
            timer: 2000,
            showConfirmButton: false,
            type: "success"
        })
        setTimeout(sweetAlertDef, 3000);
        clearInnerHTML('game-board-container', 'red-piece-prison', 'black-piece-prison');
        setUp();
    }
}

function checkForKing() {
    for (var r = 0; r < 1; r++) {
        for (var c = 0; c < 8; c++) {
            //check each piece
            var cell = document.getElementById(r + "" + c);
            if (cell.classList.contains('black-piece')) {
                cell.classList.add('black-king-piece');
                cell.classList.remove('black-piece');//switch it out for the king
            }
        }
    }
    for (var r = 7; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
            //check each piece
            var cell = document.getElementById(r + "" + c);
            if (cell.classList.contains('red-piece')) {
                cell.classList.add('red-king-piece');
                cell.classList.remove('red-piece');
            }
        }
    }
}
function toggleColor() {
    toggleTimesCalled++;
}
function whichAvailable(elem) {
    return isEven(toggleTimesCalled) ? elem.classList.add('available') : elem.classList.add('available-no-show');
}
function sweetAlertDef() {
    return sweetAlert ({
        title: "Who should start the next game?",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Red",
        cancelButtonText: "Black",
        closeOnConfirm: false,
        closeOnCancel: false },
        function(isConfirm) {
        if (isConfirm) {
            swal('Sweet!', "Red will start the game.","success");
            turnToMove = 'red';
        }
        else {
            swal("Nice!", "Black will start the game.", "success");
            turnToMove = 'black';
        }
    })
}
// remember you just added the king part to the checkNext / giveOptions
//I need to create a way to only get rid of the path that was eliminated when a piece jumps other pieces
