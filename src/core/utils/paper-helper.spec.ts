import * as paper from 'paper';

import 'paper-area-text';

import {
    PaperHelper,
    Rect2,
    Vec2
} from '@app/core';

describe('PaperHelper', () => {
    let project: paper.Project;

    beforeEach(() => {
        project = new paper.Project(null!);
        project.activate();
    });

    it('should convert rect to rectangle', () => {
        const rectangle = PaperHelper.rect2Rectangle(new Rect2(new Vec2(13, 11), new Vec2(23, 18)));

        expect(rectangle.left).toBe(13);
        expect(rectangle.top).toBe(11);
        expect(rectangle.width).toBe(23);
        expect(rectangle.height).toBe(18);
    });

    it('should convert rectangle to rect', () => {
        const rect = PaperHelper.rectangle2Rect(new paper.Rectangle(13, 11, 23, 18));

        expect(rect.left).toBe(13);
        expect(rect.top).toBe(11);
        expect(rect.width).toBe(23);
        expect(rect.height).toBe(18);
    });

    it('should convert vector to point', () => {
        const point = PaperHelper.vec2Point(new Vec2(13, 11));

        expect(point.x).toBe(13);
        expect(point.y).toBe(11);
    });

    it('should convert vector to size', () => {
        const size = PaperHelper.vec2Size(new Vec2(13, 11));

        expect(size.width).toBe(13);
        expect(size.height).toBe(11);
    });

    it('should convert vector to rectangle', () => {
        const rectangle = PaperHelper.vec2Rectangle(new Vec2(13, 11));

        expect(rectangle.top).toBe(0);
        expect(rectangle.left).toBe(0);
        expect(rectangle.width).toBe(13);
        expect(rectangle.height).toBe(11);
    });

    it('should convert point to vector', () => {
        const vec = PaperHelper.point2Vec(new paper.Point(13, 11));

        expect(vec.x).toBe(13);
        expect(vec.y).toBe(11);
    });

    it('should convert size to vector', () => {
        const size = PaperHelper.size2Vec(new paper.Size(13, 11));

        expect(size.x).toBe(13);
        expect(size.y).toBe(11);
    });

    it('should convert to transparent color', () => {
        const color = PaperHelper.toColor('transparent');

        expect(color.red).toBe(1);
        expect(color.blue).toBe(1);
        expect(color.green).toBe(1);
        expect(color.alpha).toBeLessThan(0.1);
    });

    it('should convert int to color', () => {
        const color = PaperHelper.toColor(0xFF00FF);

        expect(color.red).toBe(1);
        expect(color.blue).toBe(1);
        expect(color.green).toBe(0);
        expect(color.alpha).toBe(1);
    });

    it('should create rounded rectangle left', () => {
        const item = PaperHelper.createRoundedRectangleLeft(new paper.Rectangle(10, 10, 20, 20), 5);

        expect(item).toBeDefined();
    });

    it('should create rounded rectangle left with default radius', () => {
        const item = PaperHelper.createRoundedRectangleLeft(new paper.Rectangle(10, 10, 20, 20));

        expect(item).toBeDefined();
    });

    it('should create rounded rectangle right', () => {
        const item = PaperHelper.createRoundedRectangleRight(new paper.Rectangle(10, 10, 20, 20), 5);

        expect(item).toBeDefined();
    });

    it('should create rounded rectangle right with default radius', () => {
        const item = PaperHelper.createRoundedRectangleRight(new paper.Rectangle(10, 10, 20, 20));

        expect(item).toBeDefined();
    });

    it('should create singleline text left aligned', () => {
        const textItem = <paper.PointText>PaperHelper.createSinglelineText(new paper.Rectangle(100, 100, 240, 20), 'My Text Left', 23, 'left').textItem;

        expect(textItem.content).toBe('My Text Left');
        expect(textItem.fontSize).toBe(23);
        expect(textItem.justification).toBe('left');
        expect(textItem.point.x).toBe(100.5);
    });

    it('should create singleline text right aligned', () => {
        const textItem = <paper.PointText>PaperHelper.createSinglelineText(new paper.Rectangle(100, 100, 240, 20), 'My Text Right', 44, 'right').textItem;

        expect(textItem.content).toBe('My Text Right');
        expect(textItem.fontSize).toBe(44);
        expect(textItem.justification).toBe('right');
        expect(textItem.point.x).toBe(340.5);
    });

    it('should create singleline text centered', () => {
        const textItem = <paper.PointText>PaperHelper.createSinglelineText(new paper.Rectangle(100, 100, 240, 20), 'My Text Center', 37, 'center').textItem;

        expect(textItem.content).toBe('My Text Center');
        expect(textItem.fontSize).toBe(37);
        expect(textItem.justification).toBe('center');
        expect(textItem.point.x).toBe(220.5);
    });

    it('should create singleline text with default values', () => {
        const textItem = <paper.PointText>PaperHelper.createSinglelineText(new paper.Rectangle(100, 100, 240, 20), 'My Text Center').textItem;

        expect(textItem.content).toBe('My Text Center');
        expect(textItem.fontSize).toBe(10);
        expect(textItem.justification).toBe('center');
        expect(textItem.point.x).toBe(220.5);
    });

    it('should create multiline text', () => {
        const rectangle = new paper.Rectangle(100, 100, 240, 20);
        const textItem = <paper.AreaText>PaperHelper.createMultilineText(rectangle, 'My Wrapped Text', 23, 'right').textItem;

        expect(textItem.content).toBe('My Wrapped Text');
        expect(textItem.fontSize).toBe(23);
        expect(textItem.justification).toBe('right');
        expect(textItem.rectangle).toBe(rectangle);
    });

    it('should create multiline text with default values', () => {
        const rectangle = new paper.Rectangle(100, 100, 240, 20);
        const textItem = <paper.AreaText>PaperHelper.createMultilineText(rectangle, 'My Wrapped Text').textItem;

        expect(textItem.content).toBe('My Wrapped Text');
        expect(textItem.fontSize).toBe(10);
        expect(textItem.justification).toBe('left');
        expect(textItem.rectangle).toBe(rectangle);
    });
});