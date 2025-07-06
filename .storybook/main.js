/** @type {import('@storybook/react-vite').StorybookConfig} */

class FilterSassWarningsPlugin {
    apply(compiler) {
        compiler.hooks.done.tap('FilterSassWarningsPlugin', (stats) => {
            stats.compilation.warnings = stats.compilation.warnings.filter(warning => {
                const message = warning.message || warning.toString();
                console.log('FOO');
                return !message.includes('sass-loader');
            });
        });
    }
}

const config = {
    stories: [
        '../src/**/*.stories.@(js|jsx|ts|tsx)'
    ],
    addons: ['@storybook/addon-links', '@storybook/addon-docs'],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
    typescript: {
        reactDocgen: 'react-docgen-typescript',
    },
    webpackFinal: async config => {
        config.plugins.push(new FilterSassWarningsPlugin());
        return config;
    },
};

export default config;