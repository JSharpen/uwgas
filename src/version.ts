import pkg from '../package.json' assert { type: 'json' };

type PackageMeta = { name?: string; version?: string; buildNumber?: number };
const meta = pkg as PackageMeta;

export const APP_NAME = meta.name ?? 'angle-setter';
export const APP_VERSION = meta.version ?? '0.0.0';
export const APP_BUILD_NUMBER = meta.buildNumber ?? 0;

export const APP_VERSION_DISPLAY = `${APP_VERSION} (Build ${APP_BUILD_NUMBER})`;
