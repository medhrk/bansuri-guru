/* Optional community sharing: published songs are separate from private practice backups. */
(function(){
"use strict";
let songs=[],busy=false;
const $=id=>document.getElementById(id);
function status(text){const x=$("communityStatus");if(x)x.textContent=text}
function cloud(){const api=window.cloudRiyaz;if(!api?.ready)throw Error("Connect Firebase under Google & Backup first.");return api}
function makeButton(text,action){const b=document.createElement("button");b.textContent=text;b.type="button";b.onclick=action;return b}
function render(){
 const container=$("communityList");if(!container)return;
 const term=String($("communitySearch")?.value||"").trim().toLowerCase();
 container.replaceChildren();
 const filtered=songs.filter(x=>!term||[x.title,x.film,x.notation].some(v=>String(v||"").toLowerCase().includes(term)));
 if(!filtered.length){const p=document.createElement("p");p.className="muted";p.textContent=term?"No public songs match your search.":"No public songs to display yet.";container.append(p);return}
 for(const x of filtered){
  const row=document.createElement("article");row.className="community-song";
  const title=document.createElement("h3");title.textContent=x.title;
  const sub=document.createElement("p");sub.className="muted";sub.textContent=(x.film?x.film+" · ":"")+"Shared by a community learner";
  const notes=document.createElement("pre");notes.textContent=x.notation;
  const play=makeButton("♫ Play sargam",()=>{try{playline(x.notation)}catch(e){status("Could not play notation: "+e.message)}});
  const copy=makeButton("Copy notes",async()=>{try{await navigator.clipboard.writeText(x.notation);status("Notation copied. Please credit the contributor if you reuse it.")}catch(e){status("Copy unavailable: "+e.message)}});
  const learn=makeButton("🎯 Learn step by step",()=>{const studio=window.bansuriSongStudio;if(!studio){status("Song teacher is unavailable. Reload the page.");return}studio.openCommunity(x)});
  row.append(title,sub,notes,play,copy,learn);
  if(window.cloudRiyaz?.user?.uid===x.ownerUid){
    row.append(makeButton("Unpublish my note",async()=>{if(!confirm("Remove this notation from public browsing? Your private notes will remain."))return;try{await unpublishById(x.id);status("Publication removed.");await refresh()}catch(e){status("Could not unpublish: "+e.message)}}))
  }
  container.append(row);
 }
}
async function refresh(){
 if(busy)return;try{busy=true;status("Loading public songs…");songs=await cloud().listPublicSongs();render();status("Showing "+songs.length+" public contributions. User-submitted notations are not independently verified.")}catch(e){status("Community unavailable: "+e.message+". If the project rules have not been published, ask the Firebase administrator to publish firestore.rules.")}finally{busy=false}
}
async function unpublishById(id){
 await cloud().unpublishPublicSong(id);
 for(const entry of s.songs){if(entry.publicId===id){delete entry.publicId;delete entry.publicDirty}}
 saveStore();
 songs=songs.filter(x=>x.id!==id);render();
}
async function toggle(index){
 const entry=s.songs[index];if(!entry)return;
 if(!cloud().user){alert("Sign in with Google under Google & Backup to share or unpublish songs.");return}
 if(entry.publicId&&!entry.publicDirty){
  if(!confirm("Unpublish "+entry.title+"? It will stay in your private notebook."))return;
  try{await unpublishById(entry.publicId);songsDraw();status("Your song is private again.")}catch(e){alert("Unpublish failed: "+e.message)}
  return;
 }
 if(!entry.notation?.trim()){alert("Add your own sargam notation before publishing.");return}
 const title=entry.publicId?"Update the public version of":"Make public";
 if(!confirm(title+" “"+entry.title+"”?\n\nOnly the song title, film/artist name and notation will be visible to others. Do not include personal details, full song lyrics or unauthorized copyrighted transcriptions.\n\nConfirm that you created this notation or have permission to share it."))return;
 const id=entry.publicId||crypto.randomUUID().replace(/-/g,"");
 try{
  await cloud().publishPublicSong(entry,id);
  entry.publicId=id;entry.publicDirty=false;
  saveStore();songsDraw();
  status("Published successfully. It is visible in Community Bollywood Notations.");
  await refresh();
 }catch(e){alert("Could not publish: "+e.message+". Check Google sign-in and Firebase public-song rules. Your local entry remains private until publication succeeds.")}
}
window.bansuriCommunity={draw:render,refresh,toggle,unpublishById};
})();
