const TULIP_SRC='tulip_atlas.webp';
const GRASS_SRC='grass_night.webp';
const PLAYER_HEART_SRC='player_heart.png';
const PIXEL_FRAME_SRC='pixel_frame.png';

const playerHeartImg=new Image();
playerHeartImg.src=PLAYER_HEART_SRC;

const canvas=document.getElementById('scene');
const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
const app=document.getElementById('app');
const fill=document.getElementById('loadFill');
const loader=document.getElementById('loader');
const fsBtn=document.getElementById('fsBtn');
const tip=document.getElementById('tip');

const intro=document.getElementById('intro');
const introEnvelope=document.getElementById('introEnvelope');
const introContinue=document.getElementById('introContinue');
const bloomTransition=document.getElementById('bloomTransition');
const secretLetterBtn=document.getElementById('secretLetterBtn');
const gameOverlay=document.getElementById('gameOverlay');
const gameCanvas=document.getElementById('gameCanvas');
const gctx=gameCanvas.getContext('2d');
const challengePanel=document.getElementById('challengePanel');
const startGameBtn=document.getElementById('startGameBtn');
const closeChallengeBtn=document.getElementById('closeChallengeBtn');
const gameHud=document.getElementById('gameHud');
const phaseText=document.getElementById('phaseText');
const livesCover=document.getElementById('livesCover');
const timeText=document.getElementById('timeText');
const losePanel=document.getElementById('losePanel');
const retryGameBtn=document.getElementById('retryGameBtn');
const leaveGameBtn=document.getElementById('leaveGameBtn');
const finalLetter=document.getElementById('finalLetter');
const playAgainBtn=document.getElementById('playAgainBtn');
const backToFieldBtn=document.getElementById('backToFieldBtn');
const bgMusic=document.getElementById('bgMusic');
const musicBtn=document.getElementById('musicBtn');


let W=1,H=1,DPR=1;
let worldX=0,drag=false,startX=0,startWorld=0,lastX=0,lastT=0,velocity=0;
let rows=[],skyCanvas,groundGlow,flowerFrames=[],plainFrames=[],currentFrame=0;
let raf=0,inertiaRAF=0;

let introDone=false;
let secretShown=false;
let musicOn=false;

let gameRunning=false;
let gameRAF=0;
let gameStart=0;
let gameLast=0;
let gameSpawn=0;
let gameHP=3;
let gameInvulnUntil=0;
let gameProjectiles=[];
let gamePointer=false;
let gameDPR=1;
let gameW=1,gameH=1;
let arena={x:0,y:0,w:0,h:0};
let heart={x:0,y:0,r:10,speed:260};
const keys={};
const GAME_DURATION=24;


const mem=navigator.deviceMemory||4;
const cores=navigator.hardwareConcurrency||4;
const VERY_LOW=(mem<=2)||(cores<=2);
const MEDIUM=(mem<=4)||(cores<=4);

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function mod(n,m){return((n%m)+m)%m}
function hash(n){const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function showTip(text){tip.textContent=text;tip.classList.add('show');setTimeout(()=>tip.classList.remove('show'),2200)}
function loadImg(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src})}
