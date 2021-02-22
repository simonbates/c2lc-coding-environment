// @flow

import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import type {IntlShape} from 'react-intl';
import { ReactComponent as ErrorIcon } from './svg/Error.svg';
import './RobotConnectionErrorModal.scss';

type RobotConnectionErrorModalProps = {
    intl: IntlShape,
    show: boolean,
    onCancel: () => void,
    onRetry: () => void
};

class RobotConnectionErrorModal extends React.Component<RobotConnectionErrorModalProps, {}> {
    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onCancel}
                size='lg'
                dialogClassName='RobotConnectionErrorModal'
                centered>
                <Modal.Body className='RobotConnectionErrorModal__content'>
                    <div className='RobotConnectionErrorModal__header'>
                        <span role='img' aria-label={this.props.intl.formatMessage({id:'RobotConnectionErrorModal.error'})} >
                            <ErrorIcon className='RobotConnectionErrorModal__error-svg' />
                        </span>
                        <FormattedMessage id='RobotConnectionErrorModal.title' />
                    </div>
                    <div className='RobotConnectionErrorModal__body'>
                        <ul>
                            <li>
                                <FormattedMessage id='RobotConnectionErrorModal.firstMessage' />
                            </li>
                            <li>
                                <FormattedMessage id='RobotConnectionErrorModal.secondMessage' />
                            </li>
                        </ul>
                    </div>
                    <div className='RobotConnectionErrorModal__footer'>
                        <Button
                            className='RobotConnectionErrorModal__option-button mr-4'
                            onClick={this.props.onCancel}>
                            <FormattedMessage id='RobotConnectionErrorModal.cancelButton' />
                        </Button>
                        <Button
                            className='RobotConnectionErrorModal__option-button'
                            onClick={this.props.onRetry}>
                            <FormattedMessage id='RobotConnectionErrorModal.retryButton' />
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default injectIntl(RobotConnectionErrorModal);
