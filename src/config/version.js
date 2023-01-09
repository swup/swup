/**
 * Import swup's current version from package.json
 */

// This will only work in webpack 4
// export { version as default } from '../../package.json';

// This will work in microbundle + webpack 5, but won't treeshake in webpack 4
import pckg from '../../package.json';
export default pckg.version;
