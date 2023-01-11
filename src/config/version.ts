/**
 * Import swup's current version from package.json
 */

// This will only work in webpack 4
// export { version as default } from '../../package.json';

// This will work in microbundle + webpack 5, but won't treeshake in webpack 4
// Ignore next line in TypeScript as package.json is outside of rootDir
// @ts-ignore
import pckg from '../../package.json';

export default pckg.version;
