const path = require('path')

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        boards: './Kolan/wwwroot/js/views/boardsView.js',
        board: './Kolan/wwwroot/js/views/boardView.js',
        userSettings: './Kolan/wwwroot/js/views/userSettingsView.js',
        components: './Kolan/wwwroot/js/components/components.js',
        login: './Kolan/wwwroot/js/views/loginView.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './Kolan/wwwroot/dist')
    }
}
