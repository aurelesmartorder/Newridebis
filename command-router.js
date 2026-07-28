export function getSensorSnapshot(){
  const sport=typeof window.sp==='function'?window.sp():null;
  return {
    capturedAt:new Date().toISOString(),
    speed:Number(window.S?.spd||0),
    metric2:Number(window.S?.met2||0),
    metric3:Number(window.S?.met3||0),
    labels:sport?.metrics||[],
    units:sport?.metricUnits||[],
    gps:{lat:window.S?.userLat||null,lng:window.S?.userLng||null},
  };
}
