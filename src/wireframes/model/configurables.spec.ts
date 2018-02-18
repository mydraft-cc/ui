import {
    ColorConfigurable,
    SelectionConfigurable,
    SliderConfigurable
} from '@app/wireframes/model';

describe('SelectionConfigurable', () => {
    it('should instantiate', () => {
        const options = ['Option1', 'Option2'];

        const configurable = new SelectionConfigurable('MyName', 'MyLabel', options);

        expect(configurable).toBeDefined();
        expect(configurable.options).toBe(options);
    });
});

describe('SliderConfigurable', () => {
    it('should instantiate', () => {
        const configurable = new SliderConfigurable('MyName', 'MyLabel', 10, 20);

        expect(configurable).toBeDefined();
        expect(configurable.min).toBe(10);
        expect(configurable.max).toBe(20);
    });

    it('should instantiate default', () => {
        const configurable = new SliderConfigurable('MyName', 'MyLabel');

        expect(configurable).toBeDefined();
        expect(configurable.min).toBe(0);
        expect(configurable.max).toBe(100);
    });
});

describe('ColorConfigurable', () => {
    it('should instantiate', () => {
        const configurable = new ColorConfigurable('MyName', 'MyLabel');

        expect(configurable).toBeDefined();
    });
});