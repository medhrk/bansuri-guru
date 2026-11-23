/* Local-only phrase recording studio. Audio never enters cloud backup or public songs. */
(function(){
"use strict";
const DB="bansuri-phrase-audio-v1",STORE="takes",MAX_SECONDS=45,MAX_TOTAL=50,MAX_SIZE=8*1024*1024;
let dbPromise=null,session=null,recorder=null,stream=null,chunks=[],timeout=null,audio=null,playUrl=null,recordKey=null,activeSessionToken=0;
const $=id=>document.getElementById(id);
function message(text){const e=$("phraseRecordStatus");if(e)e.textContent=text}
function storage(){
 if(!window.indexedDB)return Promise.reject(Error("This browser does not support local audio storage (IndexedDB)."));
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE)){const st=db.createObjectStore(STORE,{keyPath:"id"});st.createIndex("phrase","phrase");st.createIndex("created","created")}};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||Error("Could not open local audio storage"));
 });
 return dbPromise;
}
async function transact(mode,fn){
 const db=await storage();return new Promise((resolve,reject)=>{
  const transaction=db.transaction(STORE,mode),store=transaction.objectStore(STORE);
  let value;try{value=fn(store)}catch(e){reject(e);return}
  transaction.oncomplete=()=>resolve(value);
  transaction.onerror=()=>reject(transaction.error||Error("Local recording operation failed"));
  transaction.onabort=()=>reject(transaction.error||Error("Local recording aborted"));
 })
}
async function allTakes(){
 const db=await storage();return new Promise((resolve,reject)=>{
  const rq=db.transaction(STORE).objectStore(STORE).getAll();
  rq.onsuccess=()=>resolve(rq.result||[]);
  rq.onerror=()=>reject(rq.error||Error("Unable to read recordings"));
 })
}
async function putTake(take){return transact("readwrite",store=>store.put(take))}
async function deleteTake(id){return transact("readwrite",store=>store.delete(id))}
function stopPlayback(){
 if(audio){audio.pause();audio.src="";audio=null}
 if(playUrl){URL.revokeObjectURL(playUrl);playUrl=null}
}
function cleanupMic(){
 if(timeout){clearTimeout(timeout);timeout=null}
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 recorder=null;chunks=[];
}
function halt(){
 activeSessionToken++;
 if(recorder&&recorder.state!=="inactive"){recorder.onstop=null;try{recorder.stop()}catch{}}
 cleanupMic();stopPlayback();
 const b=$("phraseRecordButton");if(b)b.textContent="● Record my phrase";
}
function phraseId(input){
 const key=String(input.key||"song").slice(0,100);
 const notes=(input.seq||[]).join(" ");
 return key+"|"+input.index+"|"+notes;
}
function renderEntry(take){
 const row=document.createElement("div");row.className="rec-take";
 const date=document.createElement("span");date.textContent=new Date(take.created).toLocaleString()+" · "+Math.round(take.duration)+"s · "+take.sa.toFixed(1)+" Hz Sa";
 const actions=document.createElement("div");actions.className="row";
 const play=document.createElement("button");play.textContent="▶ Listen";play.onclick=()=>{
  stopPlayback();try{
   playUrl=URL.createObjectURL(take.audio);audio=new Audio(playUrl);
   audio.onended=stopPlayback;audio.play().catch(e=>message("Playback unavailable: "+e.message));
   message("Playing your recorded flute phrase. Use the reference button above to compare.");
  }catch(e){message("Playback unavailable: "+e.message)}
 };
 const download=document.createElement("button");download.textContent="↓ Save file";download.onclick=()=>{
  const url=URL.createObjectURL(take.audio),link=document.createElement("a");
  link.href=url;link.download="bansuri-phrase-"+take.created.slice(0,10)+"."+(take.mime.includes("mp4")?"m4a":take.mime.includes("ogg")?"ogg":"webm");
  link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
 };
 const remove=document.createElement("button");remove.textContent="Delete";remove.onclick=async()=>{
  if(!confirm("Permanently delete this local audio take? This cannot be undone."))return;
  try{stopPlayback();await deleteTake(take.id);await showTakes();message("Audio take deleted from this browser.")}catch(e){message("Delete failed: "+e.message)}
 };
 actions.append(play,download,remove);row.append(date,actions);return row
}
async function showTakes(){
 const list=$("phraseRecordList");if(!list||!session)return;
 try{
  const takes=(await allTakes()).filter(x=>x.phrase===session.phrase).sort((a,b)=>String(b.created).localeCompare(String(a.created)));
  list.replaceChildren();
  if(!takes.length){const t=document.createElement("p");t.className="muted";t.textContent="No takes for this phrase yet.";list.append(t)}
  takes.forEach(x=>list.append(renderEntry(x)));
 }catch(e){message("Local recording storage unavailable: "+e.message)}
}
async function begin(){
 if(!session)return;
 if(!window.MediaRecorder||!navigator.mediaDevices?.getUserMedia){message("Recording needs a supported browser, HTTPS, and microphone permission.");return}
 const token=++activeSessionToken;
 stopPlayback();message("Requesting microphone permission…");
 try{
  const total=(await allTakes()).length;
  if(total>=MAX_TOTAL){message("Your browser already has "+MAX_TOTAL+" saved takes. Delete old takes before recording more.");return}
  const live=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  if(token!==activeSessionToken){live.getTracks().forEach(t=>t.stop());return}
  stream=live;chunks=[];
  const mime=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg;codecs=opus"].find(x=>MediaRecorder.isTypeSupported(x));
  recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
  const created=new Date().toISOString(),phrase=session.phrase,sa=session.sa,started=performance.now(),type=recorder.mimeType||"audio/webm";
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onerror=e=>{message("Recording failed: "+(e.error?.message||"microphone error"));cleanupMic()};
  recorder.onstop=async()=>{
   if(timeout){clearTimeout(timeout);timeout=null}
   const pieces=chunks.slice(),duration=(performance.now()-started)/1000;
   cleanupMic();
   const button=$("phraseRecordButton");if(button)button.textContent="● Record my phrase";
   if(token!==activeSessionToken||!pieces.length){return}
   const blob=new Blob(pieces,{type});if(blob.size>MAX_SIZE){message("Audio take is too large to store. Try a shorter phrase.");return}
   try{
    await putTake({id:crypto.randomUUID(),phrase,created,sa,duration,mime:type,audio:blob});
    if(token===activeSessionToken){message("Saved locally. Listen to your recording and compare it with the reference.");await showTakes()}
   }catch(e){message("Unable to save this audio take: "+e.message)}
  };
  recorder.start(500);
  const b=$("phraseRecordButton");if(b)b.textContent="■ Stop recording";
  message("Recording your bansuri now. Press Stop when finished (maximum "+MAX_SECONDS+" seconds).");
  timeout=setTimeout(()=>{if(recorder?.state==="recording")recorder.stop()},MAX_SECONDS*1000);
 }catch(e){cleanupMic();message("Could not record: "+e.message)}
}
function stop(){
 if(!recorder||recorder.state==="inactive")return;
 try{recorder.stop();message("Processing your local recording…")}catch(e){message(e.message);cleanupMic()}
}
function mount(item,index,seq){
 halt();
 if(!item||!Array.isArray(seq))return;
 session={phrase:phraseId({key:item.key,index,seq}),sa:Number(window.s?.sa)||Number(document.getElementById("activeSa")?.value)||440};
 const outer=$("phraseRecording");if(!outer)return;
 outer.innerHTML='<h4>🎙 My flute recording</h4><p class="muted">Record your own phrase, listen back and compare with the reference. Recordings stay in this browser only; they are not included in Google backup or community sharing.</p><div class="row"><button id="phraseRecordButton" class="primary" type="button">● Record my phrase</button><button id="phraseRecordStopPlayback" type="button">■ Stop playback</button><button id="phraseRecordReference" type="button">♫ Play reference</button></div><p id="phraseRecordStatus" role="status">Ready. Please allow microphone access when recording.</p><h5>My saved takes</h5><div id="phraseRecordList"></div>';
 $("phraseRecordButton").onclick=()=>recorder&&recorder.state==="recording"?stop():begin();
 $("phraseRecordStopPlayback").onclick=()=>{stopPlayback();message("Playback stopped.")};
 $("phraseRecordReference").onclick=()=>{stopPlayback();try{const map={S:0,r:1,R:2,g:3,G:4,M:5,"M^":6,P:7,d:8,D:9,n:10,N:11,"S'":12};const base=Number($("activeSa")?.value)||440;seq.forEach((n,i)=>{if(map[n]!==undefined)tone(base*Math.pow(2,map[n]/12),i*.6,.38)});message("Playing the synthesized reference phrase. Your recorded take is unchanged.")}catch(e){message("Reference playback failed: "+e.message)}};
 showTakes();
}
window.addEventListener("pagehide",halt);
document.addEventListener("visibilitychange",()=>{if(document.hidden)halt()});
document.querySelectorAll("#nav [data-tab]").forEach(x=>x.addEventListener("click",()=>{if(x.dataset.tab!=="songs")halt()}));
window.bansuriRecorder={mount,halt};
})();
