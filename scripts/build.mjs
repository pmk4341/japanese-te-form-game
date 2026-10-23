import {readFile, mkdir, writeFile, copyFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root),'utf8');
let html = await read('index.html');
const css = await read('style.css');
const engine = (await read('engine.js')).replace(/^export /gm,'');
const questions = (await read('questions.js')).replace(/^export /gm,'');
const app = (await read('app.js')).replace(/^import .*;\n/gm,'');
html = html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`)
  .replace('<script type="module" src="app.js"></script>',()=>`<script>\n(() => {\n'use strict';\n${engine}\n${questions}\n${app}\n})();\n</script>`);
html = html.replace('<span class="tag">문법 놀이터 · 01</span>', '<button type="button" class="tag" id="download-game">↓ HTML 다운로드</button>');
const downloadScript = `
<script>
(() => {
  document.getElementById('download-game').addEventListener('click', () => {
    const html = '<!doctype html>\\n' + document.documentElement.outerHTML;
    const url = URL.createObjectURL(new Blob([html], {type: 'text/html;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'japanese-te-form-game.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
</script>`;
html = html.replace('</body>', () => downloadScript + '\n</body>');
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/game.html',root),html);
console.log('Built dist/game.html — self-contained, no server or external resources required.');

for (const file of ['qr.png', 'qr.svg']) await copyFile(new URL('public/' + file, root), new URL('dist/' + file, root));
