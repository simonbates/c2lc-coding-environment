// @flow

import { Button, Col, Collapse, Container, Row } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import * as ProgramUtils from './ProgramUtils';
import type {Program, SelectedAction} from './types';
import React from 'react';
import ConfirmDeleteAllModal from './ConfirmDeleteAllModal';
import AriaDisablingButton from './AriaDisablingButton';
import { ReactComponent as ArrowTurnLeft } from './svg/ArrowTurnLeft.svg';
import { ReactComponent as ArrowTurnRight } from './svg/ArrowTurnRight.svg';
import { ReactComponent as ArrowForward } from './svg/ArrowForward.svg';
import { ReactComponent as AddIcon } from './svg/Add.svg';
import { ReactComponent as DeleteIcon } from './svg/Delete.svg';
import { ReactComponent as PlayIcon } from './svg/Play.svg';
import './ProgramBlockEditor.scss';

// TODO: Send focus to Delete toggle button on close of Delete All confirmation dialog

type ProgramBlockEditorProps = {
    intl: any,
    activeProgramStepNum: ?number,
    editingDisabled: boolean,
    interpreterIsRunning: boolean,
    minVisibleSteps: number,
    program: Program,
    selectedAction: SelectedAction,
    runButtonDisabled: boolean,
    addModeDescriptionId: string,
    deleteModeDescriptionId: string,
    onClickRunButton: () => void,
    onSelectAction: (selectedAction: SelectedAction) => void,
    onChange: (Program) => void
};

type ProgramBlockEditorState = {
    showConfirmDeleteAll: boolean
};

class ProgramBlockEditor extends React.Component<ProgramBlockEditorProps, ProgramBlockEditorState> {
    commandBlockRefs: Map<number, HTMLElement>;
    focusIndex: ?number;

    constructor(props: ProgramBlockEditorProps) {
        super(props);
        this.commandBlockRefs = new Map();
        this.focusIndex = null;
        this.state = {
            showConfirmDeleteAll : false
        }
    }

    toggleAction(action: 'add' | 'delete') {
        if (this.props.selectedAction
                && this.props.selectedAction.type === 'editorAction'
                && this.props.selectedAction.action === action) {
            this.props.onSelectAction(null);
        } else {
            this.props.onSelectAction({
                type: 'editorAction',
                action: action
            });
        }
    };

    actionIsSelected(action: string) {
        return (this.props.selectedAction
            && this.props.selectedAction.type === 'editorAction'
            && this.props.selectedAction.action === action);
    }

    addIsSelected() {
        return this.actionIsSelected('add');
    }

    deleteIsSelected() {
        return this.actionIsSelected('delete');
    }

    handleClickAdd = () => {
        this.toggleAction('add');
    };

    handleClickDelete = () => {
        this.toggleAction('delete');
    };

    handleClickDeleteAll = () => {
        this.setState({
            showConfirmDeleteAll : true
        });
    }

    handleCancelDeleteAll = () => {
        this.setState({
            showConfirmDeleteAll : false
        });
    }

    handleConfirmDeleteAll = () => {
        this.props.onChange([]);
        this.setState({
            showConfirmDeleteAll : false
        });
    }

    handleClickStep = (e: SyntheticEvent<HTMLButtonElement>) => {
        const index = parseInt(e.currentTarget.dataset.stepnumber, 10);

        if (this.props.selectedAction && this.props.selectedAction.type === 'editorAction') {
            if (this.props.selectedAction.action === 'add') {
                this.focusIndex = index;
                this.props.onChange(ProgramUtils.insert(this.props.program,
                    index, 'none', 'none'));
            } else if (this.props.selectedAction.action === 'delete') {
                this.focusIndex = index;
                this.props.onChange(ProgramUtils.trimEnd(
                    ProgramUtils.deleteStep(this.props.program, index),
                    'none'));
            }
        } else if (this.props.selectedAction && this.props.selectedAction.type === 'command'){
            this.focusIndex = index;
            this.props.onChange(ProgramUtils.overwrite(this.props.program,
                    index, this.props.selectedAction.commandName, 'none'));
        }
    };

    setCommandBlockRef = (programStepNumber: number, element: ?HTMLElement) => {
        if (element) {
            this.commandBlockRefs.set(programStepNumber, element);
        } else {
            this.commandBlockRefs.delete(programStepNumber);
        }
    };

    makeProgramBlock(programStepNumber: number, command: string) {
        const active = this.props.activeProgramStepNum === programStepNumber;
        let classNames = [
            'ProgramBlockEditor__program-block',
            'command-block'
        ];
        if (active) {
            classNames.push('ProgramBlockEditor__program-block--active');
        }
        switch(command) {
            case 'forward':
                return (
                    <Button
                        ref={ (element) => this.setCommandBlockRef(programStepNumber, element) }
                        key={`${programStepNumber}-forward`}
                        data-stepnumber={programStepNumber}
                        className={classNames.join(' ')}
                        variant='command-block--forward'
                        aria-label={
                            this.addIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandForward'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnAdd'})}` :
                            this.deleteIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandForward'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnDelete'})}` :
                            this.props.intl.formatMessage({id:'ProgramBlockEditor.commandForward'}, {index: programStepNumber + 1})
                        }
                        onClick={this.handleClickStep}>
                        <ArrowForward className='command-block-svg'/>
                    </Button>
                );
            case 'left':
                return (
                    <Button
                        ref={ (element) => this.setCommandBlockRef(programStepNumber, element) }
                        key={`${programStepNumber}-left`}
                        data-stepnumber={programStepNumber}
                        className={classNames.join(' ')}
                        variant='command-block--left'
                        aria-label={
                            this.addIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandLeft'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnAdd'})}` :
                            this.deleteIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandLeft'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnDelete'})}` :
                            this.props.intl.formatMessage({id:'ProgramBlockEditor.commandLeft'}, {index: programStepNumber + 1})
                        }
                        onClick={this.handleClickStep}>
                        <ArrowTurnLeft className='command-block-svg'/>
                    </Button>
                );
            case 'right':
                return (
                    <Button
                        ref={ (element) => this.setCommandBlockRef(programStepNumber, element) }
                        key={`${programStepNumber}-right`}
                        data-stepnumber={programStepNumber}
                        className={classNames.join(' ')}
                        variant='command-block--right'
                        aria-label={
                            this.addIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandRight'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnAdd'})}` :
                            this.deleteIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandRight'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnDelete'})}` :
                            this.props.intl.formatMessage({id:'ProgramBlockEditor.commandRight'}, {index: programStepNumber + 1})
                        }
                        onClick={this.handleClickStep}>
                        <ArrowTurnRight className='command-block-svg'/>
                    </Button>
                );
            case 'none':
                return (
                    <Button
                        ref={ (element) => this.setCommandBlockRef(programStepNumber, element) }
                        key={`${programStepNumber}-none`}
                        data-stepnumber={programStepNumber}
                        className={classNames.join(' ')}
                        variant='command-block--none'
                        aria-label={
                            this.addIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandNone'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnAdd'})}` :
                            this.deleteIsSelected() ?
                            `${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandNone'}, {index: programStepNumber + 1})}. ${this.props.intl.formatMessage({id:'ProgramBlockEditor.commandOnDelete'})}` :
                            this.props.intl.formatMessage({id:'ProgramBlockEditor.commandNone'}, {index: programStepNumber + 1})
                        }
                        onClick={this.handleClickStep}>
                    </Button>
                );
            default:
                return (
                    <div key={`${programStepNumber}-unknown`}/>
                );
        }
    }

    render() {
        var noneAtEnd = this.props.program[this.props.program.length - 1] === 'none';

        const programBlocks = this.props.program.map((command, stepNumber) => {
            return this.makeProgramBlock(stepNumber, command);
        });

        // Ensure that we have at least props.minVisibleSteps
        for (var i = this.props.program.length; i < this.props.minVisibleSteps; i++) {
            programBlocks.push(this.makeProgramBlock(i, 'none'));
            noneAtEnd = true;
        }

        // Ensure that the last block is 'none'
        if (!noneAtEnd) {
            programBlocks.push(this.makeProgramBlock(programBlocks.length, 'none'));
        }

        return (
            <Container className='ProgramBlockEditor__container'>
                <Row className='ProgramBlockEditor__header'>
                    <Col>
                        <h2 className='ProgramBlockEditor__heading'>
                            <FormattedMessage id='ProgramBlockEditor.programHeading' />
                        </h2>
                    </Col>
                    <div className='ProgramBlockEditor__editor-actions'>
                        <AriaDisablingButton
                            aria-label={this.props.intl.formatMessage({id:'ProgramBlockEditor.editorAction.add'})}
                            aria-describedby={this.props.addModeDescriptionId}
                            className={this.addIsSelected() ?
                                        'ProgramBlockEditor__editor-action-button ProgramBlockEditor__editor-action-button--pressed' :
                                        'ProgramBlockEditor__editor-action-button'}
                            disabledClassName='ProgramBlockEditor__editor-action-button--disabled'
                            disabled={this.props.editingDisabled}
                            onClick={this.handleClickAdd}
                            aria-pressed={this.addIsSelected() ? 'true' : 'false'}
                            key='addButton'
                        >
                            <AddIcon className='ProgramBlockEditor__editor-action-button-svg'/>
                        </AriaDisablingButton>

                        <AriaDisablingButton
                            aria-label={this.props.intl.formatMessage({id:'ProgramBlockEditor.editorAction.delete'})}
                            aria-describedby={this.props.deleteModeDescriptionId}
                            className={this.deleteIsSelected() ?
                                        'ProgramBlockEditor__editor-action-button ProgramBlockEditor__editor-action-button--pressed' :
                                        'ProgramBlockEditor__editor-action-button'}
                            disabledClassName='ProgramBlockEditor__editor-action-button--disabled'
                            disabled={this.props.editingDisabled}
                            onClick={this.handleClickDelete}
                            aria-pressed={this.deleteIsSelected() ? 'true' : 'false'}
                            key='deleteButton'
                        >
                            <DeleteIcon className='ProgramBlockEditor__editor-action-button-svg'/>
                        </AriaDisablingButton>
                    </div>
                </Row>
                <Row className='ProgramBlockEditor__delete-all-button-container'>
                    <Collapse in={this.deleteIsSelected()}>
                        <Button
                            aria-label={this.props.intl.formatMessage({id:'ProgramBlockEditor.deleteAll'})}
                            className='ProgramBlockEditor__delete-all-button'
                            onClick={this.handleClickDeleteAll}
                        >
                            <FormattedMessage id='ProgramBlockEditor.deleteAll' />
                        </Button>
                    </Collapse>
                </Row>
                <Row>
                    <Col className='ProgramBlockEditor__program-sequence-scroll-container'>
                        <div className='ProgramBlockEditor__program-sequence'>
                            <div className='ProgramBlockEditor__start-indicator'>
                                {this.props.intl.formatMessage({id:'ProgramBlockEditor.startIndicator'})}
                            </div>
                            {programBlocks}
                        </div>
                    </Col>
                </Row>
                <Row className='ProgramBlockEditor__footer'>
                    <Col>
                        <AriaDisablingButton
                            aria-label={`${this.props.intl.formatMessage({id:'PlayButton.run'})} ${this.props.program.join(' ')}`}
                            className={this.props.interpreterIsRunning ?
                                'ProgramBlockEditor__run-button ProgramBlockEditor__run-button--pressed' :
                                'ProgramBlockEditor__run-button'}
                            disabledClassName='ProgramBlockEditor__run-button--disabled'
                            disabled={this.props.runButtonDisabled}
                            onClick={this.props.onClickRunButton}
                        >
                            <PlayIcon className='ProgramBlockEditor__play-svg' />
                        </AriaDisablingButton>
                    </Col>
                </Row>
                <ConfirmDeleteAllModal
                    show={this.state.showConfirmDeleteAll}
                    onCancel={this.handleCancelDeleteAll}
                    onConfirm={this.handleConfirmDeleteAll}/>
            </Container>
        );
    }

    componentDidUpdate() {
        if (this.focusIndex != null) {
            let element = this.commandBlockRefs.get(this.focusIndex);
            if (element) {
                element.focus();
            }
            this.focusIndex = null;
        }
        if (this.props.activeProgramStepNum != null) {
            let element = this.commandBlockRefs.get(this.props.activeProgramStepNum);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }
}

export default injectIntl(ProgramBlockEditor);
