/* Acoustic tone consistency check. Not a physiological breath assessment. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
let state={token:0,running:false,stream:null,ctx:null,source:null,analyser:null,frame:0,started:0,last:0,frames:[]};
const MAX_MS=6500,MIN_FRAMES=12;
function dom(tag,value,cls){const e=document.createElement(tag);if(value!==undefined)e.textContent=String(value);if(cls)e.className=cls;return e}
function message(str){const x=$("toneStatus");if(x)x.textContent=str}
function cleanup(){
 state.token++;
 if(state.frame){cancelAnimationFrame(state.frame);state.frame=0}
 if(state.source){try{state.source.disconnect()}catch{}state.source=null}
 if(state.stream){for(const tr of state.stream.getTracks())tr.stop();state.stream=null}
 if(state.ctx){state.ctx.close().catch(()=>{});state.ctx=null}
 state.analyser=null;state.running=false;
 const btn=$("toneStart");if(btn)btn.textContent="🎙 Analyse sustained Sa";
}
function stats(values){
 const mean=values.reduce((a,b)=>a+b,0)/values.length;
 const variance=values.reduce((a,b)=>a+(b-mean)**2,0)/values.length;
 return {mean,sd:Math.sqrt(variance)}
}
function analyse(frames,target){
 if(!Array.isArray(frames)||!frames.length)return {valid:false,reason:"No usable microphone samples were captured."};
 const audible=frames.filter(x=>Number(x.rms)>.012);
 const pitched=audible.filter(x=>Number(x.hz)>0&&Number.isFinite(x.hz));
 if(pitched.length<MIN_FRAMES||pitched.length/frames.length<.5)return {valid:false,reason:"Not enough continuous, detectable pitch. Try a quieter room and a longer steady Sa.",samples:pitched.length};
 const cents=pitched.map(x=>1200*Math.log2(x.hz/target));
 const near=cents.filter(x=>Math.abs(x)<=35).length/pitched.length;
 const median=cents.slice().sort((a,b)=>a-b)[Math.floor(cents.length/2)];
 // Robust drift estimate, in cents, excluding outliers beyond 150c from median.
 const relevant=cents.filter(x=>Math.abs(x-median)<=150);
 if(relevant.length<MIN_FRAMES)return {valid:false,reason:"Pitch tracking varied too much to estimate steadiness.",samples:pitched.length};
 const pitch=stats(relevant);
 const loudness=stats(audible.map(x=>x.rms));
 const volumeCV=loudness.mean>0?100*loudness.sd/loudness.mean:100;
 const first=pitched[0].t-frames[0].t;
 const pitchSteady=pitch.sd<=20,volumeSteady=volumeCV<=25;
 return {valid:true,samples:pitched.length,coverage:Math.round(100*pitched.length/frames.length),near:Math.round(100*near),pitchSD:Math.round(pitch.sd),medianCents:Math.round(median),volumeCV:Math.round(volumeCV),onsetMs:Math.round(first),pitchSteady,volumeSteady,referenceSa:target};
}
function history(){
 s.toneChecks=Array.isArray(s.toneChecks)?s.toneChecks:[];return s.toneChecks
}
function results(){
 const panel=$("toneResults");if(!panel)return;panel.replaceChildren();
 const entries=history().slice(-6).reverse();
 if(!entries.length){panel.append(dom("p","No saved acoustic checks yet. Your previous practice scores are unchanged.","muted"));return}
 const heading=dom("h4","Recent tone checks");panel.append(heading);
 for(const x of entries){
  const line=dom("div",undefined,"tone-history-row");
  line.append(dom("span",x.day+" · "+x.sa.toFixed(1)+" Hz Sa"),dom("strong",x.pitchSD+"¢ pitch variation · "+x.volumeCV+"% volume variation"));
  panel.append(line)
 }
}
function advice(result){
 const panel=$("toneFeedback");if(!panel)return;panel.replaceChildren();
 if(!result.valid){panel.append(dom("p",result.reason,"tone-caution"));return}
 const heading=dom("h4","Acoustic consistency snapshot");panel.append(heading);
 const cells=dom("div",undefined,"tone-metrics");
 for(const [key,val] of [["Pitch variation",result.pitchSD+" cents"],["Near-target samples",result.near+"%"],["Volume variation",result.volumeCV+"%"],["Detected onset",result.onsetMs+" ms"]]){
  const cell=dom("div",undefined,"tone-metric");cell.append(dom("small",key),dom("strong",val));cells.append(cell)
 }panel.append(cells);
 const observations=[];
 observations.push(result.pitchSteady?"Detected pitch was fairly consistent over this sample.":"Detected pitch fluctuated. Try an unhurried Sa with relaxed pauses; avoid forcing your breath.");
 observations.push(result.volumeSteady?"Measured microphone level stayed relatively consistent.":"Measured loudness varied. Check your distance from the microphone and practise a comfortable, even note.");
 if(result.near<65)observations.push("Many readings differed from the selected Sa. Verify the flute scale and octave before interpreting steadiness.");
 observations.push("These indicators cannot determine breath capacity, embouchure, finger movement or tone beauty. Microphone gain and room noise affect the reading.");
 observations.forEach(x=>panel.append(dom("p",x)));
}
function finish(token,target){
 if(token!==state.token)return;
 const sample=state.frames.slice(),res=analyse(sample,target);
 cleanup();
 advice(res);
 if(res.valid){
  history().push({day:new Date().toLocaleDateString("en-CA"),sa:target,pitchSD:res.pitchSD,volumeCV:res.volumeCV,near:res.near,coverage:res.coverage,onsetMs:res.onsetMs});
  s.toneChecks=s.toneChecks.slice(-30);
  // Intentionally local only; cloudPayload does not include acoustic snapshots.
  try{localStorage.setItem("bansuri-guru-v1",JSON.stringify(s))}catch(e){message("Results measured but local saving failed: "+e.message);results();return}
 }
 results();message(res.valid?"Analysis finished; microphone is off and only summary numbers were stored.":"Check finished without a reliable measurement; microphone is off.");
}
async function start(){
 if(state.running){cleanup();message("Tone analysis stopped. Microphone is off.");return}
 if(!navigator.mediaDevices?.getUserMedia||!window.AudioContext&&!window.webkitAudioContext){message("Browser microphone analysis is unavailable. Practice can continue without it.");return}
 window.practiceReadiness?.stop?.();
 cleanup();
 const token=state.token;state.running=true;state.frames=[];state.last=0;
 const btn=$("toneStart");if(btn)btn.textContent="■ Stop analysis";
 message("Requesting permission. Play one comfortable, sustained Sa for about six seconds.");
 const target=Number(s.sa)||440;
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  if(token!==state.token){stream.getTracks().forEach(x=>x.stop());return}
  state.stream=stream;state.ctx=new (window.AudioContext||window.webkitAudioContext)();await state.ctx.resume();
  if(token!==state.token)return;
  state.source=state.ctx.createMediaStreamSource(stream);state.analyser=state.ctx.createAnalyser();state.analyser.fftSize=4096;state.source.connect(state.analyser);
  const data=new Float32Array(state.analyser.fftSize);state.started=performance.now();
  function tick(now){
   if(token!==state.token||!state.running)return;
   if(now-state.last>=130){
    state.last=now;state.analyser.getFloatTimeDomainData(data);
    let energy=0;for(let i=0;i<data.length;i++)energy+=data[i]*data[i];
    const rms=Math.sqrt(energy/data.length),hz=rms>.012&&typeof corr==="function"?corr(data,state.ctx.sampleRate):0;
    state.frames.push({t:now,rms,hz});
    message("Listening… "+Math.min(6.5,(now-state.started)/1000).toFixed(1)+" / 6.5 seconds");
   }
   if(now-state.started>=MAX_MS){finish(token,target);return}
   state.frame=requestAnimationFrame(tick)
  }
  state.frame=requestAnimationFrame(tick);
 }catch(e){if(token===state.token){cleanup();message("Microphone unavailable: "+(e?.message||"device error")+". Try the readiness check.")}}
}
function render(){
 const host=$("toneStability");if(!host)return;
 host.replaceChildren();
 host.append(dom("h3","🌬 Tone & Breath-Related Stability"),dom("p","Measure a sustained Sa's pitch drift and microphone loudness variation. This is an acoustic exercise—not a medical breath test or a technique diagnosis.","muted"));
 const line=dom("div",undefined,"row");const btn=dom("button","🎙 Analyse sustained Sa","primary");btn.id="toneStart";btn.onclick=start;line.append(btn);host.append(line);
 const status=dom("p","Optional: choose your flute Sa first, then play one comfortable sustained note.","muted");status.id="toneStatus";status.setAttribute("role","status");host.append(status);
 const feedback=dom("div",undefined,"tone-feedback");feedback.id="toneFeedback";host.append(feedback);
 const recent=dom("div",undefined,"tone-recent");recent.id="toneResults";host.append(recent);results();
}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.running){cleanup();message("Analysis stopped when the page became hidden.")}});
window.addEventListener("pagehide",cleanup);
document.querySelectorAll('#nav [data-tab]').forEach(x=>x.addEventListener("click",()=>{if(x.dataset.tab!=="progress"&&state.running){cleanup();message("Analysis stopped on navigation.")}}));
window.addEventListener("bansuri-sa-changed",()=>{if(state.running)cleanup();render()});
window.toneStability={render,stop:cleanup,analyse};
})();