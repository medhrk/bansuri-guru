/* Interactive, evidence-aware bansuri teacher. No recording uploads or external AI. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const noteName={S:"Sa",R:"Re",G:"Ga",M:"Ma",P:"Pa",D:"Dha",N:"Ni","S'":"upper Sa"};
const valid=new Set(Object.keys(noteName));
let session=null,sequence=0;
function label(n){return noteName[n]||n}
function buildPlan(){
 const report=window.bansuriProgress?.summary?.()||{noteStats:[]};
 const weak=(report.noteStats||[]).filter(x=>valid.has(x.note)&&x.samples>=10&&x.attempts>=2&&x.accuracy<75).sort((a,b)=>a.accuracy-b.accuracy);
 const focus=weak[0]?.note||"G";
 const transition=window.adaptiveTeacher?.transitionReport?.();
 const transitionNeedsHelp=transition?.confidence==="enough"&&transition.accuracy<75;
 return [
  {title:"Find your Sa",seq:["S","S","S"],bpm:42,why:"Begin with relaxed, steady Sa. Hold each note for two seconds.",kind:"Warm-up"},
  {title:"Strengthen "+label(focus),seq:["S",focus,"S",focus],bpm:45,why:weak.length?"Your saved pitch checks suggest extra "+label(focus)+" practice.":"No consistently weak swara has enough evidence yet; practise the Sa–Ga change.",kind:"Target note"},
  {title:"Ma–Pa changes",seq:transitionNeedsHelp?["M","P","M","P","M"]:["G","M","P","M","G"],bpm:42,why:transitionNeedsHelp?"Saved Ma–Pa checks suggest this movement needs extra time.":"Explore finger changes between Ma and Pa without rushing.",kind:"Transitions"},
  {title:"Play a musical phrase",seq:["S","R","G","P","G","R","S"],bpm:52,why:"Finish by linking notes into a short original phrase.",kind:"Musical phrase"}
 ];
}
function reportGrade(result){
 const steps=result?.lesson?.seq||[];
 const evidence=result?.evidence||{};
 const skips=new Set(result?.skippedIndices||[]);
 const pitched=steps.map((note,i)=>({note,i,data:evidence[i]})).filter(x=>x.note!=="—");
 const clear=pitched.filter(x=>!skips.has(x.i)&&Number(x.data?.samples)>=3);
 const held=clear.filter(x=>x.data?.steady===true);
 const totalSamples=clear.reduce((n,x)=>n+Number(x.data.samples||0),0);
 const inTune=clear.reduce((n,x)=>n+Math.max(0,Math.min(Number(x.data.samples||0),Number(x.data.inTune||0))),0);
 const accuracy=totalSamples?Math.round(inTune/totalSamples*100):null;
 const passed=!!result?.microphone&&pitched.length>0&&clear.length===pitched.length&&held.length===pitched.length&&accuracy!==null&&accuracy>=70;
 return {passed,accuracy,observed:clear.length,expected:pitched.length,holds:held.length,skipped:skips.size};
}
function start(){
 window.practiceReadiness?.stop?.();
 if(session?.active&&!confirm("Replace your current interactive session?"))return;
 session={active:true,id:"live"+(++sequence)+"-"+Date.now(),index:0,retries:0,plan:buildPlan(),results:[],last:null,sa:Number(s.sa)||440};
 render();launch();
}
function current(){return session?.plan?.[session.index]}
function launch(){
 if(!session?.active)return;
 const step=current();if(!step)return;
 if(Math.abs(1200*Math.log2((Number(s.sa)||440)/session.sa))>50){session.active=false;session.last={message:"Flute reference changed. Start a new session for the new Sa."};render();return}
 const id=session.id+"-"+session.index+"-try"+session.retries;
 const item={id,name:"Teacher · "+step.title,kind:step.kind,bpm:step.bpm,seq:step.seq.slice(),help:step.why+" Enable microphone, press Start, then hold each note steadily for two seconds."};
 if(!window.surQuest?.openExercise?.(item)){render();return}
 session.expected=id;session.last=null;
 tab("quest");
}
function finish(event){
 const result=event?.detail;if(!session?.active||!result||result.lesson?.id!==session.expected)return;
 const grade=reportGrade(result);
 session.last={...grade,message:grade.passed?
  "✓ Your notes were measured and held steadily. Ready for the next exercise.":
  "This exercise needs another attempt. "+(grade.accuracy===null?"No reliable microphone pitch grade was recorded.":"Pitch readings: "+grade.accuracy+"%.")+" "+grade.holds+"/"+grade.expected+" notes held steadily."};
 if(grade.passed){session.results.push({title:current().title,score:grade.accuracy,verified:true});session.retries=0;session.index++}
 else session.retries++;
 session.expected=null;
 // After Sur Quest completes, return to the teacher for next-step guidance.
 tab("progress");
 render();
}
function retry(){
 if(!session?.active)return;
 // After repeated difficulty, simplify the target while retaining a real, independently scored attempt.
 if(session.retries>=2){const step=current();if(step&&step.seq.length>3){const focus=step.seq.find(n=>n!=="S"&&n!=="—")||"S";step.seq=["S",focus,"S"];step.why="Simplified repeat: use fewer notes and hold each steadily. The same evidence threshold still applies."}}
 launch();
}
function manual(){
 if(!session?.active)return;
 if(!confirm("Move on without microphone verification? The exercise will be marked as unverified."))return;
 session.results.push({title:current()?.title||"Exercise",score:null,verified:false});session.index++;session.retries=0;session.last={message:"Moved on without a pitch score. Next exercise is ready."};session.expected=null;render();
}
function stop(){if(!session)return;session.active=false;session.expected=null;session.last={message:"Session ended. Your existing Sur Quest results remain saved."};render()}
function el(tag,txt,cls){const x=document.createElement(tag);if(txt!==undefined)x.textContent=txt;if(cls)x.className=cls;return x}
function button(label,fn,cls){const b=el("button",label,cls);b.type="button";b.onclick=fn;return b}
function render(){
 const host=$("liveBansuriTeacher");if(!host)return;host.replaceChildren();
 host.append(el("h3","🎵 Interactive teacher-led session"));
 host.append(el("p","One exercise at a time. Sur Quest listens to your bansuri; the next exercise depends on the notes it actually measures. No microphone recording is stored here.","muted"));
 if(!session){host.append(button("▶ Start teacher-led practice",start,"primary"));return}
 const completed=session.index>=session.plan.length;
 host.append(el("div",completed?"All four exercises visited":"Exercise "+(session.index+1)+" of "+session.plan.length,"live-teacher-stage"));
 const steps=el("div",undefined,"live-teacher-steps");
 session.plan.forEach((step,i)=>{const item=el("span",(i<session.index?"✓ ":i===session.index?"▶ ":"○ ")+step.title);if(i===session.index)item.className="active";steps.append(item)});
 host.append(steps);
 if(completed){
  const verified=session.results.filter(x=>x.verified).length;
  host.append(el("p","Session complete: "+verified+" of "+session.plan.length+" exercises microphone-verified. Unverified skips are not scored.","live-teacher-note"));
  host.append(button("↻ Start another session",start,"primary"));return;
 }
 if(!session.active){host.append(el("p",session.last?.message||"Session paused.","live-teacher-note"),button("Start fresh",start,"primary"));return}
 const step=current();
 host.append(el("h4",step.title),el("p",step.why),el("div",step.seq.join("   ·   "),"live-teacher-notes"));
 if(session.last?.message)host.append(el("p",session.last.message,"live-teacher-note"));
 const actions=el("div",undefined,"live-teacher-actions");
 if(session.expected){actions.append(button("Return to current Sur Quest",()=>tab("quest")))}
 else if(session.last?.passed){actions.append(button("▶ Continue to next exercise",launch,"primary"))}
 else{actions.append(button(session.last?"↻ Try this again":"▶ Open this exercise",retry,"primary"),button("Mark unverified & continue",manual))}
 actions.append(button("End session",stop));host.append(actions);
 host.append(el("small","A passing attempt needs microphone evidence for every sounding note, a steady two-second hold on each note, and at least 70% observed near-target pitch readings. Skips never count as verified.","muted"));
}
window.addEventListener("bansuri-quest-finished",finish);
window.liveBansuriTeacher={start,render,reportGrade,buildPlan};
})();
