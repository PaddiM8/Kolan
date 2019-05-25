const path = require('path')

module.exports = {
   entry: './src/wwwroot/js/index.js',
   output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, './src/wwwroot/dist')
   }
}
