import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (specifier.startsWith('.') && context.parentURL && context.parentURL.startsWith('file:')) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const targetPath = path.resolve(parentDir, specifier);
      for (const ext of ['.ts', '.tsx', '/index.ts', '.js']) {
        const candidate = targetPath + ext;
        if (fs.existsSync(candidate)) {
          return await nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    throw err;
  }
}
