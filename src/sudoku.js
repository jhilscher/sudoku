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

        // if (sudoku[a][b] === value)
        //     return true;

        // if (squareValues[a][value] || 
        //     rowValues[~~(a / boxSize) * boxSize + ~~(b/ boxSize)][value] || 
        //     columnValues[(b % boxSize) + (a % boxSize) * boxSize][value])
        //     return false;

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


    const snake = function (curSave) {
        if (stackIndex > stack.length - 2)
            return false;

        // swap
        let a = stack[stackIndex];
        stack[stackIndex] = stack[stack.length - 1];
        stack[stack.length - 1] = a;

        saveIndex = 0;

        return true;
    };

    const updateStack = function () {
        for (let i = stackIndex + 1; i < stack.length; i++) {

            let stackItem = stack[i];

            var newPossibleValues = [];

            for (let k = 0; k < stackItem.possibleValues.length; k++) {
                if (check(stackItem.possibleValues[k], stackItem.cordA, stackItem.cordB)) {
                    newPossibleValues.push(k);
                }
            }

            stackItem.possibleValues = newPossibleValues;
        }
    };

    const checkPosibleValues = function (curSave) {
        for (let j = saveIndex; j < curSave.possibleValues.length; j++) {

            let value = curSave.possibleValues[j];

            if (check(value, curSave.cordA, curSave.cordB)) {
                setSudokuValue(value, curSave.cordA, curSave.cordB);
                curSave.index = j;
                //console.info("BT cord", i, curSave.cordA, curSave.cordB, value);
                return true;
            }
        }

        return false;
    };

    var squareValues;
    var rowValues;
    var columnValues;

    const setSudokuValue = function(value, cordA, cordB) {

        let oldValue = sudoku[cordA][cordB];

        squareValues[cordA][oldValue] = false;
        rowValues[~~(cordA / boxSize) * boxSize + ~~(cordB/ boxSize)][oldValue] = false;
        columnValues[(cordB % boxSize) + (cordA % boxSize) * boxSize][oldValue] = false;

        sudoku[cordA][cordB] = value;

        squareValues[cordA][value] = true;
        rowValues[~~(cordA / boxSize) * boxSize + ~~(cordB/ boxSize)][value] = true;
        columnValues[(cordB % boxSize) + (cordA % boxSize) * boxSize][value] = true;
    };

    const reduceStackIndex = function() {
        stackIndex--;

        if (stackIndex < 0)
            throw new Msg(false, runs, null, 'not solvable', null);

        let tmp = stack[stackIndex];   

        saveIndex = tmp.index + 1;

        setSudokuValue(0, tmp.cordA, tmp.cordB);
    };

    var stackIndex = 0;
    var saveIndex = 0;
    var interval;

    const backtrack = function (endEvent) {

        runs++;
        //updateStack();

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
                else
                    reject();
            });
        }

        if (animation) {
            interval = setInterval(() => {
                backtrack(endEvent);
            }, TIMEOUT);
        } else {
            runBacktracking().catch((e) => {
                runCallback(new Msg(false, runs, null, 'not solvable', null));
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
            rowValues = Array.from({ length: sudokuSize }, () => Array.from({ length: sudokuSize + 1}, () => false));
            columnValues = Array.from({ length: sudokuSize }, () => Array.from({ length: sudokuSize + 1 }, () => false));
            squareValues = Array.from({ length: sudokuSize }, () => Array.from({ length: sudokuSize + 1}, () => false));
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

            for (let i = 0; i < sudoku.length; i++) {
                for (let j = 0; j < sudoku[i].length; j++) {

                    let saved = 0;
                    let index = 0;
                    let possibleValues = [];
                    let value = sudoku[i][j];

                    if (value !== 0 && runs === 0) {
                        openFields--;
                    }

                    if (value === 0) {

                        for (var k = 1; k <= sudokuSize; k++) {
                            if (check(k, i, j)) {
                                saved++;
                                index = k;
                                possibleValues.push(k);
                            }
                        }

                        // save move
                        if (saved === 1) {
                            setSudokuValue(index, i, j);
                            correction++;
                            openFields--;
                        }
                        else if (hardmode) {
                            stack.push(new Save(i, j, possibleValues));
                        }

                    } else if (!check(value, i, j)){
                        throw new Msg(false, runs, null, 'error found in initial sudoku',
                            new Save(i, j, null, possibleValues));
                    } else {
                        squareValues[i][value] = true;
                        rowValues[~~(i / boxSize) * boxSize + ~~(j / boxSize)][value] = true;
                        columnValues[(j % boxSize) + (i % boxSize) * boxSize][value] = true;
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

        getInitialSudoku: function () {
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