const path = require('path')

module.exports = {
   mode: 'development',
   entry: {
      boards: './src/wwwroot/js/boards.js',
      board: './src/wwwroot/js/board.js',
      components: './src/wwwroot/js/components/components.js'
   },
   output: {
      filename: '[name].js',
      path: path.resolve(__dirname, './src/wwwroot/dist')
   }
}
