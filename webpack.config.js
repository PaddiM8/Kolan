const path = require('path')

module.exports = {
   entry: './src/wwwroot/js/boards.js',
   output: {
      filename: 'boards.js',
      path: path.resolve(__dirname, './src/wwwroot/dist')
   }
}
