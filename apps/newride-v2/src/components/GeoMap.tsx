import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GpsPoint } from '../lib/guestRide';
export function GeoMap({points}: {points: GpsPoint[]}) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const trace = useRef<L.Polyline | null>(null);
  const places = useRef<L.LayerGroup | null>(null);
  const marker = useRef<L.CircleMarker | null>(null);
  const accuracy = useRef<L.Circle | null>(null);
  const [follow, setFollow] = useState(false);
  const [message, setMessage] = useState('Activez votre position pour vous situer sur la carte.');
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const instance = L.map(host.current).setView([46.6, 2.4], 6);
    map.current = instance;
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance);
    tiles.on('tileerror', () => setTileError(true));
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(host.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; marker.current = null; accuracy.current = null; trace.current = null; };
  }, []);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    places.current?.remove();
    places.current = L.layerGroup(points.filter(p=>p.at === 0).map(p=>L.circleMarker([p.lat,p.lng],{radius:9,color:"#fff",weight:3,fillColor:"#ff6746",fillOpacity:1}))).addTo(instance);
    trace.current?.remove();
    trace.current = null;
    if (points.length) {
      trace.current = L.polyline(points.map(p => [p.lat, p.lng] as [number, number]), {color:'#ff6746',weight:4}).addTo(instance);
      if (!follow) instance.fitBounds(trace.current.getBounds(), {padding:[30,30],maxZoom:16});
    }
  }, [points, follow]);
  useEffect(() => {
    if (!follow) return;
    if (!navigator.geolocation) { setMessage('La localisation n’est pas disponible sur ce navigateur.'); setFollow(false); return; }
    setMessage('Recherche de votre position GPS…');
    const watch = navigator.geolocation.watchPosition(p => {
      const instance = map.current;
      if (!instance) return;
      const {latitude:lat,longitude:lng,accuracy:radius} = p.coords;
      if (![lat,lng,radius].every(Number.isFinite)) return;
      marker.current ??= L.circleMarker([lat,lng],{radius:8,color:'#fff',weight:3,fillColor:'#215ed3',fillOpacity:1}).addTo(instance);
      accuracy.current ??= L.circle([lat,lng],{radius,color:'#215ed3',weight:1,fillOpacity:0.08}).addTo(instance);
      marker.current.setLatLng([lat,lng]); accuracy.current.setLatLng([lat,lng]).setRadius(radius);
      instance.setView([lat,lng], Math.max(instance.getZoom(),16));
      setMessage(`Position reçue à ${new Date(p.timestamp).toLocaleTimeString('fr-FR')} · précision ± ${Math.round(radius)} m${radius > 50 ? ' · signal imprécis' : ''}`);
    }, e => {
      setMessage(e.code === 1 ? 'Localisation refusée. Autorisez-la dans les réglages du navigateur pour réessayer.' : e.code === 3 ? 'Délai GPS dépassé. Réessayez à l’extérieur.' : 'Position indisponible. Vérifiez la localisation du téléphone.');
      setFollow(false);
    },{enableHighAccuracy:true,maximumAge:0,timeout:20000});
    return () => navigator.geolocation.clearWatch(watch);
  }, [follow]);
  return <section className="geo-map-panel" aria-label="Carte géographique interactive">
    <div className="geo-map-toolbar"><button className="studio-dark" onClick={() => {setFollow(v => !v); if(follow) setMessage('Suivi arrêté. La dernière position reste affichée.');}}>{follow ? 'Arrêter le suivi de position' : 'Me localiser en direct'}</button><p role="status">{message}</p></div>
    <div ref={host} className="geo-map-canvas" />
    {tileError && <p role="alert">Certains détails de la carte n’ont pas pu être chargés. Vérifiez votre connexion Internet.</p>}
    <p className="compat-note">Fond OpenStreetMap : rues, lieux et chemins selon les données disponibles. Le cercle bleu représente l’incertitude GPS. Ce suivi ne lance pas l’enregistrement d’une sortie et ne garantit pas qu’un chemin est praticable ou autorisé. La carte nécessite Internet ; les tuiles de la zone affichée sont demandées à OpenStreetMap.</p>
  </section>;
}
