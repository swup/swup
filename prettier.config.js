module.exports = {
	printWidth: 100,
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	trailingComma: 'none',
	bracketSpacing: true,
	jsxBracketSameLine: false,
	arrowParens: 'always',
	proseWrap: 'always',

	overrides: [
		{
			files: '{.*.json,*.json,.*.y?(a)ml,*.y?(a)ml,*.md,.prettierrc,.stylelintrc,.babelrc}',
			options: {
				tabWidth: 2,
				useTabs: false
			}
		},
		{
			files: '*.md',
			options: {
				proseWrap: 'preserve'
			}
		}
	]
};
