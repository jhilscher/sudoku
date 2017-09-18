import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import './css/main.css';

const theme = createMuiTheme();

const Wrapper = () => (
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>
);

ReactDOM.render(
    <h1>Sudoku Solver</h1>,
    document.getElementsByTagName('header')[0]
);

ReactDOM.render(
  <Wrapper />,
  document.getElementById('playGround')
);
