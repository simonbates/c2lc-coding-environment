// @flow

import type { RobotDriver } from './types';

// UUIDs from the Arduino example: ArduinoBLE / Peripheral / LED
const arduinoLedServiceUuid = '19b10000-e8f2-537e-4f6c-d104768a1214';
const arduinoLedSwitchCharacteristicUuid = '19b10001-e8f2-537e-4f6c-d104768a1214';

export default class ArduinoDriver implements RobotDriver {
    switchCharacteristic: any;

    connect(onDisconnected: () => void): Promise<void> {
        return new Promise((resolve, reject) => {
            (navigator: any).bluetooth.requestDevice({
                filters: [{ services: [arduinoLedServiceUuid] }]
            }).then((device) => {
                device.addEventListener('gattserverdisconnected', onDisconnected);
                return device.gatt.connect();
            }).then((server) => {
                return server.getPrimaryService(arduinoLedServiceUuid);
            }).then((service) => {
                return service.getCharacteristic(arduinoLedSwitchCharacteristicUuid);
            }).then((characteristic) => {
                this.switchCharacteristic = characteristic;
                resolve();
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    setSwitch(bytes: Array<number>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.switchCharacteristic.writeValue(new Uint8Array(bytes));
            resolve();
        });
    }

    forward(): Promise<void> {
        return this.setSwitch([0x01]);
    }

    left(): Promise<void> {
        return this.setSwitch([0x00]);
    }

    right(): Promise<void> {
        return this.setSwitch([0x00]);
    }
}
