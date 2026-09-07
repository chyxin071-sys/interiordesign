import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
const root=process.cwd();
const images=['/source-plan.png','/references/style-01.png','/references/style-02.png','/references/style-03.png'];
const embedded=new Map(await Promise.all(images.map(async p=>[p,'data:image/png;base64,'+(await fs.readFile(path.join(root,'public',p))).toString('base64')])));
const result=await build({configFile:false,root,publicDir:false,resolve:{alias:{'@':root}},plugins:[{name:'embed-residence-images',enforce:'pre',transform(code,id){if(!/\.[jt]sx?$/.test(id)||id.includes('node_modules'))return;for(const [p,data] of embedded)code=code.replaceAll(p,data);return code;}},react()],css:{postcss:{plugins:[tailwindcss()]}},define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:true,cssCodeSplit:false,lib:{entry:path.join(root,'standalone/main.tsx'),name:'InteriorDesignViewer',formats:['iife']},rollupOptions:{output:{inlineDynamicImports:true}}}});
const output=(Array.isArray(result)?result[0]:result).output;
const chunks=output.filter(x=>x.type==='chunk');
if(chunks.length!==1||chunks[0].imports.length||chunks[0].dynamicImports.length){console.error(chunks.map(x=>({fileName:x.fileName,imports:x.imports,dynamicImports:x.dynamicImports})));throw new Error('Expected one self-contained script');}
const css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Interior Design Viewer</title><style>'+css.replaceAll('</style','<\\/style')+'</style></head><body><div id="root"></div><script>'+chunks[0].code.replaceAll('</script','<\\/script')+'</script></body></html>';
await fs.mkdir('deliverables',{recursive:true});
await fs.writeFile('deliverables/Interior-Design-Viewer.html',html);
console.log('Standalone HTML:',Buffer.byteLength(html),'bytes; all four reference images embedded; no external JS chunks.');
