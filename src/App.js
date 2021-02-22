// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';
import type {IntlShape} from 'react-intl';
import { Col, Container, Row } from 'react-bootstrap';
import AudioManagerImpl from './AudioManagerImpl';
import CharacterState from './CharacterState';
import CharacterStateSerializer from './CharacterStateSerializer';
import CommandPaletteCommand from './CommandPaletteCommand';
import C2lcURLParams from './C2lcURLParams';
import RobotConnectionErrorModal from './RobotConnectionErrorModal';
import ArduinoDriver from './ArduinoDriver';
import * as FeatureDetection from './FeatureDetection';
import FakeAudioManager from './FakeAudioManager';
import FocusTrapManager from './FocusTrapManager';
import Interpreter from './Interpreter';
import PlayButton from './PlayButton';
import ProgramBlockEditor from './ProgramBlockEditor';
import RefreshButton from './RefreshButton';
import Scene from './Scene';
import SceneDimensions from './SceneDimensions';
import StopButton from './StopButton';
import ThemeSelector from './ThemeSelector';
import AudioFeedbackToggleSwitch from './AudioFeedbackToggleSwitch';
import PenDownToggleSwitch from './PenDownToggleSwitch';
import ProgramSequence from './ProgramSequence';
import ProgramSpeedController from './ProgramSpeedController';
import ProgramSerializer from './ProgramSerializer';
import ShareButton from './ShareButton';
import type { AudioManager, DeviceConnectionStatus, RobotDriver, RunningState, ThemeName } from './types';
import * as Utils from './Utils';
import './App.scss';
import './Themes.css';
import './vendor/dragdroptouch/DragDropTouch.js';
import DeviceConnectControl from './DeviceConnectControl';
/* Dash connection removed for version 0.5
import BluetoothApiWarning from './BluetoothApiWarning';
*/

// Uncomment to use the FakeRobotDriver (see driver construction below also)
//import FakeRobotDriver from './FakeRobotDriver';


type AppContext = {
    bluetoothApiIsAvailable: boolean
};

type AppSettings = {
    language: string,
    addNodeExpandedMode: boolean,
    theme: ThemeName
};

type AppProps = {
    intl: IntlShape,
    audioManager?: AudioManager
};

type AppState = {
    programSequence: ProgramSequence,
    characterState: CharacterState,
    settings: AppSettings,
    arduinoConnectionStatus: DeviceConnectionStatus,
    showRobotConnectionError: boolean,
    selectedAction: ?string,
    isDraggingCommand: boolean,
    audioEnabled: boolean,
    actionPanelStepIndex: ?number,
    sceneDimensions: SceneDimensions,
    drawingEnabled: boolean,
    runningState: RunningState
};

export class App extends React.Component<AppProps, AppState> {
    version: string;
    appContext: AppContext;
    arduinoDriver: RobotDriver;
    interpreter: Interpreter;
    audioManager: AudioManager;
    focusTrapManager: FocusTrapManager;
    startingCharacterState: CharacterState;
    programSerializer: ProgramSerializer;
    characterStateSerializer: CharacterStateSerializer;
    speedLookUp: Array<number>;

    constructor(props: any) {
        super(props);

        this.version = '0.6';

        this.appContext = {
            bluetoothApiIsAvailable: FeatureDetection.bluetoothApiIsAvailable()
        };

        // Begin facing East
        this.startingCharacterState = new CharacterState(0, 0, 2, []);

        this.state = {
            programSequence: new ProgramSequence([], 0),
            characterState: this.startingCharacterState,
            settings: {
                language: 'en',
                addNodeExpandedMode: true,
                theme: 'default'
            },
            arduinoConnectionStatus: 'notConnected',
            showRobotConnectionError: false,
            selectedAction: null,
            isDraggingCommand: false,
            audioEnabled: true,
            actionPanelStepIndex: null,
            sceneDimensions: new SceneDimensions(17, 9),
            drawingEnabled: true,
            runningState: 'stopped'
        };

        this.interpreter = new Interpreter(1000, this);

        this.speedLookUp = [2000, 1500, 1000, 500, 250];

        this.programSerializer = new ProgramSerializer();

        this.characterStateSerializer = new CharacterStateSerializer();

        this.interpreter.addCommandHandler(
            'forward1',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('forward1', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.forward(1, state.drawingEnabled);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("movement", stepTimeMs, newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'forward2',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('forward2', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.forward(2, state.drawingEnabled);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("movement", stepTimeMs, newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'forward3',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('forward3', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.forward(3, state.drawingEnabled);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("movement", stepTimeMs, newCharacterState);
                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'left45',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // We want for a 180 degree turn to take the whole movement delay, and for a 45 degree to take 1/4 of that.
                const soundTime = stepTimeMs / 4;

                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('left45', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.turnLeft(1);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("left", soundTime, newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'left90',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // We want for a 180 degree turn to take the whole movement delay, and for a 90 degree turn to take 1/2 of that.
                const soundTime = stepTimeMs / 2;

                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('left90', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.turnLeft(2);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("left", soundTime, newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'left180',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('left180', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.turnLeft(4);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("left", stepTimeMs,  newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'right45',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // We want for a 180 degree turn to take the whole movement delay, and for a 45 degree turn to take 1/4 of that.
                const soundTime = stepTimeMs / 2;

                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('right45', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.turnRight(1);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("right", soundTime, newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'right90',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // We want for a 180 degree turn to take the whole movement delay, and for a 90 degree to take 1/2 of that.
                const soundTime = stepTimeMs / 2;

                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('right90', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.turnRight(2);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("right", soundTime, newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        this.interpreter.addCommandHandler(
            'right180',
            'moveCharacter',
            (interpreter, stepTimeMs) => {
                // TODO: Enable announcements again.
                // this.audioManager.playAnnouncement('right180', this.props.intl);
                this.setState((state) => {
                    const newCharacterState = state.characterState.turnRight(4);

                    // We have to start the sound here because this is where we know the new character state.
                    this.audioManager.playSoundForCharacterState("right", stepTimeMs, newCharacterState);

                    return {
                        characterState: newCharacterState
                    };
                });
                return Utils.makeDelayedPromise(stepTimeMs);
            }
        );

        // For FakeRobotDriver, replace with:
        // this.arduinoDriver = new FakeRobotDriver();
        this.arduinoDriver = new ArduinoDriver();

        if (props.audioManager) {
            this.audioManager = props.audioManager
        }
        else if (FeatureDetection.webAudioApiIsAvailable()) {
            this.audioManager = new AudioManagerImpl(this.state.audioEnabled);
        }
        else {
            this.audioManager = new FakeAudioManager();
        }

        this.focusTrapManager = new FocusTrapManager();
    }

    setStateSettings(settings: $Shape<AppSettings>) {
        this.setState((state) => {
            return {
                settings: Object.assign({}, state.settings, settings)
            }
        });
    }

    getSelectedCommandName() {
        if (this.state.selectedAction !== null) {
            return this.state.selectedAction;
        } else {
            return null;
        }
    }

    setRunningState(runningState: RunningState): void {
        this.setState((state) => {
            // If stop is requested when we are in the 'paused' state,
            // then go straight to 'stopped'
            if (runningState === 'stopRequested' && state.runningState === 'paused') {
                return { runningState: 'stopped' };
            } else {
                return { runningState };
            }
        });
    }

    // API for Interpreter

    getProgramSequence(): ProgramSequence {
        return this.state.programSequence;
    }

    getRunningState(): RunningState {
        return this.state.runningState;
    }

    incrementProgramCounter(callback: () => void): void {
        this.setState((state) => {
            return {
                programSequence: state.programSequence.incrementProgramCounter()
            }
        }, callback);
    }

    // Handlers

    handleProgramSequenceChange = (programSequence: ProgramSequence) => {
        this.setState({ programSequence });
    }

    handleClickPlay = () => {
        switch (this.state.runningState) {
            case 'running':
                this.setState({ runningState: 'pauseRequested' });
                break;
            case 'pauseRequested': // Fall through
            case 'paused':
                this.setState({ runningState: 'running' });
                break;
            case 'stopRequested': // Fall through
            case 'stopped':
                this.setState((state) => {
                    return {
                        programSequence: state.programSequence.updateProgramCounter(0),
                        runningState: 'running'
                    };
                });
                break;
            default:
                break;
        }
    };

    handleClickStop = () => {
        this.setRunningState('stopRequested');
    }

    handleClickConnectArduino = () => {
        this.setState({
            arduinoConnectionStatus: 'connecting',
            showRobotConnectionError: false
        });
        this.arduinoDriver.connect(this.handleArduinoDisconnect).then(() => {
            this.setState({
                arduinoConnectionStatus: 'connected'
            });
        }, (error: Error) => {
            console.log('ERROR');
            console.log(error.name);
            console.log(error.message);
            this.setState({
                arduinoConnectionStatus: 'notConnected',
                showRobotConnectionError: true
            });
        });
    };

    handleCancelArduinoConnection = () => {
        this.setState({
            showRobotConnectionError: false
        });
    };

    handleArduinoDisconnect = () => {
        this.setState({
            arduinoConnectionStatus : 'notConnected'
        });
    };

    handleCommandFromCommandPalette = (command: ?string) => {
        if (command) {
            this.setState({
                selectedAction: command
            });
        } else {
            this.setState({
                selectedAction: null
            });
        }
    };

    handleDragStartCommand = (command: string) => {
        this.setState({
            isDraggingCommand: true,
            selectedAction: command,
            actionPanelStepIndex: null
        });
    };

    handleDragEndCommand = () => {
        this.setState({ isDraggingCommand: false });
    };

    handleChangeActionPanelStepIndex = (index: ?number) => {
        this.setState({
            actionPanelStepIndex: index
        });
    };

    handleChangeAddNodeExpandedMode = (isAddNodeExpandedMode: boolean) => {
        this.setStateSettings({
            addNodeExpandedMode: isAddNodeExpandedMode
        });
    };

    handleRootClick = (e: SyntheticInputEvent<HTMLInputElement>) => {
        let element = e.target;
        // Walk up the document tree until we hit the top, or we find that
        // we are within an action panel group area
        while (element != null && element.dataset) {
            if (element.dataset.actionpanelgroup) {
                // We are within an action panel group area, stop looking
                return;
            }
            element = element.parentElement;
        }
        // We hit the top, close the action panel
        this.setState({
            actionPanelStepIndex: null
        });
    };

    handleRootKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
        this.focusTrapManager.handleKeyDown(e);
    };

    handleToggleAudioFeedback = (audioEnabled: boolean) => {
        this.setState({
            audioEnabled: audioEnabled
        });
    }

    handleTogglePenDown = (drawingEnabled: boolean) => {
        this.setState({
            drawingEnabled: drawingEnabled
        });
    }

    handleChangeProgramSpeed = (stepTimeMs: number) => {
        this.interpreter.setStepTime(stepTimeMs);
    }

    renderCommandBlocks = () => {
        const commandNames = [
            'forward1', 'forward2', 'forward3',
            'left45', 'left90', 'left180',
            'right45', 'right90', 'right180'
        ];
        const commandBlocks = [];

        for (const [index, value] of commandNames.entries()) {
            commandBlocks.push(
                <CommandPaletteCommand
                    key={`CommandBlock-${index}`}
                    commandName={value}
                    selectedCommandName={this.getSelectedCommandName()}
                    audioManager={this.audioManager}
                    isDraggingCommand={this.state.isDraggingCommand}
                    onChange={this.handleCommandFromCommandPalette}
                    onDragStart={this.handleDragStartCommand}
                    onDragEnd={this.handleDragEndCommand}/>
            )
        }

        return commandBlocks;
    }

    handleRefresh = () => {
        this.setState({
            characterState: this.startingCharacterState
        });
    }

    handleChangeTheme = (theme: ThemeName) => {
        this.setStateSettings({ theme });
    }

    render() {
        return (
            <React.Fragment>
                <div
                    onClick={this.handleRootClick}
                    onKeyDown={this.handleRootKeyDown}>
                    <header className='App__header'>
                        <Container className='App__title'>
                            <Row className='App__header-row'>
                                <h1 className='App__app-heading'>
                                    <FormattedMessage id='App.appHeading'/>
                                </h1>
                                <div className='App__header-right'>
                                    <div className='App__audio-toggle-switch'>
                                        <AudioFeedbackToggleSwitch
                                            value={this.state.audioEnabled}
                                            onChange={this.handleToggleAudioFeedback} />
                                    </div>
                                    <DeviceConnectControl
                                        disabled={
                                            !this.appContext.bluetoothApiIsAvailable ||
                                            this.state.arduinoConnectionStatus === 'connected' }
                                        connectionStatus={this.state.arduinoConnectionStatus}
                                        onClickConnect={this.handleClickConnectArduino}>
                                        <FormattedMessage id='App.connectToArduino' />
                                    </DeviceConnectControl>
                                    <ThemeSelector onSelect={this.handleChangeTheme} />
                                </div>
                            </Row>
                        </Container>
                    </header>
                    <Container
                        className='App__container mb-5'
                        role='main'>
                        {/* Dash connection removed for version 0.5
                        {!this.appContext.bluetoothApiIsAvailable &&
                            <Row className='App__bluetooth-api-warning-section'>
                                <Col>
                                    <BluetoothApiWarning/>
                                </Col>
                            </Row>
                        }
                        */}
                        <div className='App__scene-container'>
                            <Scene
                                dimensions={this.state.sceneDimensions}
                                characterState={this.state.characterState}
                                theme={this.state.settings.theme}
                            />
                            <div className='App__scene-controls'>
                                <div className='App__scene-controls-group'>
                                    <div className='App__penDown-toggle-switch-container'>
                                        <PenDownToggleSwitch
                                            className='App__penDown-toggle-switch'
                                            value={this.state.drawingEnabled}
                                            onChange={this.handleTogglePenDown}/>
                                    </div>
                                    <div className='App__refreshButton-container'>
                                        <RefreshButton
                                            disabled={this.state.runningState === 'running'}
                                            onClick={this.handleRefresh}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Row className='App__program-section' noGutters={true}>
                            <Col md={6} lg={4} className='pr-md-4 mb-4 mb-md-0'>
                                <div className='App__command-palette'>
                                    <h2 className='App__command-palette-heading'>
                                        <FormattedMessage id='CommandPalette.movementsTitle' />
                                    </h2>
                                    <div className='App__command-palette-commands'>
                                        {this.renderCommandBlocks()}
                                    </div>
                                </div>
                            </Col>
                            <Col md={6} lg={8}>
                                <ProgramBlockEditor
                                    actionPanelStepIndex={this.state.actionPanelStepIndex}
                                    editingDisabled={
                                        !(this.state.runningState === 'stopped'
                                        || this.state.runningState === 'paused')}
                                    audioManager={this.audioManager}
                                    programSequence={this.state.programSequence}
                                    runningState={this.state.runningState}
                                    selectedAction={this.state.selectedAction}
                                    isDraggingCommand={this.state.isDraggingCommand}
                                    focusTrapManager={this.focusTrapManager}
                                    addNodeExpandedMode={this.state.settings.addNodeExpandedMode}
                                    theme={this.state.settings.theme}
                                    onChangeProgramSequence={this.handleProgramSequenceChange}
                                    onChangeActionPanelStepIndex={this.handleChangeActionPanelStepIndex}
                                    onChangeAddNodeExpandedMode={this.handleChangeAddNodeExpandedMode}
                                />
                            </Col>
                        </Row>
                        <div className='App__playAndShare-container'>
                            <div className='App__playControl-container'>
                                <div className='App__playButton-container'>
                                    <PlayButton
                                        className='App__playButton'
                                        interpreterIsRunning={this.state.runningState === 'running'}
                                        disabled={this.state.programSequence.getProgramLength() === 0}
                                        onClick={this.handleClickPlay}
                                    />
                                    <StopButton
                                        disabled={
                                            this.state.runningState === 'stopped'
                                            || this.state.runningState === 'stopRequested'}
                                        onClick={this.handleClickStop}/>
                                </div>
                                <ProgramSpeedController
                                    values={this.speedLookUp}
                                    onChange={this.handleChangeProgramSpeed}
                                />
                            </div>
                            <div className='App__shareButton-container'>
                                <ShareButton/>
                            </div>
                        </div>
                    </Container>
                </div>
                <RobotConnectionErrorModal
                    show={this.state.showRobotConnectionError}
                    onCancel={this.handleCancelArduinoConnection}
                    onRetry={this.handleClickConnectArduino}/>
            </React.Fragment>
        );
    }

    componentDidMount() {
        if (window.location.search != null && window.location.search !== '') {
            const params = new C2lcURLParams(window.location.search);
            const programQuery = params.getProgram();
            const characterStateQuery = params.getCharacterState();
            const themeQuery = params.getTheme();
            if (programQuery != null && characterStateQuery != null) {
                try {
                    this.setState({
                        programSequence: new ProgramSequence(this.programSerializer.deserialize(programQuery), 0),
                        characterState: this.characterStateSerializer.deserialize(characterStateQuery)
                    });
                } catch(err) {
                    console.log(`Error parsing program: ${programQuery} or characterState: ${characterStateQuery}`);
                    console.log(err.toString());
                }
            }
            this.setStateSettings({ theme: Utils.getThemeFromString(themeQuery, 'default') });
        } else {
            const localProgram = window.localStorage.getItem('c2lc-program');
            const localCharacterState = window.localStorage.getItem('c2lc-characterState');
            const localTheme = window.localStorage.getItem('c2lc-theme');
            if (localProgram != null && localCharacterState != null) {
                try {
                    this.setState({
                        programSequence: new ProgramSequence(this.programSerializer.deserialize(localProgram), 0),
                        characterState: this.characterStateSerializer.deserialize(localCharacterState)
                    });
                } catch(err) {
                    console.log(`Error parsing program: ${localProgram} or characterState: ${localCharacterState}`);
                    console.log(err.toString());
                }
            }
            this.setStateSettings({ theme: Utils.getThemeFromString(localTheme, 'default') });
        }
    }

    componentDidUpdate(prevProps: {}, prevState: AppState) {
        if (this.state.programSequence !== prevState.programSequence
            || this.state.characterState !== prevState.characterState
            || this.state.settings.theme !== prevState.settings.theme) {
            const serializedProgram = this.programSerializer.serialize(this.state.programSequence.getProgram());
            const serializedCharacterState = this.characterStateSerializer.serialize(this.state.characterState);
            window.history.pushState(
                {
                    p: serializedProgram,
                    c: serializedCharacterState,
                    t: this.state.settings.theme
                },
                '',
                Utils.generateEncodedProgramURL(this.version, this.state.settings.theme, serializedProgram, serializedCharacterState)
            );
            window.localStorage.setItem('c2lc-version', this.version);
            window.localStorage.setItem('c2lc-program', serializedProgram);
            window.localStorage.setItem('c2lc-characterState', serializedCharacterState);
            window.localStorage.setItem('c2lc-theme', this.state.settings.theme);
        }
        if (this.state.audioEnabled !== prevState.audioEnabled) {
            this.audioManager.setAudioEnabled(this.state.audioEnabled);
        }
        if (this.state.runningState !== prevState.runningState
                && this.state.runningState === 'running') {
            this.interpreter.startRun();
        }
        if (this.state.settings.theme !== prevState.settings.theme) {
            if (document.body) {
                if (this.state.settings.theme === 'default') {
                    document.body.className = '';
                } else {
                    document.body.className = `${this.state.settings.theme}-theme`;
                }
            }
        }
        if (this.state.selectedAction !== prevState.selectedAction) {
            const messagePayload = {};
            const announcementKey = this.state.selectedAction ?
                "movementSelected" : "noMovementSelected";
            if (this.state.selectedAction) {
                const commandString = this.props.intl.formatMessage({
                    id: "Announcement." + this.state.selectedAction
                });
                messagePayload.command = commandString;
            }
            this.audioManager.playAnnouncement(announcementKey,
                    this.props.intl, messagePayload);
        }

        if (this.state.programSequence !== prevState.programSequence) {
            if (this.state.programSequence.getProgramLength() === 0) {
                // All steps have been deleted
                this.setState({ runningState: 'stopped' });
            } else if (this.state.programSequence.getProgramCounter()
                    >= this.state.programSequence.getProgramLength()) {
                // All steps from the programCounter onward have been deleted
                this.setState({ runningState: 'stopped' });
            }
        }

        if (this.state.arduinoConnectionStatus !== prevState.arduinoConnectionStatus) {
            console.log(this.state.arduinoConnectionStatus);

            if (this.state.arduinoConnectionStatus === 'connected') {
                this.interpreter.addCommandHandler('forward1', 'arduino',
                    this.arduinoDriver.forward.bind(this.arduinoDriver));
                this.interpreter.addCommandHandler('left45', 'arduino',
                    this.arduinoDriver.left.bind(this.arduinoDriver));
                this.interpreter.addCommandHandler('right45', 'arduino',
                    this.arduinoDriver.right.bind(this.arduinoDriver));
            }
        }
    }
}

export default injectIntl(App);
