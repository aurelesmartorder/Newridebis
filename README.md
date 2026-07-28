import { bus } from './core/event-bus.js';
import { TrainingEngine, createLegacyTrainingAdapter } from './coach/training-engine.js';
import { HeadsetController } from './voice/headset-controller.js';
import { getSensorSnapshot } from './sensors/sensor-snapshot.js';
import { classifyCommand } from './coach/command-router.js';

const waitForLegacy=()=>new Promise((resolve,reject)=>{
  const deadline=Date.now()+10000;
  const tick=()=>{
    if(window.S && typeof window.startGuidedWorkout==='function') return resolve();
    if(Date.now()>deadline) return reject(new Error('NewRide legacy non initialisé'));
    setTimeout(tick,50);
  }; tick();
});

await waitForLegacy();
const training=new TrainingEngine(createLegacyTrainingAdapter());
const headset=new HeadsetController();
window.NewRideV2={training,headset,getSensorSnapshot,classifyCommand,bus,version:'2.0.0-alpha'};

const badge=document.createElement('div');
badge.className='nr-v2-status';badge.textContent='NewRide V2 prête';badge.dataset.visible='true';document.body.appendChild(badge);
setTimeout(()=>badge.dataset.visible='false',2400);
console.info('NewRide V2 modules initialisés',window.NewRideV2);
