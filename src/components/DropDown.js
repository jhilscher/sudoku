import React from 'react';

import { FormControl, FormControlLabel } from 'material-ui/Form';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import Menu, { MenuItem } from 'material-ui/Menu';

/**
 * Selection for elements of itemList.
 */
class DropDown extends React.Component {
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

export default DropDown;