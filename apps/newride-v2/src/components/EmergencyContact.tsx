import { useState } from 'react';
export function EmergencyContact(){
 const [name,setName]=useState(()=>localStorage.getItem('newride.emergency.name')||'');
 const [phone,setPhone]=useState(()=>localStorage.getItem('newride.emergency.phone')||'');
 const [saved,setSaved]=useState(false);
 const clean=phone.replace(/[\s().-]/g,'');const valid=/^\+?[0-9]{6,15}$/.test(clean);
 return <section className="studio-panel"><span className="ride-kicker">SÉCURITÉ / VOTRE CONTACT</span><h2>Quelqu’un à prévenir.</h2><form onSubmit={e=>{e.preventDefault();if(!valid)return;localStorage.setItem('newride.emergency.name',name);localStorage.setItem('newride.emergency.phone',phone);setSaved(true)}}><label>Nom du contact<input value={name} maxLength={80} onChange={e=>{setName(e.target.value);setSaved(false)}}/></label><label>Téléphone<input type="tel" required value={phone} onChange={e=>{setPhone(e.target.value);setSaved(false)}} placeholder="+33…"/></label><button className="studio-dark" disabled={!valid} type="submit">Enregistrer sur cet appareil</button></form>{saved&&<p role="status">Contact enregistré sur cet appareil.</p>}{valid&&<a className="studio-primary" href={'tel:'+clean}>Appeler {name||'mon contact'} maintenant</a>}<p className="compat-note">Appel manuel : le téléphone demande de confirmer l’appel. Aucun appel automatique ni surveillance d’immobilité n’est activé. Les numéros restent sur cet appareil.</p></section>
}
