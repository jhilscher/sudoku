import React from 'react';

// Material UI
import Snackbar from 'material-ui/Snackbar';
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';

/**
 * Alert-Box that handles messages from the sudoku.js.
 */
class InfoBox extends React.Component {
    
        state = {
            open: this.props.open
        };
    
        componentWillReceiveProps(nextProps) {
            this.setState({ open: nextProps.open });
        }

        handleRequestClose = (event) => {
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

    export default InfoBox;