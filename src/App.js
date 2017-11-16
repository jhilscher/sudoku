/**
 * Created by Joerg on 07.06.15.
 */
import React from 'react';
import solver from './sudoku';
import Sudokus from './resources/sudokus.json';

// Project Components
import InfoBox from './components/InfoBox';
import DropDown from './components/DropDown';

// Material UI
import Icon from 'material-ui/Icon';
import PropTypes from 'prop-types';
import withStyles from 'material-ui/styles/withStyles';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Button from 'material-ui/Button';
import Switch from 'material-ui/Switch';
import Menu, { MenuItem } from 'material-ui/Menu';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import IconButton from 'material-ui/IconButton';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
// todo: remove global vars

var loadedSudoku = Sudokus.sudokus[0].data.deepClone();

var initialSudoku = loadedSudoku.deepClone();


/**
 * Cell of the Sudoku Table.
 * @type {*}
 */
class SDCell extends React.Component {

    state = {
        cellValue: this.props.value > 0 ? this.props.value : ""
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            cellValue: nextProps.value > 0 ? nextProps.value : ""
        });
    };
    
    shouldComponentUpdate(nextProps) {
        return this.state.cellValue !== nextProps.value;
    };

    selectAll = (event) => {
        event.target.select();
    };

    onChange = (event) => {
        var newValue = event.target.value;

        if (isNaN(newValue)) // only numbers allowed
            return false;

        //loadedSudoku[this.props.a][this.props.b] = ~~newValue;

        this.props.onChange(this.props.a, this.props.b, ~~newValue);

        this.setState({
            cellValue: newValue
        });
    };

    getClassName = function () {
        if (!this.props.running) {
            if (initialSudoku[this.props.a][this.props.b])
                return "initFilled";
            else
                return "initEmpty"; 
        } else if (initialSudoku[this.props.a][this.props.b] != 0) {
                return "initFilled";
        } else if (!initialSudoku[this.props.a][this.props.b]) {
            if (loadedSudoku[this.props.a][this.props.b] === 0)
                return "emptyField";
            else
                return "sdFilled";
        }
    };

    render() {

        //var cellValue = this.props.value > 0 ? this.props.value : '';//loadedSudoku[this.props.a][this.props.b] > 0 ? loadedSudoku[this.props.a][this.props.b] : '';

        var cellValue = this.state.cellValue;

        var style = {
            width: this.props.width + "px",
            height: this.props.width + "px"
        };

        // todo: unschön
        if (this.props.info && this.props.info.save && this.props.info.save.cordA === this.props.a && this.props.info.save.cordB === this.props.b) {
            style.background = '#f00';
        }

        return (
            <div className={this.getClassName() + ' sdCell'}>
                <input ref="input" style={style} value={cellValue} disabled={this.props.running} onChange={this.onChange} onClick={this.selectAll} type="number" />
            </div>
        );
    }
};

/**
 * Table elements, represents a html-table.
 * @type {*}
 */
class SDTable extends React.Component {

    state = {
        selectedSudoku: this.props.selectedSudoku
    };

    componentWillReceiveProps(nextProps) {
        this.setState({selectedSudoku: nextProps.selectedSudoku});
    }

    renderChildren = (a, b) => {

        let self = this;

        return React.Children.map(this.props.children, function (child) {
            if (child.type === SDCell)
                return React.cloneElement(child, { 
                    index: b, 
                    a: a, 
                    b: b, 
                    value: self.state.selectedSudoku[a][b],
                    key: (a + b) });
            else
                return React.cloneElement(child, { index: b });
        })
    }    
    
    render() {

        let columns = Array.from(new Array(this.props.columnCount), (val,index) => index);
        let rows = Array.from(new Array(this.props.rowCount), (val,index) => index);

        var self = this;

        return (
            <div className="sdTable">

                {rows.map(function (eRow, iRow) {
                    return (
                        <div key={eRow} className="sdRow">
                            {columns.map(function (eCol, iCol) {
                                return (
                                    <div key={iCol + eCol} className="sdColumn">
                                        {self.renderChildren(self.props.index, (iRow * self.props.rowCount) + iCol)}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

            </div>
        );
    }
};

class Sudoku extends React.Component {

    getWidth = () => {
        return ~~((Math.min(window.innerWidth, window.innerHeight) - 120) / this.props.size);
    }

    state = {
        selectedSudoku: this.props.selectedSudoku,
        width: this.getWidth()
    };

    componentWillReceiveProps(nextProps) {
        this.setState({selectedSudoku: nextProps.selectedSudoku});
    }

    shouldComponentUpdate(nextProps) {
        // must be true, otherwise won't update on animation
        return true;//this.state.selectedSudoku != nextProps.selectedSudoku;
    };


    updateDimensions = () => {
        this.setState({width: this.getWidth()});
    };

    componentWillMount = () => {
        this.updateDimensions();
    };

    componentDidMount = () => {
        window.addEventListener("resize", this.updateDimensions);
    };

    componentWillUnmount = () => {
        window.removeEventListener("resize", this.updateDimensions);
    };

    handleChange = (a, b, value) => {
        this.state.selectedSudoku[a][b] = value;
    };

    render () {

        let rowAndColumnSize = Math.sqrt(this.props.size);

        //var width = ~~((Math.min(window.innerWidth, window.innerHeight) - 100) / this.props.size);

        //let width = ~~(89 / this.props.size);

        let columns = Array.from(new Array(rowAndColumnSize), (val,index) => index);
        let rows = Array.from(new Array(rowAndColumnSize), (val,index) => index);

        let self = this;

        return (
            <div className="tableContainer">
                <SDTable rowCount={rowAndColumnSize} columnCount={rowAndColumnSize}>
                    <SDTable selectedSudoku={this.state.selectedSudoku} rowCount={rowAndColumnSize} columnCount={rowAndColumnSize}>
                        <SDCell info={this.props.msg} width={this.state.width} onChange={this.handleChange} running={this.props.running} />
                    </SDTable>
                </SDTable>
            </div>
        );
    };
};

/**
 * Complete App component.
 * @type {*}
 */
class App extends React.Component {
    
    state = {
        isAnimationChecked: false,
        sudokuAsString: "",
        showResults: false,
        msg: null,
        running: false,
        selectedSudoku: Sudokus.sudokus[0].data.deepClone(),
        size: 9,
    };

    requestCancel = false;

    //loadedSudoku;

    clear = () => {
        this.state.selectedSudoku.forEach(function (arr, a) {
            arr.forEach(function (ele, b) {
                arr[b] = 0;
            });
        });

        solver.set(this.state.selectedSudoku, this.update, this.state.isAnimationChecked);
        initialSudoku = solver.getInitialSudoku();

        this.setState({
            showResults: false,
            msg: null
        });
    };
    
    update = (args) => {
        this.forceUpdate();
        return !this.requestCancel;
    };
    
    componentDidMount() {
        solver.set(this.state.selectedSudoku, this.update, this.state.isAnimationChecked);
        initialSudoku = solver.getInitialSudoku();
    };
    
    solve = () => {

        if (this.state.running) {
            this.requestCancel = true;
            this.state.running = false;
            return;
        }

        this.requestCancel = false;
        this.state.running = true;

        solver.set(this.state.selectedSudoku, this.update, this.state.isAnimationChecked);
        initialSudoku = solver.getInitialSudoku();
        
        var success = function (msg) {
            this.setState({
                showResults: true,
                msg: msg,
                running: false
            });
        };
        var successCallback = success.bind(this);

        solver.run(successCallback);
    };

    onAnimationChange = () => {
        this.setState({ isAnimationChecked: !this.state.isAnimationChecked });
    };

    onSizeChange = (event, index, value) => {

        let sudoku = value.data.deepClone();

        this.setState({
            size: sudoku.length,
            showResults: false,
            selectedSudoku: sudoku
        });

        solver.set(this.state.selectedSudoku, this.update, this.state.isAnimationChecked);
        initialSudoku = solver.getInitialSudoku();
    };

    onInfoBoxClose = (event) => {
        this.setState({
            showResults: false
        });
    };

    onJsonInputChange = (event) => {

        var newValue = event.target.value;

        this.setState({
            sudokuAsString: newValue
        });
    };

    getAsString = () => {
        this.setState({ sudokuAsString: solver.print() });
    };

    setFromString = () => {

        if (this.state.sudokuAsString) {
            let sudoku = solver.getSudokuFromString(this.state.sudokuAsString);
            solver.set(sudoku, this.update, this.state.isAnimationChecked);
            initialSudoku = solver.getInitialSudoku();

            this.setState({
                running: false,
                showResults: false,
                msg: null,
                size: sudoku.length,
                selectedSudoku: sudoku
            });
        }
    };

    render () {

        return (
            <div>
                <header>
                    <Grid container 
                        align='flex-end' 
                        style={{
                            background: '#fff'
                        }}>
                        <Grid item>
                            <Typography type="headline">
                                <Icon style={{
                                    color: '#ccc',
                                    fontSize: '48px'
                                }}>border_outer</Icon> Sudoku Solver
                            </Typography>
                        </Grid>
                        <Grid item>
                            <DropDown itemList={Sudokus} onChange={this.onSizeChange} />
                        </Grid>
                        <Grid item>
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        id='animation-switch'
                                        checked={this.state.isAnimationChecked}
                                        onChange={this.onAnimationChange}
                                    />
                                }
                                label="animation" />
                            
                        </Grid>
                    </Grid>
                </header>

                <div className="sudokuContainer">
                    <InfoBox msg={this.state.msg} open={this.state.showResults} onClose={this.onInfoBoxClose} />
                    <Sudoku selectedSudoku={this.state.selectedSudoku} msg={this.state.msg} size={this.state.size} running={this.state.running} />
                </div>
            
                <Grid container spacing={24} style={{
                            background: '#eee'
                        }}>
                    <Grid item xs={12}>
                        <Toolbar>
                            <Grid container spacing={24} justify='space-around'>
                                <Grid item>
                                    <Button raised onClick={this.clear}>
                                        <Icon>clear</Icon> Clear
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button raised color="primary" onClick={this.solve}>
                                    {!this.state.running? <Icon>check</Icon> :<Icon>autorenew</Icon>}  Solve
                                    </Button>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography type="subheading">
                                    Sudoku as json
                                </Typography>

                                <TextField
                                    id="json-input"
                                    label="json"
                                    helperText="get or load a sudoku via json"
                                    fullWidth
                                    margin="normal"
                                    value={this.state.sudokuAsString} onChange={this.onJsonInputChange}
                                    />
                            </CardContent>
                            <CardActions>
                                <Button dense onClick={this.getAsString}>Get As String</Button>
                                <Button dense onClick={this.setFromString}>Set From String</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        );
    };
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

const styles = {
    root: {
        marginTop: 0,
        width: '100%',
    },
};

export default withStyles(styles)(App);