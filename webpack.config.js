const path = require('path')

module.exports = {
   mode: 'development',
   entry: {
      boards: './src/wwwroot/js/boards.js',
      components: './src/wwwroot/js/components/components.js'
   },
   output: {
      filename: '[name].js',
      path: path.resolve(__dirname, './src/wwwroot/dist')
   }
}
