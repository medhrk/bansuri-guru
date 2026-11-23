/* Explicit, private microphone & flute readiness check before live practice. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
let active=false,stream=null,context=null,source=null,analyser=null,frame=0,timeout=0,run=0;
let readings=[],audible=0,samples=0;
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e}
function message(text){const e=$("readinessStatus");if(e)e.textContent=text}
function cleanup(){
 ++run;active=false;
 if(frame)cancelAnimationFrame(frame);frame=0;
 if(timeout)clearTimeout(timeout);timeout=0;
 if(source){try{source.disconnect()}catch{}source=null}
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 if(context){context.close().catch(()=>{});context=null}
 analyser=null;
 const btn=$("readinessStart");if(btn)btn.textContent="🎙 Test microphone";
}
function analyse(values,target){
 const valid=values.filter(x=>Number.isFinite(x)&&x>0);
 if(!valid.length)return {heard:false,near:false,median:null,cents:null,note:"No steady pitch was detected. Check mic permission, input selection and background noise."};
 const sorted=valid.slice().sort((a,b)=>a-b),middle=sorted[Math.floor(sorted.length/2)];
 const cents=Math.round(1200*Math.log2(middle/target));
 const near=Math.abs(cents)<=35;
 const octave=Math.abs(cents)>900&&Math.abs(cents)<1300;
 const note=near?"Pitch is close to the selected Sa. You are ready to practise.":octave?"An octave difference was detected. Check your flute register or microphone harmonics.":"A pitch was detected, but it differs from the selected Sa. Check your flute choice or play the intended Sa again.";
 return {heard:true,near,median:middle,cents,note};
}
async function begin(){
 if(active){cleanup();message("Readiness check stopped. Microphone is off.");return}
 if(!navigator.mediaDevices?.getUserMedia||!window.AudioContext&&!window.webkitAudioContext){message("This browser does not support microphone readiness testing. You can still practise manually.");return}
 cleanup();const id=run;active=true;readings=[];audible=0;samples=0;
 const btn=$("readinessStart");if(btn)btn.textContent="■ Stop test";
 const target=Number(s.sa)||440;
 message("Requesting microphone permission. Play a clear sustained Sa at your selected flute pitch.");
 try{
   const live=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
   if(id!==run){live.getTracks().forEach(t=>t.stop());return}
   stream=live;
   context=new (window.AudioContext||window.webkitAudioContext)();await context.resume();
   if(id!==run)return;
   source=context.createMediaStreamSource(stream);analyser=context.createAnalyser();analyser.fftSize=4096;source.connect(analyser);
   const buffer=new Float32Array(analyser.fftSize),started=performance.now();let last=0;
   const tick=now=>{
     if(id!==run||!active)return;
     if(now-last>=160){
       last=now;samples++;analyser.getFloatTimeDomainData(buffer);
       let energy=0;for(let i=0;i<buffer.length;i++)energy+=buffer[i]*buffer[i];
       const rms=Math.sqrt(energy/buffer.length);
       if(rms>.012)audible++;
       if(rms>.012){
         const hz=window.corr?window.corr(buffer,context.sampleRate):typeof corr==="function"?corr(buffer,context.sampleRate):0;
         if(hz>=90&&hz<=1500)readings.push(hz);
       }
       message("Listening for Sa… "+readings.length+" pitch readings. Keep the note steady for a few seconds.");
     }
     if(now-started>5200){finish(target,id);return}
     frame=requestAnimationFrame(tick);
   };
   frame=requestAnimationFrame(tick);
 }catch(e){if(id===run){cleanup();message("Microphone check unavailable: "+(e?.message||"permission or device issue")+". You can still use manual exercises.")}}
}
function finish(target,id){
 if(id!==run)return;
 const result=analyse(readings,target),enough=readings.length>=5;
 const sounding=audible>=5;
 const overall=enough?result.note:sounding?"Sound reaches the mic, but reliable pitch readings are limited. Try quieter surroundings and a longer Sa.":"No sufficient sound reached the mic. Check permission, input device and blowing volume.";
 cleanup();
 const e=$("readinessResult");if(e){e.replaceChildren();e.append(el("strong",enough&&result.near?"✓ Ready for pitch training":enough?"Check your Sa before starting":"Microphone check incomplete"));
 e.append(el("p",overall));
 if(result.median!==null&&enough)e.append(el("p","Detected: "+result.median.toFixed(1)+" Hz · Target Sa: "+target.toFixed(1)+" Hz · Difference: "+result.cents+" cents."))}
 message("Check finished. Microphone turned off.");
}
function render(){
 const host=$("practiceReadiness");if(!host)return;
 host.replaceChildren();const head=el("h3","🎙 Practice Readiness Check"),info=el("p","Before your teacher-led session, check that your mic hears your bansuri and that your selected Sa matches the note you play.","muted");
 const scale=el("p","Current Sa: "+(Number(s.sa)||440).toFixed(2)+" Hz. Play this Sa for about five seconds; no audio is saved or uploaded.","readiness-scale");
 const controls=el("div",undefined,"row"),test=el("button","🎙 Test microphone","primary"),skip=el("button","Continue without testing");
 test.id="readinessStart";test.onclick=begin;
 skip.onclick=()=>{cleanup();window.liveBansuriTeacher?.start?.()};
 controls.append(test,skip);
 const status=el("p","Test is optional. Microphone access is requested only if you press Test.","muted");status.id="readinessStatus";status.setAttribute("role","status");
 const result=el("div",undefined,"readiness-result");result.id="readinessResult";
 host.append(head,info,scale,controls,status,result);
}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&active){cleanup();message("Test stopped because the page is not active.")}});
window.addEventListener("pagehide",cleanup);
document.querySelectorAll('#nav [data-tab]').forEach(b=>b.addEventListener("click",()=>{if(b.dataset.tab!=="progress"&&active){cleanup();message("Test stopped when changing tabs.")}}));
window.addEventListener("bansuri-sa-changed",()=>{if(active)cleanup();render()});
window.practiceReadiness={render,stop:cleanup,analyse};
})();
