// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import messages from './messages.json';
import Scene from './Scene';
import type {SceneProps} from './Scene';
import SceneDimensions from './SceneDimensions';
import CharacterState from './CharacterState';

configure({ adapter: new Adapter() });

const defaultSceneProps = {
    dimensions: new SceneDimensions(1, 1),
    characterState: new CharacterState(0, 0, 2, []),
    mirrorHorizontally: false,
    mirrorVertically: false
};

function createMountScene(props) {
    const wrapper = mount(
        React.createElement(
            Scene,
            (Object.assign(
                {},
                defaultSceneProps,
                props
            ):SceneProps)
        ),
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {
                locale: 'en',
                defaultLocale: 'en',
                messages: messages.en
            }
        }
    );

    return wrapper;
}

function findScene(sceneWrapper) {
    return sceneWrapper.find('.Scene');
}

function findGridLines(sceneWrapper) {
    return sceneWrapper.find('.Scene__grid-line');
}

function findGridLabels(sceneWrapper) {
    return sceneWrapper.find('.Scene__grid-label');
}

function findRobotCharacter(sceneWrapper) {
    return sceneWrapper.find('.RobotCharacter');
}

function findRobotCharacterIcon(sceneWrapper) {
    return sceneWrapper.find('.RobotCharacter__icon');
}

function findRobotCharacterPath(sceneWrapper) {
    return sceneWrapper.find('.Scene__path-line');
}

// TODO: This function is reproducing logic from Scene (the 0.8) and
//       RobotCharacter (everything else) and it will be easily
//       broken. Is there a better approach here that tests that the
//       character is rendered as expected, but it less brittle?
function calculateCharacterDimensions() {
    const characterWidth = 0.8 * 0.75;
    const x = -characterWidth/2;
    const y = -characterWidth/2;
    const width = characterWidth;
    const height = characterWidth;
    return { x, y, width, height };
}

describe('When the Scene renders', () => {
    test('With width = 0, height = 2', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            dimensions: new SceneDimensions(0, 2)
        });
        expect(findGridLines(sceneWrapper).length).toBe(0);
    });

    test('With width = 2, height = 0', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            dimensions: new SceneDimensions(2, 0)
        });
        expect(findGridLines(sceneWrapper).length).toBe(0);
    });

    test('With width = 1, height = 1', () => {
        expect.assertions(7);
        const dimensions = new SceneDimensions(1, 1);
        const sceneWrapper = createMountScene({
            dimensions: dimensions
        });
        const expectedLabelOffset = 0.025;

        // Scene viewbox

        expect(findScene(sceneWrapper).get(0).props.children.props.viewBox)
            .toBe(`${dimensions.getMinX()} ${dimensions.getMinY()} ${dimensions.getWidth()} ${dimensions.getHeight()}`);

        // Grid labels

        expect(findGridLabels(sceneWrapper).length).toBe(2);

        // Row labels

        expect(findGridLabels(sceneWrapper).get(0).props.x).toBe(-0.5 - expectedLabelOffset);
        expect(findGridLabels(sceneWrapper).get(0).props.y).toBe(0);

        // Column labels

        expect(findGridLabels(sceneWrapper).get(1).props.x).toBe(0);
        expect(findGridLabels(sceneWrapper).get(1).props.y).toBe(-0.5 - expectedLabelOffset);

        // Grid lines

        expect(findGridLines(sceneWrapper).length).toBe(0);
    });

    test('With width = 3, height = 2', () => {
        expect.assertions(25);
        const dimensions = new SceneDimensions(3, 2);
        const sceneWrapper = createMountScene({
            dimensions: dimensions
        });
        const expectedRowLabelOffset = 0.075;
        const expectedColumnLabelOffset = 0.05;

        // Scene viewbox

        expect(findScene(sceneWrapper).get(0).props.children.props.viewBox)
            .toBe(`${dimensions.getMinX()} ${dimensions.getMinY()} ${dimensions.getWidth()} ${dimensions.getHeight()}`);

        // Grid labels

        expect(findGridLabels(sceneWrapper).length).toBe(5);

        // Row labels

        expect(findGridLabels(sceneWrapper).get(0).props.x).toBe(-1.5 - expectedRowLabelOffset);
        expect(findGridLabels(sceneWrapper).get(0).props.y).toBe(-0.5);
        expect(findGridLabels(sceneWrapper).get(1).props.x).toBe(-1.5 - expectedRowLabelOffset);
        expect(findGridLabels(sceneWrapper).get(1).props.y).toBe(0.5);

        // Column labels

        expect(findGridLabels(sceneWrapper).get(2).props.x).toBe(-1);
        expect(findGridLabels(sceneWrapper).get(2).props.y).toBe(-1 - expectedColumnLabelOffset);
        expect(findGridLabels(sceneWrapper).get(3).props.x).toBe(0);
        expect(findGridLabels(sceneWrapper).get(3).props.y).toBe(-1 - expectedColumnLabelOffset);
        expect(findGridLabels(sceneWrapper).get(4).props.x).toBe(1);
        expect(findGridLabels(sceneWrapper).get(4).props.y).toBe(-1 - expectedColumnLabelOffset);

        // Grid lines

        expect(findGridLines(sceneWrapper).length).toBe(3);

        // Grid rows

        expect(findGridLines(sceneWrapper).get(0).props.x1).toBe(-1.5);
        expect(findGridLines(sceneWrapper).get(0).props.y1).toBe(0);
        expect(findGridLines(sceneWrapper).get(0).props.x2).toBe(1.5);
        expect(findGridLines(sceneWrapper).get(0).props.y2).toBe(0);

        // Grid columns

        expect(findGridLines(sceneWrapper).get(1).props.x1).toBe(-0.5);
        expect(findGridLines(sceneWrapper).get(1).props.y1).toBe(-1);
        expect(findGridLines(sceneWrapper).get(1).props.x2).toBe(-0.5);
        expect(findGridLines(sceneWrapper).get(1).props.y2).toBe(1);
        expect(findGridLines(sceneWrapper).get(2).props.x1).toBe(0.5);
        expect(findGridLines(sceneWrapper).get(2).props.y1).toBe(-1);
        expect(findGridLines(sceneWrapper).get(2).props.x2).toBe(0.5);
        expect(findGridLines(sceneWrapper).get(2).props.y2).toBe(1);
    });
});

describe('The ARIA label should tell there is a robot character with its position', () => {
    test.each([
        [0, 1, 0, 'Scene, 17 by 9 grid with a robot character at column I, row 6 facing up'],
        [1, 2, 1, 'Scene, 17 by 9 grid with a robot character at column J, row 7 facing upper right'],
        [0, 1, 2, 'Scene, 17 by 9 grid with a robot character at column I, row 6 facing right'],
        [0, 1, 3, 'Scene, 17 by 9 grid with a robot character at column I, row 6 facing lower right'],
        [0, 1, 4, 'Scene, 17 by 9 grid with a robot character at column I, row 6 facing down'],
        [0, 1, 5, 'Scene, 17 by 9 grid with a robot character at column I, row 6 facing lower left'],
        [0, 1, 6, 'Scene, 17 by 9 grid with a robot character at column I, row 6 facing left'],
        [0, 1, 7, 'Scene, 17 by 9 grid with a robot character at column I, row 6 facing upper left'],
        [   0, -10, 0, 'Scene, 17 by 9 grid with a robot character outside of the scene above the scene, facing up'],
        [ 100, -10, 6, 'Scene, 17 by 9 grid with a robot character outside of the scene to the upper right of the scene, facing left'],
        [ 100,   0, 0, 'Scene, 17 by 9 grid with a robot character outside of the scene to the right of the scene, facing up'],
        [ 100,  10, 0, 'Scene, 17 by 9 grid with a robot character outside of the scene to the lower right of the scene, facing up'],
        [   0,  10, 0, 'Scene, 17 by 9 grid with a robot character outside of the scene below the scene, facing up'],
        [-100,  10, 0, 'Scene, 17 by 9 grid with a robot character outside of the scene to the lower left of the scene, facing up'],
        [-100,   0, 0, 'Scene, 17 by 9 grid with a robot character outside of the scene to the left of the scene, facing up'],
        [-100, -10, 0, 'Scene, 17 by 9 grid with a robot character outside of the scene to the upper left of the scene, facing up']
    ])('x=%f, y=%f, direction=%i', (x, y, direction, expectedLabel) => {
            const sceneWrapper = createMountScene({
                dimensions: new SceneDimensions(17, 9),
                characterState: new CharacterState(x, y, direction, [])
            });
            expect(findScene(sceneWrapper).get(0).props['aria-label']).toBe(expectedLabel);
        }
    );
});

describe('When the Scene renders', () => {
    test('Should render the robot character component', () => {
        expect.assertions(5);
        const sceneWrapper = createMountScene({
            dimensions: new SceneDimensions(1, 1)
        });
        const expectedCharacterDimensions = calculateCharacterDimensions();
        expect(findRobotCharacterIcon(sceneWrapper).hostNodes().length).toBe(1);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.x)
            .toBeCloseTo(expectedCharacterDimensions.x, 5);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.y)
            .toBeCloseTo(expectedCharacterDimensions.y, 5);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.width)
            .toBeCloseTo(expectedCharacterDimensions.width, 5);
        expect(findRobotCharacterIcon(sceneWrapper).get(0).props.height)
            .toBeCloseTo(expectedCharacterDimensions.height, 5);
    });
});

describe('When the robot character renders, transform should apply', () => {
    test('When xPos = 0, yPos = 0, direction = 2', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            dimensions: new SceneDimensions(1, 1),
            characterState: new CharacterState(0, 0, 2, [])
        });
        const robotCharacter = findRobotCharacter(sceneWrapper);
        expect(robotCharacter.get(0).props.transform)
            .toBe('translate(0 0) rotate(0 0 0)');
    });
    test('When xPos = 10, yPos = 8, direction = 4', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            dimensions: new SceneDimensions(20, 20),
            characterState: new CharacterState(10, 8, 4, [])
        });
        const robotCharacter = findRobotCharacter(sceneWrapper);
        expect(robotCharacter.get(0).props.transform)
            .toBe('translate(10 8) rotate(90 0 0)');
    });
    test('When xPos = 0, yPos = 9, direction = 0', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            dimensions: new SceneDimensions(20, 20),
            characterState: new CharacterState(0, 9, 0, [])
        });
        const robotCharacter = findRobotCharacter(sceneWrapper);
        expect(robotCharacter.get(0).props.transform)
            .toBe('translate(0 9) rotate(-90 0 0)');
    });
});

describe('Draw character when out of bounds', () => {
    test.each([
        [  0, -2,  0  , -1.4 ], // N
        [  3, -2,  2.4, -1.4 ], // NE
        [  3,  0,  2.4,  0   ], // E
        [  3,  2,  2.4,  1.4 ], // SE
        [  0,  2,  0  ,  1.4 ], // S
        [ -3,  2, -2.4,  1.4 ], // SW
        [ -3,  0, -2.4,  0   ], // W
        [ -3, -2, -2.4, -1.4 ]  // NW
    ])('x=%f, y=%f, expectedDrawX=%f, expectedDrawY=%f',
        (x, y, expectedDrawX, expectedDrawY) => {
            const sceneWrapper = createMountScene({
                dimensions: new SceneDimensions(5, 3),
                characterState: new CharacterState(x, y, 2, [])
            });
            const robotCharacter = findRobotCharacter(sceneWrapper);
            expect(robotCharacter.get(0).props.transform)
                .toBe(`translate(${expectedDrawX} ${expectedDrawY}) rotate(0 0 0)`);
        }
    );
});

describe('When the Character has a path, it is drawn on the Scene', () => {
    test('When there is no path segment', () => {
        expect.assertions(1);
        const sceneWrapper = createMountScene({
            characterState: new CharacterState(0, 0, 2, [])
        });
        const robotCharacterPath = findRobotCharacterPath(sceneWrapper);
        expect(robotCharacterPath.length).toBe(0);
    });

    test('When there is one path segment', () => {
        expect.assertions(5);
        const sceneWrapper = createMountScene({
            characterState: new CharacterState(0, 0, 2, [{x1: 100, y1: 200, x2: 300, y2: 400}])
        });
        const robotCharacterPath = findRobotCharacterPath(sceneWrapper);
        expect(robotCharacterPath.length).toBe(1);
        expect(robotCharacterPath.get(0).props.x1).toBe(100);
        expect(robotCharacterPath.get(0).props.y1).toBe(200);
        expect(robotCharacterPath.get(0).props.x2).toBe(300);
        expect(robotCharacterPath.get(0).props.y2).toBe(400);
    });

    test('When there are two path segments', () => {
        expect.assertions(9);
        const sceneWrapper = createMountScene({
            characterState:
                new CharacterState(0, 0, 2, [
                    {x1: 100, y1: 200, x2: 300, y2: 400},
                    {x1: 500, y1: 600, x2: 700, y2: 800}
                ])
        });
        const robotCharacterPath = findRobotCharacterPath(sceneWrapper);
        expect(robotCharacterPath.length).toBe(2);
        expect(robotCharacterPath.get(0).props.x1).toBe(100);
        expect(robotCharacterPath.get(0).props.y1).toBe(200);
        expect(robotCharacterPath.get(0).props.x2).toBe(300);
        expect(robotCharacterPath.get(0).props.y2).toBe(400);
        expect(robotCharacterPath.get(1).props.x1).toBe(500);
        expect(robotCharacterPath.get(1).props.y1).toBe(600);
        expect(robotCharacterPath.get(1).props.x2).toBe(700);
        expect(robotCharacterPath.get(1).props.y2).toBe(800);
    })
})
