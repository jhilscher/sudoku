/**
 * Created by Joerg on 07.06.15.
 */
import React from 'react';
import solver from './sudoku';
import $ from 'jquery';
import Sudokus from './resources/sudokus.json';
import createReactClass from 'create-react-class';

// Material UI
import Icon from 'material-ui/Icon';
import PropTypes from 'prop-types';
import Snackbar from 'material-ui/Snackbar';
import withStyles from 'material-ui/styles/withStyles';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Button from 'material-ui/Button';
import Switch from 'material-ui/Switch';
import Menu, { MenuItem } from 'material-ui/Menu';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
import IconButton from 'material-ui/IconButton';
import Grid from 'material-ui/Grid';
// todo: remove global vars

var s = Sudokus.sudokus[0].data.deepClone();

var initialSudoku = s.deepClone();

var running = false;

const StateTwoWayMixin = {
    linkState: function () {
        return {
            value: s[this.props.a][this.props.b] > 0 ? s[this.props.a][this.props.b] : '',
            onChange: function (event) {
                var newValue = event.target.value;

                if (isNaN(newValue)) // only numbers allowed
                    return false;

                s[this.props.a][this.props.b] = ~~newValue;

                this.setState({ initValue: newValue });
            }.bind(this)
        }
    }
};

/**
 * Cell of the Sudoku Table.
 * @type {*}
 */
var SDCell = createReactClass({

    mixins: [StateTwoWayMixin],

    getInitialState: function () {
        return {
            initValue: s[this.props.a][this.props.b] > 0 ? s[this.props.a][this.props.b] : ''
        };
    },

    /**
     * Selects all of this input field.
     */
    selectAll: function () {
        $(this.refs.input).select();
    },

    getClassName: function () {
        if (!running) {
            if (initialSudoku[this.props.a][this.props.b])
                return "initFilled";
            else
                return "initEmpty";
        } else if (!initialSudoku[this.props.a][this.props.b]) {
            if (s[this.props.a][this.props.b] === 0)
                return "emptyField";
            else
                return "sdFilled";
        }
    },

    render: function () {


        var style = {
            width: this.props.width + "vmin",
            height: this.props.width + "vmin"
        };

        // todo: unschön
        if (this.props.info && this.props.info.save && this.props.info.save.cordA === this.props.a && this.props.info.save.cordB === this.props.b) {
            style.background = '#f00';
        }

        return (
            <div className={this.getClassName()}>
                <input ref="input" style={style} value={this.state.initValue} {...this.linkState() } onClick={this.selectAll} maxLength="1" size="1" type="number" />
            </div>
        );
    }
});

/**
 * Table elements, represents a html-table.
 * @type {*}
 */
var SDTable = createReactClass({

    renderChildren: function (a, b) {
        return React.Children.map(this.props.children, function (child) {
            if (child.type === SDCell)
                return React.cloneElement(child, { index: b, a: a, b: b, key: (a + b) });
            else
                return React.cloneElement(child, { index: b });
        })
    },
    render: function () {

        var columns = [];
        var rows = [];

        for (let i = 0; i < this.props.rowCount; i++)
            rows.push(i);

        for (let i = 0; i < this.props.columnCount; i++)
            columns.push(i);

        var self = this;

        return (
            <div className="container-fluid">

                {rows.map(function (eRow, iRow) {
                    return (
                        <div key={eRow} className="row">
                            {columns.map(function (eCol, iCol) {
                                return (
                                    <div key={iCol + eCol} className="column">
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
});

/**
 * Selection for elements of itemList.
 */
class SudokuDropDown extends React.Component {
    state = {
        selectedIndex: 0,
        selectedItem: this.props.itemList.sudokus[0]
    };

    handleClickListItem = (event) => {
        this.setState({
            selectedIndex: event.target.index,
            selectedItem: event.target.value
        });
        this.props.onChange(event, event.target.index, event.target.value);
    };

    render() {
        return (
            <div>
                <FormControl>
                    <InputLabel htmlFor="dropdown">Sudoku</InputLabel>
                    <Select
                        value={this.state.selectedItem}
                        onChange={this.handleClickListItem}
                        input={<Input id="dropdown" />}
                    >
                        {this.props.itemList.sudokus.map((sudoku, index) => (
                            <MenuItem
                                key={sudoku.title}
                                value={sudoku}
                            >
                                {sudoku.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </div>
        );
    }
}


/**
 * Alert-Box that handles messages from the sudoku.js.
 * @type {*}
 */
class InfoBox extends React.Component {

    state = {
        open: this.props.open
    };

    componentWillReceiveProps(nextProps) {
        this.setState({ open: nextProps.open });
    }

    handleRequestClose = (event, reason) => {
        this.setState({ open: false });
        this.props.onClose(event);
    };

    render() {
        var text = this.props.msg ? this.props.msg.toString() : null;

        if (this.props.msg) {

            var classes = 'alert ';

            if (this.props.msg.success) {
                classes += 'alert-info';
            } else {
                classes += 'alert-danger';
            }
        }

        return (
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={this.state.open}
                onRequestClose={this.handleRequestClose}
                SnackbarContentProps={{
                    'aria-describedby': 'message-id'
                }}
                message={<span id="message-id">{text}</span>}
                action={
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={this.handleRequestClose}>
                        <Icon color="accent">close</Icon>
                    </IconButton>
                }
            />
        );
    }
};

var Sudoku = createReactClass({

    getInitialState: function () {
        return {};
    },

    render: function () {

        var rowAndColumnSize = Math.sqrt(this.props.size);
        var width = ~~(70 / this.props.size);

        return (
            <div className="tableContainer">
                <SDTable rowCount={rowAndColumnSize} columnCount={rowAndColumnSize}>
                    <SDTable rowCount={rowAndColumnSize} columnCount={rowAndColumnSize}>
                        <SDCell info={this.props.msg} width={width} />
                    </SDTable>
                </SDTable>
            </div>
        );
    }
});

/**
 * Complete Sudoku component.
 * @type {*}
 */
var App = createReactClass({

    clear: function () {
        s.forEach(function (arr, a) {
            arr.forEach(function (ele, b) {
                s[a][b] = 0;
                initialSudoku[a][b] = 0;
            });
        });
        this.setState({
            showResults: false,
            msg: null
        });
    },

    update: function (args) {
        console.log(args);
        this.forceUpdate();
    },

    componentDidMount: function () {
        solver.set(s, this.update, this.state.isChecked);
        initialSudoku = solver.getInitialSudoku();
    },

    solve: function () {
        running = true;

        solver.set(s, this.update, this.state.isChecked);
        initialSudoku = solver.getInitialSudoku();

        var success = function (msg) {
            this.setState({
                showResults: true,
                msg: msg
            });
        };
        var successCallback = success.bind(this);

        solver.run(successCallback);

    },

    onChange: function () {
        this.setState({ isChecked: !this.state.isChecked });
    },

    onSizeChange: function (event, index, value) {

        s = value.data.deepClone();

        this.setState({
            size: s.length,
            selectedSudoku: value,
            showResults: false
        });

        initialSudoku = s.deepClone();

        solver.set(s, this.update, this.state.isChecked);
    },

    onInfoBoxClose: function(event) {
        this.setState({
            showResults: false
        });
    },

    handleChange: function (event) {

        var newValue = event.target.value;

        this.setState({
            sudokuAsString: newValue
        });
    },

    getInitialState: function () {
        return {
            isChecked: false,
            sudokuAsString: "",
            initialSudoku: [],
            showResults: false,
            msg: null,
            size: 9,
            selectedSudoku: 91
        };
    },

    getAsString: function () {
        this.setState({ sudokuAsString: solver.print() });
    },

    setFromString: function () {

        if (this.state.sudokuAsString) {
            s = solver.getSudokuFromString(this.state.sudokuAsString);
            solver.set(s, this.update, this.state.isChecked);
            initialSudoku = solver.getInitialSudoku();
            console.log(s);
            running = false;

            this.setState({
                showResults: false,
                msg: null
            });
        }
    },

    render: function () {

        return (
            <div>
                <div className="sudokuContainer">
                    <InfoBox msg={this.state.msg} open={this.state.showResults} onClose={this.onInfoBoxClose} />
                    <Sudoku msg={this.state.msg} size={this.state.size} />
                </div>

                <Toolbar>
                    <Grid container>
                        <Grid item>
                            <SudokuDropDown itemList={Sudokus} onChange={this.onSizeChange} />
                        </Grid>
                        <Grid item>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.isChecked}
                                    onChange={this.onChange}
                                />
                            }
                            label="animation" />
                        </Grid>
                        <Grid item>
                            <Button raised onClick={this.clear}>
                                <Icon>clear</Icon> Clear
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button raised color="primary" onClick={this.solve}>
                                <Icon>check</Icon> Solve
                            </Button>
                        </Grid>
                    </Grid>
                </Toolbar>

                <div className="panel panel-default">
                    <div className="panel-heading">Settings</div>
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="input-group">
                                    <input type="text" className="form-control" value={this.state.sudokuAsString} onChange={this.handleChange} />
                                    <span className="input-group-btn">
                                        <button className="btn btn-default" onClick={this.getAsString} type="button">Get As String.</button>
                                        <button className="btn btn-default" onClick={this.setFromString} type="button">Set From String.</button>
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
});

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

const styles = {
    root: {
        marginTop: 30,
        width: '100%',
    },
};

export default withStyles(styles)(App);