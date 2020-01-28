// @flow

import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import { ReactComponent as ErrorIcon } from './svg/Error.svg';
import './DashConnectionErrorModal.scss';

type DashConnectionErrorModalProps = {
    intl: any,
    show: boolean,
    onCancel: () => void,
    onRetry: () => void
};

class DashConnectionErrorModal extends React.Component<DashConnectionErrorModalProps, {}> {
    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onCancel}
                size='lg'
                dialogClassName='DashConnectionErrorModal'
                centered>
                <Modal.Body className='DashConnectionErrorModal__content'>
                    <div className='DashConnectionErrorModal__header'>
                        <span role='img' aria-label={this.props.intl.formatMessage({id:'DashConnectionErrorModal.error'})} >
                            <ErrorIcon className='DashConnectionErrorModal__error-svg' />
                        </span>
                        <FormattedMessage id='DashConnectionErrorModal.title' />
                    </div>
                    <div className='DashConnectionErrorModal__body'>
                        <ul>
                            <li>
                                <FormattedMessage id='DashConnectionErrorModal.firstMessage' />
                            </li>
                            <li>
                                <FormattedMessage id='DashConnectionErrorModal.secondMessage' />
                            </li>
                        </ul>
                    </div>
                    <div className='DashConnectionErrorModal__footer'>
                        <Button
                            className='DashConnectionErrorModal__option-button mr-4'
                            onClick={this.props.onCancel}>
                            <FormattedMessage id='DashConnectionErrorModal.cancelButton' />
                        </Button>
                        <Button
                            className='DashConnectionErrorModal__option-button'
                            onClick={this.props.onRetry}>
                            <FormattedMessage id='DashConnectionErrorModal.retryButton' />
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default injectIntl(DashConnectionErrorModal);
