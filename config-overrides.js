const path = require('path');

module.exports = function override(config, env) {
  // Добавляем правило, которое будет обрабатывать CSS файлы react-toastify
  config.module.rules.push({
    test: /react-toastify\/.*\.css$/,
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader',
        options: {
          modules: false
        }
      }
    ]
  });
  
  return config;
}; 