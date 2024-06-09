// babel-jest.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    'next/babel',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
        root: ['./'],
      },
    ],
  ],
};
