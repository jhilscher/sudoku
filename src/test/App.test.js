import React from 'react';
import App from '../App';
import renderer from 'react-test-renderer';

jest.mock('react-dom', () => ({
    // Mock findDOMNode since react-test-renderer is not supporting it
    findDOMNode: () => ({
      getContext: jest.fn(),
    }),
  })
);

test('render App without crashing', () => {
    const component = renderer.create(
        <App />
    );
});

test('App Snapshot', () => {
    const component = renderer.create(
        <App />
    );

    let tree = component.toJSON();

    expect(tree).toMatchSnapshot();
});