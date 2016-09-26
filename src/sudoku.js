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
    // animation timeout
    const TIMEOUT = 10;

    var openFields = 81;

    var solved = false, hardmode = false, runs = 0;

    var animation = false;

    /**
     * Status information callback, triggered in animation mode.
     */
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

    const triggerCallback = function(a) {
        if (callback instanceof Function && animation) {
            callback(a);
        }
    };

    const check = function (value, a, b) {

        for (var j = 0; j < 9; j++) {

            // Quadrat
            if (sudoku[a][j] === value && b !== j) {
                return false;
            }

            // Reihe
            var x = ~~(a/3) * 3 + ~~(j/3);
            var y = ~~(b/3) * 3 + (j%3);
            if ((x !== a || y !== b) && sudoku[x][y] === value) {
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

    const backtrack = function (endEvent) {

        triggerCallback("de");

        runs++;


        // fallback exit . todo: remove
        if (runs > 500000) {
            endEvent();
            return;
        }

        if (stackIndex < 0 || stackIndex >= stack.length) {
            stackIndex = 0;
            endEvent();
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
                endEvent();
                triggerCallback("SOLVED");
                return;
            }
        }
    };

    const backtrackHandler = function (runCallback) {

        var endEvent = function () {
            clearInterval(interval);
            solved = true;
            runCallback();
        };

        if (animation) {
            interval = setInterval(function () {
                backtrack(endEvent);
            }, TIMEOUT);
        } else {
            while (!solved) {
                backtrack(endEvent);
            }
        }
    };

    return {
        /**
         * Sets the initials values of the solver.
         * @param e Sudoku 2d array
         * @param cb Callback function
         * @param ani Animation flag
         */
        set: function (e, cb, ani) {
            console.info("Set Sudoku: ", e);
            animation = ani;
            callback = cb; // todo remove this callback
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

        /**
         * 1. Step of solving a sudoku. Fills all obvious cells.
         *
         * @returns {boolean} If this function could solve the whole sudoku.
         */
        solve: function () {

            var correction = 0;

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

            console.info("runs: %d correction: %d open: %d", runs, correction, openFields);

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
         * @returns {Array}
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

          return s;
        },

        /**
         * Runs the solver.
         *
         * @param runCallback Callback function, triggered after finishing.
         */
        run: function (runCallback) {

            var d = new Date();
            var success = true;
            var elapsedTime = 0;


            try {
                if (!this.solve()) {
                    backtrackHandler(function () {
                        elapsedTime = new Date() - d;
                        console.info("Solved in %d ms.", elapsedTime);
                        runCallback(new Msg(success, runs, elapsedTime, errors));
                    });
                }
             } catch (e) {
                console.error(e.toString());
                runCallback(e);
            }
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

export default solver;