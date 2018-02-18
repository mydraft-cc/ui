import { Diagram, EditorState } from '@app/wireframes/model';

describe('EditorState', () => {
    const diagram = Diagram.createDiagram();

    it('should instantiate', () => {
        const state = EditorState.createInitial();

        expect(state).toBeDefined();
    });

    it('should add diagram', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);

        expect(state_2.diagrams.contains(diagram.id)).toBeTruthy();
    });

    it('should return original state when diagram to add is null', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(null!);

        expect(state_1).toBe(state_2);
    });

    it('should remove diagram', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.removeDiagram(diagram.id);

        expect(state_3.diagrams.contains(diagram.id)).toBeFalsy();
    });

    it('should return original state when diagram to remove is null', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.removeDiagram(null!);

        expect(state_2).toBe(state_3);
    });

    it('should return original state when diagram to remove is not found', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.removeDiagram('unfound');

        expect(state_2).toBe(state_3);
    });

    it('should unselect diagram when diagram to remove is selected', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.selectDiagram(diagram.id);
        const state_4 = state_3.removeDiagram(diagram.id);

        expect(state_4.diagrams.contains(diagram.id)).toBeFalsy();
        expect(state_4.selectedDiagramId).toBeNull();
    });

    it('should select diagram', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.selectDiagram(diagram.id);

        expect(state_3.selectedDiagramId).toBe(diagram.id);
    });

    it('should return original state when diagram to select is null', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.selectDiagram(null);

        expect(state_2).toBe(state_3);
    });

    it('should return original state when diagram to select is not found', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.selectDiagram('unfound');

        expect(state_2).toBe(state_3);
    });

    it('should update diagram', () => {
        const newDiagram = Diagram.createDiagram(diagram.id);

        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram(diagram.id, d => newDiagram);

        expect(state_3.diagrams.size).toBe(1);
        expect(state_3.diagrams.get(diagram.id)).toEqual(newDiagram);
    });

    it('sshould return orignal state when diagram id to update is null', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram(null!, d => Diagram.createDiagram(d.id));

        expect(state_2).toBe(state_3);
    });

    it('sshould return orignal state when diagram to update is not found', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram('unfound', d => Diagram.createDiagram(d.id));

        expect(state_2).toBe(state_3);
    });

    it('sshould return orignal state when updater is null', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram(diagram.id, null!);

        expect(state_2).toBe(state_3);
    });

    it('sshould return orignal state when updater returns null', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram(diagram.id, d => null!);

        expect(state_2).toBe(state_3);
    });

    it('sshould return orignal state when updater returns same diagram', () => {
        const state_1 = EditorState.createInitial();
        const state_2 = state_1.addDiagram(diagram);
        const state_3 = state_2.updateDiagram(diagram.id, d => d);

        expect(state_2).toBe(state_3);
    });

    it('should move shape to new index', () => {
        const d1 = Diagram.createDiagram('1');
        const d2 = Diagram.createDiagram('2');
        const d3 = Diagram.createDiagram('3');
        const d4 = Diagram.createDiagram('4');
        const d5 = Diagram.createDiagram('5');

        const state_1 =
            EditorState.createInitial()
                .addDiagram(d1)
                .addDiagram(d2)
                .addDiagram(d3)
                .addDiagram(d4)
                .addDiagram(d5);
        const state_2 = state_1.moveDiagram(d4.id, 1);

        expect(state_2.diagrams.toArray()).toEqual([d1, d4, d2, d3, d5]);
    });
});
