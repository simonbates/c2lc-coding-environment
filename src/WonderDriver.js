// @flow

import type { RobotDriver } from './types';
import WonderJS from '@wonderworkshop/wwjs';

// TODO: Does WonderJS support connecting to multiple robots at once?
// TODO: The RobotDriver interface supports at most one robot connection at a
//       time per driver. Separate into RobotDriver and RobotConnection
//       interfaces? RobotDriver.connect() returns RobotConnection instance.

export default class WonderDriver implements RobotDriver {
    robot: any;
    poseStarted: boolean;
    onConnect: (() => void) | null;
    onDisconnected: (() => void) | null;
    onPoseFinished: (() => void) | null;

    constructor() {
        this.robot = null;
        this.poseStarted = false;
        this.onConnect = null;
        this.onDisconnected = null;
        this.onPoseFinished = null;

        WonderJS.addEventListener('onconnect', this.handleConnect);
        WonderJS.addEventListener('ondisconnect', this.handleDisconnect);
        WonderJS.addEventListener('onsensor', this.handleSensor);
    }

    handleConnect = (robot: any) => {
        this.robot = robot;
        if (this.onConnect) {
            this.onConnect();
        }
    };

    handleDisconnect = (robotId: any) => {
        if (this.onDisconnected) {
            this.onDisconnected();
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

    connect(onDisconnected: () => void): Promise<void> {
        return new Promise((resolve, reject) => {
            this.onConnect = () => {
                resolve();
            };
            this.onDisconnected = onDisconnected;
            WonderJS.connect();
        });
    }

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
