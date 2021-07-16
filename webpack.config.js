const path = require('path');

const gameBundle = {
    entry: {
        web: './client/web/index.js',
    },
    devtool: 'eval-cheap-source-map',
    mode: 'development',
    target: 'web',
    output: {
        filename: '[name].bundle.js',
        library: 'frogJuice',
        path: path.resolve(__dirname, 'client/web/')
    }
}

module.exports = gameBundle;
