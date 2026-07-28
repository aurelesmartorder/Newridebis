export function legacyState(){
  if(!window.S) throw new Error('État NewRide indisponible');
  return window.S;
}
export const now = ()=>Date.now();
