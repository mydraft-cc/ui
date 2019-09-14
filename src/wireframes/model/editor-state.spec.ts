import { Diagram, EditorState } from '@app/wireframes/model';

describe('EditorState', () => {
    const state_1 = EditorState.empty();

    const diagram = Diagram.empty('1');

    it('should instantiate', () => {
        const state = EditorState.empty();

        expect(state).toBeDefined();
    });

    it('should add diagram', () => {
        const state_2 = state_1.addDiagram(diagram);

        expect(state_2.diagrams.has(diagram.id)).toBeTruthy();
    });

    it('should remove diagram', () => {
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.removeDiagram(diagram.id);

        expect(state_3.diagrams.has(diagram.id)).toBeFalsy();
    });

    it('should return original state when diagram to remove is not found', () => {
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.removeDiagram('unfound');

        expect(state_2).toBe(state_3);
    });

    it('should unselect diagram when diagram to remove is selected', () => {
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.selectDiagram(diagram.id);
        const state_4 = state_3.removeDiagram(diagram.id);

        expect(state_4.diagrams.has(diagram.id)).toBeFalsy();
        expect(state_4.selectedDiagramId).toBeNull();
    });

    it('should select diagram', () => {
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.selectDiagram(diagram.id);

        expect(state_3.selectedDiagramId).toBe(diagram.id);
    });

    it('should return original state when diagram to select is not found', () => {
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.selectDiagram('unfound');

        expect(state_2).toBe(state_3);
    });

    it('should update diagram', () => {
        const newDiagram = Diagram.empty(diagram.id);

        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram(diagram.id, d => newDiagram);

        expect(state_3.diagrams.size).toBe(1);
        expect(state_3.diagrams.get(diagram.id)).toEqual(newDiagram);
    });

    it('sshould return orignal state when diagram to update is not found', () => {
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram('unfound', d => Diagram.empty(d.id));

        expect(state_2).toBe(state_3);
    });

    it('sshould return orignal state when updater returns same diagram', () => {
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram(diagram.id, d => d);

        expect(state_2).toBe(state_3);
    });
});
