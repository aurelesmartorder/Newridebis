import type { AppData } from './model';
import { exercises } from '../content/exercises.ts';
import { trainingReferences } from '../content/trainingLibrary.ts';
export function aliContext(data:AppData, question:string){
 const horse=data.horses.find(h=>h.id===data.selectedHorseId);
 const sessions=data.sessions.filter(s=>s.status==='finished'&&(!horse||s.horseId===horse.id)).slice(-5).map(s=>({exercise:s.title,horse:s.horseName,outcome:s.outcome||'non renseigné',observation:(s.notes||'').slice(0,300),date:new Date(s.startedAt).toISOString().slice(0,10)}));
 const words=question.toLocaleLowerCase('fr').match(/[a-zà-ÿ]{4,}/g)||[];
 const matched=exercises.map(e=>({exercise:e,score:words.filter(w=>(e.title+' '+e.goal).toLocaleLowerCase('fr').includes(w)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,2).map(({exercise:e})=>({title:e.title,level:e.level,goal:e.goal,prerequisite:e.prerequisite,criteria:e.criteria||[],sources:e.sources}));
 return {scope:'Carnet local ; déclarations du cavalier, pas mesures vérifiées.',horse:horse?{name:horse.name}:null,recentSessions:sessions,relatedExercises:matched,references:trainingReferences.map(r=>({title:r.title,url:r.url,limits:r.detail}))};
}
