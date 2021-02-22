# Connecting to an Arduino over Bluetooth Low Energy (BLE)

This branch contains code showing how to connect the C2LC Coding Environment to a BLE-enabled Arduino. The code has been tested using an [Arduino UNO Wifi Rev 2](https://store.arduino.cc/usa/arduino-uno-wifi-rev2), but should work with other BLE-enabled Arduino boards that are compatible with the [ArduinoBLE](https://www.arduino.cc/en/Reference/ArduinoBLE) library.

The demonstration code in this repository:

- Adds a button to the Coding Environment ("Connect to Arduino") which when clicked, attempts to connect to a BLE-enabled Arduino
- When a connection is established, the Forward 1 square command will turn the LED on the Arduino on and either of the Turn Left 45 degrees or Turn Right 45 degrees commands will turn the LED off

This repository does not contain any Arduino code, but rather connects to an Arduino that is running the "LED" ArduinoBLE example sketch (details below).

## Hardware Needed

- An Arduino with BLE
- A USB cable to connect the Arduino to a computer for programming

## Step 1: Install the Arduino IDE, board support, and ArduinoBLE library

- Download and install the desktop Arduino IDE (latest version is 1.8.13 at time of writing) from https://www.arduino.cc/en/software
- Add support for your particular Arduino board
  - For example, for the Arduino UNO WiFi Rev 2, install the Arduino megaAVR Core as described at https://www.arduino.cc/en/Guide/ArduinoUnoWiFiRev2
- Install the ArduinoBLE library using the Library Manager found under Tools / Manage Libraries... (latest version is 1.1.3 at time of writing)

## Step 2: Connect the Arduino and upload the WifiNINA firmware

- Connect the Arduino using USB
- Set the board type in the Tools menu (for example "Arduino Uno WiFi Rev2")
- Selected the port in the Tools menu
- Ensure that the serial console is closed
- Tools / "Wifi101 / WifiNINA Firmware Updater"
  - Select the appropriate serial port
  - Select the latest NINA firmware version (latest version for the Arduino UNO WiFi Rev 2 is 1.3.0 at time of writing)
  - Click "Update Firmware"
  - Wait for the upload to complete

## Step 3: Upload the ArduinoBLE "LED" example sketch

- Open the LED example sketch: File / Examples / ArduinoBLE / Peripheral / LED
- Click the "Upload" button

I see the following warning with the Arduino UNO Wifi Rev 2:

> avrdude: WARNING: invalid value for unused bits in fuse "fuse5", should be set to 1 according to datasheet<br>
> This behaviour is deprecated and will result in an error in future version<br>
> You probably want to use 0xcd instead of 0xc9 (double check with your datasheet first).

But it looks like this can be ignored: https://forum.arduino.cc/index.php?topic=605539.0

If everything has worked, you should see the following message in the serial monitor:

    BLE LED Peripheral

## Step 4: Run the C2LC Coding Environment and try it out!

You should now be able to run the C2LC Coding environment with `npm start` and connect to the Arduino over BLE.

## The code that implements the BLE connection

- [ArduinoDriver.js](../src/ArduinoDriver.js) contains the details of the BLE connection to the Arduino
- [App.js](../src/App.js) provides the UI to establish the connection
  - Upon successful connection, the `App` registers command handlers with the interpreter to send the LED on and off messages: https://github.com/codelearncreate/c2lc-coding-environment/blob/300e134ed90f5e707dc49491df46ccb6684f0faf/src/App.js#L783-L793

## Resources

- [Arduino UNO WiFi Rev 2](https://store.arduino.cc/usa/arduino-uno-wifi-rev2)
- [Getting started with the Arduino UNO WiFi Rev 2](https://www.arduino.cc/en/Guide/ArduinoUnoWiFiRev2)
- [Arduino IDE download](https://www.arduino.cc/en/software)
- [ArduinoBLE Library Reference](https://www.arduino.cc/en/Reference/ArduinoBLE)
- [WiFiNINA Library Reference](https://www.arduino.cc/en/Reference/WiFiNINA)
