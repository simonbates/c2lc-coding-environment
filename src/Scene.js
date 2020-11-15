// @flow

import React from 'react';
import CharacterState from './CharacterState';
import RobotCharacter from './RobotCharacter';
import SceneDimensions from './SceneDimensions';
import { injectIntl } from 'react-intl';
import type {IntlShape} from 'react-intl';

import './Scene.scss';

export type SceneProps = {
    dimensions: SceneDimensions,
    characterState: CharacterState,
    mirrorHorizontally: boolean,
    mirrorVertically: boolean,
    intl: IntlShape
};

class Scene extends React.Component<SceneProps, {}> {
    drawGrid() {
        const grid = [];
        if (this.props.dimensions.getWidth() === 0 ||
            this.props.dimensions.getHeight() === 0) {
            return grid;
        }
        const rowLabelOffset = this.props.dimensions.getWidth() * 0.025;
        const columnLabelOffset = this.props.dimensions.getHeight() * 0.025;
        const halfGridCellWidth = 0.5;
        let yOffset = this.props.dimensions.getMinY();
        for (let i=1;i < this.props.dimensions.getHeight() + 1;i++) {
            yOffset += 1;
            if (i < this.props.dimensions.getHeight()) {
                grid.push(<line
                    className='Scene__grid-line'
                    key={`grid-cell-row-${i}`}
                    x1={this.props.dimensions.getMinX()}
                    y1={yOffset}
                    x2={this.props.dimensions.getMaxX()}
                    y2={yOffset} />);
            }
            grid.push(
                <text
                    className='Scene__grid-label'
                    textAnchor='end'
                    key={`grid-cell-label-${i}`}
                    dominantBaseline='middle'
                    x={this.props.dimensions.getMinX() - rowLabelOffset}
                    y={yOffset - halfGridCellWidth}>
                    {i}
                </text>
            )
        }
        let xOffset = this.props.dimensions.getMinX();
        for (let i=1;i < this.props.dimensions.getWidth() + 1;i++) {
            xOffset += 1;
            if (i < this.props.dimensions.getWidth()) {
                grid.push(<line
                    className='Scene__grid-line'
                    key={`grid-cell-column-${i}`}
                    x1={xOffset}
                    y1={this.props.dimensions.getMinY()}
                    x2={xOffset}
                    y2={this.props.dimensions.getMaxY()} />);
            }
            grid.push(
                <text
                    className='Scene__grid-label'
                    key={`grid-cell-label-${String.fromCharCode(64+i)}`}
                    textAnchor='middle'
                    x={xOffset - halfGridCellWidth}
                    y={this.props.dimensions.getMinY() - columnLabelOffset}>
                    {String.fromCharCode(64+i)}
                </text>
            )
        }
        return grid;
    }

    drawCharacterPath() {
        const lines = [];
        for (let i = 0; i < this.props.characterState.path.length; ++i) {
            const pathSegment = this.props.characterState.path[i];
            lines.push(
                <line
                    className='Scene__path-line'
                    key={`path-${i}`}
                    x1={pathSegment.x1}
                    y1={pathSegment.y1}
                    x2={pathSegment.x2}
                    y2={pathSegment.y2} />
            );
            if (this.props.mirrorHorizontally) {
                lines.push(
                    <line
                        className='Scene__path-line'
                        key={`path-mirror-h-${i}`}
                        x1={pathSegment.x1 * -1}
                        y1={pathSegment.y1}
                        x2={pathSegment.x2 * -1}
                        y2={pathSegment.y2} />
                );
            }
            if (this.props.mirrorVertically) {
                lines.push(
                    <line
                        className='Scene__path-line'
                        key={`path-mirror-v-${i}`}
                        x1={pathSegment.x1}
                        y1={pathSegment.y1 * -1}
                        x2={pathSegment.x2}
                        y2={pathSegment.y2 * -1} />
                );
            }
            if (this.props.mirrorHorizontally && this.props.mirrorVertically) {
                lines.push(
                    <line
                        className='Scene__path-line'
                        key={`path-mirror-hv-${i}`}
                        x1={pathSegment.x1 * -1}
                        y1={pathSegment.y1 * -1}
                        x2={pathSegment.x2 * -1}
                        y2={pathSegment.y2 * -1} />
                );
            }
        }
        return lines;
    }

    getDirectionWords(direction: number): string {
        return this.props.intl.formatMessage({id: `Direction.${direction}`});
    }

    getRelativeDirection(xPos: number, yPos: number): string {
        if (this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsBelow' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'inBounds') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.0'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsBelow' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsAbove') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.1'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'inBounds' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsAbove') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.2'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsAbove' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsAbove') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.3'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsAbove' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'inBounds') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.4'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsAbove' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsBelow') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.5'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'inBounds' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsBelow') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.6'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsBelow' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsBelow') {
                return this.props.intl.formatMessage({id: 'RelativeDirection.7'});
        } else {
            throw new Error(`Unrecognized xPos: ${xPos} or yPos: ${yPos}`);
        }
    }

    generateAriaLabel() {
        const { xPos, yPos } = this.props.characterState;
        const numColumns = this.props.dimensions.getWidth();
        const numRows = this.props.dimensions.getHeight();
        const direction = this.getDirectionWords(this.props.characterState.direction);
        if (this.props.dimensions.getBoundsStateX(xPos) !== 'inBounds'
            || this.props.dimensions.getBoundsStateY(yPos) !== 'inBounds') {
                return this.props.intl.formatMessage(
                    { id: 'Scene.outOfBounds' },
                    {
                        numColumns,
                        numRows,
                        direction,
                        relativeDirection: this.getRelativeDirection(xPos, yPos)
                    }
                )
        } else {
            return this.props.intl.formatMessage(
                { id: 'Scene.inBounds' },
                {
                    numColumns: this.props.dimensions.getWidth(),
                    numRows: this.props.dimensions.getHeight(),
                    xPos: String.fromCharCode(64 + Math.trunc(xPos) + Math.ceil(numColumns/2)),
                    yPos: Math.trunc(yPos) + Math.ceil(numRows/2),
                    direction
                }
            )
        }
    }

    getCharacterDrawXPos() {
        switch (this.props.dimensions.getBoundsStateX(this.props.characterState.xPos)) {
            case 'inBounds':
                return this.props.characterState.xPos;
            case 'outOfBoundsAbove':
                return this.props.dimensions.getMaxX() - 0.1;
            case 'outOfBoundsBelow':
                return this.props.dimensions.getMinX() + 0.1;
            default:
                throw new Error('Unexpected bounds type');
        }
    }

    getCharacterDrawYPos() {
        switch (this.props.dimensions.getBoundsStateY(this.props.characterState.yPos)) {
            case 'inBounds':
                return this.props.characterState.yPos;
            case 'outOfBoundsAbove':
                return this.props.dimensions.getMaxY() - 0.1;
            case 'outOfBoundsBelow':
                return this.props.dimensions.getMinY() + 0.1;
            default:
                throw new Error('Unexpected bounds type');
        }
    }

    render() {
        const minX = this.props.dimensions.getMinX();
        const minY = this.props.dimensions.getMinY();
        const width = this.props.dimensions.getWidth();
        const height = this.props.dimensions.getHeight();

        // Subtract 90 degrees from the character bearing as the character
        // image is drawn upright when it is facing East
        const robotCharacterTransform = `translate(${this.getCharacterDrawXPos()} ${this.getCharacterDrawYPos()}) rotate(${this.props.characterState.getDirectionDegrees() - 90} 0 0)`;

        return (
            <div>
                <span
                    className='Scene'
                    role='img'
                    aria-label={this.generateAriaLabel()}>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox={`${minX} ${minY} ${width} ${height}`}>
                        <defs>
                            <clipPath id='Scene-clippath'>
                                <rect x={minX} y={minY} width={width} height={height} />
                            </clipPath>
                        </defs>
                        {this.drawGrid()}
                        <g clipPath='url(#Scene-clippath)'>
                            {this.drawCharacterPath()}
                            <RobotCharacter
                                transform={robotCharacterTransform}
                                width={0.6}
                            />
                        </g>
                    </svg>
                </span>
            </div>
        );
    }
}

export default injectIntl(Scene);
