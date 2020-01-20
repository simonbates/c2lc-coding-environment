// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import { Button } from 'react-bootstrap';
import { createIntl } from 'react-intl';
import App from './App';
import messages from './messages.json';
import ConfirmDeleteAllModal from './ConfirmDeleteAllModal';

configure({ adapter: new Adapter()});

function getOptionButtons(confirmDeleteAllModalWrapper) {
    return confirmDeleteAllModalWrapper.find(Button)
        .filter('.ConfrimDeleteAllModal__option-button');
}

test('Check if buttons are calling right function from the props', () => {
    const intl = createIntl({
        locale: 'en',
        defaultLocale: 'en',
        messages: messages.en
    });

    const mockCancelHandler = jest.fn();
    const mockConfirmHandler = jest.fn();
    const wrapper = shallow(
        <ConfirmDeleteAllModal.WrappedComponent
            intl={intl}
            show={true}
            onCancel={mockCancelHandler}
            onConfirm={mockConfirmHandler}/>
    );

    const cancelButton = getOptionButtons(wrapper).at(0);
    const confirmButton = getOptionButtons(wrapper).at(1);

    cancelButton.simulate('click');
    expect(mockCancelHandler.mock.calls.length).toBe(1);

    confirmButton.simulate('click');
    expect(mockConfirmHandler.mock.calls.length).toBe(1);
});

