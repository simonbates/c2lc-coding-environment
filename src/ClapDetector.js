// @flow

import React from 'react';
import * as FeatureDetection from './FeatureDetection';

type ClapDetectorProps = {
    onDetect: (string) => void
}

type AppContext = {
    mediaDevicesIsAvailable: boolean,
    webAudioAPIIsAvailable: boolean
};

type ClapDetectorState = {
    contextAvailable: boolean,
    audioInputDeviceIds: Array<string>
}

export default class ClapDetector extends React.Component<ClapDetectorProps, ClapDetectorState> {
    appContext: AppContext;
    constructor(props: ClapDetectorProps) {
        super(props);

        this.appContext = {
            mediaDevicesIsAvailable: FeatureDetection.mediaDevicesIsAvailable(),
            webAudioAPIIsAvailable: FeatureDetection.webAudioAPIIsAvailable()
        };

        this.state = {
            contextAvailable: false,
            audioInputDeviceIds: [],
        };
    }

    componentDidMount() {
        if (this.appContext.mediaDevicesIsAvailable) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                console.log(devices);
                let deviceIds = [];
                for (let i=0, numDevices=devices.length; i<numDevices; i++) {
                    if (devices[i].kind === 'audioinput') deviceIds.push(devices[i].deviceId);
                }
                this.setState({
                    contextAvailable : true,
                    audioInputDeviceIds : deviceIds
                });
            }, (error) => {
                console.log(error.name);
                console.log(error.message);
            });
        }
    }

    componentDidUpdate(prevProps: {}, prevState: ClapDetectorState) {
        if (this.state.audioInputDeviceIds !== prevState.audioInputDeviceIds) {
            if (this.state.audioInputDeviceIds.length === 0) {
                console.log('state not updated');
            } else {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const context = new AudioContext();

                Promise.all([
                    this.addAudioStreamNode(this.state.audioInputDeviceIds[0], context),
                    this.addAudioStreamNode(this.state.audioInputDeviceIds[1], context),
                    this.addAudioStreamNode(this.state.audioInputDeviceIds[3], context)
                ]).then((analysers) => {
                    const defaultInputAnalyser = analysers[0];
                    const externalInputAnalyser = analysers[1];
                    const wirelessInputAnalyser = analysers[2];
                    const scriptProcessorAnalysisNode = context.createScriptProcessor(2048,2,1);
                    const audioGain = context.createGain();
                    scriptProcessorAnalysisNode.connect(audioGain);
                    audioGain.connect(context.destination);
                    scriptProcessorAnalysisNode.onaudioprocess = () => {

                        let sim1 = this.getClapSimilarity(defaultInputAnalyser, 5, 1);
                        let sim2 = this.getClapSimilarity(externalInputAnalyser, 5, 2);
                        let sim3 = this.getClapSimilarity(wirelessInputAnalyser, 5, 3);

                        if (sim1 >= sim2 && sim1 >= sim3 && sim1 >= 0.90) {
                            console.log(sim1);
                            console.log('left');
                            this.props.onDetect('left');
                        } else if (sim2 >= sim1 && sim2 >= sim3 && sim2 >= 0.90) {
                            console.log(sim2);
                            console.log('right');
                            this.props.onDetect('right');
                        } else if (sim3 >= sim1 && sim3 >= sim2 && sim3 >= 0.90) {
                            console.log(sim3);
                            console.log('forward');
                            this.props.onDetect('forward');
                        }
                    }
                });
            }
        }
    }

    addAudioStreamNode = async (deviceId: string, audioContext: any): any=> {
        const audioInputDevice = await navigator.mediaDevices.getUserMedia({audio: {deviceId: this.state.audioInputDeviceIds[0]}});
        const audioInputStream = audioContext.createMediaStreamSource(audioInputDevice);
        const audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.smoothingTimeConstant = 0;
        audioAnalyser.fftSize = 2048;
        audioInputStream.connect(audioAnalyser);
        const bufferLength = audioAnalyser.frequencyBinCount;
        const arrayFreqDomain = new Uint8Array(bufferLength);
        const arrayTimeDomain = new Uint8Array(bufferLength);
        return ({
            analyser : audioAnalyser,
            freqBuffer : arrayFreqDomain,
            timeBuffer : arrayTimeDomain
        });
    }

    getClapSimilarity(analyserNode: any, numRows: number, deviceId: number): number {
        let timeDomainBuffer = analyserNode.analyser.getByteTimeDomainData(analyserNode.timeBuffer);
        let freqDomainBuffer = analyserNode.analyser.getByteFrequencyData(analyserNode.freqBuffer);
        let currentTimeValue = (analyserNode.timeBuffer[0] / 128) - 1.0;
        let similarity = 0;
        if (Math.abs(currentTimeValue) !== 0.0078125
        && currentTimeValue !== 0 && Math.abs(currentTimeValue) !== 0.015625
        && Math.abs(currentTimeValue) !== 0.0234375) {
            similarity = this.getNormalizedCorrelation(analyserNode.freqBuffer);
        }
        return similarity;
        // if (similarity > 0.90) {
        //     console.log('is a clap');
        //     console.log(deviceId);
        //     // switch (deviceId) {
        //     //     case (1) : this.props.onDetect('left');
        //     //     break;
        //     //     case (2) : this.props.onDetect('right');
        //     //     break;
        //     //     case (3) : this.props.onDetect('forward');
        //     //     break;
        //     // }
        // }
    }

    //testcase is needed for normalizedCorrelation
    getNormalizedCorrelation(fftSamples: Array<number>): number {
        const clappingSound = [0,0,34,52,61,71,79,121,125,145,159,147,154,171,146,158,146,134,164,172,165,184,178,140,133,146,157,141,115,98,145,160,155,150,139,119,134,151,154,164,156,141,141,153,161,176,172,120,172,191,195,185,154,130,111,139,128,192,213,205,177,141,166,173,144,183,192,188,160,150,213,208,175,179,207,208,190,170,154,152,133,104,127,106,108,125,144,154,165,170,159,143,62,114,157,178,163,135,159,163,159,141,111,125,119,132,124,108,76,112,117,124,127,80,65,90,73,113,120,117,108,90,60,81,76,110,121,106,80,127,117,75,75,109,120,92,129,129,118,111,110,118,128,125,111,102,97,97,105,121,120,103,100,99,86,98,73,123,128,103,94,98,97,93,107,112,95,95,107,89,75,105,111,107,109,93,128,132,111,62,86,99,102,95,90,69,82,58,75,93,84,78,92,100,82,103,95,97,126,120,58,106,94,85,104,92,67,65,93,104,100,88,85,92,73,83,61,61,82,97,98,90,89,95,79,5,51,82,93,92,90,88,75,36,44,35,79,79,41,55,82,80,59,21,40,62,85,81,84,86,69,74,93,103,97,82,81,71,60,74,89,86,82,88,85,51,68,84,71,56,25,55,53,31,26,61,78,76,72,69,69,79,77,38,50,55,57,48,48,75,81,63,57,64,4,63,70,47,13,54,75,74,63,73,88,82,62,68,78,77,84,90,94,88,66,77,92,87,84,92,95,88,83,99,102,98,97,98,99,95,82,77,81,80,88,86,56,61,72,52,69,70,51,33,14,52,60,61,55,36,28,0,32,64,78,80,66,0,50,58,78,82,76,57,59,50,81,88,94,98,88,59,58,87,98,95,90,83,49,61,56,72,79,75,58,49,55,71,79,79,63,14,19,0,40,66,68,66,65,59,66,52,24,65,82,79,59,41,51,57,55,27,38,53,58,63,62,52,28,42,32,35,60,59,44,55,64,59,63,22,65,64,54,34,35,70,75,68,73,72,69,71,79,79,62,50,69,62,47,48,34,55,58,36,41,47,48,46,58,64,74,85,85,72,52,50,73,78,60,71,41,54,81,69,26,74,88,84,58,56,71,74,62,71,83,81,73,77,68,0,76,76,59,48,37,14,55,59,55,53,48,31,35,0,27,65,81,81,72,52,37,30,56,63,79,75,26,50,30,33,54,66,68,70,72,65,58,78,69,45,57,62,69,72,56,39,57,73,62,37,68,79,59,36,4,13,63,58,33,64,68,64,58,71,67,38,42,60,62,65,66,57,30,33,63,61,42,43,56,56,47,49,53,50,55,54,31,33,21,70,78,66,48,46,35,44,55,46,21,24,34,0,7,1,18,52,60,62,68,55,29,39,37,31,47,68,58,27,35,54,62,58,58,55,54,56,64,65,54,39,37,40,42,17,6,34,32,8,18,22,5,40,48,63,70,65,43,28,34,32,47,61,68,65,53,18,51,62,49,0,26,0,36,0,11,28,29,31,58,42,0,0,2,43,37,39,41,13,35,35,29,26,32,26,24,24,35,36,37,22,26,31,0,29,42,39,35,42,41,24,0,12,34,19,33,38,35,50,61,58,44,29,0,5,5,16,27,31,24,12,0,0,18,14,0,0,6,9,0,0,0,4,0,13,13,0,10,0,0,0,0,0,0,21,0,30,42,15,0,0,13,25,19,16,17,24,12,0,6,20,43,33,0,26,10,0,0,0,3,9,18,12,15,22,18,2,0,3,0,0,0,23,0,35,48,30,18,40,38,47,21,24,37,44,43,34,18,18,24,20,0,16,40,48,53,61,62,50,28,25,33,30,0,9,19,20,14,21,33,47,55,58,48,23,15,19,8,0,37,41,33,41,10,2,11,0,13,17,13,29,45,30,21,52,57,52,39,29,22,0,0,15,33,26,19,28,24,16,18,26,22,19,18,18,21,21,12,29,43,39,34,13,18,43,40,21,25,24,0,5,0,0,0,0,0,0,21,11,6,25,28,11,0,18,13,0,0,0,17,9,0,0,0,0,0,0,0,0,0,0,0,0,0,5,18,13,2,7,2,0,0,1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        let sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (let i =0, numSamples = fftSamples.length; i<numSamples;i++) {
            sumXY += (fftSamples[i] * clappingSound[i]);
            sumX2 += Math.pow(clappingSound[i],2);
            sumY2 += Math.pow(fftSamples[i],2);
        }
        let denominator = Math.sqrt(sumX2*sumY2);
        let normalizedCorrelation = sumXY/denominator;

        return normalizedCorrelation;
    };

    render() {
        return (
            <div>
                {this.state.contextAvailable ? (
                    <p>Clap detector is supported</p>
                    ) : (
                    <p>Clap detector is not supported</p>
                )}
            </div>
        );
    };
}