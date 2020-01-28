// @flow

import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import { ReactComponent as ErrorIcon } from './svg/Error.svg';
import './ConfirmDeleteAllModal.css';

type ConfrimDeleteAllModalProps = {
    intl: any,
    show: boolean,
    onCancel: () => void,
    onConfirm: () => void
};

class ConfrimDeleteAllModal extends React.Component<ConfrimDeleteAllModalProps, {}> {
    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onCancel}
                size='lg'
                dialogClassName='ConfrimDeleteAllModal'
                centered>
                <Modal.Body className='ConfrimDeleteAllModal__content'>
                    <div className='ConfrimDeleteAllModal__header'>
                        <span role='img' aria-label={this.props.intl.formatMessage({id:'ConfrimDeleteAllModal.warning'})} >
                            <ErrorIcon className='ConfrimDeleteAllModal__warning-svg' />
                        </span>
                        <FormattedMessage id='ConfrimDeleteAllModal.title' />
                    </div>
                    <div className='ConfrimDeleteAllModal__footer'>
                        <Button
                            className='ConfrimDeleteAllModal__option-button mr-4'
                            onClick={this.props.onCancel}>
                            <FormattedMessage id='ConfrimDeleteAllModal.cancelButton' />
                        </Button>
                        <Button
                            className='ConfrimDeleteAllModal__option-button'
                            onClick={this.props.onConfirm}>
                            <FormattedMessage id='ConfrimDeleteAllModal.confirmButton' />
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default injectIntl(ConfrimDeleteAllModal);
