const path = require('path')

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        boards: './Kolan/wwwroot/js/views/boards.js',
        board: './Kolan/wwwroot/js/views/board.js',
        userSettings: './Kolan/wwwroot/js/views/userSettings.js',
        components: './Kolan/wwwroot/js/components/components.js',
        login: './Kolan/wwwroot/js/views/login.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './Kolan/wwwroot/dist')
    }
}
