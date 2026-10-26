

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zain Ludo</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#10251e;color:white;font-family:Arial,sans-serif;text-align:center}
h1{color:#ffd54f;margin:14px 0 4px}
p{margin:6px}
#status{min-height:24px;color:#ffe082}
#board{display:grid;grid-template-columns:repeat(15,1fr);grid-template-rows:repeat(15,1fr);width:min(96vw,500px);aspect-ratio:1;margin:12px auto;background:#fff;border:4px solid white;gap:1px}
.cell{background:#f4f4f4;display:flex;align-items:center;justify-content:center;position:relative;min-width:0;min-height:0}
.home{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3px;padding:9%;border:2px solid white}
.red{background:#e53935}.green{background:#2eaa58}.yellow{background:#f6d33d}.blue{background:#2584dc}
.base{background:#fff;border-radius:18%;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px;padding:3px;width:100%;height:100%}
.token{border:2px solid white;border-radius:50%;width:72%;aspect-ratio:1;max-width:24px;max-height:24px;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;box-shadow:0 1px 3px #222;cursor:pointer}
.path{background:#fff;border:1px solid #bbb}
.safe{background:#fff3b0}
.center{background:conic-gradient(#2eaa58 0 25%,#f6d33d 25% 50%,#2584dc 50% 75%,#e53935 75%);font-size:clamp(12px,4vw,25px)}
button{border:0;border-radius:12px;padding:12px 18px;font-size:17px;font-weight:bold;cursor:pointer;margin:5px}
#roll{background:#ffd54f;color:#222}
#reset{background:#e8e8e8;color:#222}
#dice{font-size:42px;margin:8px}
#players{display:flex;justify-content:center;gap:7px;flex-wrap:wrap}
.player{padding:7px 10px;border-radius:8px;background:#244338}
.active{outline:3px solid #ffd54f}
.note{font-size:12px;color:#d5e4db;padding:10px}
</style>
</head>
<body>
<h1>🎲 Zain Ludo</h1>
<p>Four Players · Local Pass-and-Play</p>
<div id="players"></div>
<div id="board"></div>
<div id="dice">⚀</div>
<button id="roll" onclick="rollDice()">🎲 Roll Dice</button>
<button id="reset" onclick="resetGame()">↻ New Game</button>
<p id="status">Red starts. Roll a 6 to bring a token out.</p>
<p class="note">Tap one of your tokens after rolling. Play on the same device.</p>

<script>
const colors=['red','green','yellow','blue'];
const names=['Red','Green','Yellow','Blue'];
const start=[0,13,26,39];
const path=[];
for(let c=1;c<=6;c++)path.push([6,c]);
for(let r=5;r>=0;r--)path.push([r,7]);
for(let r=0;r<=5;r++)path.push([r,8]);
for(let c=9;c<=14;c++)path.push([6,c]);
for(let r=7;r<=14;r++)path.push([r,8]);
for(let c=13;c>=9;c--)path.push([8,c]);
for(let r=9;r<=14;r++)path.push([8,r===14?7:6]);
/* Build a reliable 52-cell shared route */
const route=[];
for(let c=1;c<=5;c++)route.push([6,c]);
for(let r=5;r>=0;r--)route.push([r,6]);
for(let r=0;r<=5;r++)route.push([r,8]);
for(let c=9;c<=14;c++)route.push([6,c]);
for(let r=7;r<=13;r++)route.push([r,8]);
for(let c=7;c>=0;c--)route.push([8,c]);
for(let r=9;r<=14;r++)route.push([r,6]);
for(let c=5;c>=0;c--)route.push([8,c]);
while(route.length<52)route.push([7,7]);
const board=document.getElementById('board');
const cells=[];
for(let i=0;i<225;i++){
 const d=document.createElement('div');
 d.className='cell';
 d.id='c'+i;
 board.appendChild(d);cells.push(d);
}
function cellAt(r,c){return cells[r*15+c]}
function paintHome(color,r,c){
 const d=cellAt(r,c);d.className='cell home '+color;
 const base=document.createElement('div');base.className='base';
 for(let i=0;i<4;i++){
  const t=document.createElement('button');t.className='token '+color;
  t.textContent=i+1;t.style.width='34%';t.style.maxWidth='30px';
  t.onclick=()=>selectToken(colors.indexOf(color),i);
  base.appendChild(t);
 }
 d.appendChild(base);
}
function setupBoard(){
 cells.forEach(d=>{d.className='cell';d.innerHTML=''});
 paintHome('red',0,0);paintHome('green',0,9);
 paintHome('blue',9,0);paintHome('yellow',9,9);
 route.forEach(([r,c],i)=>{
  const d=cellAt(r,c);d.className='cell path';
  if(i%13===0)d.classList.add('safe');
  d.textContent='·';
 });
 cellAt(7,7).className='cell center';cellAt(7,7).textContent='★';
}
let pos,turn,dice,finished,rolled;
function resetGame(){
 pos=colors.map(()=>[-1,-1,-1,-1]);turn=0;dice=0;finished=false;rolled=false;
 document.getElementById('dice').textContent='⚀';
 document.getElementById('status').textContent='Red starts. Roll a 6 to bring a token out.';
 setupBoard();render();
}
function render(){
 document.getElementById('players').innerHTML=names.map((n,i)=>
 '<div class="player '+(i===turn?'active':'')+'" style="border-bottom:4px solid '+colors[i]+'">'+n+(i===turn?' • Turn':'')+'</div>').join('');
 cells.forEach(d=>{if(d.classList.contains('path'))d.textContent=''});
 route.forEach(([r,c],i)=>{
  const d=cellAt(r,c);d.className='cell path'+(i%13===0?' safe':'');d.textContent='';
 });
 for(let p=0;p<4;p++){
  for(let t=0;t<4;t++){
   const step=pos[p][t];if(step<0||step>=52)continue;
   const [r,c]=route[(start[p]+step)%52];const d=cellAt(r,c);
   const b=document.createElement('button');b.className='token '+colors[p];b.textContent=t+1;
   b.title=names[p]+' token '+(t+1);
   b.onclick=()=>selectToken(p,t);
   d.appendChild(b);
  }
 }
}
function rollDice(){
 if(finished)return;
 if(rolled){say('Choose one of your tokens first.');return}
 dice=Math.floor(Math.random()*6)+1;rolled=true;
 document.getElementById('dice').textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][dice];
 const movable=pos[turn].some(s=>s<0?dice===6:s+dice<=57);
 if(!movable){say('No valid move. Next player.');setTimeout(nextTurn,800);return}
 say(names[turn]+' rolled '+dice+'. Tap a token to move.');
}
function selectToken(p,t){
 if(finished||!rolled||p!==turn){return}
 let s=pos[p][t];
 if(s<0){if(dice!==6){say('You need a 6 to leave home.');return}pos[p][t]=0}
 else{
  if(s+dice>57){say('Exact number needed to finish.');return}
  pos[p][t]=s+dice;
 }
 const now=pos[p][t];
 if(now<52){
  const idx=(start[p]+now)%52;
  if(idx%13!==0){
   for(let q=0;q<4;q++)if(q!==p)for(let j=0;j<4;j++){
    const other=pos[q][j];
    if(other>=0&&other<52&&(start[q]+other)%52===idx)pos[q][j]=-1;
   }
  }
 }
 render();
 if(pos[p].every(x=>x===57)){finished=true;say('🏆 '+names[p]+' wins!');return}
 const extra=dice===6||now===57;
 rolled=false;dice=0;
 if(!extra)turn=(turn+1)%4;
 document.getElementById('dice').textContent='🎲';
 say(extra?names[p]+' gets another turn!':names[turn]+' turn. Roll the dice.');
 render();
}
function nextTurn(){rolled=false;dice=0;turn=(turn+1)%4;document.getElementById('dice').textContent='🎲';render();say(names[turn]+' turn. Roll the dice.')}
function say(s){document.getElementById('status').textContent=s}
resetGame();
</script>
</body>
</html>
