import pkg from '../package.json' assert { type: 'json' };

type PackageMeta = { name?: string; version?: string };
const meta = pkg as PackageMeta;

export const APP_NAME = meta.name ?? 'angle-setter';
export const APP_VERSION = meta.version ?? '0.0.0';

// Optional build metadata (e.g., commits since last deploy) injected at build time via Vite env.
type ViteEnv = { VITE_BUILD_META?: string };
const metaEnv =
  typeof import.meta !== 'undefined' && typeof (import.meta as { env?: unknown }).env === 'object'
    ? ((import.meta as { env: unknown }).env as ViteEnv)
    : undefined;
const envBuildMeta = metaEnv?.VITE_BUILD_META;
const buildMeta =
  typeof envBuildMeta === 'string' && envBuildMeta.trim() ? envBuildMeta.trim() : null;

export const APP_BUILD_META = buildMeta;
export const APP_VERSION_DISPLAY = buildMeta ? `${APP_VERSION}+${buildMeta}` : APP_VERSION;
