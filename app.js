import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x02040a);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.05,100);
camera.position.set(0,1.65,5.4);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.xr.enabled=true; renderer.xr.setReferenceSpaceType("local-floor"); document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xbde8ff,0x080b18,2.0));
const light=new THREE.PointLight(0x57cfff,18,18); light.position.set(0,4,-2); scene.add(light);
const warm=new THREE.PointLight(0xffa95b,10,12); warm.position.set(5,2,1); scene.add(warm);

function mat(c,em=0,rough=.55,metal=.15){return new THREE.MeshStandardMaterial({color:c,emissive:em,emissiveIntensity:em?1:.0,roughness:rough,metalness:metal})}
function box(w,h,d,c,em=0){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,em))}
function textSprite(t,scale=.2){const c=document.createElement("canvas"),x=c.getContext("2d");c.width=1024;c.height=256;x.font="700 92px Arial";x.textAlign="center";x.textBaseline="middle";x.fillStyle="#ffffff";x.fillText(t,512,128);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true}));s.scale.set(scale*4,scale,1);return s}
function glowStrip(w,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.025,.025),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85}));return m}

const room=new THREE.Group();scene.add(room);

// Mansion shell
const floor=box(14,.18,16,0x111827);floor.position.y=-.1;room.add(floor);
const rug=new THREE.Mesh(new THREE.BoxGeometry(9,.025,7),mat(0x101c31,0x183e62,.9,.05));rug.position.set(0,.01,-2);room.add(rug);
for(const [x,z,w,d] of [[-6,-2,.3,16],[6,-2,.3,16],[0,-9,12,.3]]){const wall=box(w,5,d,0x08101c);wall.position.set(x,2.5,z);room.add(wall)}
// ceiling beams
for(let x=-5;x<=5;x+=2.5){const b=box(.09,.12,15,0x4e8ca8);b.position.set(x,4.85,-1);room.add(b)}
// windows / neon skyline
for(const x of [-4.5,-1.5,1.5,4.5]){const win=box(1.7,2.7,.06,0x102f46,0x153f66);win.position.set(x,2.25,-8.82);room.add(win)}
// center rug path
const path=box(2.3,.035,7,0x16253a);path.position.set(0,.03,1);room.add(path);

// Smart wall display
const display=new THREE.Group();display.position.set(0,2.5,-8.65);room.add(display);
const frame=box(5.2,2.55,.22,0x182738,0x1c9bd0);display.add(frame);
const screen=box(4.75,2.1,.04,0x061521,0x0c72a4);screen.position.z=.14;display.add(screen);
const st=textSprite("NOVOS // HOME",.27);st.position.set(0,.48,.18);display.add(st);
const sub=textSprite("ROOM • APPS • FILES • AI • SYSTEM",.11);sub.position.set(0,.08,.18);display.add(sub);
const clock=textSprite("READY",.18);clock.position.set(0,-.43,.18);display.add(clock);
display.userData.interactive="display";

// App shelf
const shelf=new THREE.Group();shelf.position.set(-4.9,0,-2.0);room.add(shelf);
const wood=mat(0x182433,0x0b2134,.38,.35);
for(let y of [1.0,2.05,3.1]){const plank=box(3.1,.14,.65,0x1c2b3b,0x164b67);plank.position.set(0,y,0);shelf.add(plank)}
const sides=box(.16,3.2,.65,0x172534);sides.position.set(-1.47,1.65,0);shelf.add(sides);const side2=sides.clone();side2.position.x=1.47;shelf.add(side2);
const shelfTitle=textSprite("NOVOS APPS",.17);shelfTitle.position.set(0,3.75,0);shelf.add(shelfTitle);

const apps=[
 ["Files","▣",0x3ca8ff,1.0],["Browser","◎",0x41ddff,1.0],["NOVOS AI","✦",0xa978ff,1.0],
 ["App Store","◆",0xffb84d,2.05],["Settings","⚙",0x8b9bb2,2.05],["Camera","◉",0xff6e91,3.1]
];
const interact=[];
for(let i=0;i<apps.length;i++){const [name,icon,color,y]=apps[i];const x=i%3-1;
 const book=new THREE.Group();book.position.set(x*.9,y+.42,.0);book.rotation.y=(x*.08);
 const cover=box(.65,.75,.22,color,color);cover.position.z=.05;book.add(cover);
 const ic=textSprite(icon,.16);ic.position.set(0,.02,.18);book.add(ic);
 const lab=textSprite(name,.08);lab.position.set(0,-.52,.16);book.add(lab);
 book.userData={type:"app",name};shelf.add(book);interact.push(book);
}

// Coffee table + movable "memory" objects
const table=box(3,.25,1.7,0x263342,0x163d50,.3,.45);table.position.set(2.9,.85,-.2);room.add(table);
for(let i=0;i<3;i++){const o=box(.42,.15,.7,[0x42c9ff,0xa77aff,0xffa74a][i],[0x124d68,0x3c2360,0x663c18][i]);o.position.set(2+i*.65,1.05,-.2);o.userData={type:"object",name:["Saved App","Project","Note"][i]};room.add(o);interact.push(o)}

// plants
function plant(x,z){const pot=new THREE.Mesh(new THREE.CylinderGeometry(.28,.35,.5,20),mat(0x26303a));pot.position.set(x,.25,z);room.add(pot);for(let i=0;i<5;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8),mat(0x1c8a62,0x082d20));leaf.scale.set(.7,1.8,.5);leaf.position.set(x+(i-2)*.13,.72,z);room.add(leaf)}}plant(-5.2,4);plant(5.1,4);

// local persistence: furniture/app usage/preferences
const state=JSON.parse(localStorage.getItem("novos-xr-state")||'{"uses":{},"objects":{}}');
function save(){localStorage.setItem("novos-xr-state",JSON.stringify(state))}
function toast(s){const e=document.querySelector("#toast");e.textContent=s;e.style.display="block";clearTimeout(window.tt);window.tt=setTimeout(()=>e.style.display="none",2600)}
function openApp(name){state.uses[name]=(state.uses[name]||0)+1;save();toast(name+" opened • usage saved on this device");}
for(const o of interact)o.addEventListener("click",()=>openApp(o.userData.name));

// Desktop interaction
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=false,lastX=0,lastY=0;
addEventListener("pointerdown",e=>{down=true;lastX=e.clientX;lastY=e.clientY});
addEventListener("pointerup",()=>down=false);
addEventListener("pointermove",e=>{if(!down||renderer.xr.isPresenting)return;room.rotation.y+=(e.clientX-lastX)*.003;camera.rotation.x=Math.max(-.7,Math.min(.7,camera.rotation.x+(e.clientY-lastY)*.002));lastX=e.clientX;lastY=e.clientY});
addEventListener("click",e=>{if(renderer.xr.isPresenting)return;mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const h=ray.intersectObjects(interact,true);if(h.length){let o=h[0].object;while(o&&!o.userData.type)o=o.parent;if(o?.userData.type==="app")openApp(o.userData.name)}});

// XR controllers and hands
function controller(c){scene.add(c);c.addEventListener("selectstart",()=>xrSelect(c));c.addEventListener("squeezestart",()=>xrGrab(c))}
const c0=renderer.xr.getController(0),c1=renderer.xr.getController(1);controller(c0);controller(c1);
function xrRay(input){const m=new THREE.Matrix4().identity().extractRotation(input.matrixWorld);ray.ray.origin.setFromMatrixPosition(input.matrixWorld);ray.ray.direction.set(0,0,-1).applyMatrix4(m)}
function xrSelect(input){xrRay(input);const h=ray.intersectObjects(interact,true);if(h.length){let o=h[0].object;while(o&&!o.userData.type)o=o.parent;if(o?.userData.type==="app")openApp(o.userData.name)}}
function xrGrab(input){xrSelect(input)}

document.querySelector("#xr").onclick=async()=>{
 if(!navigator.xr){toast("This browser does not provide WebXR.");return}
 try{
  const supported=await navigator.xr.isSessionSupported("immersive-ar"); if(!supported){toast("Passthrough XR is not available here.");return}
  const s=await navigator.xr.requestSession("immersive-ar",{requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking","plane-detection","anchors","dom-overlay"],domOverlay:{root:document.body}});
  renderer.xr.setSession(s); document.querySelector("#mode").textContent="PASSTHROUGH • SPATIAL HOME";document.querySelector("#xr").style.display="none";
  s.addEventListener("end",()=>{document.querySelector("#xr").style.display="block";document.querySelector("#mode").textContent="DESKTOP PREVIEW"});
 }catch(e){toast("Could not start XR: "+e.message)}
};

let keys={};addEventListener("keydown",e=>keys[e.key.toLowerCase()]=1);addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
function move(){if(renderer.xr.isPresenting)return;const v=new THREE.Vector3();if(keys.w)v.z-=.08;if(keys.s)v.z+=.08;if(keys.a)v.x-=.08;if(keys.d)v.x+=.08;camera.translateX(v.x);camera.translateZ(v.z)}
renderer.setAnimationLoop(()=>{move();renderer.render(scene,camera)});
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
document.querySelector("#boot").remove();
