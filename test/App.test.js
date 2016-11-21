import React from 'react';
//import ReactDOM from 'react-dom';
import App from '../src/App';
import renderer from 'react-test-renderer';

//it('renders without crashing', () => {
//    const component = renderer.create(
//        <App />
//    );
//});

it('changes the class when hovered', () => {
    const component = renderer.create(
        <App />
    );

    let app = App.toJSON();

    app.props.getAsString();

    expect(app.state.sudokuAsString).toEqual('0,0,0,0,0,0,1,0,0,1,0,0,0,7,0,8,0,0,5,0,0,0,6,3,0,2,0,0,7,0,0,0,4,0,0,1,3,0,0,9,0,7,0,0,4,4,0,0,8,0,0,0,7,0,0,1,0,3,5,0,0,0,2,0,0,2,0,8,0,0,0,5,0,0,9,0,0,0,0,0,0');
//
//    // manually trigger the callback
//    tree.props.onMouseEnter();
//    // re-rendering
//    tree = component.toJSON();
//    expect(tree).toMatchSnapshot();
//
//    // manually trigger the callback
//    tree.props.onMouseLeave();
//    // re-rendering
//    tree = component.toJSON();
//    expect(tree).toMatchSnapshot();
});