import { useCallback, useEffect, useRef, useState } from 'react';
/** Uses the same configured ALI service as other spoken answers, never device TTS. */
export function useAliSpeech(){
 const current=useRef<{controller:AbortController;audio:HTMLAudioElement;url?:string}|null>(null);
 const [status,setStatus]=useState<'idle'|'loading'|'playing'>('idle');
 const [error,setError]=useState('');
 const stop=useCallback(()=>{const task=current.current;current.current=null;if(task){task.controller.abort();task.audio.pause();task.audio.removeAttribute('src');task.audio.load();if(task.url)URL.revokeObjectURL(task.url)}setStatus('idle')},[]);
 const speak=useCallback(async(text:string)=>{
  stop();setError('');setStatus('loading');
  const task={controller:new AbortController(),audio:new Audio(),url:undefined as string|undefined};current.current=task;
  try{const res=await fetch('/api/text-to-speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:task.controller.signal});
   if(!res.ok||!res.headers.get('Content-Type')?.startsWith('audio/'))throw Error('voice');
   const blob=await res.blob();if(current.current!==task)return;
   task.url=URL.createObjectURL(blob);task.audio.src=task.url;
   task.audio.onended=()=>{if(current.current===task)stop()};
   task.audio.onerror=()=>{if(current.current===task){stop();setError('La lecture a échoué. Réessayez ; la consigne reste disponible à l’écran.')}};
   await task.audio.play();if(current.current===task)setStatus('playing');
  }catch(e){if(current.current!==task)return;stop();if(!(e instanceof DOMException&&e.name==='AbortError'))setError('La voix ALI est indisponible ou la lecture a été bloquée. Touchez à nouveau Écouter. La consigne reste lisible.');}
 },[stop]);
 useEffect(()=>()=>{const t=current.current;if(t){t.controller.abort();t.audio.pause();if(t.url)URL.revokeObjectURL(t.url)}},[]);
 return {speak,stop,status,error};
}
