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

var solver = (function () {
    'use strict';

    // animation timeout
    const TIMEOUT = 10;

    var openFields = 81;

    var solved = false, hardmode = false, runs = 0;

    var animation = false;

    var callback;

    var sudoku;

    var errors = '';

    var stack = [];

    var Msg = function (success, runs, time, errors, save) {
        return {
            success: success,
            errors: errors,
            save: save,
            runs: runs,
            time: time,
            toString: function () {
                if (success)
                    return 'Run in ' + this.runs + ' iterations in ' + this.time + ' ms.';
                else
                    return this.errors;
            }
        };
    };

    var Save = function(a, b, s, v) {
        return {
            cordA: a,
            cordB: b,
            saved: s,
            possibleValues: v,
            index: 0
        };
    };

    var triggerCallback = function(a) {
        if (callback instanceof Function) {
            callback(a);
        }
    };

    var check = function (value, a, b) {

        for (var j = 0; j < 9; j++) {

            // Quadrat
            if (sudoku[a][j] == value && b !== j) {
                return false;
            }

            // Reihe
            var x = ~~(a/3) * 3 + ~~(j/3);
            var y = ~~(b/3) * 3 + (j%3);
            if ((x != a || y != b) && sudoku[x][y] === value) {
                return false;
            }

            // Spalte
            x = (a%3) + ~~(j/3) * 3;
            y = (b%3) + (j%3) * 3;
            if ((x !== a || y !== b) && sudoku[x][y] === value) {
                return false;
            }
        }

        return true;
    };

    var stackIndex = 0;
    var saveIndex = 0;
    var interval;

    var backtrackHandler = function () {

        saveIndex = 0;
        stackIndex = 0;

        if (animation) {
            interval = setInterval( function () {
                backtrack();
            }, TIMEOUT);
        } else {
            while (!solved) {
                backtrack();
            }
        }
    };

    var backtrack = function () {

        if (animation)
            triggerCallback("de");

        runs++;


        // fallback exit . todo: remove
        if (runs > 500000) {
            clearInterval(interval);
            solved = true;
            return;
        }

        if (stackIndex < 0 || stackIndex >= stack.length) {
            stackIndex = 0;
            clearInterval(interval);
            solved = true;
            return;
        }

        var assignFirst = stack[stackIndex];

        if (assignFirst.possibleValues.length <= saveIndex ){
            if (stackIndex > 1) {
                stackIndex--;
                saveIndex = stack[stackIndex].index + 1;
                //console.info("Reduce Index! Stackindex: %d SaveIndex: %d", stackIndex, saveIndex);
                return;
            }
            else {
                throw new Msg(false, runs, null, 'not solvable', stack[stackIndex]);
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
                stackIndex = i - 1;
                saveIndex = stack[stackIndex].index + 1;
                break;
            }

            if (correct && i == stack.length - 1) {
                console.info("SOLVED! in %d runs.", runs);
                solved = true;
                clearInterval(interval);
                triggerCallback("Solved");
                return false;
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
            stackIndex = 0;
            saveIndex = 0;
            errors = '';
        },

        solve: function () {

            var correction = 0;
            stack = [];

            for (var i = 0; i < sudoku.length; i++) {
                for (var j = 0; j < sudoku[i].length; j++) {

                    var saved = 0;
                    var index = 0;
                    var possibleValues = [];

                    if (sudoku[i][j] !== 0 && runs === 0) {
                        openFields--;
                    }

                    if (sudoku[i][j] === 0) {

                        for (var k = 1; k <= 9; k++) {
                            if (check(k, i, j)) {
                                saved++;
                                index = k;
                                possibleValues.push(k);
                            }
                        }

                        // save move
                        if (saved === 1) {
                            sudoku[i][j] = index;
                            correction++;
                            openFields--;
                        }
                        else if (hardmode) {
                            stack.push(new Save(i, j, saved, possibleValues));
                        }

                    } else if (!check(sudoku[i][j], i, j)){
                        throw new Msg(false, runs, null, 'error found in initial sudoku',
                            new Save(i, j, null, possibleValues));
                    }
                }
            }

            runs++;

            console.info("runs: " + runs + " correction: " + correction + " open: " + openFields);

            if (correction > 0 && openFields > 0) {
                this.solve();
            } else if (openFields > 0 && !hardmode) {
                hardmode = true;
                this.solve();
                return false;
            }

            if (openFields === 0)
                return true;
        },

        /**
         * Transforms a String sudoku to it's 2D array form.
         *
         * @param s String representation of a sudoku
         * @returns Array
         */
        getSudokuFromString: function (s) {

            var arr = s.split(',');

            arr = arr.map(function (ele) {
                return parseInt(ele, 10);
            });

            console.info("Loading sudoku from String", s, arr.length);

            if (arr.length !== 81)
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

        getInitialSokudok: function () {
          var s = sudoku.deepClone();

//            s.forEach(function (ele) {
//                ele.forEach(function (innerEle) {
//                    innerEle = !!innerEle;
//                })
//            });

          return s;
        },

        /**
         * Runs the solver.
         */
        run: function () {

            var d = new Date();

            var success = true;
            var elapsedTime = 0;


            try {
                if (!this.solve()) {
                    backtrackHandler();
                }

                elapsedTime = new Date() - d;

                console.info("Solved in %d ms.", elapsedTime);

            } catch (e) {
                console.error(e.toString());
                return e;
            }

            return new Msg(success, runs, elapsedTime, errors);

        },

        /**
         * Returns the sudoku as 2D array.
         *
         * @returns Array
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