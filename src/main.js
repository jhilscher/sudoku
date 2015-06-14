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
    <h1>Sudoku Solver</h1>,
    document.getElementsByTagName('header')[0]
);


var SDCell = React.createClass({

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
                <input ref="input" className={classes} onClick={this.selectAll} valueLink={valueLink} maxLength="1" size="1" type="text" />
            );
    }
});


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
            <table>
            <tbody>
                {rows.map(function (eRow, iRow) {
                    return (
                        <tr>
                        {columns.map(function (eCol, iCol) {
                            return (
                                <td key={iCol}>
                                    {self.renderChildren(self.props.index, (iRow * self.props.rowCount) + iCol)}
                                </td>
                        );
                        })}
                        </tr>
                        );
                })}
            </tbody>
            </table>
            );
    }
});

var SudokuPlayground = React.createClass({
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
            <div>
            <div className="jumbotron">
            <div className="tableContainer">
            <SDTable rowCount="3" columnCount="3">
                <SDTable rowCount="3" columnCount="3">
                    <SDCell />
                </SDTable>
            </SDTable>
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
                    <div className="row">
                        <div className="col-md-2">
                            <button type="button" className="btn btn-default btn-lg" data-toggle="button" onClick={this.onChange} aria-pressed="false" autoComplete="off">
                                Animation
                            </button>
                        </div>
                        <div className="col-md-1">
                            <button type="button" className="btn btn-default btn-lg" onClick={this.clear}>Clear</button>
                        </div>
                        <div className="col-md-1">
                            <button type="button" className="btn btn-primary btn-lg" onClick={this.solve}>Solve</button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            );
    }
});

React.render(<SudokuPlayground/>, document.getElementById('playGround'));
