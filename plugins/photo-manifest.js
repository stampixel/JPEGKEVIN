import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';

const VIRTUAL_ID = 'virtual:photos';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const IMAGE = /\.(jpe?g|png|webp)$/i;

// Turns a folder of images into an importable list of { name, src, width, height }.
// Pixel sizes are read from the file headers at build time, so the page can lay photos
// out by orientation without downloading them first. The files themselves go through
// Vite's normal asset pipeline, so the originals are served untouched.
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

    load(id) {
      if (id !== RESOLVED_ID) return;
      const files = readdirSync(folder).filter((file) => IMAGE.test(file)).sort();
      const imports = [];
      const entries = [];
      files.forEach((file, i) => {
        const { width, height } = imageSize(readFileSync(path.join(folder, file)));
        imports.push('import src' + i + ' from ' + JSON.stringify('/' + dir + '/' + file) + ';');
        entries.push('  { name: ' + JSON.stringify(file) + ', src: src' + i + ', width: ' + width + ', height: ' + height + ' },');
      });
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
