// @flow

import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { Col, Container, Row } from 'react-bootstrap';
import BluetoothApiWarning from './BluetoothApiWarning';
import CommandPaletteCommand from './CommandPaletteCommand';
import DashConnectionErrorModal from './DashConnectionErrorModal';
import DashDriver from './DashDriver';
import DeviceConnectControl from './DeviceConnectControl';
import * as FeatureDetection from './FeatureDetection';
import Interpreter from './Interpreter';
import type { InterpreterRunningState } from './Interpreter';
import ProgramBlockEditor from './ProgramBlockEditor';
import * as Utils from './Utils';
import type {DeviceConnectionStatus, Program, SelectedAction} from './types';
import messages from './messages.json';
import './App.scss';
import { ReactComponent as ArrowForward } from './svg/ArrowForward.svg';
import { ReactComponent as ArrowTurnLeft } from './svg/ArrowTurnLeft.svg';
import { ReactComponent as ArrowTurnRight } from './svg/ArrowTurnRight.svg';
import AddModeImage from './AddModeImage';
import DeleteModeImage from './DeleteModeImage';

type AppContext = {
    bluetoothApiIsAvailable: boolean
};

type AppSettings = {
    language: string
};

type AppState = {
    program: Program,
    settings: AppSettings,
    dashConnectionStatus: DeviceConnectionStatus,
    activeProgramStepNum: ?number,
    interpreterIsRunning: boolean,
    showDashConnectionError: boolean,
    selectedAction: SelectedAction
};

export default class App extends React.Component<{}, AppState> {
    appContext: AppContext;
    dashDriver: DashDriver;
    interpreter: Interpreter;
    addModeDescriptionId: string;
    deleteModeDescriptionId: string;

    constructor(props: {}) {
        super(props);

        this.appContext = {
            bluetoothApiIsAvailable: FeatureDetection.bluetoothApiIsAvailable()
        };

        this.state = {
            program: [],
            settings: {
                language: 'en'
            },
            dashConnectionStatus: 'notConnected',
            activeProgramStepNum: null,
            interpreterIsRunning: false,
            showDashConnectionError: false,
            selectedAction: null
        };

        this.interpreter = new Interpreter(this.handleRunningStateChange);

        this.interpreter.addCommandHandler(
            'none',
            'noneHandler',
            () => {
                return Promise.resolve();
            }
        );

        this.dashDriver = new DashDriver();

        this.addModeDescriptionId = Utils.generateId('addModeDescription');
        this.deleteModeDescriptionId = Utils.generateId('deleteModeDescription');
    }

    setStateSettings(settings: $Shape<AppSettings>) {
        this.setState((state) => {
            return {
                settings: Object.assign({}, state.settings, settings)
            }
        });
    }

    getSelectedCommandName() {
        if (this.state.selectedAction !== null
                && this.state.selectedAction.type === 'command') {
            return this.state.selectedAction.commandName;
        } else {
            return null;
        }
    }

    handleChangeProgram = (program: Program) => {
        this.setState({
            program: program
        });
    };

    handleClickRun = () => {
        this.interpreter.run(this.state.program).then(
            () => {}, // Do nothing on successful resolution
            (error) => {
                console.log(error.name);
                console.log(error.message);
            }
        );
    };

    handleClickConnectDash = () => {
        this.setState({
            dashConnectionStatus: 'connecting',
            showDashConnectionError: false
        });
        this.dashDriver.connect(this.handleDashDisconnect).then(() => {
            this.setState({
                dashConnectionStatus: 'connected'
            });
        }, (error) => {
            console.log('ERROR');
            console.log(error.name);
            console.log(error.message);
            this.setState({
                dashConnectionStatus: 'notConnected',
                showDashConnectionError: true
            });
        });
    };

    handleCancelDashConnection = () => {
        this.setState({
            showDashConnectionError: false
        });
    };

    handleDashDisconnect = () => {
        this.setState({
            dashConnectionStatus : 'notConnected'
        });
    };

    handleCommandFromCommandPalette = (command: ?string) => {
        if (command) {
            this.setState({
                selectedAction: {
                    type: 'command',
                    commandName: command
                }
            });
        } else {
            this.setState({
                selectedAction: null
            });
        }
    };

    handleSelectAction = (action: SelectedAction) => {
        this.setState({
            selectedAction: action
        });
    };

    handleRunningStateChange = ( interpreterRunningState : InterpreterRunningState) => {
        this.setState({
            activeProgramStepNum: interpreterRunningState.activeStep,
            interpreterIsRunning: interpreterRunningState.isRunning
        });
    }

    render() {
        return (
            <IntlProvider
                    locale={this.state.settings.language}
                    messages={messages[this.state.settings.language]}>
                <div className='App__heading-section'>
                    <Container>
                        <Row>
                            <Col>
                                <h1 className='App__app-heading'>
                                    <FormattedMessage id='App.appHeading'/>
                                </h1>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <Container className='mb-5'>
                    <Row className='App__robot-connection-section'>
                        <Col>
                            {!this.appContext.bluetoothApiIsAvailable &&
                                <BluetoothApiWarning/>
                            }
                        </Col>
                        <Col md='auto'>
                            <DeviceConnectControl
                                    disabled={!this.appContext.bluetoothApiIsAvailable}
                                    connectionStatus={this.state.dashConnectionStatus}
                                    onClickConnect={this.handleClickConnectDash}>
                                <FormattedMessage id='App.connectToDash' />
                            </DeviceConnectControl>
                        </Col>
                    </Row>
                    <Row className='App__program-section' noGutters={true}>
                        <Col md={4} lg={3} className='pr-md-3 mb-3 mb-md-0'>
                            <div className='App__command-palette'>
                                <h2 className='App__command-palette-heading'>
                                    <FormattedMessage id='CommandPalette.movementsTitle' />
                                </h2>
                                <div className='App__command-palette-command'>
                                    <CommandPaletteCommand
                                        commandName='forward'
                                        icon={React.createElement(
                                            ArrowForward,
                                            {className:'command-block-svg'}
                                        )}
                                        selectedCommandName={this.getSelectedCommandName()}
                                        onChange={this.handleCommandFromCommandPalette}/>
                                </div>
                                <div className='App__command-palette-command'>
                                    <CommandPaletteCommand
                                        commandName='right'
                                        icon={React.createElement(
                                            ArrowTurnRight,
                                            {className:'command-block-svg'}
                                        )}
                                        selectedCommandName={this.getSelectedCommandName()}
                                        onChange={this.handleCommandFromCommandPalette}/>
                                </div>
                                <div className='App__command-palette-command'>
                                    <CommandPaletteCommand
                                        commandName='left'
                                        icon={React.createElement(
                                            ArrowTurnLeft,
                                            {className:'command-block-svg'}
                                        )}
                                        selectedCommandName={this.getSelectedCommandName()}
                                        onChange={this.handleCommandFromCommandPalette}/>
                                </div>
                            </div>
                        </Col>
                        <Col md={8} lg={9}>
                            <ProgramBlockEditor
                                activeProgramStepNum={this.state.activeProgramStepNum}
                                editingDisabled={this.state.interpreterIsRunning === true}
                                interpreterIsRunning={this.state.interpreterIsRunning}
                                minVisibleSteps={6}
                                program={this.state.program}
                                selectedAction={this.state.selectedAction}
                                runButtonDisabled={
                                    this.state.dashConnectionStatus !== 'connected' ||
                                    this.state.interpreterIsRunning}
                                addModeDescriptionId={this.addModeDescriptionId}
                                deleteModeDescriptionId={this.deleteModeDescriptionId}
                                onClickRunButton={this.handleClickRun}
                                onSelectAction={this.handleSelectAction}
                                onChange={this.handleChangeProgram}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h2 className='App__instructions-heading'>
                                <FormattedMessage id='App.instructions.heading' />
                            </h2>
                            <h3 className="App__instructions-section-heading">
                                <FormattedMessage id='App.instructions.addHeading' />
                            </h3>
                            <div className='App__instructions-text' id={this.addModeDescriptionId}>
                                <FormattedMessage id='App.instructions.addText1' />
                                <AddModeImage className='App__add-mode-image'/>
                                <FormattedMessage id='App.instructions.addText2' />
                            </div>
                            <h3 className="App__instructions-section-heading">
                                <FormattedMessage id='App.instructions.deleteHeading' />
                            </h3>
                            <div className='App__instructions-text' id={this.deleteModeDescriptionId}>
                                <FormattedMessage id='App.instructions.deleteText1' />
                                <DeleteModeImage className='App__delete-mode-image'/>
                                <FormattedMessage id='App.instructions.deleteText2' />
                            </div>
                        </Col>
                    </Row>
                </Container>
                <DashConnectionErrorModal
                    show={this.state.showDashConnectionError}
                    onCancel={this.handleCancelDashConnection}
                    onRetry={this.handleClickConnectDash}/>
            </IntlProvider>
        );
    }

    componentDidUpdate(prevProps: {}, prevState: AppState) {
        if (this.state.dashConnectionStatus !== prevState.dashConnectionStatus) {
            console.log(this.state.dashConnectionStatus);

            if (this.state.dashConnectionStatus === 'connected') {
                this.interpreter.addCommandHandler('forward', 'dash',
                    this.dashDriver.forward.bind(this.dashDriver));
                this.interpreter.addCommandHandler('left', 'dash',
                    this.dashDriver.left.bind(this.dashDriver));
                this.interpreter.addCommandHandler('right', 'dash',
                    this.dashDriver.right.bind(this.dashDriver));
            } else if (this.state.dashConnectionStatus === 'notConnected') {
                // TODO: Remove Dash handlers

                if (this.state.interpreterIsRunning) {
                    this.interpreter.stop();
                }
            }
        }
    }
}
