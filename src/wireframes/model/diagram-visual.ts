import * as Immutable from 'immutable';

import { DiagramItem } from './diagram-item';

export abstract class DiagramVisual extends DiagramItem {
    public static readonly APPEARANCE_OPACITY = 'OPACITY';
    public static readonly APPEARANCE_STROKE_COLOR = 'STROKE_COLOR';
    public static readonly APPEARANCE_STROKE_THICKNESS = 'STROKE_THICKNESS';

    protected constructor(id: string,
        public appearance: Immutable.Map<string, any>
    ) {
        super(id);
    }

    public replaceAppearance(appearance: Immutable.Map<string, any>) {
        if (!appearance) {
            return this;
        }

        return this.cloned<DiagramVisual>((state: DiagramVisual) => state.appearance = appearance);
    }

    public setAppearance(key: string, value: any): DiagramVisual {
        if (!key || this.appearance.get(key) === value) {
            return this;
        }

        return this.cloned<DiagramVisual>((state: DiagramVisual) => state.appearance = state.appearance.set(key, value));
    }

    public unsetAppearance(key: string): DiagramVisual {
        if (!key || !this.appearance.get(key)) {
            return this;
        }

        return this.cloned<DiagramVisual>((state: DiagramVisual) => state.appearance = state.appearance.remove(key));
    }
}