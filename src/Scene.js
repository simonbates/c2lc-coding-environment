// @flow

import React from 'react';
import * as C2lcMath from './C2lcMath';
import Character from './Character';
import './Scene.scss';

type SceneState = {
    location: {
        x: number,
        y: number
    },
    directionDegrees: number
};

export default class Scene extends React.Component<{}, SceneState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            location: {
                x: 0,
                y: 0
            },
            directionDegrees: 90 // 0 is North, 90 is East
        }
    }

    forward(distance: number): Promise<void> {
        this.setState((state) => {
            const directionRadians = C2lcMath.degrees2radians(state.directionDegrees);
            const xOffset = Math.sin(directionRadians) * distance;
            const yOffset = Math.cos(directionRadians) * distance;

            const newX = state.location.x + xOffset;
            const newY = state.location.y - yOffset;

            return {
                location: {
                    x: newX,
                    y: newY
                }
            }
        });

        return Promise.resolve();
    }

    turnLeft(amountDegrees: number): Promise<void> {
        this.setState((state) => {
            return {
                directionDegrees: C2lcMath.wrap(0, 360,
                    state.directionDegrees - amountDegrees)
            };
        });

        return Promise.resolve();
    }

    turnRight(amountDegrees: number): Promise<void> {
        this.setState((state) => {
            return {
                directionDegrees: C2lcMath.wrap(0, 360,
                    state.directionDegrees + amountDegrees)
            };
        });

        return Promise.resolve();
    }

    home(): void {
        this.setState({
            location: {
                x: 0,
                y: 0
            },
            directionDegrees: 0
        });
    }

    render() {
        const characterTransform = `translate(${this.state.location.x} ${this.state.location.y}) rotate(${this.state.directionDegrees} 0 0)`;

        return (
            <div>
                <span
                    className='Scene__drawing-area'
                    role='img'
                    aria-label='Drawing area'>
                    <svg
                        className='Scene__svg'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='-100 -100 200 200'>
                        <Character characterTransform={characterTransform}/>
                    </svg>
                </span>
            </div>
        );
    }
}
