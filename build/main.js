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
    React.createElement("h1", null, "Sudoku Solver"),
    document.getElementsByTagName('header')[0]
);

/**
 * Cell of the Sudoku Table.
 * @type {*}
 */
var SDCell = React.createClass({displayName: "SDCell",

    parentTd: null,

    componentDidMount: function () {
        this.parentTd = $(React.findDOMNode(this.refs.input)).parent("td");
        this.updateClass();
    },

    getInitialState: function() {
        return {
            sdValue: s[this.props.a][this.props.b]
        };
    },

    setParentClass: function (newClass) {
        if (this.parentTd) {
            this.parentTd.attr('class', newClass);
        }
    },

    handleChange: function(newValue) {
        if(isNaN(newValue)) // only numbers allowed
            return false;
        s[this.props.a][this.props.b] = ~~newValue;

        this.setState({}); // update

       //$(React.findDOMNode(this.refs.input)).closest("tr").next().find('.emptyField').select();
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

        var style = {
            height: this.props.size,
            width: this.props.size
        };

        // todo: unschön
        if (this.props.info && this.props.info.save && this.props.info.save.cordA == this.props.a && this.props.info.save.cordB == this.props.b) {
            style.background = '#f00';
        }

        return (
                React.createElement("input", {ref: "input", style: style, onClick: this.selectAll, valueLink: valueLink, maxLength: "1", size: "1", type: "text"})
            );
    }
});

/**
 * Table elements, represents a html-table.
 * @type {*}
 */
var SDTable = React.createClass({displayName: "SDTable",

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
            React.createElement("table", null, 
            React.createElement("tbody", null, 
                rows.map(function (eRow, iRow) {
                    return (
                        React.createElement("tr", {key: eRow}, 
                        columns.map(function (eCol, iCol) {
                            return (
                                React.createElement("td", {key: iCol+eCol}, 
                                    self.renderChildren(self.props.index, (iRow * self.props.rowCount) + iCol)
                                )
                        );
                        })
                        )
                        );
                })
            )
            )
            );
    }
});

/**
 * Alert-Box that handles messages from the sudoku.js.
 * @type {*}
 */
var InfoBox = React.createClass({displayName: "InfoBox",
    render: function () {

        var text = this.props.msg.toString();

        var classes = 'alert ';

        if (this.props.msg.success) {
            classes += 'alert-info';
        } else {
            classes += 'alert-danger';
        }

        return (
            React.createElement("div", {className: classes, role: "alert"}, text)
            );
    }

});

/**
 * Complete Sudoku component.
 * @type {*}
 */
var SudokuPlayground = React.createClass({displayName: "SudokuPlayground",

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

    size: function () {
        return ~~((Math.min($(window).width(), $(window).height()) - 200) / 10);
    },

    render: function(){

        var valueLink = {
            value: this.state.sudokuAsString,
            requestChange: this.handleChange
        };

        return (
            React.createElement("div", null, 
            React.createElement("div", {className: "jumbotron"}, 
                 this.state.showResults ?  React.createElement(InfoBox, {msg: this.state.msg}) : null, 

                React.createElement("div", {className: "tableContainer"}, 
                    React.createElement(SDTable, {rowCount: "3", columnCount: "3"}, 
                        React.createElement(SDTable, {rowCount: "3", columnCount: "3"}, 
                            React.createElement(SDCell, {size: this.size(), info: this.state.msg})
                        )
                    )
                ), 
                React.createElement("div", {className: "btn-toolbar row-fluid"}, 
                    React.createElement("button", {type: "button", className: "btn btn-default", "data-toggle": "button", onClick: this.onChange, "aria-pressed": "false", autoComplete: "off"}, 
                    "Animation"
                    ), 
                    React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.clear}, "Clear"), 
                    React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.solve}, "Solve")
                )
            ), 

            React.createElement("div", {className: "panel panel-default"}, 
                React.createElement("div", {className: "panel-heading"}, "Settings"), 
                React.createElement("div", {className: "panel-body"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-lg-6"}, 
                            React.createElement("div", {className: "input-group"}, 
                                React.createElement("input", {type: "text", className: "form-control", valueLink: valueLink}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-default", onClick: this.getAsString, type: "button"}, "Get As String."), 
                                    React.createElement("button", {className: "btn btn-default", onClick: this.setFromString, type: "button"}, "Set From String.")
                                )
                                )
                            )
                    )

                )
            )
            )
            );
    }
});

React.render(React.createElement(SudokuPlayground, null), document.getElementById('playGround'));
