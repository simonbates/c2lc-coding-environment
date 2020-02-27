// @flow

import type { RobotDriver, RobotConnection } from './types';

class FakeRobotConnection implements RobotConnection {
    onDisconnected(callback: () => void) {
        // Do nothing
    }

    fakeCommandImpl(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    forward(): Promise<void> {
        console.log("FakeRobot: Forward");
        return this.fakeCommandImpl();
    }

    left(): Promise<void> {
        console.log("FakeRobot: Left");
        return this.fakeCommandImpl();
    }

    right(): Promise<void> {
        console.log("FakeRobot: Right");
        return this.fakeCommandImpl();
    }
}

export default class FakeRobotDriver implements RobotDriver {
    onConnectedCallback: ((RobotConnection) => void) | null;

    constructor() {
        this.onConnectedCallback = null;
    }

    onConnected(callback: (RobotConnection) => void) {
        this.onConnectedCallback = callback;
    }

    connect() {
        if (this.onConnectedCallback) {
            this.onConnectedCallback(new FakeRobotConnection());
        }
    }
}
