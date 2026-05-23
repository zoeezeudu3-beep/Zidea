// ------ Firebase --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const FB = 'https://zidea-9da13-default-rtdb.firebaseio.com';
const db = {
  patch(p,d){return fetch(`${FB}/${p}.json`,{method:'PATCH',body:JSON.stringify(d),headers:{'Content-Type':'application/json'}}).then(r=>r.json()).catch(()=>{return new Promise(res=>setTimeout(res,1000))})},
  write(p,d){return fetch(`${FB}/${p}.json`,{method:'PUT',body:JSON.stringify(d),headers:{'Content-Type':'application/json'}}).then(r=>r.json()).catch(()=>{return new Promise(res=>setTimeout(res,1000))})},
  async read(p){for(let n=0;n<3;n++){try{const r=await fetch(`${FB}/${p}.json`);if(r.ok)return await r.json();}catch(_){}if(n<2)await new Promise(res=>setTimeout(res,400*(n+1)));}return null;},
  del(p){return fetch(`${FB}/${p}.json`,{method:'DELETE'}).catch(()=>{})}
};
