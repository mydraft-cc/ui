import { DiagramContainer } from '@app/wireframes/model';

describe('DiagramContainer', () => {
    it('should throw when calculating bounds', () => {
        const container = DiagramContainer.createContainer();

        expect(() => container.bounds(null!)).toThrowError();
    });

    it('should throw when transforming bounds', () => {
        const container = DiagramContainer.createContainer();

        expect(() => container.transformByBounds(null!, null!)).toThrowError();
    });

    it('should return original container when item id to remove is not in container', () => {
        const container_1 = DiagramContainer.createContainer();
        const container_2 = container_1.removeItems('item');

        expect(container_2).toBe(container_1);
    });
});