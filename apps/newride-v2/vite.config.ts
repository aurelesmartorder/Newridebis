import { defineConfig } from 'vite';
const origin = 'https://famous-starburst-2555e3.netlify.app';
const functions = new Set(['coach-chat','realtime-token','transcribe-audio','analyze-video-session','describe-photo','text-to-speech','send-report']);
export default defineConfig({server:{proxy:{
 '/newridebis/config.js':{target:origin,changeOrigin:true,rewrite:()=>'/config.js'},
 '^/api/(coach-chat|realtime-token|transcribe-audio|analyze-video-session|describe-photo|text-to-speech|send-report)$':{target:origin,changeOrigin:true,rewrite:path=>{const name=path.split('/').pop()!;return functions.has(name)?'/.netlify/functions/'+name:'/not-found';}},
}}});
