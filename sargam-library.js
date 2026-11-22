/* Additional Sargam and Raag curriculum. Retains the original eight exercises. */
(function(){
"use strict";
const basic=["S","R","G","M","P","D","N","S'"];
const raags=[
["Bhupali","beginner","S R G P D","S R G P D S'","S' D P G R S","S R G P G R S","Pentatonic, omits Ma and Ni."],
["Durga","beginner","S R M P D","S R M P D S'","S' D P M R S","S R M P M R S","Pentatonic with Ma, omits Ga and Ni."],
["Bilawal","beginner","S R G M P D N","S R G M P D N S'","S' N D P M G R S","S R G M P G R S","All shuddha swaras in this introductory exercise."],
["Khamaj","beginner","S R G M P D n","S G M P D N S'","S' n D P M G R S","G M P D n D P M G","Use komal Ni mainly descending; note ascent may vary."],
["Desh","beginner","S R M P N","S R M P N S'","S' n D P M G R S","R M P N S' n D P M G R","Notice shuddha Ni rising and komal Ni descending."],
["Yaman","intermediate","S R G M^ P D N","N R G M^ D N S'","S' N D P M^ G R S","N R G M^ D N R S","Tivra Ma is essential; ascending movement can be vakra."],
["Kafi","intermediate","S R g M P D n","S R g M P D n S'","S' n D P M g R S","S g R M P n D P","Komal Ga and Ni. Study typical phrasing."],
["Bhairav","intermediate","S r G M P d N","S r G M P d N S'","S' N d P M G r S","G M d P M G r S","Komal Re and Dha; ornamentation matters."],
["Bhairavi","intermediate","S r g M P d n","S r g M P d n S'","S' n d P M g r S","g M P d P M g r S","Four komal swaras in a basic Bhairavi framework."],
["Bageshri","intermediate","S R g M D n","n S g M D n S'","S' n D M P D M g R S","g M D n D M g R S","Pa is often approached selectively; characteristic phrases matter."],
["Bhimpalasi","intermediate","S R g M P D n","n S g M P n S'","S' n D P M g R S","n S g M P M g R S","Komal Ga and Ni; phrase and time-of-day context."],
["Pilu","intermediate","S R g G M P D n N","S g R M P n S'","S' n D P M g R S","g R S n S G M P","Flexible light-classical raga; swara usage varies."],
["Jaunpuri","intermediate","S R g M P d n","S R M P d n S'","S' n d P M g R S","R M P d M g R S","Komal Ga Dha Ni; learn slow descent."],
["Asavari","intermediate","S R g M P d n","S R M P d n S'","S' n d P M g R S","M P d n S' n d P","A simplified Asavari framework."],
["Malkauns","expert","S g M d n","S g M d n S'","S' n d M g S","g M d n d M g S","Pentatonic with komal Ga Dha Ni, no Re or Pa."],
["Darbari Kanada","expert","S R g M P d n","S R g M P d n S'","S' n d P M g R S","g M R S n S","Slow development and nuanced oscillation essential."],
["Marwa","expert","S r G M^ D N","S r G M^ D N S'","S' N D M^ G r S","r G M^ D N D M^ G","Komal Re and tivra Ma; Pa omitted."],
["Puriya","expert","S r G M^ P D N","N r G M^ D N S'","S' N D P M^ G r S","N r G M^ D N","A simplified exercise requiring phrase-based study."],
["Todi","expert","S r g M^ P d N","S r g M^ d N S'","S' N d P M^ g r S","r g M^ d M^ g r S","Komal Re Ga Dha and tivra Ma; strong intonation demands."],
["Multani","expert","S r g M^ P D N","N S g M^ P N S'","S' N D P M^ g r S","g M^ P N D P M^ g","Listen closely to characteristic ascent and descent."]
];
const exercises=[
["Straight ascending alankara","beginner","S R G M P D N S'","Start slow, hold each clean note."],
["Straight descending alankara","beginner","S' N D P M G R S","Keep breath consistent while descending."],
["Step-and-return palta","beginner","S R S R G R G M G M P M","Smooth fingers, no unnecessary movement."],
["Three-swara movement","beginner","S R G R G M G M P M P D","Three-note groups, gently articulated."],
["Ma–Pa balance","beginner","G M P M G M P M G","Give Ma–Pa and Pa–Ma equal attention."],
["Pa–Ma long note","beginner","P P M M P M G R S","Notice intonation just after the change."],
["Pairwise ascent","beginner","S S R R G G M M P P","Play each pair with identical tone."],
["Sa–Pa distance","beginner","S P S P G P M P S","Avoid overblowing the leap."],
["Four-swara cascade","intermediate","S R G M R G M P G M P D M P D N","Repeat each four-note fragment evenly."],
["Four-note return","intermediate","M G R S P M G R D P M G","Return cleanly after longer jumps."],
["Ma–Pa repeated reversals","intermediate","M P M P G M P M G M P D","Play clean transitions before adding speed."],
["Odd grouping palta","intermediate","S R G R G M G M P M P D P","Count groups against an even beat."],
["Descending doubles","intermediate","S' N N D D P P M M G G R R S","Keep each repeated pitch stable."],
["Rhythm over 8 beats","intermediate","S R G M P M G R S R G M P D N S'","Feel the eight-beat cycle."],
["Alankara in thirds","intermediate","S G R M G P M D P N D S'","Maintain clean leaps."],
["Ma–Pa with surrounding notes","intermediate","G M P D P M G R G M P M","Avoid a pause between Ma and Pa."],
["Wide interval patterns","expert","S M R P G D M N P S'","Increase only after pitch accuracy."],
["Reverse cascade","expert","S' N D P N D P M D P M G P M G R","Phrase long descending groups."],
["Fast Ma–Pa oscillation","expert","G M P M P M G M P D P M G","Tempo follows clarity, not the reverse."],
["Mixed interval palta","expert","S G P R M D G P N M D S'","Watch intonation after every leap."],
["Vakra-style pattern","expert","S G R M G P M D P N D S'","A training palta, not a raga pakad."],
["Keharwa accent exercise","expert","S R G M P M G R M P D N S' N D P","Keep strong beats and note accuracy separate."],
["Tivra-Ma drill","expert","G M^ P M^ G R S G M^ P","Reference frequencies include tivra Ma."],
["Komal transitions","expert","S r g M g r S n S","Focus on accurately lowered swaras."]
];
const root=document.getElementById("sargamLibrary");if(!root)return;
let selectedLevel="all",keyword="",section="all";
const esc=x=>String(x).replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[a]));
function lessons(){return [...exercises.map((x,i)=>({id:"e"+i,name:x[0],level:x[1],seq:x[2].split(/\s+/),help:x[3],kind:"Sargam / Alankara",bpm:x[1]==="beginner"?48:x[1]==="intermediate"?62:78,section:"exercise"})),...raags.flatMap((x,i)=>[
 {id:"r"+i+"a",name:"Raag "+x[0]+" · Aroha",level:x[1],seq:x[3].split(/\s+/),help:x[6],kind:"Raag study",bpm:x[1]==="beginner"?52:x[1]==="intermediate"?58:48,section:"raag"},
 {id:"r"+i+"v",name:"Raag "+x[0]+" · Avaroha",level:x[1],seq:x[4].split(/\s+/),help:x[6],kind:"Raag study",bpm:52,section:"raag"},
 {id:"r"+i+"p",name:"Raag "+x[0]+" · Phrase",level:x[1],seq:x[5].split(/\s+/),help:x[6],kind:"Raag phrase",bpm:56,section:"raag"}
 ])]}
function render(){
 const all=lessons(),filtered=all.filter(x=>(selectedLevel==="all"||x.level===selectedLevel)&&(section==="all"||x.section===section)&&(!keyword||(x.name+" "+x.seq.join(" ")+" "+x.help).toLowerCase().includes(keyword)));
 root.innerHTML='<div class="rag-head"><div><h2>Expanded Sargam & Raag Library</h2><p>24 additional swara exercises and 20 raag frameworks, each with aroha, avaroha and a study phrase. Select a level and practise interactively.</p></div><b>'+filtered.length+' lessons shown</b></div><div class="rag-controls"><label>Difficulty<select id="ragLevel"><option value="all">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option></select></label><label>Section<select id="ragType"><option value="all">All types</option><option value="exercise">Sargam & Alankara</option><option value="raag">Raag lessons</option></select></label><label>Search<input id="ragSearch" placeholder="Search e.g. Yaman, Ma–Pa"></label></div><p class="rag-note">Notation: lowercase r, g, d, n = komal; M^ = tivra Ma. These are introductory teaching frameworks, not complete authoritative raag treatments. Raag-specific phrases, ornamentation and note usage should be studied with a teacher. Play reference tones with headphones while using the microphone.</p><div class="rag-grid">'+filtered.map(x=>'<article class="rag-card"><span>'+esc(x.level)+' · '+esc(x.kind)+'</span><h3>'+esc(x.name)+'</h3><div class="rag-notation">'+esc(x.seq.join(" "))+'</div><p>'+esc(x.help)+'</p><div><button data-listen="'+x.id+'">♫ Hear</button><button data-open="'+x.id+'">Practise →</button></div></article>').join("")+'</div>';
 root.querySelector("#ragLevel").value=selectedLevel;root.querySelector("#ragType").value=section;root.querySelector("#ragSearch").value=keyword;
}
function find(id){return lessons().find(x=>x.id===id)}
function playPhrase(seq){const pitches={S:0,r:1,R:2,g:3,G:4,M:5,"M^":6,P:7,d:8,D:9,n:10,N:11,"S'":12};let i=0;for(const n of seq){if(!Object.prototype.hasOwnProperty.call(pitches,n)){i++;continue}tone((Number(s.sa)||440)*Math.pow(2,pitches[n]/12),i*.38,.24);i++}}
root.addEventListener("input",e=>{if(e.target.id==="ragSearch"){keyword=e.target.value.toLowerCase().trim();render();root.querySelector("#ragSearch").focus()}});
root.addEventListener("change",e=>{if(e.target.id==="ragLevel")selectedLevel=e.target.value;if(e.target.id==="ragType")section=e.target.value;render()});
root.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const lesson=find(b.dataset.open||b.dataset.listen);if(!lesson)return;if(b.dataset.listen)playPhrase(lesson.seq);else{tab("quest");window.surQuest?.openExercise?.(lesson)}});
window.expandedSargam={lessons,render,playPhrase};
render();
})();
