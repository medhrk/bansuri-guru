/* Adaptive teaching plans. Self-contained and deterministic; no paid AI APIs required. */
(function(){
"use strict";
const NOTE_ORDER=["S","R","G","M","P","D","N","S'"];
const NOTE_NAMES={S:"Sa",R:"Re",G:"Ga",M:"Ma",P:"Pa",D:"Dha",N:"Ni","S'":"Upper Sa"};
function data(){s.quest=s.quest||{};s.quest.noteAttempts=Array.isArray(s.quest.noteAttempts)?s.quest.noteAttempts:[];return s.quest}
function recent(){return data().noteAttempts.slice(-250).filter(x=>NOTE_ORDER.includes(x.note)&&x.samples>=3&&!x.skipped&&Number.isFinite(x.inTune))}
function report(){
 const group=new Map(NOTE_ORDER.map(n=>[n,{note:n,attempts:0,samples:0,good:0,absCents:0}]));
 for(const a of recent()){const g=group.get(a.note);g.attempts++;g.samples+=a.samples;g.good+=a.inTune;g.absCents+=(Number(a.meanAbsCents)||0)*a.samples}
 return Array.from(group.values()).map(v=>({...v,accuracy:v.samples?Math.round(100*v.good/v.samples):null,meanDeviation:v.samples?Math.round(v.absCents/v.samples):null,confidence:v.attempts>=2&&v.samples>=10?"enough":"limited"}));
}
function plan(){
 const stats=report();
 const weak=stats.filter(n=>n.confidence==="enough").sort((a,b)=>a.accuracy-b.accuracy||b.samples-a.samples);
 const focus=weak.filter(x=>x.accuracy<75).slice(0,2);
 const notes=focus.length?focus.map(x=>x.note):["S","R","G"];
 const warm=["S","S","R","S"];
 const drill=notes.flatMap(n=>["S",n,"S",n]);
 const phrase=focus.length?notes.flatMap(n=>["S",n,"R",n]):["S","R","G","R","S","R","G","S"];
 const sequence=[...warm,...drill,...phrase,"S","S"];
 const targeted=focus.length>0;
 return {id:"adaptive",name:"My Personal Riyaz",kind:"Adaptive teacher",bpm:targeted?48:54,seq:sequence,help:targeted?"Focus today on "+focus.map(x=>NOTE_NAMES[x.note]).join(" and ")+". Hold each note with a steady, relaxed breath.":"Starter focus: steady Sa, smooth Re–Ga transitions. Complete microphone-enabled lessons to unlock evidence-based personalization.",focus:notes,targeted,why:targeted?"Based on your recent microphone-confirmed note attempts.":"Not enough reliable practice data yet: using a structured starter session.",generatedFor:new Date().toLocaleDateString("en-CA")};
}
function summary(){
 const p=plan(),stats=report(),observed=stats.filter(x=>x.attempts>0).length;
 const recentDays=new Set(recent().map(x=>x.day)).size;
 return {plan:p,stats,observed,recentDays,attempts:recent().length}
}
function record(records,lesson,mode){
 if(!Array.isArray(records)||!records.length)return;
 const d=data(),day=new Date().toLocaleDateString("en-CA");
 for(const a of records){
  if(!NOTE_ORDER.includes(a.note))continue;
  const samples=Math.max(0,Math.min(500,Number(a.samples)||0)),good=Math.max(0,Math.min(samples,Number(a.inTune)||0));
  d.noteAttempts.push({note:a.note,samples,inTune:good,meanAbsCents:samples?Math.round((Number(a.totalAbsCents)||0)/samples):null,skipped:!!a.skipped,steady:!!a.steady,day,lesson:String(lesson).slice(0,40),mode:String(mode).slice(0,20)});
 }
 d.noteAttempts=d.noteAttempts.slice(-400);
}
function render(){
 const elements=[document.getElementById("adaptiveBrief"),document.getElementById("adaptiveDailyBrief")].filter(Boolean);
 if(!elements.length)return;
 const {plan:p,stats,attempts,observed}=summary();
 const list=stats.filter(n=>n.confidence==="enough").sort((a,b)=>a.accuracy-b.accuracy).slice(0,4);
 const markup='<div class="adapt-head"><div><span class="adapt-eyebrow">YOUR PERSONAL RIYAZ</span><h2>Today’s focus</h2></div><span class="adapt-date">'+p.generatedFor+'</span></div><p>'+p.why+'</p><div class="adapt-tags">'+p.focus.map(n=>'<span>'+NOTE_NAMES[n]+'</span>').join("")+'</div><p><b>Exercise:</b> '+p.seq.length+' swaras at '+p.bpm+' BPM, with long notes and transitions.</p><p class="adapt-muted">Evidence: '+attempts+' measured note attempts across '+observed+' swaras. Skipped and microphone-off notes are excluded from weakness ratings.</p>'+(list.length?'<div class="adapt-results"><b>Recent pitch patterns</b>'+list.map(n=>'<div class="adapt-result"><span>'+NOTE_NAMES[n.note]+'</span><div class="adapt-bar"><i style="width:'+n.accuracy+'%"></i></div><strong>'+n.accuracy+'%</strong></div>').join("")+'</div>':'<p class="adapt-muted">Complete a few lessons with your mic enabled to make the exercises more personal.</p>')+'<button type="button" class="primary" data-adapt="launch">▶ Start my personal practice</button>';elements.forEach(element=>element.innerHTML=markup);
}
document.addEventListener("click",e=>{if(e.target.closest("#adaptiveDailyBrief [data-adapt=launch]")){tab("quest");window.surQuest?.startAdaptive?.()}});
window.adaptiveTeacher={plan,summary,record,render};
})();
