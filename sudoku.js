/**
 * Created by Joerg on 24.04.15.
 */

/**
 * Clones a 2D Array.
 * @returns {Array}
 */
Array.prototype.deepClone = function () {
    var a = this.map(function(arr) {
        return arr.slice(0);
    });
    return a;
};

Array.prototype.shuffle = function () {

    var counter = this.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }

};

var solver = (function () {
    'use strict';

    const TIMEOUT = 5;

    var animation = false;

    var callback;

    var sudoku;

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

    var solved = false, hardmode = false, openFields = 81, runs = 0;

    /**
     * Trigger a Callback Call.
     * @param args
     */
    var backtrack2 = function (a, b) {
       if (animation && callback instanceof Function) {
            setTimeout(function() {
                callback("");
                backtrack2(a,b);
            }, TIMEOUT);
       } else {
           backtrack2(a,b);
       }
        //backtrack2(a,b);
    };

    var triggerCallback = function(a) {
        if (callback instanceof Function) {
            if (animation) {
                setTimeout(function() {
                    callback(a);
                }, TIMEOUT);
            } else {
                callback(a);
            }
        }
    };

    var check = function (value, a, b) {

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

    var bt = function () {

        var stackIndex = 0;
        var saveIndex = 0;

        do {

            //triggerCallback("de");
            runs++;

            if (stackIndex < 0 || stackIndex >= stack.length) {
                stackIndex = 0;
                //console.log("Index < 0");
            }

            var assignFirst = stack[stackIndex];

            if (assignFirst.possibleValues.length <= saveIndex ){
                if (stackIndex > 1) {
                    stackIndex--;
                    saveIndex = stack[stackIndex].index + 1;
                    continue;
                }
                else {
                    console.info("Not solvable!");
                    return false;
                }
            }

            for (var h = stackIndex; h < stack.length; h++) {
                var tmp = stack[h];
                sudoku[tmp.cordA][tmp.cordB] = 0;
            }

            if (check(assignFirst.possibleValues[saveIndex], assignFirst.cordA, assignFirst.cordB)) {
                assignFirst.index = saveIndex;
                sudoku[assignFirst.cordA][assignFirst.cordB] = assignFirst.possibleValues[saveIndex];
            } else {
                saveIndex++;
                continue;
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
                        //console.info("BT cord", i, curSave.cordA, curSave.cordB, value);
                        break;
                    }
                }

                if (!correct) {
                    stackIndex = i - 1;
                    saveIndex = stack[stackIndex].index + 1;
                    //console.log("correction!");
                    break;
                }

                if (correct && i == stack.length - 1) {
                    console.info("SOLVED! in %d runs.", runs);
                    solved = true;
                    triggerCallback("Solved");
                    return true;
                }

            }

        } while (!solved);

    };


    var backtrack = function (stackIndex, saveIndex) {

        if (solved || stackIndex < 0 || stackIndex >= stack.length) {
            return;
        }

        runs++;

        var assignFirst = stack[stackIndex];

        if (assignFirst.possibleValues.length <= saveIndex ){
            if (stackIndex > 1)
                backtrack(stackIndex - 1, stack[stackIndex - 1].index + 1);
            else {
                console.info("Not solvable!");
            }
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
                    //console.info("BT cord", i, curSave.cordA, curSave.cordB, value);
                    break;
                }
            }

            if (!correct) {
                var l = stack[i - 1].index + 1;
                backtrack(i - 1, l);
                return;
            }

            if (correct && i == stack.length - 1) {
                console.info("SOLVED! in %d runs.", runs);
                solved = true;
                triggerCallback("Solved");
                return;
            }

        }
    };


    return {
        set: function (e, cb, ani) {
            console.info("Set Sudoku: ", e);
            animation = ani;
            callback = cb;
            runs = 0;
            solved = false;
            sudoku = e;
            openFields = 81;
            hardmode = false;
            stack = [];
        },

        solve: function () {

            var correction = 0;
            stack = [];

            for (var i = 0; i < sudoku.length; i++) {
                for (var j = 0; j < sudoku[i].length; j++) {

                    var saved = 0;
                    var index = 0;
                    var possibleValues = [];

                    if (sudoku[i][j] != 0 && runs == 0) { // initaler set der offenen Felder
                        openFields--;
                    }

                    if (sudoku[i][j] == 0) {

                        for (var k = 1; k <= 9; k++) {
                            if (check(k, i, j)) {
                                saved++;
                                index = k;
                                possibleValues.push(k);
                            }
                        }

                        // sicherer zug
                        if (saved === 1) {
                            console.warn("cords: " + i + " : " + j + " --> " + index);
                            sudoku[i][j] = index;
                            correction++;
                            openFields--;
                        } else if (hardmode) {
                            stack.push(new Save(i, j, saved, possibleValues));
                        }

                    }
                }
            }

            runs++;

            console.info("runs: " + runs + " correction: " + correction + " open: " + openFields);

            if (runs > 500) {
                return false;
            }

            if (correction > 0 && openFields > 0) {
                this.solve();
            } else if (openFields > 0 && !hardmode) {
                hardmode = true;
                this.solve();
                return false;
            }

            if (openFields == 0)
                return true;
        },

        /**
         * Transforms a String sudoku to it's 2D array form.
         *
         * @param s String representation of a sudoku
         * @returns 2D array
         */
        getSudokuFromString: function (s) {

            var arr = s.split(',');

            arr = arr.map(function (ele) {
                return parseInt(ele, 10);
            });

            console.info("Loading sudoku from String", s, arr.length);

            if (arr.length != 81)
                return false;

            var res = [];

            while(arr[0] != undefined) {
                res.push(arr.splice(0,9));
            }

            return res;
        },

        /**
         * Print the sudoku as a String.
         *
         * @returns String
         */
        print: function() {

            if (!sudoku)
                return "";

            var a = sudoku.reduce(function(previousValue, currentValue) {
                var b = currentValue.reduce(function(previousValue2, currentValue2) {
                    return previousValue2 + "," + currentValue2;
                });
                return previousValue + "," + b;
            });

            console.log(a, a.length);

            return a;

        },

        /**
         * Runs the solver.
         */
        run: function () {

            var d = new Date();

            if (!this.solve()) {
                try {
                    bt();
                } catch (e) {
                    console.error(e, runs);
                }
            }

            console.info("Solved in %d ms.", new Date() - d);

        },

        /**
         * Returns the sudoku as 2D array.
         *
         * @returns {2D array}
         */
        getSudoku: function () {
            return sudoku;
        }

    };
})();

/*solver.set([
    [0,0,0,0,0,0,1,0,0],
    [1,0,0,0,7,0,8,0,0],
    [5,0,0,0,6,3,0,2,0],
    [0,7,0,0,0,4,0,0,1],
    [3,0,0,9,0,7,0,0,4],
    [4,0,0,8,0,0,0,7,0],
    [0,1,0,3,5,0,0,0,2],
    [0,0,2,0,8,0,0,0,5],
    [0,0,9,0,0,0,0,0,0]
]);*/

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