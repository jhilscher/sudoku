/**
 * Created by Joerg on 07.06.15.
 */
import React from 'react';
import solver from './sudoku';
import $ from 'jquery';
import Sudokus from './resources/sudokus.json';
import createReactClass from 'create-react-class';

// todo: remove global vars

var s = Sudokus["sudokus"][8].deepClone();

var initialSudoku = s.deepClone();

var running = false;

const StateTwoWayMixin = {
    linkState: function () {
        return {
            value: s[this.props.a][this.props.b] > 0? s[this.props.a][this.props.b]: '',
            onChange: function (event) {
                var newValue = event.target.value;

                if(isNaN(newValue)) // only numbers allowed
                    return false;

                s[this.props.a][this.props.b] = ~~newValue;

                this.setState({initValue: newValue});
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

    getInitialState: function() {
        return {
            initValue: s[this.props.a][this.props.b] > 0? s[this.props.a][this.props.b]: ''
        };
    },

    /**
     * Selects all of this input field.
     */
    selectAll: function() {
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
                <input ref="input" style={style} value={this.state.initValue} {...this.linkState()} onClick={this.selectAll}  maxLength="1" size="1" type="number" />
            </div>
            );
    }
});

/**
 * Table elements, represents a html-table.
 * @type {*}
 */
var SDTable = createReactClass({

    renderChildren: function (a,b) {
        return React.Children.map(this.props.children, function (child) {
            if (child.type === SDCell)
                return React.cloneElement(child, { index:b, a: a, b: b, key: (a + b) });
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
                                <div key={iCol+eCol} className="column">
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
 * Alert-Box that handles messages from the sudoku.js.
 * @type {*}
 */
var InfoBox = createReactClass({
    render: function () {

        var text = this.props.msg.toString();

        var classes = 'alert ';

        if (this.props.msg.success) {
            classes += 'alert-info';
        } else {
            classes += 'alert-danger';
        }

        return (
            <div className={classes} role="alert">{text}</div>
            );
    }

});

var Sudoku = createReactClass({

    getInitialState: function() {
        return {};
    },

    render: function(){

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

    clear: function() {
        s.forEach(function(arr, a) {
            arr.forEach(function(ele, b) {
                s[a][b] = 0;
                initialSudoku[a][b] = 0;
            });
        });
        this.setState({
            showResults: false,
            msg: null});
    },

    update: function (args) {
        console.log(args);
        this.forceUpdate();
    },

    componentDidMount: function () {
        solver.set(s, this.update, this.state.isChecked);
        initialSudoku = solver.getInitialSokudok();
    },

    solve: function(){
        running = true;

        solver.set(s, this.update, this.state.isChecked);
        initialSudoku = solver.getInitialSokudok();

        var success = function (msg) {
            this.setState({
                showResults: true,
                msg: msg});
        };
        var successCallback = success.bind(this);

        solver.run(successCallback);

    },

    onChange: function () {
        this.setState({isChecked: !this.state.isChecked});
    },

    onSizeChange: function(event) {
        this.setState({size: event.target.value});

        if (event.target.value == 25){
            s = Sudokus["sudokus"][3].deepClone();
            initialSudoku = s.deepClone();
        } else if (event.target.value == 16){
            s = Sudokus["sudokus"][4].deepClone();
            initialSudoku = s.deepClone();
        } else if (event.target.value == 4){
            s = Sudokus["sudokus"][5].deepClone();
            initialSudoku = s.deepClone();
        } else if (event.target.value == 9){
            s = Sudokus["sudokus"][8].deepClone();
            initialSudoku = s.deepClone();
        }

        solver.set(s, this.update, this.state.isChecked);
    },

    handleChange: function(event) {

        var newValue = event.target.value;

        this.setState({
            sudokuAsString: newValue
        });
    },

    getInitialState: function(){
        return {
            isChecked: false,
            sudokuAsString: "",
            initialSudoku: [],
            showResults: false,
            msg: null,
            size: 9
        };
    },

    getAsString: function () {
        this.setState({sudokuAsString: solver.print()});
    },

    setFromString: function () {

        if (this.state.sudokuAsString) {
            s = solver.getSudokuFromString(this.state.sudokuAsString);
            solver.set(s, this.update, this.state.isChecked);
            initialSudoku = solver.getInitialSokudok();
            console.log(s);
            running = false;

            this.setState({
                showResults: false,
                msg: null});
        }
    },

    render: function(){

        return (
            <div>
            <div className="jumbotron">
                { this.state.showResults ?  <InfoBox msg={this.state.msg} /> : null }

                <Sudoku msg={this.state.msg} size={this.state.size} />

                <div className="btn-toolbar row-fluid form-inline">
                    <select className="form-control" defaultValue={this.state.size} onChange={this.onSizeChange}>
                        <option value="4">4x4</option>
                        <option value="9">9x9</option>
                        <option value="16">16x16</option>
                        <option value="25">25x25</option>
                    </select>
                    <button type="button" className="btn btn-default" data-toggle="button" onClick={this.onChange} aria-pressed="false" autoComplete="off">
                    Animation
                    </button>
                    <button type="button" className="btn btn-default" onClick={this.clear}>Clear</button>
                    <button type="button" className="btn btn-primary" onClick={this.solve}>Solve</button>
                    
                </div>
            </div>

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

export default App;
