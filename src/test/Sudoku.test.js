import solver from '../sudoku';
import Sudokus from '../resources/sudokus.json';

test('solver print test', () => {

    solver.set(Sudokus.sudokus[0].data.deepClone(), null, false);

    let result = solver.print();

    expect(result).not.toBeNull();
});

test('solver getSudoku test', () => {
    
    let sudokuInput = Sudokus.sudokus[0].data.deepClone();

    solver.set(sudokuInput, null, false);

    let result = solver.getSudoku();

    expect(result).toEqual(sudokuInput);
});

test('solver Solve test', () => {
    
    let sudokuInput = Sudokus.sudokus[0].data.deepClone();

    solver.set(sudokuInput, null, false);

    solver.run(() => {});

    expect(solver.print()).toEqual("[[2,6,7,4,8,5,1,9,3],[1,4,3,2,7,9,8,5,6],[5,9,8,1,6,3,7,2,4],[9,7,6,5,2,4,8,3,1],[3,2,8,9,1,7,5,6,4],[4,1,5,8,3,6,9,7,2],[7,1,8,3,5,9,6,4,2],[4,3,2,6,8,1,7,9,5],[6,5,9,2,4,7,3,8,1]]");
});