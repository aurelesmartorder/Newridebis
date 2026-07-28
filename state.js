import { bus } from '../core/event-bus.js';

export class HeadsetController {
  async enable(){ const ok=await window.enableHeadsetMode(false); bus.emit(ok?'headset:enabled':'headset:error'); return ok; }
  disable(){ window.disableHeadsetMode(false); bus.emit('headset:disabled'); }
  async listenOnce(){ return window.guidedVoiceReply(); }
  status(){ return {
    active:!!window.S?.headsetModeActive,
    listening:!!window.S?.headsetListening,
    device:window.S?.headsetDeviceLabel||'',
    transcript:window.S?.headsetLastTranscript||'',
  }; }
}
