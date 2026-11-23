/* Original guided raag improvisation exercises; no copyrighted compositions. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const hz={S:0,R:2,G:4,M:5,"M^":6,P:7,D:9,N:11,"S'":12};
const raags={
 Bhupali:{label:"Bhupali",notes:["S","R","G","P","D","S'"],aroh:"S R G P D S'",avroh:"S' D P G R S",pakad:["G","R","S","D","S","R","G","P","G","R","S"],tip:"Pentatonic. Avoid Ma and Ni. Explore G–R–S and D–S movements.",starter:[["S","R","G","P"],["D","P","G","R"],["G","R","S","R"]]},
 Durga:{label:"Durga",notes:["S","R","M","P","D","S'"],aroh:"S R M P D S'",avroh:"S' D P M R S",pakad:["R","M","P","D","M","R","S"],tip:"Pentatonic with Ma; omit Ga and Ni. Listen for characteristic R–M and D–M motion.",starter:[["S","R","M","P"],["D","P","M","R"],["R","M","P","M"]]},
 Yaman:{label:"Yaman",notes:["S","R","G","M^","P","D","N","S'"],aroh:"N R G M^ P D N S'",avroh:"S' N D P M^ G R S",pakad:["N","R","G","M^","D","N","R","S"],tip:"Use tivra Ma, not shuddha Ma. Listen to Ni–Re–Ga and Ga–tivra Ma relationships; characteristic phrases matter more than simply using the scale.",starter:[["N","R","G","M^"],["G","M^","D","N"],["P","M^","G","R"]]}
};
let active="Bhupali",phrase=["S","R","G","P"],tempo=48,stage=0,lastFeedback="",lastAttempt=null,customId=0;
const stages=["Listen to the aroh and avroh","Learn the pakad","Build your own four-note phrase","Practise the phrase in Sur Quest"];
function el(tag,text,cls){const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);if(cls)x.className=cls;return x}
function play(seq,bpm=tempo){try{const base=Number(s.sa)||440;seq.forEach((n,i)=>{if(hz[n]!==undefined)tone(base*Math.pow(2,hz[n]/12),i*60/bpm,Math.min(.55,50/bpm))})}catch(e){setStatus("Audio playback unavailable: "+e.message)}}
function validPhrase(notes){const allowed=raags[active].notes;return Array.isArray(notes)&&notes.length>0&&notes.length<=16&&notes.every(n=>allowed.includes(n))}
function setStatus(msg){lastFeedback=msg;const x=$("raagImprovStatus");if(x)x.textContent=msg}
function teacherTip(){
 const x=raags[active];if(!validPhrase(phrase))return "Choose only allowed swaras.";
 const unique=new Set(phrase).size;
 const guidance=[];
 if(unique===1)guidance.push("Try moving away from a repeated swara and returning.");
 if(phrase.length<4)guidance.push("Extend your phrase to four notes before practising.");
 if(phrase[phrase.length-1]!=="S"&&phrase.length>=4)guidance.push("Consider resolving toward Sa at the end; a phrase need not always resolve immediately.");
 if(active==="Yaman"&&!phrase.includes("M^"))guidance.push("Try introducing tivra Ma to make the Yaman exercise more characteristic.");
 if(active==="Bhupali"&&phrase.includes("G")&&phrase.includes("R"))guidance.push("Listen to the Ga–Re relationship as you shape the phrase.");
 if(active==="Durga"&&phrase.includes("R")&&phrase.includes("M"))guidance.push("Listen to Re–Ma movement.");
 return guidance.join(" ")||"Your notes are in the selected introductory swara set. Listen for meaningful movement and rhythm; correct notes alone do not prove raag identity.";
}
function addNote(n){if(phrase.length>=16){setStatus("A phrase can contain up to 16 notes.");return}phrase.push(n);render()}
function remove(){phrase.pop();render()}
function reset(){phrase=raags[active].starter[0].slice();lastAttempt=null;stage=0;render()}
function select(name){if(!raags[name])return;active=name;reset()}
function openQuest(seq,label){
 if(!validPhrase(seq)){setStatus("This phrase is outside the selected swara set.");return}
 const item={id:"raag-improv-"+active.toLowerCase()+"-"+(++customId)+"-"+Date.now(),name:active+" · "+label,kind:"Raag improvisation",bpm:tempo,seq:seq.slice(),help:"Play the notes accurately and hold each swara steadily for two seconds. This evaluates pitch stability, not whether your improvisation expresses the raag."};
 if(!window.surQuest?.openExercise?.(item))return;
 lastAttempt={id:item.id,raag:active,notes:seq.slice(),score:null};
 tab("quest");
}
function onFinish(e){
 const d=e?.detail;if(!lastAttempt||d?.lesson?.id!==lastAttempt.id)return;
 const count=lastAttempt.notes.length,observed=Object.values(d.evidence||{}).filter(x=>x?.steady===true).length;
 const skipped=(d.skippedIndices||[]).length;
 const complete=!!d.microphone&&skipped===0&&observed>=count&&d.accuracy!==null&&Number(d.accuracy)>=70;
 lastAttempt.score=complete?Number(d.accuracy):null;
 setStatus(complete?"Pitch exercise measured: "+d.accuracy+"%. This confirms pitch exercise completion, not raag authenticity.":"Attempt completed without full pitch verification. You may retry; creativity isn't graded.");
 tab("improv");render();
}
function render(){
 const root=$("raagImprovisation");if(!root)return;root.replaceChildren();
 root.append(el("h2","🎶 Raag Improvisation Teacher"),el("p","Learn an introductory raag framework, listen to characteristic movements and invent your own phrases. All examples are original teaching exercises, not full traditional compositions.","muted"));
 const switcher=el("div",undefined,"improv-switcher");
 Object.keys(raags).forEach(k=>{const b=el("button",raags[k].label);b.className=k===active?"selected":"";b.onclick=()=>select(k);switcher.append(b)});root.append(switcher);
 const r=raags[active],meta=el("div",undefined,"improv-meta");
 meta.append(el("h3",r.label),el("p","Aroh: "+r.aroh),el("p","Avroh: "+r.avroh),el("p",r.tip,"muted"));root.append(meta);
 const step=el("div",undefined,"improv-steps");stages.forEach((v,i)=>{const b=el("button",(stage===i?"▶ ":"")+(i+1)+". "+v);b.className=stage===i?"selected":"";b.onclick=()=>{stage=i;render()};step.append(b)});root.append(step);
 const lesson=el("div",undefined,"improv-lesson");
 if(stage===0){
  lesson.append(el("h4","1. Listen to the melodic outline"),el("p","Hear the ascent and descent separately. Sing the swaras before playing.","muted"));
  const buttons=el("div",undefined,"row");const a=el("button","♫ Listen to aroh","primary"),b=el("button","♫ Listen to avroh"),next=el("button","Next: pakad");
  a.onclick=()=>play(r.aroh.split(" "));b.onclick=()=>play(r.avroh.split(" "));next.onclick=()=>{stage=1;render()};buttons.append(a,b,next);lesson.append(buttons);
 }else if(stage===1){
  lesson.append(el("h4","2. Characteristic movement (pakad study)"),el("p",r.pakad.join(" · "),"improv-notes"),el("p","A compact educational approximation for listening and practice; ornaments and nuanced phrasing require a teacher.","muted"));
  const buttons=el("div",undefined,"row"),listen=el("button","♫ Hear pakad","primary"),practise=el("button","🎯 Practise notes"),next=el("button","Next: build phrase");
  listen.onclick=()=>play(r.pakad);practise.onclick=()=>openQuest(r.pakad,"Pakad exercise");next.onclick=()=>{stage=2;render()};buttons.append(listen,practise,next);lesson.append(buttons);
 }else{
  lesson.append(el("h4",stage===2?"3. Compose a phrase":"4. Listen, play and assess"),el("p","Choose allowed swaras below. Your phrase is editable and the microphone will assess target notes, not artistic quality.","muted"));
  const composer=el("div",undefined,"improv-composer");r.notes.forEach(n=>{const b=el("button",n);b.onclick=()=>addNote(n);composer.append(b)});lesson.append(composer);
  lesson.append(el("div",phrase.length?phrase.join("  ·  "):"(No notes yet)","improv-notes"));
  const controls=el("div",undefined,"row"),undo=el("button","Undo last"),clear=el("button","Clear"),suggest=el("button","Use example"),listen=el("button","♫ Hear phrase"),tryIt=el("button","🎯 Play in Sur Quest","primary");
  undo.onclick=remove;clear.onclick=()=>{phrase=[];render()};suggest.onclick=()=>{const choices=r.starter;phrase=choices[Math.floor(Math.random()*choices.length)].slice();render()};listen.onclick=()=>play(phrase);tryIt.onclick=()=>{stage=3;openQuest(phrase,"My creative phrase")};controls.append(undo,clear,suggest,listen,tryIt);lesson.append(controls);
  lesson.append(el("p","Teacher tip: "+teacherTip(),"improv-tip"));
 }
 root.append(lesson);
 const status=el("p",lastFeedback||"Choose a step and practise. Only microphone-confirmed pitch performance receives a numeric score.","muted");status.id="raagImprovStatus";status.setAttribute("role","status");root.append(status);
 const foot=el("div",undefined,"row"),slow=el("button","40 BPM"),mid=el("button","48 BPM"),fast=el("button","60 BPM");
 [[slow,40],[mid,48],[fast,60]].forEach(([b,n])=>{b.className=tempo===n?"selected":"";b.onclick=()=>{tempo=n;render()};foot.append(b)});root.append(el("p","Reference tempo: "+tempo+" BPM"),foot);
 root.append(el("p","Raag identity also depends on movement, emphasis, ornaments and listening tradition. A scale-compliant phrase and a good pitch score alone do not establish a correct raag performance.","improv-disclaimer"));
}
window.addEventListener("bansuri-quest-finished",onFinish);
window.raagImproviser={render,select,validate:(name,notes)=>!!raags[name]&&Array.isArray(notes)&&notes.length>0&&notes.every(n=>raags[name].notes.includes(n)),getRaags:()=>Object.keys(raags)};
render();
})();