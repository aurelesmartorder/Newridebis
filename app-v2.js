const patterns={
  pause:/\b(pause|mets? en pause|arr[eê]te le chrono)\b/i,
  resume:/\b(reprends?|continue|on reprend)\b/i,
  ready:/\b(je suis pr[eê]t(?:e)?|on y va|vas[- ]?y|go)\b/i,
  stop:/\b(arr[eê]te|termine|fin de l['’]entra[iî]nement)\b/i,
  remaining:/\b(combien de temps|temps reste|reste[- ]?t[- ]?il)\b/i,
  repeat:/\b(r[eé]p[eè]te|redis|quelle est la consigne)\b/i,
};
export function classifyCommand(text=''){
  for(const [intent,re] of Object.entries(patterns)) if(re.test(text)) return {intent,text};
  return {intent:'coach_question',text};
}
