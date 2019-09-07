import { DiagramItem } from './diagram-item';

describe('DiagramItem', () => {
    const item_1 = DiagramItem.createShape('1', 'btn', 100, 20);

    it('should return original item when already unlocked', () => {
        const item_2 = item_1.unlock();

        expect(item_2).toBe(item_1);
    });

    it('should set isLocked when locking', () => {
        const item_2 = item_1.lock();

        expect(item_2.isLocked).toBeTruthy();
    });

    it('should set isLocked when unlocking', () => {
        const item_2 = item_1.lock();
        const item_3 = item_2.unlock();

        expect(item_3.isLocked).toBeFalsy();
    });

    it('should return original item when already locked', () => {
        const item_2 = item_1.lock();
        const item_3 = item_2.lock();

        expect(item_3).toBe(item_2);
    });
});
