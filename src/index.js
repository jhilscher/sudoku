import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../css/main.css';


ReactDOM.render(
    <h1>Sudoku Solver</h1>,
    document.getElementsByTagName('header')[0]
);

ReactDOM.render(
  <App />,
  document.getElementById('playGround')
);
