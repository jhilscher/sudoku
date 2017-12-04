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
  <Wrapper />,
  document.querySelector('#app')
);
