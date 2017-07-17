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

    // animation timeout in ms
    const TIMEOUT = 10;

    var sudokuSize;

    var boxSize;

    var openFields;

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

    /**
     * Saved values node in stack.
     *
     * @param {Number} cordA 
     * @param {Number} cordB 
     * @param {Array} values 
     */
    var Save = function(cordA, cordB, values) {
        return {
            cordA: cordA,
            cordB: cordB,
            possibleValues: values,
            index: -1
        };
    };

    const triggerCallback = function(a) {
        if (callback instanceof Function && animation) {
            callback(a);
        }
    };

    const check = function (value, a, b) {

        for (var i = 0; i < sudokuSize; i++) {

            // Square
            if (sudoku[a][i] === value && b !== i) {
                return false;
            }

            // Row
            var x = ~~(a / boxSize) * boxSize + ~~(i / boxSize);
            var y = ~~(b / boxSize) * boxSize + (i % boxSize);

            if ((x !== a || y !== b) && sudoku[x][y] === value) {
                return false;
            }

            // Column
            x = (a % boxSize) + ~~(i / boxSize) * boxSize;
            y = (b % boxSize) + (i % boxSize) * boxSize;

            if ((x !== a || y !== b) && sudoku[x][y] === value) {
                return false;
            }
        }

        return true;
    };

    const checkPosibleValues = function (curSave) {
        for (let j = saveIndex; j < curSave.possibleValues.length; j++) {

            let value = curSave.possibleValues[j];

            if (check(value, curSave.cordA, curSave.cordB)) {
                sudoku[curSave.cordA][curSave.cordB] = value;
                curSave.index = j;
                //console.info("BT cord", i, curSave.cordA, curSave.cordB, value);
                return true;
            }
        }

        return false;
    };

    const reduceStackIndex = function() {
        stackIndex--;

        if (stackIndex < 0)
            throw new Msg(false, runs, null, 'not solvable', null);

        let tmp = stack[stackIndex];   

        saveIndex = tmp.index + 1;

        sudoku[tmp.cordA][tmp.cordB] = 0;
    };

    var stackIndex = 0;
    var saveIndex = 0;
    var interval;

    const backtrack = function (endEvent) {

        runs++;

        if (!checkPosibleValues(stack[stackIndex])) {
            
            reduceStackIndex();

            while (stack[stackIndex].possibleValues.length <= saveIndex) {
                reduceStackIndex();
            }

        } else {
            saveIndex = 0;
            stackIndex++;
        }

        if (animation)
            triggerCallback("de: " + runs);

        if (stackIndex >= stack.length) {
            console.info("SOLVED! in %d runs.", runs);
            endEvent();
            triggerCallback("SOLVED");
        }
    };




    const backtrackHandler = function (runCallback) {

        var endEvent = function () {
            clearInterval(interval);
            solved = true;
            runCallback();
        };

        function runBacktracking() {
            return new Promise((resolve, reject) => {

                while (stackIndex < stack.length) {
                    backtrack(endEvent);
                }

                if (solved)
                    resolve();
            });
        }

        if (animation) {
            interval = setInterval(() => {
                backtrack(endEvent);
            }, TIMEOUT);
        } else {
            runBacktracking().catch((e) => {
                throw e;
            });
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
            sudokuSize = e.length;
            openFields = sudokuSize * sudokuSize;
            boxSize = Math.sqrt(sudokuSize);
            hardmode = false;
            stack = [];
            stackIndex = 0;
            saveIndex = 0;
            errors = '';

            console.info('Size, BoxSize, Open:', sudokuSize, boxSize, openFields);
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

                        for (var k = 1; k <= sudokuSize; k++) {
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
                            stack.push(new Save(i, j, possibleValues));
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

            return JSON.parse(s);
        },

        /**
         * Print the sudoku as a String.
         *
         * @returns String
         */
        print: function() {

            if (!sudoku)
                return "";

            return JSON.stringify(sudoku);
        },

        getInitialSokudok: function () {
          return sudoku.deepClone();
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

                    var cordAList = [];
                    var cordBList = [];

                    stack.forEach(function(element) {
                        if (!cordAList[element.cordA])
                            cordAList[element.cordA] = 0;

                        if (!cordBList[element.cordB])
                            cordBList[element.cordB] = 0;

                        cordAList[element.cordA]++;
                        cordBList[element.cordB]++;
                    });

                    cordAList.sort((a,b) => a - b);
                    cordBList.sort((a,b) => a - b);    

                    stack.sort((a, b) => {
                        
                        if (cordAList[a.cordA] < cordAList[b.cordA])
                            return -1;
                        if (cordAList[a.cordA] > cordAList[b.cordA])
                            return 1;
                            
                        if (a.possibleValues.length < b.possibleValues.length)
                            return -1;
                        if (a.possibleValues.length > b.possibleValues.length)
                            return 1;

                        return  ((a.cordB % boxSize) * ~~(a.cordA / boxSize)) - ((b.cordB % boxSize) * ~~(b.cordA / boxSize));
                    }); 
                    
                    backtrackHandler(() => {
                        elapsedTime = new Date() - d;
                        console.info("Solved in %d ms.", elapsedTime);
                        runCallback(new Msg(success, runs, elapsedTime, errors));
                    });

                } else {
                    runCallback(new Msg(success, runs, elapsedTime, errors));
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

class _Solver {

}


export default solver;