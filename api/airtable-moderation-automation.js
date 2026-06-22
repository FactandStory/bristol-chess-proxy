/* ============================================================================
   Airtable Automation — "Run a script" step
   Builds the signed Approve / Reject links for the alert email.

   Set up ONE automation per table (Notable Games, Events, Gallery):
     Trigger:  "When a record is created"  (on that table)
     Action 1: "Run a script"  → paste THIS script
     Action 2: "Send an email" → to you; make the words "Approve" and "Reject"
               hyperlinks to the variables approveUrl / rejectUrl from step 1.

   EDIT THE THREE CONSTANTS BELOW per table. The SECRET must be byte-identical
   to the MODERATE_SECRET env var on Vercel, or the links won't validate.
   Use an ASCII secret (letters/digits/symbols, no accented characters).
   ============================================================================ */

// ---- EDIT THESE ------------------------------------------------------------
const TYPE = "game"          // "game" (Notable Games) | "event" (Events) | "photo" (Gallery)
const SECRET = "PASTE_THE_SAME_SECRET_AS_MODERATE_SECRET"
const BASE_URL = "https://bristol-chess-proxy.vercel.app"
// ----------------------------------------------------------------------------

// The triggering record's id. In the script step's "Input variables" panel,
// add a variable named "recordId" and map it to the trigger record's Airtable
// record ID. (Left side: recordId ; right side: the record's ID token.)
const { recordId } = input.config()

// --- pure-JS HMAC-SHA256 (Airtable's sandbox has no Node crypto) ------------
function sha256(b){function r(n,x){return (x>>>n)|(x<<(32-n))}
const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]
let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]
const bl=b.length*8,w8=[...b,0x80];while(w8.length%64!==56)w8.push(0)
for(let i=7;i>=0;i--)w8.push((bl/Math.pow(2,8*i))&0xff)
for(let o=0;o<w8.length;o+=64){const w=new Array(64)
for(let i=0;i<16;i++)w[i]=(w8[o+i*4]<<24)|(w8[o+i*4+1]<<16)|(w8[o+i*4+2]<<8)|(w8[o+i*4+3])
for(let i=16;i<64;i++){const s0=r(7,w[i-15])^r(18,w[i-15])^(w[i-15]>>>3),s1=r(17,w[i-2])^r(19,w[i-2])^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
let[a,b2,c,d,e,f,g,h]=H
for(let i=0;i<64;i++){const S1=r(6,e)^r(11,e)^r(25,e),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+w[i])|0,S0=r(2,a)^r(13,a)^r(22,a),mj=(a&b2)^(a&c)^(b2&c),t2=(S0+mj)|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b2;b2=a;a=(t1+t2)|0}
H=[(H[0]+a)|0,(H[1]+b2)|0,(H[2]+c)|0,(H[3]+d)|0,(H[4]+e)|0,(H[5]+f)|0,(H[6]+g)|0,(H[7]+h)|0]}
const out=[];for(const x of H)out.push((x>>>24)&0xff,(x>>>16)&0xff,(x>>>8)&0xff,x&0xff);return out}
function bytes(s){const o=[];for(let i=0;i<s.length;i++){let c=s.charCodeAt(i)
if(c<0x80)o.push(c);else if(c<0x800){o.push(0xc0|(c>>6),0x80|(c&0x3f))}
else{o.push(0xe0|(c>>12),0x80|((c>>6)&0x3f),0x80|(c&0x3f))}}return o}
function hmacHex(key,msg){let k=bytes(key);if(k.length>64)k=sha256(k)
if(k.length<64)k=[...k,...new Array(64-k.length).fill(0)]
const ip=k.map(x=>x^0x36),op=k.map(x=>x^0x5c)
const inner=sha256([...ip,...bytes(msg)]);const o=sha256([...op,...inner])
return o.map(x=>x.toString(16).padStart(2,"0")).join("")}
// ----------------------------------------------------------------------------

function link(action){
  const token = hmacHex(SECRET, `${TYPE}:${recordId}:${action}`)
  return `${BASE_URL}/api/moderate?type=${TYPE}&id=${recordId}&action=${action}&token=${token}`
}

output.set("approveUrl", link("approve"))
output.set("rejectUrl", link("reject"))
