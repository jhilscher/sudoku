/**
 * Created by Joerg on 24.04.15.
 */
var solver = (function () {

    var sudoku;

    var sudokuBuffer;

    var checkBoard = [];

    var stack = [];

    var Save = function(a, b, s, v) {
        return {
            cordA: a,
            cordB: b,
            saved: s,
            possibleValues: v,
            index: 0
        };
    };

    var solved = false;

    var hardmode = false;

    var openFields = 81;

    var runs = 0;

    var copy = function(e) {
        // deep copy
        var a = e.map(function(arr) {
            return arr.slice();
        });

        return a;
    };

    var check = function (value, a, b) {

        //console.info("Checkpoint: " + a + " : " + b);

        for (var j = 0; j < 9; j++) {

            // Quadrat
            if (sudoku[a][j] == value) {
                return false;
            }

            // Reihe
            if (sudoku[~~(a/3) * 3 + ~~(j/3)][~~(b/3) * 3 + (j%3)] == value) {
                return false;
            }

            // Spalte
            if (sudoku[(a%3) + ~~(j/3) * 3][(b%3) + (j%3) * 3] == value) {
                return false;
            }
        }

        return true;
    };

    var backtrack = function (stackIndex, saveIndex) {

        console.log("Stack: ", stackIndex, saveIndex);

        if (solved) {
            return;
        }

        if (stackIndex < 0 || stackIndex >= stack.length)
            return;

        var assignFirst = stack[stackIndex];

        if (assignFirst.possibleValues.length <= saveIndex){

            console.log("Back one stackindex.");
            backtrack(stackIndex - 1, stack[stackIndex - 1].index + 1);
            return;
        }

        for (var h = stackIndex; h < stack.length; h++) {
            var tmp = stack[h];
            sudoku[tmp.cordA][tmp.cordB] = 0;
        }


        if (check(assignFirst.possibleValues[saveIndex], assignFirst.cordA, assignFirst.cordB)) {
            assignFirst.index = saveIndex;
            sudoku[assignFirst.cordA][assignFirst.cordB] = assignFirst.possibleValues[saveIndex];
        } else {
            console.log("Failed init check: ", stackIndex, saveIndex );
            backtrack(stackIndex, saveIndex + 1);
            return;
        }

        for (var i = stackIndex + 1; i < stack.length; i++) {

            var curSave = stack[i];

            var correct = false;

            for (var j = 0; j < curSave.possibleValues.length; j++ ) {

                var value = curSave.possibleValues[j];

                var checked = check(value, curSave.cordA, curSave.cordB);

                correct |= checked;

                if (checked) {
                    sudoku[curSave.cordA][curSave.cordB] = value;
                    curSave.index = j;
                    console.info("BT cord", i, curSave.cordA, curSave.cordB, value);
                    break;
                }


            }

            if (!correct) {

                console.info("ERROR AT", i);


                var l = stack[i - 1].index + 1;
                backtrack(i - 1, l);
                return;
            }

            if (correct && i == stack.length - 1) {
                solved = true;
                return;
            }

        }
//        if (!correct) {
//            console.warn("correct", stackIndex, saveIndex);
//
//            sudoku = copy(sudokuBuffer);
//
//            for (var h = 0; h < stackIndex; h++) {
//                var tmp = stack[h];
//                sudoku[tmp.cordA][tmp.cordB] = tmp.possibleValues[tmp.index];
//            }
//
//            if (saveIndex < stack[stackIndex].possibleValues.length) {
//                backtrack(stackIndex, ++saveIndex);
//            } else {
//                backtrack(++stackIndex, 0);
//            }
//        } else {
//            console.warn("solved!")
//        }
    };


    return {
        set: function (e) {
            sudoku = e;

            // deep copy
            checkBoard = e.map(function(arr) {
                return arr.slice();
            });

        },
        solve: function () {

            var correction = 0;
            var correctinInScope = false;

            for (var i = 0; i < sudoku.length; i++) {
                for (var j = 0; j < sudoku[i].length; j++) {

                    var saved = 0;
                    var index = 0;
                    var possibleValues = [];


                    if (sudoku[i][j] != 0 && runs == 0) { // initaler set der offenen Felder
                        openFields--;
                    }

                        for (var k = 1; k <= 9; k++) {
                            if (check(k, i, j)) {
                                saved++;
                                index = k;
                                possibleValues.push(k);
                            }
                        }

                        if (!hardmode && sudoku[i][j] == 0) {

                            // sicherer zug
                            if (saved === 1) {
                                console.warn("cords: " + i + " : " + j + " --> " + index);
                                sudoku[i][j] = index;
                                correction++;
                                openFields--;

                                correctinInScope = false;

                            } else {
                                if (!isNaN(checkBoard[i][j])) {
                                    checkBoard[i][j] = new Save(i, j, saved, possibleValues);
                                    stack.push(checkBoard[i][j]);
                                }
                            }
                            // sichern des Feldes mit den wenigsten Optionen
//                            else if (saved > 1 &&  (!lowestSave || saved < lowestSave.save)) {
//                                lowestSave = new Save(i, j, saved, possibleValues);
//                            }

                        }

//                        if (saved > 1 && hardmode) {
//
//                            console.info(lowestSave);
//
//                            if (sudoku[lowestSave.cordA][lowestSave.cordB] == 0)
//                                openFields--;
//
//                            sudoku[lowestSave.cordA][lowestSave.cordB] = lowestSave.possibleValues[lowestSave.index];
//                            lowestSave = null;
//                            correction++;
//                        }


//                        if (hardmode && saved > 0 && checkBoard[i][j] instanceof Object) {
//
//                            checkBoard[i][j] = new Save(i, j, saved, possibleValues);
//
//                            if (sudoku[i][j] == 0)
//                                openFields--;
//
//                            correction++;
//                            sudoku[i][j] = checkBoard[i][j].possibleValues[checkBoard[i][j].index];
//                        }
//
//                        if (hardmode && saved != 1) {
//
//
//                            //checkBoard[i][j] = null;
//                            //sudoku[i][j] = 0;
//                            //openFields++;
//
//                            if (checkBoard[correctI][correctJ].possibleValues.length > checkBoard[correctI][correctJ].index + 1) {
//                                checkBoard[correctI][correctJ].index++;
//                            } else {
//                                correctI = ++correctI % 9;
//                                correctJ = correctI == 0? ++correctJ : correctJ;
//                            }
//
//                            while (!(checkBoard[correctI][correctJ] instanceof Object)) {
//                                correctI = ++correctI % 9;
//                                correctJ = correctI == 0? ++correctJ % 9 : correctJ;
//                            }
//
//
//                            if (check(checkBoard[correctI][correctJ].possibleValues[checkBoard[correctI][correctJ].index], correctI, correctJ)) {
//                                if (sudoku[correctI][correctJ] == 0)
//                                    openFields--;
//                                sudoku[correctI][correctJ] = checkBoard[correctI][correctJ].possibleValues[checkBoard[correctI][correctJ].index];
//                                correction++;
//                            }
//                        }


                }
            }

            console.info("hardmode: " + hardmode);
            runs++;

            console.info("runs: " + runs + " correction: " + correction + " open: " + openFields);

            if (runs > 500) {
                return;
            }

            if (correction > 0 && openFields > 0) {
                this.solve();
            } else if (openFields > 0) {
                console.warn("Hardmode!");
                sudokuBuffer = copy(sudoku);
                backtrack(0, 0);
            }
        },
        print: function() {

            console.warn("printing ...");

            $('#tab').empty();

            var body =  $('<tbody>');
            $('#tab').append(body);

            for (var i = 0; i < sudoku.length; i++) {

                var row;

                if (i%3 == 0) {
                    row = $('<tr>');
                    body.append(row);
                }
                var body2 = $('<tbody>');
                row.append($('<td>').append($('<table>').append(body2)));

                for (var j = 0; j < sudoku[i].length; j++) {

                    var row2;

                    if (j%3 == 0) {
                        row2 = $('<tr>');
                        body2.append(row2);
                    }

                    if (sudoku[i][j] > 0)
                        row2.append($('<td>').text(sudoku[i][j]));
                    else
                        row2.append($('<td class="emptyField">'));
                }
            }


            $('#info').text("Solved in " + runs + " iterations");
        },

        run: function () {
            this.solve();
            this.print();
        }

    };
})();

solver.set([
    [0,0,0,0,0,0,1,0,0],
    [1,0,0,0,7,0,8,0,0],
    [5,0,0,0,6,3,0,2,0],
    [0,7,0,0,0,4,0,0,1],
    [3,0,0,9,0,7,0,0,4],
    [4,0,0,8,0,0,0,7,0],
    [0,1,0,3,5,0,0,0,2],
    [0,0,2,0,8,0,0,0,5],
    [0,0,9,0,0,0,0,0,0]
]);

/*
solver.set(    [
    [0,0,7,3,0,9,0,4,0],
    [0,0,0,0,0,0,0,0,0],
    [0,9,0,0,2,8,0,0,7],
    [0,5,0,0,7,0,0,0,8],
    [0,7,0,1,0,0,0,0,3],
    [3,0,0,0,0,2,0,0,1],
    [0,0,0,5,6,4,0,0,0],
    [4,0,0,7,0,1,3,9,0],
    [0,0,0,0,0,0,2,5,0]
]);*/

/*solver.set(
 [
 [0,6,0,7,0,0,0,2,0],
 [1,0,0,0,0,0,0,0,0],
 [0,8,0,0,0,5,0,0,0],
 [0,0,0,0,0,4,3,1,0],
 [8,1,0,5,0,9,0,7,6],
 [0,7,3,0,6,0,0,0,0],
 [0,0,7,8,0,0,0,3,0],
 [0,0,0,0,0,0,0,0,4],
 [0,3,0,0,0,2,0,9,0]
 ]
 );*/


$(function () {
    solver.print();
});

