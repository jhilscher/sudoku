import React from 'react';
//import ReactDOM from 'react-dom';
import App from '../App';
import renderer from 'react-test-renderer';

test('renders App without crashing', () => {
   const component = renderer.create(
       <App />
   );
});

test('App properties ', () => {
    const component = renderer.create(
        <App />
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
});