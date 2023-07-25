module.exports = {
    root: true,
    extends: [
        'eslint-config-ay',
        'eslint-config-ay/import',
        'eslint-config-ay/react',
        'eslint-config-ay/typescript',
    ],
    rules: { 'no-console': 'off', 'no-unused-vars': 'off'},
};
