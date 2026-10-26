
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zain Ludo</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#17251e;color:white;font-family:Arial,sans-serif;text-align:center}
h1{margin:12px;color:#ffd34e}
#status{padding:10px;font-size:17px}
#timer{font-size:24px;font-weight:bold;color:#ffd34e}
#board{width:min(94vw,470px);aspect-ratio:1;margin:12px auto;display:grid;grid-template-columns:repeat(15,1fr);grid-template-rows:repeat(15,1fr);background:#fff;border:4px solid white;gap:1px}
.cell{background:#f1f1e8;position:relative;display:flex;align-items:center;justify-content:center;min-width:0;min-height:0}
.base{grid-column:span 6;grid-row:span 6;display:grid;place-items:center}
.base.green{background:#16883d;grid-area:1/1/7/7}
.base.red{background:#d62828;grid-area:1/10/7/16}
.base.blue{background:#2477d4;grid-area:10/1/16/7}
.base.yellow{background:#f1c928;grid-area:10/10/16/16}
.home{grid-area:7/7/10/10;background:#fff;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);display:grid;place-items:center;color:#222;font-size:10px;font-weight:bold}
.nest{width:72%;height:72%;background:#fff;border-radius:15%;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8%;padding:10%}
.pawn{border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px #222;cursor:pointer;width:100%;height:100%;min-width:0;min-height:0}
.green .pawn{background:#16883d}
.red .pawn{background:#d62828}
.blue .pawn{background:#2477d4}
.yellow .pawn{background:#e7b900}
.track{grid-area:1/7/7/10;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(6,1fr)}
.track.right{grid-area:7/10/10/16;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(3,1fr)}
.track.bottom{grid-area:10/7/16/10;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(6,1fr)}
.track.left{grid-area:7/1/10/7;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(3,1fr)}
.pathcell{background:#f7f7ed;border:1px solid #bbb;display:flex;align-items:center;justify-content:center;position:relative}
.pathpawn{width:85%;height:85%;border-radius:50%;border:2px solid white;position:absolute;z-index:2}
.greenColor{background:#16883d}.redColor{background:#d62828}.blueColor{background:#2477d4}.yellowColor{background:#e7b900}
.baseLabel{font-size:12px;font-weight:bold;color:white}
.yellow .baseLabel{color:#222}
.controls{display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap;margin:15px}
#dice{font-size:38px;background:white;color:#222;border-radius:12px;padding:8px 18px;min-width:76px}
button{border:0;border-radius:10px;padding:12px 18px;font-size:16px;font-weight:bold;cursor:pointer}
#roll{background:#ffd34e;color:#222}
button:disabled{opacity:.45}
#message{min-height:24px;padding:8px;color:#fff}
.legend{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding:10px}
</style>
</head>
<body>
<h1>🎲 ZAIN LUDO</h1>
<div id="status">Green کی باری</div>
<div>باری کا وقت: <span id="timer">20</span> سیکنڈ</div>
<div id="board">
 <div class="base green"><div class="nest" id="nest-green"></div></div>
 <div class="base red"><div class="nest" id="nest-red"></div></div>
 <div class="base blue"><div class="nest" id="nest-blue"></div></div>
 <div class="base yellow"><div class="nest" id="nest-yellow"></div></div>
 <div class="track" id="track-top"></div>
 <div class="track right" id="track-right"></div>
 <div class="track bottom" id="track-bottom"></div>
 <div class="track left" id="track-left"></div>
 <div class="home">HOME</div>
</div>
<div class="controls">
 <div id="dice">🎲</div>
 <button id="roll" onclick="rollDice()">ROLL DICE</button>
</div>
<div id="message">ڈائس دبائیں۔ چھکا آنے پر دوبارہ ڈائس دبائیں۔</div>
<div class="legend">
 <span>🟢 Green</span><span>🔴 Red</span>
 <span>🔵 Blue</span><span>🟡 Yellow</span>
</div>
<script>
const colors=["green","red","blue","yellow"];
const names={green:"Green",red:"Red",blue:"Blue",yellow:"Yellow"};
const emojis=["🟢","🔴","🔵","🟡"];
let turn=0,dice=0,rolled=false,seconds=20,timer=null;
let pawns={green:[-1,-1,-1,-1],red:[-1,-1,-1,-1],
 blue:[-1,-1,-1,-1],yellow:[-1,-1,-1,-1]};
const trackPositions=[];
for(let r=1;r<=6;r++)trackPositions.push([r,7],[r,8],[r,9]);
for(let c=10;c<=15;c++)trackPositions.push([7,c],[8,c],[9,c]);
for(let r=10;r<=15;r++)trackPositions.push([r,9],[r,8],[r,7]);
for(let c=6;c>=1;c--)trackPositions.push([9,c],[8,c],[7,c]);
/* Use a circular 52-step route for each color. */
const route=[];
for(let c=7;c<=9;c++)for(let r=1;r<=6;r++)route.push([r,c]);
for(let r=7;r<=9;r++)for(let c=10;c<=15;c++)route.push([r,c]);
for(let c=9;c>=7;c--)for(let r=10;r<=15;r++)route.push([r,c]);
for(let r=9;r>=7;r--)for(let c=6;c>=1;c--)route.push([r,c]);
/* Draw a simple 52-cell playable track. */
const cells=[];
for(let i=0;i<52;i++){
 const el=document.createElement("div");
 el.className="pathcell";
 el.dataset.index=i;
 cells.push(el);
}
function drawTrack(){
 const tracks=[
  ...Array.from({length:18},(_,i)=>[i,0]),
 ];
 // Put route cells around the board edge of the central cross.
 const top=document.getElementById("track-top");
 const right=document.getElementById("track-right");
 const bottom=document.getElementById("track-bottom");
 const left=document.getElementById("track-left");
 [top,right,bottom,left].forEach(x=>x.innerHTML="");
 for(let i=0;i<18;i++){
  let e=document.createElement("div");e.className="pathcell";
  top.appendChild(e);
 }
 for(let i=0;i<18;i++){
  let e=document.createElement("div");e.className="pathcell";
  right.appendChild(e);
 }
 for(let i=0;i<18;i++){
  let e=document.createElement("div");e.className="pathcell";
  bottom.appendChild(e);
 }
 for(let i=0;i<18;i++){
  let e=document.createElement("div");e.className="pathcell";
  left.appendChild(e);
 }
}
drawTrack();
function render(){
 colors.forEach(color=>{
  const nest=document.getElementById("nest-"+color);
  nest.innerHTML="";
  pawns[color].forEach((pos,i)=>{
   if(pos===-1){
    const b=document.createElement("button");
    b.className="pawn";b.title="گٹی نکالیں";
    b.onclick=()=>choosePawn(color,i);
    nest.appendChild(b);
   }
  });
 });
 document.getElementById("status").textContent=
  names[colors[turn]]+" کی باری";
 document.getElementById("roll").disabled=rolled;
}
function startTimer(){
 clearInterval(timer);seconds=20;
 document.getElementById("timer").textContent=seconds;
 timer=setInterval(()=>{
  seconds--;
  document.getElementById("timer").textContent=seconds;
  if(seconds<=0){
   clearInterval(timer);
   nextTurn("وقت ختم ہوگیا۔ اگلے کھلاڑی کی باری۔");
  }
 },1000);
}
function rollDice(){
 if(rolled)return;
 dice=Math.floor(Math.random()*6)+1;
 rolled=true;
 document.getElementById("dice").textContent=
  ["⚀","⚁","⚂","⚃","⚄","⚅"][dice-1];
 document.getElementById("roll").disabled=true;
 if(dice===6){
  document.getElementById("message").textContent=
   "چھکا! اسی کھلاڑی کو دوبارہ ڈائس دبانے کا موقع ہے۔";
  rolled=false;
  document.getElementById("roll").disabled=false;
  startTimer();
  return;
 }
 document.getElementById("message").textContent=
  dice+" آیا۔ اپنی گٹی منتخب کریں۔";
 startTimer();
}
function choosePawn(color,index){
 if(color!==colors[turn])return;
 if(!rolled){
  document.getElementById("message").textContent=
   "پہلے ڈائس دبائیں۔";
  return;
 }
 if(pawns[color][index]===-1){
  document.getElementById("message").textContent=
   "گٹی گھر سے نکالنے کے لیے 6 درکار ہے۔ دوبارہ کوشش کریں۔";
  nextTurn("گٹی نکالنے کے لیے چھکا درکار ہے۔");
  return;
 }
 pawns[color][index]+=dice;
 nextTurn("گٹی چل گئی۔ اگلے کھلاڑی کی باری۔");
}
function nextTurn(message){
 clearInterval(timer);
 document.getElementById("message").textContent=message;
 rolled=false;dice=0;
 turn=(turn+1)%4;
 document.getElementById("dice").textContent="🎲";
 render();startTimer();
}
render();startTimer();
</script>
</body>
</html>
