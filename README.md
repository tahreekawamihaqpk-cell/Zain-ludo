<!doctype html>
<html lang="ur" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>Zain Ludo</title>
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:#101820;color:#fff;font-family:system-ui,sans-serif;text-align:center}
h1{margin:10px 0 4px;font-size:24px}
#setup,#game{max-width:560px;margin:0 auto;padding:8px}
.opt{margin:14px 0}
.opt b{display:block;margin-bottom:6px}
.btn{background:#26323d;color:#fff;border:2px solid #3b4a58;border-radius:12px;padding:10px 14px;margin:3px;font-size:16px}
.btn.on{background:#2e7d32;border-color:#81c784}
.go{background:#f9a825;color:#000;font-weight:bold;border:0;padding:14px 30px;font-size:20px;border-radius:14px;margin-top:10px}
#game{display:none}
#msg{min-height:28px;font-size:17px;margin:4px 0}
#board{direction:ltr;position:relative;width:min(96vw,540px);aspect-ratio:1;margin:6px auto;background:#fff;display:grid;grid-template-columns:repeat(15,1fr);grid-template-rows:repeat(15,1fr);border:3px solid #222}
.cell{border:.5px solid #bbb;display:flex;align-items:center;justify-content:center;font-size:min(3vw,15px);color:#666}
.center{position:absolute;left:40%;top:40%;width:20%;height:20%;background:conic-gradient(from -45deg,#43a047 0 25%,#fdd835 0 50%,#1e88e5 0 75%,#e53935 0)}
#pieces{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.pc{position:absolute;width:5.4%;aspect-ratio:1;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px #000;transform:translate(-50%,-50%);transition:left .25s,top .25s;pointer-events:auto}
.pc.can{animation:pulse .5s infinite alternate;z-index:5;cursor:pointer}
@keyframes pulse{to{transform:translate(-50%,-50%) scale(1.4)}}
#dice{font-size:56px;line-height:1;background:#fff;color:#000;border:5px solid #888;border-radius:16px;width:84px;height:84px;margin:8px}
</style>
</head>
<body>
<div id="setup">
  <h1>🎲 Zain Ludo</h1>
  <div class="opt"><b>موڈ</b>
    <button class="btn on" data-k="mode" data-v="quick">Quick (ایک گوٹی جیت)</button>
    <button class="btn" data-k="mode" data-v="classic">Classic (چاروں گوٹیاں)</button>
  </div>
  <div class="opt"><b>کھلاڑی</b>
    <button class="btn on" data-k="n" data-v="2">2</button>
    <button class="btn" data-k="n" data-v="4">4</button>
  </div>
  <div class="opt"><b>مخالف</b>
    <button class="btn on" data-k="bots" data-v="yes">کمپیوٹر</button>
    <button class="btn" data-k="bots" data-v="no">دوست (ایک فون پر)</button>
  </div>
  <button class="go" id="start">شروع کریں</button>
</div>

<div id="game">
  <div id="msg"></div>
  <div id="board"></div>
  <button id="dice">🎲</button><br>
  <button class="btn" id="menu">نیا گیم</button>
</div>

<script>
const $=id=>document.getElementById(id);
const rand=n=>Math.floor(Math.random()*n);
const COL=["#e53935","#43a047","#fdd835","#1e88e5"];
const NAME=["سرخ","ہرا","پیلا","نیلا"];
const FACE="⚀⚁⚂⚃⚄⚅";
const START=[0,13,26,39];
const SAFE=new Set([0,13,26,39,8,21,34,47]);
const T=[[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const HOME=[
 [[7,1],[7,2],[7,3],[7,4],[7,5]],
 [[1,7],[2,7],[3,7],[4,7],[5,7]],
 [[7,13],[7,12],[7,11],[7,10],[7,9]],
 [[13,7],[12,7],[11,7],[10,7],[9,7]]
];
const Q=[[0,0],[0,9],[9,9],[9,0]];
let cfg={mode:"quick",n:"2",bots:"yes"};
let S=null;

document.querySelectorAll(".btn[data-k]").forEach(b=>{
  b.onclick=()=>{
    cfg[b.dataset.k]=b.dataset.v;
    document.querySelectorAll('.btn[data-k="'+b.dataset.k+'"]').forEach(x=>x.classList.toggle("on",x===b));
  };
});
$("start").onclick=start;
$("menu").onclick=()=>{$("game").style.display="none";$("setup").style.display="block";};
$("dice").onclick=()=>{if(S&&!isBot(cur()))roll();};

const cur=()=>S.active[S.turn];
const isBot=c=>cfg.bots==="yes"&&c!==0;
const msg=t=>$("msg").textContent=t;

function start(){
  S={active:cfg.n==="2"?[0,2]:[0,1,2,3],turn:0,
     pos:[[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]],
     dice:0,sixes:0,phase:"roll",can:[],over:false,els:{}};
  $("setup").style.display="none";$("game").style.display="block";
  buildBoard();buildPieces();render();setTurn();
}

function buildBoard(){
  const b=$("board");b.innerHTML="";
  const tk=new Map();T.forEach((t,k)=>tk.set(t[0]+","+t[1],k));
  const hm=new Map();HOME.forEach((h,c)=>h.forEach(t=>hm.set(t[0]+","+t[1],c)));
  for(let r=0;r<15;r++)for(let c=0;c<15;c++){
    const d=document.createElement("div");d.className="cell";
    const key=r+","+c;let q=-1;
    if(r<6&&c<6)q=0;else if(r<6&&c>8)q=1;else if(r>8&&c>8)q=2;else if(r>8&&c<6)q=3;
    if(q>=0){
      const r0=Q[q][0],c0=Q[q][1];
      const inner=r>r0&&r<r0+5&&c>c0&&c<c0+5;
      d.style.background=inner?"#fff":COL[q];d.style.border="none";
    }else if(r>=6&&r<=8&&c>=6&&c<=8){d.style.border="none";}
    else if(hm.has(key)){d.style.background=COL[hm.get(key)];}
    else if(tk.has(key)){
      const k=tk.get(key);
      if(START.includes(k))d.style.background=COL[START.indexOf(k)];
      else if(SAFE.has(k))d.textContent="★";
    }
    b.appendChild(d);
  }
  const ce=document.createElement("div");ce.className="center";b.appendChild(ce);
  const pl=document.createElement("div");pl.id="pieces";b.appendChild(pl);
}

function buildPieces(){
  const pl=$("pieces");
  S.active.forEach(c=>{
    S.els[c]=[];
    for(let i=0;i<4;i++){
      const e=document.createElement("div");e.className="pc";e.style.background=COL[c];
      e.onclick=()=>{if(S.phase==="move"&&cur()===c&&S.can.includes(i))move(i);};
      pl.appendChild(e);S.els[c].push(e);
    }
  });
}

function posXY(c,i){
  const p=S.pos[c][i];
  if(p<0){const q=Q[c];return [q[0]+(i<2?2:4),q[1]+(i%2?4:2)];}
  if(p<=50){const t=T[(START[c]+p)%52];return [t[0]+.5,t[1]+.5];}
  if(p<=55){const t=HOME[c][p-51];return [t[0]+.5,t[1]+.5];}
  const f=[[7.5,6.7],[6.7,7.5],[7.5,8.3],[8.3,7.5]][c];
  return [f[0]+(i-1.5)*.12,f[1]+(i-1.5)*.12];
}

function render(){
  const g={},L=[];
  S.active.forEach(c=>{
    for(let i=0;i<4;i++){
      const [y,x]=posXY(c,i);const p=S.pos[c][i];
      const k=(p>=0&&p<56)?y+","+x:null;
      const o={c,i,y,x};L.push(o);
      if(k)(g[k]=g[k]||[]).push(o);
    }
  });
  Object.values(g).forEach(a=>{if(a.length>1)a.forEach((o,j)=>{o.x+=(j-(a.length-1)/2)*0.3;});});
  L.forEach(o=>{
    const e=S.els[o.c][o.i];
    e.style.left=(o.x*100/15)+"%";e.style.top=(o.y*100/15)+"%";
    e.classList.toggle("can",S.phase==="move"&&cur()===o.c&&S.can.includes(o.i));
  });
}

function setTurn(){
  S.phase="roll";S.can=[];render();
  $("dice").style.borderColor=COL[cur()];
  msg(NAME[cur()]+" کی باری — پانسہ پھینکیں");
  if(isBot(cur()))setTimeout(roll,800);
}

function nextTurn(){
  S.turn=(S.turn+1)%S.active.length;S.sixes=0;setTurn();
}

function roll(){
  if(S.phase!=="roll"||S.over)return;
  S.phase="rolling";let n=0;
  const iv=setInterval(()=>{
    $("dice").textContent=FACE[rand(6)];
    if(++n>=8){clearInterval(iv);afterRoll(1+rand(6));}
  },70);
}

function movable(c,d){
  const r=[];
  for(let i=0;i<4;i++){
    const p=S.pos[c][i];
    if(p===-1){if(d===6)r.push(i);}
    else if(p<56&&p+d<=56)r.push(i);
  }
  return r;
}

function afterRoll(d){
  S.dice=d;$("dice").textContent=FACE[d-1];
  if(d===6){
    S.sixes++;
    if(S.sixes===3){msg("تین چھکے! باری ختم");return setTimeout(nextTurn,1000);}
  }else S.sixes=0;
  const c=cur(),m=movable(c,d);
  if(!m.length){msg("کوئی چال ممکن نہیں");return setTimeout(nextTurn,900);}
  if(isBot(c)){
    S.phase="moving";
    setTimeout(()=>move(botPick(c,d,m)),700);
  }else if(m.length===1){
    S.phase="moving";
    setTimeout(()=>move(m[0]),350);
  }else{
    S.phase="move";S.can=m;render();msg("گوٹی چنیں");
  }
}

function botPick(c,d,m){
  let best=m[0],bs=-1;
  m.forEach(i=>{
    const p=S.pos[c][i],np=p===-1?0:p+d;let s=np;
    if(np===56)s=100;
    else if(p===-1)s=50;
    else if(np<=50){
      const idx=(START[c]+np)%52;
      if(SAFE.has(idx))s+=15;
      else S.active.forEach(o=>{if(o===c)return;
        for(let j=0;j<4;j++){const q=S.pos[o][j];
          if(q>=0&&q<=50&&(START[o]+q)%52===idx)s=80;}});
    }
    if(s>bs){bs=s;best=i;}
  });
  return best;
}

function move(i){
  const c=cur(),d=S.dice;
  S.can=[];S.phase="moving";
  let p=S.pos[c][i];p=(p===-1)?0:p+d;S.pos[c][i]=p;
  let cap=false;
  if(p<=50){
    const idx=(START[c]+p)%52;
    if(!SAFE.has(idx)){
      S.active.forEach(o=>{
        if(o===c)return;
        for(let j=0;j<4;j++){
          const q=S.pos[o][j];
          if(q>=0&&q<=50&&(START[o]+q)%52===idx){S.pos[o][j]=-1;cap=true;}
        }
      });
    }
  }
  render();
  const won=cfg.mode==="quick"?S.pos[c].some(x=>x===56):S.pos[c].every(x=>x===56);
  if(won){S.over=true;msg("🏆 "+NAME[c]+" جیت گیا!");return;}
  if(d===6||cap||p===56){
    msg(cap?"گوٹی ماری! دوبارہ باری":d===6?"چھکا! دوبارہ باری":"گھر پہنچی! دوبارہ باری");
    S.phase="roll";
    if(isBot(c))setTimeout(roll,900);
  }else setTimeout(nextTurn,500);
}
</script>
</body>
</html>
