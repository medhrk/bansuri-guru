/* Bansuri Guru Alankara School — original, levelled riyaz patterns, no copyrighted scores */
(function(){
"use strict";
const LEVELS=["beginner","intermediate","expert"];
const NOTES=["S","R","G","M","P","D","N","S'"];
const MP={
 beginner:[
 ["Ma → Pa foundation",["M","—","P","—","M","—","P","—"],42,"Hold each Ma, then move deliberately to Pa; use a breath rest.","Ma–Pa transition"],
 ["Pa → Ma return",["P","—","M","—","P","—","M","—"],42,"Return from Pa without losing the centre of Ma.","Ma–Pa transition"],
 ["Ma–Pa neighbours",["G","M","P","M","G","M","P","M"],48,"Check Ga–Ma, Ma–Pa and Pa–Ma; stop if fingers tense.","Ma–Pa transition"],
 ["Ma Pa anchor",["S","M","P","S","M","P","M","S"],46,"Anchor each jump with a comfortable steady Sa.","Ma–Pa transition"]
 ],
 intermediate:[
 ["Ma–Pa rebound",["M","P","M","G","M","P","D","P","M","G"],62,"Alternate Ma and Pa accurately before increasing speed.","Ma–Pa transition"],
 ["Ma–Pa in four",["G","M","P","D","P","M","G","R","G","M","P","M"],65,"Keep four even notes per group with no air blast at Pa.","Ma–Pa transition"],
 ["Pa Ma accent reversal",["P","M","P","G","M","P","M","R","G","M","P","S"],64,"Alternate accented groupings over Keharwa; do not force Ma.","Ma–Pa transition"],
 ["Ma–Pa loop and rest",["M","P","M","P","—","G","M","P","M","—","S"],60,"Pause between groups; listen for sustained tuning after each transition.","Ma–Pa transition"]
 ],
 expert:[
 ["Ma–Pa rapid reversals",["M","P","M","P","G","M","P","D","P","M","P","M","G","R"],84,"Maintain pitch centres with controlled short articulations.","Ma–Pa transition"],
 ["Ma–Pa syncopation",["M","—","P","M","P","—","G","M","P","M","—","P","M"],78,"Accent across the pulse without changing hole coverage unintentionally.","Ma–Pa transition"],
 ["Cross-range Ma–Pa",["S'","P","M","P","S'","D","P","M","P","G","M","P"],76,"Protect intonation when moving down from upper Sa to Ma–Pa.","Ma–Pa transition"],
 ["Pa–Ma return tana",["P","M","G","M","P","D","P","M","P","M","G","R","S"],86,"Fast is optional; clarity and clean phrasing come first.","Ma–Pa transition"]
 ]
};
const PATTERNS={
 beginner:[
 ["Straight ascent",[0,1,2,3],44],["Two-note pairs",[0,1,0,1],46],["Three-note climb",[0,1,2,0,1,2],48],["Step and return",[0,1,0,1,2,1],48],
 ["Neighbour bounce",[0,1,0,2,1,0],50],["Four-note blocks",[0,1,2,3,2,1,0],48],["Two steps up one down",[0,1,2,1,2,3],48],["Skip and settle",[0,2,1,0],46],
 ["Pauses between swaras",[0,"—",1,"—",2,"—",1],44],["Repetition of three",[0,0,0,1,1,1,2,2,2],50],["Up and down pairs",[0,1,2,1,0],48],["Gentle zigzag",[0,2,1,3,2,1,0],48]
 ],
 intermediate:[
 ["Three-one palta",[0,1,2,1,0,1,2,3],60],["Alternate skips",[0,2,1,3,2,4],60],["Four-tone inversion",[3,2,1,0,1,2,3],58],["Two-up-two-down",[0,1,2,3,2,1],64],
 ["Step-skip-step",[0,1,3,2,1,2,4,3],64],["Fours and reversals",[0,1,2,3,1,2,3,4],62],["Moving triplets",[0,1,2,1,2,3,2,3,4],65],["Vakra-style movement",[0,2,1,3,2,4,3],64],
 ["Double each anchor",[0,0,1,2,2,3,4,4],62],["Jump down and recover",[3,1,2,0,1,3,2],60],["Mixed 3+2 grouping",[0,1,2,1,0,2,3],60],["Octave approach",[0,2,4,6,4,2,0],58]
 ],
 expert:[
 ["Five-note cascade",[0,1,2,3,4,3,2,1,0],82],["Broken fourths",[0,3,1,4,2,5,3,6],78],["Extended skip ladder",[0,2,4,1,3,5,2,4,6],78],["Descending spiral",[6,5,4,3,5,4,3,2,4,3,2,1],82],
 ["Rapid symmetrical palta",[0,2,1,3,2,4,3,5,4],86],["Seven-note inversion",[6,4,5,3,4,2,3,1,2,0],78],["Five-note inversion",[4,3,2,1,0,1,2,3,4],86],["Rising zigzag",[0,3,1,4,2,5,3,6],82],
 ["Offbeat recovery",[0,"—",2,3,1,"—",4,3,2,0],76],["Three-against-four feel",[0,1,2,1,2,3,2,3,4,3,4,5],80],["Wide leap control",[0,4,1,5,2,6,3,5],78],["Fast return with rests",[6,4,2,0,"—",1,3,5,6],84]
 ]
};
function makeSequence(offsets){const valid=offsets.filter(x=>typeof x==="number"),high=Math.max(...valid);const count=Math.max(1,NOTES.length-high);const result=[];for(let root=0;root<count;root++){for(const off of offsets)result.push(off==="—"?"—":NOTES[root+off])}return result}
function catalog(level){const lv=LEVELS.includes(level)?level:"beginner";
 const transitions=MP[lv].map(([name,seq,bpm,help,kind],i)=>({id:lv+"-mp-"+i,name,kind,bpm,seq,help,level:lv,focus:"ma-pa"}));
 const patterns=PATTERNS[lv].map(([name,pattern,bpm],i)=>({id:lv+"-alk-"+i,name,kind:"Alankara / palta",bpm,seq:makeSequence(pattern),help:"Sing the swaras first; play one swara per beat. Stop at a comfortable speed, then reverse the exercise. Keep Ma–Pa clean whenever it appears.",level:lv,focus:"alankara"}));
 return transitions.concat(patterns)}
function choose(level){const lv=LEVELS.includes(level)?level:"beginner";s.learnerLevel=lv;saveStore();window.dispatchEvent(new CustomEvent("bansuri-level-changed",{detail:{level:lv}}));render();window.adaptiveTeacher?.render?.();return lv}
function active(){const lv=LEVELS.includes(s.learnerLevel)?s.learnerLevel:"beginner";return lv}
function render(){
 const container=document.getElementById("alankaraSchool");if(!container)return;
 const level=active(),items=catalog(level),transitions=items.filter(x=>x.focus==="ma-pa"),patterns=items.filter(x=>x.focus==="alankara");
 const cards=arr=>arr.map(e=>'<article class="alk-card"><span class="alk-chip">'+e.kind+'</span><h3>'+e.name+'</h3><div class="alk-notes">'+e.seq.slice(0,18).join(" ") +(e.seq.length>18?" …":"")+'</div><p>'+e.help+'</p><div class="alk-card-foot"><span>'+e.bpm+' BPM · '+e.seq.length+' swaras</span><button type="button" data-alk="'+e.id+'">Practise →</button></div></article>').join("");
 container.innerHTML='<section class="alk-shell"><div class="alk-title"><div><small>ALANKARA & PALTA ACADEMY</small><h2>Your levelled practice library</h2><p>More than scales: develop swara fluency, clean Ma–Pa transitions, rhythm and confident finger changes.</p></div><div><label for="alkLevel">Learning level</label><select id="alkLevel"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option></select></div></div><div class="alk-tip"><b>Ma → Pa focus:</b> Ma may require half-holing the top finger hole; some Pa techniques use all six holes covered with appropriate air, others use an alternate fingering. Confirm the method with your teacher and listen for clean pitch, not finger speed. <a target="_blank" rel="noopener" href="https://bikashacharya.com/basuri/ladder.html">Fingering reference ↗</a></div><h3>Ma–Pa transition workshop · 4 drills</h3><div class="alk-grid">'+cards(transitions)+'</div><h3>Alankara patterns · 12 drills</h3><div class="alk-grid">'+cards(patterns)+'</div><p class="alk-footnote">All exercises are original teaching patterns using shuddha swaras. They are progressive exercises, not complete compositions or raag-specific improvisations.</p></section>';
 container.querySelector("#alkLevel").value=level;
}
function lesson(id){return catalog(active()).find(x=>x.id===id)||null}
document.addEventListener("change",e=>{if(e.target.id==="alkLevel")choose(e.target.value)});
document.addEventListener("click",e=>{const b=e.target.closest?.("[data-alk]");if(!b)return;const item=lesson(b.dataset.alk);if(!item)return;tab("quest");window.surQuest?.openExercise?.(item)});
window.alankaraSchool={catalog,active,choose,lesson,render,NOTE_ORDER:NOTES};
})();
