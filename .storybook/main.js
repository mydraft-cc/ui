/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
    stories: [
        '../src/**/*.stories.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)'
    ],

    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials'
    ],

    framework: {
        name: '@storybook/react-vite',
        options: {}
    },

    docs: {
        autodocs: true
    }
};

export default config;