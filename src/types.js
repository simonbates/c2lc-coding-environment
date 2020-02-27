// @flow

export type DeviceConnectionStatus = 'notConnected' | 'connecting' | 'connected';

export type EditorMode = 'text' | 'block';

export type Program = Array<string>;

export interface RobotDriver {
    onConnected(callback: (RobotConnection) => void): void;
    connect(): void;
};

export interface RobotConnection {
    onDisconnected(callback: () => void): void;
    forward(): Promise<void>;
    left(): Promise<void>;
    right(): Promise<void>;
};

export type SelectedAction =
    null
    |
    {
        type: 'command',
        commandName: string
    }
    |
    {
        type: 'editorAction',
        action: 'add' | 'delete'
    }
;
