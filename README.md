
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zain Ludo</title>
<style>
body{margin:0;background:#173b2b;color:white;text-align:center;font-family:Arial}
h1{color:#ffd54f}
.board{display:grid;grid-template-columns:repeat(15,1fr);width:min(94vw,450px);aspect-ratio:1;margin:15px auto;background:white;gap:1px}
.cell{background:#eee;display:flex;align-items:center;justify-content:center;font-size:clamp(9px,2.5vw,16px)}
.red{background:#e53935}.green{background:#43a047}.yellow{background:#fdd835}.blue{background:#1e88e5}
button{padding:12px 24px;font-size:18px;border:0;border-radius:10px;margin:8px}
#dice{font-size:38px}
</style>
</head>
<body>
<h1>🎲 Zain Ludo</h1>
<p>Roll the dice and play!</p>
<div class="board" id="board"></div>
<div id="dice">⚀</div>
<button onclick="rollDice()">Roll Dice</button>
<p id="message">Welcome to Zain Ludo!</p>
<script>
const board=document.getElementById('board');
for(let r=0;r<15;r++){
 for(let c=0;c<15;c++){
  let d=document.createElement('div');
  d.className='cell';
  if(r<6&&c<6)d.classList.add('red');
  else if(r<6&&c>8)d.classList.add('green');
  else if(r>8&&c<6)d.classList.add('blue');
  else if(r>8&&c>8)d.classList.add('yellow');
  else if((r===7&&c>=1&&c<=5)||(c===7&&r>=1&&r<=5))d.style.background='#e53935';
  else if((r===7&&c>=9&&c<=13)||(c===7&&r>=1&&r<=5))d.style.background='#43a047';
  else if((r===7&&c>=9&&c<=13)||(c===7&&r>=9&&r<=13))d.style.background='#fdd835';
  else if((r===7&&c>=1&&c<=5)||(c===7&&r>=9&&r<=13))d.style.background='#1e88e5';
  if(r===7&&c===7)d.textContent='★';
  board.appendChild(d);
 }
}
function rollDice(){
 let n=Math.floor(Math.random()*6)+1;
 document.getElementById('dice').textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][n];
 document.getElementById('message').textContent='You rolled '+n+'!';
}
</script>
</body>
</html>
