/* Privacy-first progress dashboard; combines existing local stats without uploading audio. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const swaras={S:"Sa",r:"Komal Re",R:"Re",g:"Komal Ga",G:"Ga",M:"Ma","M^":"Tivra Ma",P:"Pa",d:"Komal Dha",D:"Dha",n:"Komal Ni",N:"Ni","S'":"Upper Sa"};
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
const fmt=n=>Math.round(n)+"%";
const dayOf=x=>String(x||"").slice(0,10);
function summary(){
 const logs=Array.isArray(s.logs)?s.logs:[],quest=s.quest||{};
 const notes=Array.isArray(quest.noteAttempts)?quest.noteAttempts:[];
 const current=Number(s.sa)||440;
 const measured=notes.filter(n=>n&&!n.skipped&&Number(n.samples)>=3&&Number(n.sa)>0&&Math.abs(1200*Math.log2(Number(n.sa)/current))<100);
 const buckets={};
 for(const n of measured){if(!swaras[n.note])continue;const x=buckets[n.note]||(buckets[n.note]={note:n.note,samples:0,good:0,attempts:0,steady:0});const samples=Math.max(0,Number(n.samples)||0);x.attempts++;x.samples+=samples;x.good+=Math.min(samples,Math.max(0,Number(n.inTune)||0));if(n.steady)x.steady++}
 const noteStats=Object.values(buckets).map(x=>({...x,accuracy:x.samples?Math.round(x.good/x.samples*100):null})).sort((a,b)=>b.samples-a.samples);
 const good=noteStats.reduce((n,x)=>n+x.good,0),total=noteStats.reduce((n,x)=>n+x.samples,0);
 const steady=noteStats.reduce((n,x)=>n+x.steady,0);
 const allAttempts=noteStats.reduce((n,x)=>n+x.attempts,0);
 const phrase=s.songPhraseProgress&&typeof s.songPhraseProgress==="object"?Object.values(s.songPhraseProgress):[];
 const unlocked=phrase.reduce((n,x)=>n+Math.max(0,Number(x?.unlocked)||0),0);
 const verified=phrase.reduce((n,x)=>n+Object.keys(x?.verifiedPhrases||{}).length,0);
 const sessions=logs.filter(x=>Number(x.mins)>0);
 const minutes=sessions.reduce((n,x)=>n+(Number(x.mins)||0),0);
 const days=new Set(sessions.map(x=>dayOf(x.day)).filter(Boolean));
 const chartDays=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toLocaleDateString("en-CA")});
 const chart=chartDays.map(day=>({day,minutes:sessions.filter(x=>dayOf(x.day)===day).reduce((n,x)=>n+Number(x.mins||0),0)}));
 const guided=sessions.filter(x=>x.type==="guided"&&Number(x.pitchSamples)>0&&x.pitchAccuracyEstimate!=null);
 const guidedAvg=guided.length?Math.round(guided.reduce((n,x)=>n+Number(x.pitchAccuracyEstimate)*Number(x.pitchSamples),0)/guided.reduce((n,x)=>n+Number(x.pitchSamples),0)):null;
 const questHistory=Array.isArray(quest.history)?quest.history.filter(x=>x.accuracy!=null).slice(-8):[];
 return {minutes,sessions:sessions.length,days:days.size,chart,noteStats,pitch:total?Math.round(good/total*100):null,steady,attempts:allAttempts,unlocked,verified,phraseRecords:phrase.length,guidedAvg,questHistory};
}
function el(tag,text,className){const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);if(className)x.className=className;return x}
function addStat(grid,label,value,sub){const box=el("div",undefined,"progress-stat");box.append(el("span",label),el("strong",value),el("small",sub));grid.append(box)}
function addBar(container,title,value,sub){const line=el("div",undefined,"progress-measure"),head=el("div",undefined,"progress-measure-header");head.append(el("span",title),el("strong",fmt(value)));const track=el("div",undefined,"progress-measure-track"),fill=el("i");fill.style.width=clamp(value)+"%";track.append(fill);line.append(head,track);if(sub)line.append(el("small",sub));container.append(line)}
async function recordingStats(){
 if(!window.indexedDB)return {unavailable:"Audio storage isn't supported in this browser."};
 return new Promise(resolve=>{
  try{
   const request=indexedDB.open("bansuri-phrase-audio-v1",1);
   request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains("takes")){const t=db.createObjectStore("takes",{keyPath:"id"});t.createIndex("phrase","phrase");t.createIndex("created","created")}};
   request.onerror=()=>resolve({unavailable:"Unable to read local recordings."});
   request.onsuccess=()=>{
    const db=request.result;const tx=db.transaction("takes","readonly"),query=tx.objectStore("takes").getAll();
    query.onsuccess=()=>{const takes=query.result||[];resolve({count:takes.length,phrases:new Set(takes.map(x=>x.phrase)).size,seconds:Math.round(takes.reduce((n,x)=>n+(Number(x.duration)||0),0))})};
    query.onerror=()=>resolve({unavailable:"Unable to read recordings."});
    tx.oncomplete=()=>db.close();
   };
  }catch(e){resolve({unavailable:e.message})}
 })
}
let generation=0;
async function render(){
 const target=$("progressDashboard");if(!target)return;
 const gen=++generation,report=summary();target.replaceChildren();window.virtualBansuriTeacher?.render?.();window.liveBansuriTeacher?.render?.();
 const header=el("div",undefined,"progress-heading");header.append(el("h2","Your Bansuri Journey"),el("p","Your progress is calculated from saved practice, microphone evidence and local recordings. Manual practice is never presented as a measured pitch score.","muted"));target.append(header);
 const grid=el("div",undefined,"progress-stats");
 addStat(grid,"Practice time",report.minutes+" min",report.sessions+" logged sessions");
 addStat(grid,"Pitch accuracy",report.pitch===null?"Not measured":fmt(report.pitch),report.attempts+" measured note attempts");
 addStat(grid,"Steady notes",String(report.steady), "Completed two-second note holds");
 addStat(grid,"Song phrases",report.verified+" verified",report.unlocked+" unlocked incl. manual");
 target.append(grid);
 const sections=el("div",undefined,"progress-columns");
 const left=el("section",undefined,"progress-section"),right=el("section",undefined,"progress-section");
 left.append(el("h3","Last seven days"),el("p","Logged minutes per day; missing logs appear as zero.","muted"));
 const max=Math.max(1,...report.chart.map(x=>x.minutes));const chart=el("div",undefined,"progress-week");
 for(const d of report.chart){const day=el("div",undefined,"progress-day"),bar=el("div",undefined,"progress-day-bar"),fill=el("i");fill.style.height=Math.max(d.minutes?8:0,d.minutes/max*100)+"%";bar.append(fill);day.append(el("small",String(d.minutes)+"m"),bar,el("small",d.day.slice(5)));chart.append(day)}left.append(chart);
 left.append(el("h3","Swara accuracy"));
 if(!report.noteStats.length)left.append(el("p","No reliable microphone measurements yet. Complete Sur Quest lessons with the mic enabled.","muted"));
 for(const n of report.noteStats.slice(0,9))addBar(left,swaras[n.note]||n.note,n.accuracy,n.attempts+" observed attempts · "+n.steady+" steady holds");
 right.append(el("h3","Recent Sur Quest results"));
 if(!report.questHistory.length)right.append(el("p","No microphone-scored Sur Quest missions yet.","muted"));
 for(const q of report.questHistory.slice().reverse()){const x=el("div",undefined,"progress-history-row");x.append(el("span",(q.lesson||"Lesson")+" · "+dayOf(q.day)),el("strong",fmt(q.accuracy)));right.append(x)}
 right.append(el("h3","Song phrase milestones"),el("p",report.verified+" microphone-verified phrases; "+Math.max(0,report.unlocked-report.verified)+" other unlocked steps (including manual practice).","muted"));
 if(report.guidedAvg!==null)right.append(el("p","Guided Riyaz sampled pitch: "+fmt(report.guidedAvg)+" (estimated from logged sessions)."));
 else right.append(el("p","Guided Riyaz pitch score: not yet measured.","muted"));
 right.append(el("h3","My audio recordings"));const recordingLabel=el("p","Checking private recordings…","muted");right.append(recordingLabel);
 sections.append(left,right);target.append(sections);
 target.append(el("p","Pitch percentages estimate proximity to the selected flute Sa, not tone quality, breathing, fingering accuracy or musical expression. Audio stays on this device and isn't included in Google backup.","progress-note"));
 const take=await recordingStats();if(gen!==generation||!target.isConnected)return;
 recordingLabel.textContent=take.unavailable?take.unavailable:take.count+" private takes · "+take.phrases+" phrases · "+Math.round(take.seconds/60)+" min recorded locally";
}
window.bansuriProgress={render,summary};
})();
