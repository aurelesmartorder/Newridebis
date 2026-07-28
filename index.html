async function postJSON(url, body){
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error||`Erreur HTTP ${response.status}`);
  return data;
}
export const coachChat=(system,messages)=>postJSON('/.netlify/functions/coach-chat',{system,messages});
export const transcribeAudio=(audio,mimeType,language='fr')=>postJSON('/.netlify/functions/transcribe-audio',{audio,mimeType,language});
