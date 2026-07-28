import { bus } from '../core/event-bus.js';

export class TrainingEngine {
  constructor(adapter){ this.adapter=adapter; this.active=false; }
  async start(){
    if(this.active) return;
    this.active=true;
    bus.emit('training:start');
    try { await this.adapter.start(); }
    catch(error){ this.active=false; bus.emit('training:error',error); throw error; }
  }
  pause(){ this.adapter.pause(); bus.emit('training:pause'); }
  ready(){ this.adapter.ready(); bus.emit('training:ready'); }
  stop(){ this.adapter.stop(); this.active=false; bus.emit('training:stop'); }
  snapshot(){ return this.adapter.snapshot(); }
}

export function createLegacyTrainingAdapter(){
  return {
    start:()=>window.startGuidedWorkout(),
    pause:()=>window.guidedPauseResume(),
    ready:()=>window.guidedConfirmReady(),
    stop:()=>window.stopGuidedWorkout(false),
    snapshot:()=>({
      active:!!window.S?.guidedWorkoutActive,
      paused:!!window.S?.guidedPaused,
      waitingReady:!!window.S?.guidedWaitingReady,
      phaseIndex:window.S?.guidedPhaseIndex||0,
      remaining:window.S?.guidedPhaseRemaining||0,
      phases:window.S?.guidedPhases||[],
    }),
  };
}
