import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("public Firebase config loads from a single published file",()=>{
 const win={};runInNewContext(read("firebase-config.js"),{window:win});
 const config=win.BANSURI_FIREBASE_CONFIG;
 for(const key of ["apiKey","projectId","authDomain","appId"])assert.ok(config[key]);
 assert.equal(config.projectId,"bansuri-guru");
 assert.equal(config.client_secret,undefined);
 assert.equal(config.private_key,undefined);
});
test("Firebase config loads before the auth module and avoids inline duplicates",()=>{
 const html=read("index.html");
 assert.ok(html.indexOf('src="./firebase-config.js"')<html.indexOf('src="./cloud.js"'));
 assert.match(html,/const PUBLIC_FIREBASE_CONFIG=window\.BANSURI_FIREBASE_CONFIG/);
 assert.doesNotMatch(html,/const PUBLIC_FIREBASE_CONFIG=\{/);
});
test("first-time login uses deployed config instead of requiring browser storage",()=>{
 const html=read("index.html");
 assert.match(html,/function firebaseConfig\(/);
 assert.match(html,/const cfg=firebaseConfig\(\)/);
 assert.match(html,/auth\/unauthorized-domain/);
 assert.match(html,/auth\/popup-blocked/);
});
test("user-authored lesson labels are rendered as text instead of HTML",()=>{
 const js=read("sur-quest.js");
 const start=js.indexOf("function drawList()");
 const end=js.indexOf("const hints=",start);
 assert.ok(start>=0&&end>start);
 const segment=js.slice(start,end);
 assert.match(segment,/textContent=String\(x\.name/);
 assert.match(segment,/textContent=String\(x\.kind/);
 assert.doesNotMatch(segment,/innerHTML/);
});
test("service worker precaches the deployed Firebase config",()=>{
 const sw=read("sw.js");
 assert.match(sw,/auth-security-v31/);
 assert.match(sw,/\.\/firebase-config\.js/);
});
test("secure Firestore policy has user-bound backup and deny-by-default fallback",()=>{
 const rules=read("firestore.rules");
 assert.match(rules,/request\.auth\.uid == userId/);
 assert.match(rules,/allow read, write: if false/);
});
