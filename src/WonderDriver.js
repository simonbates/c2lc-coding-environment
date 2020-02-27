// @flow

import type { RobotDriver, RobotConnection } from './types';
import WonderJS from '@wonderworkshop/wwjs';

class WonderConnection implements RobotConnection {
    robot: any;
    isConnected: boolean;
    onDisconnectedCallback: (() => void) | null;
    poseStarted: boolean;
    onPoseFinished: (() => void) | null;

    constructor(robot: any) {
        this.robot = robot;
        this.isConnected = true;
        this.onDisconnectedCallback = null;
        this.poseStarted = false;
        this.onPoseFinished = null;
    }

    onDisconnected(callback: () => void) {
        this.onDisconnectedCallback = callback;
        if (!this.isConnected) {
            callback();
        }
    }

    handleDisconnect = () => {
        this.isConnected = false;
        if (this.onDisconnectedCallback) {
            this.onDisconnectedCallback();
        }
    };

    handleSensor = (msg: any) => {
        if (msg.sensors.BODY_POSE != null && msg.sensors.BODY_POSE.hasOwnProperty('watermark')) {
            if (msg.sensors.BODY_POSE.watermark !== 255) {
                this.poseStarted = true;
            }
            else if (this.poseStarted && msg.sensors.BODY_POSE.watermark === 255 && this.onPoseFinished) {
                this.onPoseFinished();
                this.onPoseFinished = null;
                this.poseStarted = false;
            }
        }
    };

    forward(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.onPoseFinished = () => {
                resolve();
            };
            this.robot.command.pose(20, 0, 0, 1);
        });
    }

    left(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.onPoseFinished = () => {
                resolve();
            };
            this.robot.command.pose(0, 0, 90, 1);
        });
    }

    right(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.onPoseFinished = () => {
                resolve();
            };
            this.robot.command.pose(0, 0, -90, 1);
        });
    }
}

export default class WonderDriver implements RobotDriver {
    connections: Map<any, WonderConnection>;
    onConnectedCallback: ((RobotConnection) => void) | null;

    constructor() {
        this.connections = new Map();
        this.onConnectedCallback = null;

        WonderJS.addEventListener('onconnect', this.handleConnect);
        WonderJS.addEventListener('ondisconnect', this.handleDisconnect);
        WonderJS.addEventListener('onsensor', this.handleSensor);
    }

    handleConnect = (robot: any) => {
        if (this.onConnectedCallback) {
            const connection = new WonderConnection(robot);
            this.connections.set(robot.id, connection);
            if (this.onConnectedCallback) {
                this.onConnectedCallback(connection);
            }
        }
    };

    handleDisconnect = (robotId: any) => {
        // Dispatch to the appropriate connection
        const connection = this.connections.get(robotId);
        if (connection) {
            connection.handleDisconnect();
            // Remove the connection from the connections collection
            this.connections.delete(robotId);
        }
    };

    handleSensor = (msg: any) => {
        // Dispatch the sensor message to the appropriate connection
        const connection = this.connections.get(msg.id);
        if (connection) {
            connection.handleSensor(msg);
        }
    };

    onConnected(callback: (RobotConnection) => void) {
        this.onConnectedCallback = callback;
    }

    connect() {
        WonderJS.connect();
    }
}
