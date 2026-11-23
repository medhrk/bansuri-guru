/* Evidence-aware virtual bansuri teacher. Deterministic, offline, no third-party model calls. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const names={S:"Sa",r:"komal Re",R:"Re",g:"komal Ga",G:"Ga",M:"Ma","M^":"tivra Ma",P:"Pa",d:"komal Dha",D:"Dha",n:"komal Ni",N:"Ni","S'":"upper Sa"};
function advice(progress,adaptive){
 const strong=progress.noteStats.filter(n=>n.attempts>=2&&n.samples>=10);
 const weak=strong.filter(n=>n.accuracy<75).sort((a,b)=>a.accuracy-b.accuracy||b.samples-a.samples).slice(0,2);
 const target=weak.map(n=>n.note);
 const transition=adaptive?.transitionReport?.()||null;
 const maPaWeak=transition?.confidence==="enough"&&transition.accuracy<75;
 const lowStability=progress.attempts>=4&&progress.steady/Math.max(1,progress.attempts)<.35;
 const messages=[];
 if(!strong.length){
   messages.push({type:"starter",title:"Establish a clear baseline",explanation:"I have too little reliable note-by-note microphone data to identify weak swaras yet.",action:"Play Sa, Re and Ga slowly in Sur Quest. Hold each note for two seconds with the pitch indicator green. Then review these recommendations."});
 }else if(weak.length){
   for(const n of weak)messages.push({type:"pitch",title:"Give extra attention to "+names[n.note],explanation:"Your saved "+names[n.note]+" readings were close to the expected pitch about "+n.accuracy+"% of the time across "+n.attempts+" measured attempts.",action:"Play Sa → "+names[n.note]+" → Sa slowly at 40–50 BPM. Listen to the reference, then hold "+names[n.note]+" steadily for two seconds. Compare the next session."});
 }else{
   messages.push({type:"strength",title:"Maintain your reliable swaras",explanation:"Your sufficiently measured swaras were at least 75% near the expected pitch.",action:"Keep the notes steady, then challenge yourself with short four-note phrases. Do not rush the tempo."});
 }
 if(maPaWeak){
   messages.push({type:"transition",title:"Slow down Ma–Pa transitions",explanation:"Your microphone results following Ma–Pa or Pa–Ma changes were near target about "+transition.accuracy+"% of the time.",action:"Try Ma → Pa → Ma → Ga at 40 BPM. Change one finger position at a time and check the target pitch after each transition. A microphone cannot confirm which finger caused an error."});
 }else if(transition?.confidence!=="enough"){
   messages.push({type:"transition",title:"Explore Ma–Pa movement",explanation:"There aren't enough measured Ma–Pa transitions to diagnose this movement.",action:"Try Ma → Pa → Ma → Ga slowly and compare the target pitch. Check fingering with a teacher if the transition feels awkward."});
 }
 if(lowStability){
   messages.push({type:"stability",title:"Practise longer steady tones",explanation:"Only "+progress.steady+" of "+progress.attempts+" measured note attempts were recorded as completing a steady hold. This could reflect short attempts or interrupted microphone tracking.",action:"Practise relaxed, comfortable long notes on Sa. Aim for two continuous green seconds; take breaks between attempts. This does not measure breath technique directly."});
 }
 if(progress.verified===0){
   messages.push({type:"songs",title:"Complete your first verified song phrase",explanation:progress.unlocked?"Some phrases are unlocked, but none has a stored microphone-verified result.":"No microphone-verified phrase completion is saved yet.",action:"Open a short original song exercise, listen to phrase one, and complete every note without skipping in Sur Quest Learn mode."});
 }
 const routine=[
  {minutes:3,title:"Warm-up",action:"Relax shoulders, play comfortable Sa tones, and watch the tuner. Stop if dizzy or uncomfortable."},
  {minutes:5,title:weak.length?"Target weak swaras":"Basic sur control",action:weak.length?"Focus on "+weak.map(n=>names[n.note]).join(" and ")+" using slow Sa-to-note alternation.":"Repeat Sa–Re–Ga–Re–Sa, holding each swara steadily."},
  {minutes:4,title:"Finger transitions",action:"Practise Ma–Pa–Ma–Ga at a slow pace, checking each note against your selected Sa."},
  {minutes:3,title:"Musical phrase",action:"Repeat a four-note Bhakti or film-style exercise; listen first, play second, then review your pitch result."}
 ];
 return {messages,routine,focus:target,hasEvidence:strong.length>0,transitionEvidence:transition?.confidence==="enough"};
}
function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e}
function render(){
 const host=$("virtualBansuriTeacher");if(!host)return;
 host.replaceChildren();
 const progress=window.bansuriProgress?.summary?.();if(!progress)return;
 const result=advice(progress,window.adaptiveTeacher);
 const head=node("div",undefined,"virtual-teacher-heading");head.append(node("div","🎓 Your Virtual Bansuri Teacher","virtual-teacher-title"),node("p","Evidence-based coaching from your saved practice. No camera, microphone or raw recordings are accessed for these recommendations.","muted"));host.append(head);
 const list=node("div",undefined,"virtual-teacher-advice");
 for(const message of result.messages){
  const card=node("article",undefined,"virtual-teacher-tip");
  card.append(node("h4",message.title),node("p",message.explanation),node("p","Try this: "+message.action,"virtual-teacher-action"));list.append(card);
 }host.append(list);
 host.append(node("h3","Today's 15-minute guided plan"));
 const steps=node("ol",undefined,"virtual-teacher-routine");
 for(const item of result.routine){const li=node("li");li.append(node("strong",item.minutes+" min · "+item.title),node("p",item.action));steps.append(li)}host.append(steps);
 const buttons=node("div",undefined,"row");
 const begin=node("button","▶ Start personalized Sur Quest","primary");begin.onclick=()=>{
  if(!window.surQuest?.startAdaptive){alert("Sur Quest is unavailable. Reload the app.");return}
  tab("quest");window.surQuest.startAdaptive();
 };
 const interactive=node("button","🎵 Start interactive teacher");interactive.onclick=()=>window.liveBansuriTeacher?.start?.();buttons.append(interactive);
 const copy=node("button","Copy today's plan");copy.onclick=()=>{
  const text=result.routine.map(r=>r.minutes+" min — "+r.title+": "+r.action).join("\n");
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>{copy.textContent="✓ Copied"}).catch(()=>{copy.textContent="Copy unavailable"});
  else copy.textContent="Clipboard unavailable";
 };
 buttons.append(begin,copy);host.append(buttons);
 host.append(node("p","These are suggestions, not a diagnosis of embouchure, posture, airflow or exact finger movement. Pitch tracking may be wrong when it detects a harmonic or background sound.","virtual-teacher-disclaimer"));
}
window.virtualBansuriTeacher={advice,render};
})();
