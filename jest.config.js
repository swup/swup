export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	transformIgnorePatterns: [
		'/node_modules/(?!delegate-it)'
	],
	transform: {
		"^.+\\.(j|t)sx?$": [
			'babel-jest',
			{
				presets: ['@babel/env', '@babel/typescript', '@babel/preset-react'],
			},
		],
	},
	setupFilesAfterEnv: ['./setup-jest.ts'],
	modulePathIgnorePatterns: ['<rootDir>/cypress/'],
};
