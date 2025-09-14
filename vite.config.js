import { defineConfig } from 'vite';
import zipPack from "vite-plugin-zip-pack";
import CleanCSS from 'vite-plugin-clean-css';
import { promises as fs } from 'fs';
import path from 'path';


export default defineConfig(({ command, mode }) => {


  if (command === 'serve') {
    // Development specific configuration
    return {
      server: {
        open: true,
        port: 8080,
      },
      plugins: [],
    };

    // Full bundle build configuration
  } else if (command === 'build') {

    if (mode === 'production') {

      return {
        build: {
          outDir: './build',
          emptyOutDir: true,
          //sourcemap: true,
          // other full bundle build options
        },
        plugins: [],
      };



      //game Mode, no three.js module bundled

    } else if (mode === 'game') {

      return {
        base: './',
        build: {
          outDir: './dist',
          emptyOutDir: true,
          // sourcemap: true,
          minify: 'terser',
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              passes: 2,              
              toplevel: true,
              // booleans_as_integers: true,
              // ecma: 2020,          
              // module: true,
              // arrows: true,
              // defaults: true,
              // unsafe: true,           
              // unsafe_arrows: true,
              // unsafe_methods: true,
              // unsafe_proto: true,
              // unsafe_regexp: true,
              // unsafe_undefined: true,
            },
            mangle: {
              toplevel: true,
            },
            format: {
              comments: false,
            },
          },

          rollupOptions: {
            input: 'index.html',
            external: ['three', 'lil-gui'], //not include three in the bundle, called in index.html
            output: {
              inlineDynamicImports: true,
              entryFileNames: `script.js`,
              chunkFileNames: `[name].js`,
              assetFileNames: `[name].[ext]`
            }
          },
          modulePreload: false,
          cssCodeSplit: false,        
          assetsInlineLimit: 0,       
        },
        publicDir: 'public',
        plugins: [

          {
            name: 'clean-dist-zip',
            buildEnd: async () => {
              await deleteFolderContents('./dist-zip');
              console.log('dist-zip folder cleaned.');
            }
          },

          CleanCSS({ level: 2 }),

          zipPack({ filter: (file) => !file.includes('Thumbs.db') }),





        ],
      };
    }
  }
});


const deleteFolderContents = async (folderPath) => {
  try {
    const files = await fs.readdir(folderPath);
    for (const file of files) {
      const currentPath = path.join(folderPath, file);
      const stat = await fs.lstat(currentPath);
      if (stat.isDirectory()) {
        await deleteFolderContents(currentPath);
        await fs.rmdir(currentPath);
      } else {
        await fs.unlink(currentPath);
      }
    }
    console.log(`Contents of ${folderPath} deleted.`);
  } catch (err) {
    console.error(`Error deleting contents of ${folderPath}:`, err);
  }
}



//npm run dev

//headset
//npm run dev -- --host 
//chrome://inspect/#devices

// npm run build:production  // for full bundle, including three.js
// npm run build:game // for js13k comp upload - external three.js


