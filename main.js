/**
 * Created by Joerg on 07.06.15.
 */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

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

React.render(
    React.createElement("h1", null, "Sudoku Solver"),
    document.getElementsByTagName('header')[0]
);


var SDCell = React.createClass({displayName: "SDCell",

    getInitialState: function() {
        return {
            sdValue: s[this.props.a][this.props.b],
            initClass: s[this.props.a][this.props.b] == 0? " initEmtpy" : " initFilled"
        };
    },

    handleChange: function(newValue) {
       if(isNaN(newValue)) // only numbers allowed
            return false;
       s[this.props.a][this.props.b] = newValue;


       this.setState({sdValue: s[this.props.a][this.props.b]});

       $(React.findDOMNode(this.refs.input)).closest("tr").next().find('.emptyField').select();
    },

    /**
     * Selects all of this input field.
     */
    selectAll: function() {
        $(React.findDOMNode(this.refs.input)).select();
    },

    render: function () {
        var valueLink = {
            value: s[this.props.a][this.props.b],
            requestChange: this.handleChange
        };

        var classes = s[this.props.a][this.props.b] == 0? "emptyField" : "sdFilled";
        classes += this.state.initClass;

        return (
                React.createElement("input", {ref: "input", className: classes, onClick: this.selectAll, valueLink: valueLink, maxLength: "1", size: "1", type: "text"})
            );
    }
});


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
                        React.createElement("tr", null, 
                        columns.map(function (eCol, iCol) {
                            return (
                                React.createElement("td", {key: iCol}, 
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

var SudokuPlayground = React.createClass({displayName: "SudokuPlayground",
    setValue: function(event) {
        //alert(event.target.value);

    },
    clear: function() {
        s.forEach(function(arr, a) {
            arr.forEach(function(ele, b) {
                s[a][b] = 0;
            });
        });
        this.forceUpdate();
    },
    update: function (args) {
        console.log(args);
        this.forceUpdate();
    },

    componentDidMount: function () {
        solver.set(s, this.update, this.state.isChecked);
    },

    solve: function(){
           solver.set(s, this.update, this.state.isChecked);
           solver.run();
           this.setState({});
    },

    onChange: function () {
        this.setState({isChecked: !this.state.isChecked});
    },

    getInitialState: function(){
        return {
            isChecked: false,
            sudokuAsString: ""
        };
    },

    getAsString: function () {
        this.setState({sudokuAsString: solver.print()});
    },

    setFromString: function () {
        s = solver.getSudokuFromString(this.state.sudokuAsString);
        solver.set(s, this.update, this.state.isChecked);
        console.log(s);
        this.setState({});
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
            React.createElement("div", null, 
            React.createElement("div", {className: "jumbotron"}, 
            React.createElement("div", {className: "tableContainer"}, 
            React.createElement(SDTable, {rowCount: "3", columnCount: "3"}, 
                React.createElement(SDTable, {rowCount: "3", columnCount: "3"}, 
                    React.createElement(SDCell, null)
                )
            )
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
                    ), 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-md-2"}, 
                            React.createElement("button", {type: "button", className: "btn btn-default btn-lg", "data-toggle": "button", onClick: this.onChange, "aria-pressed": "false", autoComplete: "off"}, 
                                "Animation"
                            )
                        ), 
                        React.createElement("div", {className: "col-md-1"}, 
                            React.createElement("button", {type: "button", className: "btn btn-default btn-lg", onClick: this.clear}, "Clear")
                        ), 
                        React.createElement("div", {className: "col-md-1"}, 
                            React.createElement("button", {type: "button", className: "btn btn-primary btn-lg", onClick: this.solve}, "Solve")
                        )
                    )
                )
            )
            )
            );
    }
});

React.render(React.createElement(SudokuPlayground, null), document.getElementById('playGround'));
