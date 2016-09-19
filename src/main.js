/**
 * Created by Joerg on 07.06.15.
 */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

// todo: remove global vars

var s = [
    [0,0,0,0,0,0,1,0,0],
    [1,0,0,0,7,0,8,0,0],
    [5,0,0,0,6,3,0,2,0],
    [0,7,0,0,0,4,0,0,1],
    [3,0,0,9,0,7,0,0,4],
    [4,0,0,8,0,0,0,7,0],
    [0,1,0,3,5,0,0,0,2],
    [0,0,2,0,8,0,0,0,5],
    [0,0,9,0,0,0,0,0,0]
];

var initialSudoku = s.deepClone();

var running = false;

React.render(
    <h1>Sudoku Solver</h1>,
    document.getElementsByTagName('header')[0]
);

/**
 * Cell of the Sudoku Table.
 * @type {*}
 */
var SDCell = React.createClass({

    parentDiv: null,
    initClass: null,

    componentDidMount: function () {
        this.parentDiv = $(React.findDOMNode(this.refs.input)).parent("div");
        this.initClass = this.parentDiv.attr('class');
        this.updateClass();
    },

    getInitialState: function() {
        return {
            sdValue: s[this.props.a][this.props.b]
        };
    },

    setParentClass: function (newClass) {
        if (this.parentDiv) {
            this.parentDiv.attr('class', newClass + ' ' + this.initClass);
        }
    },

    handleChange: function(newValue) {
        if(isNaN(newValue)) // only numbers allowed
            return false;

        s[this.props.a][this.props.b] = ~~newValue;

        this.setState({}); // update
    },

    /**
     * Selects all of this input field.
     */
    selectAll: function() {
        $(React.findDOMNode(this.refs.input)).select();
    },

    updateClass: function () {
        if (!running) {
            if (initialSudoku[this.props.a][this.props.b])
                this.setParentClass("initFilled");
            else
                this.setParentClass("initEmpty");
        } else if (!initialSudoku[this.props.a][this.props.b]) {
            if (s[this.props.a][this.props.b] == 0)
                this.setParentClass("emptyField");
            else
                this.setParentClass("sdFilled");
        }
    },

    render: function () {

        this.updateClass();

        var valueLink = {
            value: s[this.props.a][this.props.b] > 0? s[this.props.a][this.props.b]: '',
            requestChange: this.handleChange
        };

        var style = {};

        // todo: unschön
        if (this.props.info && this.props.info.save && this.props.info.save.cordA == this.props.a && this.props.info.save.cordB == this.props.b) {
            style.background = '#f00';
        }

        return (
                <input ref="input" style={style} onClick={this.selectAll} valueLink={valueLink} maxLength="1" size="1" type="number" />
            );
    }
});

/**
 * Table elements, represents a html-table.
 * @type {*}
 */
var SDTable = React.createClass({

    renderChildren: function (a,b) {
        return React.Children.map(this.props.children, function (child) {
            if (child.type == SDCell)
                return React.cloneElement(child, { index:b, a: a, b: b, key: (a + b) });
            else
                return React.cloneElement(child, { index: b });
        })
    },
    render: function () {
        var columns = [];
        var rows = [];
        for (var i = 0; i < this.props.rowCount; i++)
            rows.push(i);

        for (var i = 0; i < this.props.columnCount; i++)
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
var InfoBox = React.createClass({
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

/**
 * Complete Sudoku component.
 * @type {*}
 */
var SudokuPlayground = React.createClass({

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

    getInitialState: function(){
        return {
            isChecked: false,
            sudokuAsString: "",
            initialSudoku: [],
            showResults: false,
            msg: null
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

    handleChange: function(newValue) {
        this.setState({
            sudokuAsString: newValue
        });
    },

    render: function(){

        var valueLink = {
            value: this.state.sudokuAsString,
            requestChange: this.handleChange
        };

        return (
            <div>
            <div className="jumbotron">
                { this.state.showResults ?  <InfoBox msg={this.state.msg} /> : null }

                <div className="tableContainer">
                    <SDTable rowCount="3" columnCount="3">
                        <SDTable rowCount="3" columnCount="3">
                            <SDCell info={this.state.msg} />
                        </SDTable>
                    </SDTable>
                </div>
                <div className="btn-toolbar row-fluid">
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
                                <input type="text" className="form-control" valueLink={valueLink} />
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

React.render(<SudokuPlayground/>, document.getElementById('playGround'));
