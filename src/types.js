// @flow

export type DeviceConnectionStatus = 'notConnected' | 'connecting' | 'connected';

export type EditorMode = 'text' | 'block';

export type Program = Array<string>;

export interface RobotDriver {
    connect(onDisconnected: () => void): Promise<void>;
    forward(): Promise<void>;
    left(): Promise<void>;
    right(): Promise<void>;
};
