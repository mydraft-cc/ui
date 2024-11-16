import '@app/index.scss'

export const parameters = {
    actions: {
        argTypesRegex: '^on[A-Z].*'
    },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },

    backgrounds: {
        values: [
            { name: 'Dark', value: '#333' },
            { name: 'Light', value: '#F7F9F2' },
            { name: 'Gray', value: '#efefef' },
        ]
    }
}