import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';
import exifr from 'exifr';

const VIRTUAL_ID = 'virtual:photos';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const IMAGE = /\.(jpe?g|png|webp)$/i;

// Turns a folder of images into an importable list of { name, src, width, height, taken }.
// Pixel sizes and the EXIF capture time are read at build time, so the page can lay photos
// out by orientation and find the newest ones without downloading them first. The files
// themselves go through Vite's normal asset pipeline, so the originals are served untouched.
// "2025:12:21 01:28:01" from the camera, as "2025-12-21T01:28:01" (no time zone: it is camera time).
async function captureTime(buffer) {
  try {
    const exif = await exifr.parse(buffer, { pick: ['DateTimeOriginal', 'CreateDate'], reviveValues: false });
    const raw = exif?.DateTimeOriginal || exif?.CreateDate;
    const m = typeof raw === 'string' && /^(\d{4}):(\d{2}):(\d{2}) (\d{2}:\d{2}:\d{2})/.exec(raw);
    return m ? m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] : null;
  } catch {
    return null;
  }
}

export default function photoManifest({ dir = 'src/assets/portfolio' } = {}) {
  let folder;

  return {
    name: 'photo-manifest',

    configResolved(config) {
      folder = path.resolve(config.root, dir);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return;
      const files = readdirSync(folder).filter((file) => IMAGE.test(file)).sort();
      const imports = [];
      const entries = [];
      for (const [i, file] of files.entries()) {
        const buffer = readFileSync(path.join(folder, file));
        const { width, height } = imageSize(buffer);
        const taken = await captureTime(buffer);
        imports.push('import src' + i + ' from ' + JSON.stringify('/' + dir + '/' + file) + ';');
        entries.push('  { name: ' + JSON.stringify(file) + ', src: src' + i + ', width: ' + width + ', height: ' + height + ', taken: ' + JSON.stringify(taken) + ' },');
      }
      return imports.join('\n') + '\nexport default [\n' + entries.join('\n') + '\n];\n';
    },

    // In dev, adding or removing a photo rebuilds the list and reloads the page.
    // (Not addWatchFile: Vite's import analysis would try to resolve the folder as a module.)
    configureServer(server) {
      const refresh = (event) => (file) => {
        if (!file.startsWith(folder) || !IMAGE.test(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.config.logger.info('[photo-manifest] ' + event + ' ' + path.basename(file) + ', reloading');
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(folder);
      server.watcher.on('add', refresh('added'));
      server.watcher.on('unlink', refresh('removed'));
    },
  };
}
