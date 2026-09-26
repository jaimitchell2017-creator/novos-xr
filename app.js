import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { XRButton } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/webxr/XRButton.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03050b);
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, .05, 100);
camera.position.set(0,1.6,4.8);

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9ddcff,0x101522,1.8));
const key = new THREE.DirectionalLight(0xffffff,1.5); key.position.set(2,5,4); scene.add(key);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(6,64),
  new THREE.MeshStandardMaterial({color:0x07101d,metalness:.35,roughness:.8,transparent:true,opacity:.75})
);
floor.rotation.x=-Math.PI/2; floor.position.y=0; scene.add(floor);

const grid = new THREE.GridHelper(12,24,0x28658c,0x123046);
grid.position.y=.01; scene.add(grid);

const group = new THREE.Group(); scene.add(group);

function roundedPanel(w,h,color=0x0a1525){
  const g=new THREE.Group();
  const m=new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.55,transparent:true,opacity:.94});
  const s=new THREE.Mesh(new THREE.BoxGeometry(w,h,.08),m); g.add(s);
  const glow=new THREE.Mesh(new THREE.BoxGeometry(w+.035,h+.035,.025),new THREE.MeshBasicMaterial({color:0x3bbdff,transparent:true,opacity:.09}));
  glow.position.z=-.045; g.add(glow);
  return g;
}
function label(text,size=.18,color="#ffffff"){
  const c=document.createElement("canvas"),x=c.getContext("2d"); c.width=1024;c.height=256;
  x.clearRect(0,0,c.width,c.height);x.font="700 92px Arial";x.textAlign="center";x.textBaseline="middle";x.fillStyle=color;x.fillText(text,512,128);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.SpriteMaterial({map:t,transparent:true});
  const sp=new THREE.Sprite(mat); sp.scale.set(size*4,size,1); return sp;
}
function addApp(name,icon,x,z,color){
  const root=new THREE.Group(); root.position.set(x,1.45,z);
  const panel=roundedPanel(1.55,1.2,0x0b1728); root.add(panel);
  const glow=new THREE.Mesh(new THREE.BoxGeometry(.82,.82,.09),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.5,metalness:.1,roughness:.4}));
  glow.position.z=.06; root.add(glow);
  const iconText=label(icon,.22); iconText.position.z=.12; root.add(iconText);
  const title=label(name,.13); title.position.set(0,-.78,.1); root.add(title);
  root.userData.app=name; group.add(root); return root;
}
const apps=[
  addApp("Files","▣",-3.0,-1.3,0x38a8ff),
  addApp("Browser","◎",-1.0,-1.3,0x4ce1ff),
  addApp("NOVOS AI","✦",1.0,-1.3,0xa879ff),
  addApp("App Store","◆",3.0,-1.3,0xffb84c),
  addApp("Settings","⚙",-1.9,-3.15,0x7c8da6),
  addApp("Rooms","◈",0,-3.15,0x4ff0bb),
  addApp("Camera","◉",1.9,-3.15,0xff6d8d)
];

const title=label("NOVOS SPATIAL HOME",.28); title.position.set(0,3.15,-1.3); group.add(title);
const sub=label("Walk • point • grab • select",.12); sub.position.set(0,2.72,-1.3); group.add(sub);

const info=roundedPanel(6.2,1.0,0x081322); info.position.set(0,.75,-1.25); group.add(info);
const infot=label("Your apps are physical spaces you can reach and open.",.12); infot.position.set(0,.75,-1.21); group.add(infot);

const raycaster=new THREE.Raycaster();
const tempMatrix=new THREE.Matrix4();
const controllers=[];
const hands=[];
function setupController(c){
  c.addEventListener("selectstart",()=>{select(c)});
  c.addEventListener("squeezestart",()=>{grab(c)});
  c.addEventListener("squeezeend",()=>{});
  scene.add(c); controllers.push(c);
}
const c0=renderer.xr.getController(0), c1=renderer.xr.getController(1);
setupController(c0);setupController(c1);

function setupHand(h){
  h.addEventListener("pinchstart",()=>{select(h)});
  scene.add(h); hands.push(h);
}
try{setupHand(renderer.xr.getHand(0));setupHand(renderer.xr.getHand(1));}catch(e){}

function select(input){
  tempMatrix.identity().extractRotation(input.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(input.matrixWorld);
  raycaster.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);
  const hits=raycaster.intersectObjects(group.children,true);
  let app=null;
  for(const h of hits){let o=h.object;while(o && !o.userData.app)o=o.parent;if(o?.userData.app){app=o;break}}
  if(app) openApp(app.userData.app);
}
function grab(input){select(input)}

function openApp(name){
  const messages={
    "Files":"Files opened — your spatial file room is ready.",
    "Browser":"Browser opened. In the Quest web build, sites that permit embedding can appear here; a full unrestricted browser engine requires a native NOVOS build.",
    "NOVOS AI":"NOVOS AI opened.",
    "App Store":"App Store opened.",
    "Settings":"Settings opened.",
    "Rooms":"Rooms opened.",
    "Camera":"Camera opened."
  };
  toast(messages[name]||`${name} opened`);
}
function toast(s){const el=document.querySelector("#toast");el.textContent=s;el.style.display="block";clearTimeout(window._t);window._t=setTimeout(()=>el.style.display="none",3000)}

let keys={};
addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
let dragging=false,lastX=0,lastY=0;
addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY});
addEventListener("pointerup",()=>dragging=false);
addEventListener("pointermove",e=>{
 if(!dragging||renderer.xr.isPresenting)return;
 group.rotation.y+=(e.clientX-lastX)*.004;
 camera.rotation.x=Math.max(-.8,Math.min(.8,camera.rotation.x+(e.clientY-lastY)*.003));
 lastX=e.clientX;lastY=e.clientY;
});
function desktopMove(){
 if(renderer.xr.isPresenting)return;
 const v=new THREE.Vector3();
 if(keys.w)v.z-=.06;if(keys.s)v.z+=.06;if(keys.a)v.x-=.06;if(keys.d)v.x+=.06;
 camera.translateX(v.x);camera.translateZ(v.z);
}
function animate(){desktopMove();renderer.render(scene,camera)}
renderer.setAnimationLoop(animate);

const enter=document.querySelector("#enterXR");
const status=document.querySelector("#status");
if("xr" in navigator){
  enter.addEventListener("click",async()=>{
    try{
      const session=await navigator.xr.requestSession("immersive-ar",{
        requiredFeatures:["local-floor"],
        optionalFeatures:["hand-tracking","bounded-floor","dom-overlay"],
        domOverlay:{root:document.body}
      });
      renderer.xr.setSession(session);
      status.textContent="XR active";
      document.querySelector("#hint").textContent="Point with a controller or pinch with a supported hand; trigger/select an app.";
      enter.style.display="none";
      session.addEventListener("end",()=>{enter.style.display="block";status.textContent="XR ended"});
    }catch(e){toast("XR could not start: "+e.message)}
  });
}else{
  enter.textContent="XR NOT AVAILABLE";
  enter.disabled=true;
}
document.querySelector("#loading").remove();
document.querySelector("#hud").classList.remove("hidden");
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
