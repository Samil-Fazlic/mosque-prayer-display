import { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* CONFIG */
const C = {
  name: "Džemat Tevhid",
  sub: "Islamska zajednica Bošnjaka u Njemačkoj · Medžlis IZ Bayern",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
  iqama: { Fajr:30, Dhuhr:15, Asr:15, Maghrib:7, Isha:15 },
  jumuah: "13:30", khutba: "13:00",
};

/* HIJRI */
function toH(d){const gd=d.getDate(),gm=d.getMonth()+1,gy=d.getFullYear();let jd=Math.floor((1461*(gy+4800+Math.floor((gm-14)/12)))/4)+Math.floor((367*(gm-2-12*Math.floor((gm-14)/12)))/12)-Math.floor((3*Math.floor((gy+4900+Math.floor((gm-14)/12))/100))/4)+gd-32075;const l=jd-1948440+10632,n=Math.floor((l-1)/10631),lp=l-10631*n+354,j=Math.floor((10985-lp)/5316)*Math.floor((50*lp)/17719)+Math.floor(lp/5670)*Math.floor((43*lp)/15238),lpp=lp-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29,hm=Math.floor((24*lpp)/709),hd=lpp-Math.floor((709*hm)/24),hy=30*n+j-30;const nm=["Muharrem","Safer","Rebi'u-l-evvel","Rebi'u-l-ahir","Džumade-l-ula","Džumade-l-ahira","Redžeb","Ša'ban","Ramazan","Ševval","Zu-l-ka'de","Zu-l-hidždže"];return{d:hd,mn:nm[hm-1]||"",y:hy};}

/* LOCAL FALLBACK */
function loc(date,lat,lng){const D=Math.PI/180,R=180/Math.PI,s=d=>Math.sin(d*D),c=d=>Math.cos(d*D),t=d=>Math.tan(d*D);const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();const ay=m<=2?y-1:y,am=m<=2?m+12:m,A=Math.floor(ay/100),B=2-A+Math.floor(A/4);const jd=Math.floor(365.25*(ay+4716))+Math.floor(30.6001*(am+1))+d+B-1524.5,DD=jd-2451545,g=(357.529+.98560028*DD)%360,q=(280.459+.98564736*DD)%360,L=(q+1.915*s(g)+.02*s(2*g))%360,e=23.439-.00000036*DD,RA=Math.atan2(c(e)*s(L),c(L))*R/15,decl=Math.asin(s(e)*s(L))*R;let EqT=q/15-((RA+360)%24);if(EqT>12)EqT-=24;const tz=new Date().getTimezoneOffset()/-60,dh=12+tz-lng/15-EqT;const ha=a=>{const v=(s(a)-s(lat)*s(decl))/(c(lat)*c(decl));return v>1||v<-1?NaN:Math.acos(v)*R/15;};const f=h=>{if(isNaN(h))return"--:--";let hr=Math.floor(h),mn=Math.round((h-hr)*60);if(mn>=60){hr++;mn=0;}if(hr>=24)hr-=24;return`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};return{Fajr:f(dh-ha(-18)),Sunrise:f(dh-ha(-.833)),Dhuhr:f(dh),Asr:f(dh+ha(R*Math.atan(1/(1+t(Math.abs(lat-decl)))))),Maghrib:f(dh+ha(-.833)),Isha:f(dh+ha(-17))};}

const cl=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toM=t=>{if(!t||t==="--:--")return 0;const[h,m]=cl(t).split(":").map(Number);return h*60+m;};
const addM=(t,m)=>{if(!t||t==="--:--")return"--:--";const[h,mn]=cl(t).split(":").map(Number);const tot=h*60+mn+m;return`${String(Math.floor(tot/60)%24).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

const MO=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DB=["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"];

/* ═══════════════════════════════════════════════════════════════ */
export default function App(){
  const[now,setNow]=useState(new Date());
  const[times,setTimes]=useState(null);
  const ld=useRef("");
  const canvasRef=useRef(null);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);

  // Particle system
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let w=canvas.width=window.innerWidth;
    let h=canvas.height=window.innerHeight;
    let raf;

    const particles=Array.from({length:60},()=>({
      x:Math.random()*w,y:Math.random()*h,
      vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.15,
      r:Math.random()*1.5+.5,
      o:Math.random()*.15+.03,
      pulse:Math.random()*Math.PI*2,
    }));

    const draw=()=>{
      ctx.clearRect(0,0,w,h);
      const t=Date.now()*.001;
      particles.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0)p.x=w;if(p.x>w)p.x=0;
        if(p.y<0)p.y=h;if(p.y>h)p.y=0;
        const o=p.o*(0.6+0.4*Math.sin(t+p.pulse));
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(180,220,200,${o})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=particles[i].x-particles[j].x;
          const dy=particles[i].y-particles[j].y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<150){
            ctx.beginPath();
            ctx.moveTo(particles[i].x,particles[i].y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=`rgba(100,200,160,${0.02*(1-dist/150)})`;
            ctx.lineWidth=.5;
            ctx.stroke();
          }
        }
      }
      raf=requestAnimationFrame(draw);
    };
    draw();

    const resize=()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;};
    window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);

  // Fetch times
  useEffect(()=>{
    const k=`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if(k===ld.current&&times)return;
    (async()=>{try{
      const dd=String(now.getDate()).padStart(2,"0"),mm=String(now.getMonth()+1).padStart(2,"0");
      const r=await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${now.getFullYear()}?latitude=${C.lat}&longitude=${C.lng}&method=${C.method}&methodSettings=${C.methodSettings}&school=${C.school}`);
      const d=await r.json();
      if(d.code===200){const t=d.data.timings;setTimes({Fajr:t.Fajr,Sunrise:t.Sunrise,Dhuhr:t.Dhuhr,Asr:t.Asr,Maghrib:t.Maghrib,Isha:t.Isha});ld.current=k;}
      else throw 0;
    }catch{setTimes(loc(now,C.lat,C.lng));ld.current=k;}})();
  },[now.getDate()]);

  const hij=useMemo(()=>toH(now),[now.getDate()]);
  const nM=now.getHours()*60+now.getMinutes();

  const nxt=useMemo(()=>{
    if(!times)return{n:"",cd:"--:--:--",pct:0};
    const s=[{k:"Fajr",n:"Sabah"},{k:"Sunrise",n:"Izlazak sunca"},{k:"Dhuhr",n:"Podne"},{k:"Asr",n:"Ikindija"},{k:"Maghrib",n:"Akšam"},{k:"Isha",n:"Jacija"}];
    let prevM=0;
    for(let i=0;i<s.length;i++){
      const m=toM(times[s[i].k]);
      if(m>nM){
        const d=m-nM,ts=d*60-now.getSeconds();
        const h=Math.floor(ts/3600),mn=Math.floor((ts%3600)/60),sc=ts%60;
        prevM=i>0?toM(times[s[i-1].k]):0;
        const span=m-prevM||1;
        return{n:s[i].n,cd:`${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(Math.max(0,sc)).padStart(2,"0")}`,pct:Math.min(100,((nM-prevM)/span)*100)};
      }
    }
    return{n:"Sabah",cd:"--:--:--",pct:100};
  },[now,times]);

  const act=useMemo(()=>{if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nM<toM(times[k]))break;a=k;}return a;},[now,times]);

  const hh=String(now.getHours()).padStart(2,"0");
  const mi=String(now.getMinutes()).padStart(2,"0");
  const ss=String(now.getSeconds()).padStart(2,"0");

  const prayers=times?[
    {k:"Fajr",bs:"Sabah",t:cl(times.Fajr),iq:addM(cl(times.Fajr),C.iqama.Fajr)},
    {k:"Dhuhr",bs:"Podne",t:cl(times.Dhuhr),iq:addM(cl(times.Dhuhr),C.iqama.Dhuhr)},
    {k:"Asr",bs:"Ikindija",t:cl(times.Asr),iq:addM(cl(times.Asr),C.iqama.Asr)},
    {k:"Maghrib",bs:"Akšam",t:cl(times.Maghrib),iq:addM(cl(times.Maghrib),C.iqama.Maghrib)},
    {k:"Isha",bs:"Jacija",t:cl(times.Isha),iq:addM(cl(times.Isha),C.iqama.Isha)},
  ]:[];

  // Arc for countdown
  const arcRadius=54;
  const arcCirc=2*Math.PI*arcRadius;
  const arcOffset=arcCirc-(nxt.pct/100)*arcCirc;

  return(
    <div style={{width:"100%",height:"100vh",overflow:"hidden",position:"relative",background:"#060a0f",fontFamily:"'Outfit',sans-serif",color:"#fff"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes breathe{0%,100%{opacity:.4}50%{opacity:.7}}
        @keyframes colonPulse{0%,100%{opacity:.7}50%{opacity:.15}}
        @keyframes countGrad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes ringPulse{0%,100%{filter:drop-shadow(0 0 4px rgba(52,211,153,.2))}50%{filter:drop-shadow(0 0 12px rgba(52,211,153,.5))}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotGlow{0%,100%{box-shadow:0 0 4px rgba(52,211,153,.3)}50%{box-shadow:0 0 14px rgba(52,211,153,.7)}}
      `}</style>

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,zIndex:1}}/>

      {/* Atmospheric light */}
      <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
        background:"radial-gradient(ellipse 60% 50% at 25% 30%, rgba(52,211,153,.04), transparent),radial-gradient(ellipse 50% 40% at 75% 70%, rgba(100,130,255,.03), transparent)"
      }}/>

      {/* Content */}
      <div style={{position:"relative",zIndex:3,height:"100%",display:"flex",flexDirection:"column",padding:"32px 56px 20px"}}>

        {/* ═══ TOP BAR ═══ */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:0,animation:"slideIn .8s ease both"}}>
          <div>
            <div style={{fontSize:9,fontWeight:500,letterSpacing:".35em",color:"rgba(255,255,255,.2)",textTransform:"uppercase"}}>{C.sub}</div>
            <div style={{fontSize:32,fontWeight:200,letterSpacing:".04em",marginTop:4,color:"rgba(255,255,255,.9)"}}>{C.name}</div>
          </div>
          <div style={{textAlign:"right",marginTop:4}}>
            <div style={{fontSize:12,fontWeight:300,color:"rgba(255,255,255,.25)"}}>{DB[now.getDay()]}, {now.getDate()}. {MO[now.getMonth()]} {now.getFullYear()}</div>
            <div style={{fontSize:14,fontWeight:400,color:"rgba(52,211,153,.5)",marginTop:4}}>{hij.d}. {hij.mn} {hij.y}.</div>
          </div>
        </div>

        {/* Thin line */}
        <div style={{height:1,background:"linear-gradient(90deg,rgba(52,211,153,.15),rgba(255,255,255,.03) 50%,transparent)",margin:"16px 0 0"}}/>

        {/* ═══ HERO SECTION ═══ */}
        <div style={{flex:1,display:"flex",alignItems:"center",gap:0}}>

          {/* LEFT — THE CLOCK */}
          <div style={{flex:"0 0 45%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"slideIn 1s ease both",animationDelay:".2s"}}>

            {/* Massive clock */}
            <div style={{fontFamily:"'JetBrains Mono',monospace",lineHeight:.82,textAlign:"center",position:"relative"}}>
              <div style={{fontSize:160,fontWeight:100,letterSpacing:"-0.08em",color:"rgba(255,255,255,.92)"}}>
                {hh}
                <span style={{animation:"colonPulse 2s ease-in-out infinite",color:"rgba(52,211,153,.35)",margin:"0 -8px",fontSize:120,fontWeight:100}}>:</span>
                {mi}
              </div>
              <div style={{fontSize:32,fontWeight:100,color:"rgba(255,255,255,.08)",letterSpacing:".15em",marginTop:-8}}>{ss}</div>
            </div>

            {/* Countdown ring */}
            <div style={{position:"relative",marginTop:36,width:130,height:130,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="130" height="130" style={{position:"absolute",transform:"rotate(-90deg)",animation:"ringPulse 4s ease-in-out infinite"}}>
                <circle cx="65" cy="65" r={arcRadius} fill="none" stroke="rgba(255,255,255,.03)" strokeWidth="2"/>
                <circle cx="65" cy="65" r={arcRadius} fill="none" stroke="rgba(52,211,153,.4)" strokeWidth="2"
                  strokeDasharray={arcCirc} strokeDashoffset={arcOffset}
                  strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
              </svg>
              <div style={{textAlign:"center",position:"relative",zIndex:1}}>
                <div style={{fontSize:8,fontWeight:600,letterSpacing:".3em",color:"rgba(255,255,255,.15)",textTransform:"uppercase"}}>{nxt.n}</div>
                <div style={{
                  fontSize:24,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",marginTop:4,
                  background:"linear-gradient(135deg,#34d399,#6ee7b7,#34d399)",backgroundSize:"200% 200%",
                  animation:"countGrad 4s ease infinite",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
                }}>{nxt.cd}</div>
              </div>
            </div>

            {/* Jumuah — minimal */}
            <div style={{marginTop:32,display:"flex",gap:28,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:8,fontWeight:500,letterSpacing:".25em",color:"rgba(255,255,255,.1)",textTransform:"uppercase"}}>Hutba</div>
                <div style={{fontSize:22,fontWeight:100,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,255,255,.3)",marginTop:4}}>{C.khutba}</div>
              </div>
              <div style={{width:1,height:28,background:"rgba(255,255,255,.04)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:8,fontWeight:500,letterSpacing:".25em",color:"rgba(255,255,255,.1)",textTransform:"uppercase"}}>Džuma</div>
                <div style={{fontSize:22,fontWeight:400,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,255,255,.6)",marginTop:4}}>{C.jumuah}</div>
              </div>
            </div>
          </div>

          {/* RIGHT — PRAYER TIMES */}
          <div style={{flex:1,paddingLeft:40,display:"flex",flexDirection:"column",justifyContent:"center",gap:0,animation:"slideIn 1s ease both",animationDelay:".4s"}}>

            {prayers.map((p,i)=>{
              const isA=act===p.k;
              return(
                <div key={p.k} style={{
                  display:"flex",alignItems:"center",
                  padding:"22px 0",
                  borderBottom:i<prayers.length-1?"1px solid rgba(255,255,255,.025)":"none",
                  position:"relative",
                  animation:"slideIn .7s ease both",animationDelay:`${.5+i*.1}s`,
                }}>
                  {/* Active indicator */}
                  {isA && <div style={{
                    position:"absolute",left:-20,
                    width:6,height:6,borderRadius:"50%",
                    background:"#34d399",
                    animation:"dotGlow 2s ease-in-out infinite",
                  }}/>}

                  {/* Name */}
                  <div style={{width:140}}>
                    <div style={{
                      fontSize:isA?21:18,fontWeight:isA?500:200,
                      color:isA?"rgba(52,211,153,.9)":"rgba(255,255,255,.35)",
                      transition:"all .6s cubic-bezier(.4,0,.2,1)",
                      letterSpacing:".02em",
                    }}>{p.bs}</div>
                  </div>

                  {/* Adhan time */}
                  <div style={{flex:1}}>
                    <span style={{
                      fontSize:isA?52:44,fontWeight:isA?600:200,
                      fontFamily:"'JetBrains Mono',monospace",
                      color:isA?"rgba(255,255,255,.95)":"rgba(255,255,255,.55)",
                      letterSpacing:"-0.04em",
                      transition:"all .6s cubic-bezier(.4,0,.2,1)",
                    }}>{p.t}</span>
                  </div>

                  {/* Iqama */}
                  <div style={{width:100,textAlign:"right"}}>
                    <div style={{fontSize:8,fontWeight:500,letterSpacing:".2em",color:"rgba(255,255,255,.08)",textTransform:"uppercase",marginBottom:2}}>Ikamet</div>
                    <span style={{
                      fontSize:18,fontWeight:200,
                      fontFamily:"'JetBrains Mono',monospace",
                      color:isA?"rgba(52,211,153,.5)":"rgba(255,255,255,.12)",
                      transition:"all .6s ease",
                    }}>{p.iq}</span>
                  </div>
                </div>
              );
            })}

            {/* Sunrise — separate, minimal */}
            {times && (
              <div style={{marginTop:8,paddingTop:12,display:"flex",alignItems:"center",gap:12,animation:"slideIn .7s ease both",animationDelay:"1.1s"}}>
                <div style={{fontSize:10,fontWeight:300,color:"rgba(255,255,255,.12)",letterSpacing:".1em"}}>Izlazak sunca</div>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,.02)"}}/>
                <div style={{fontSize:16,fontWeight:200,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,255,255,.15)"}}>{cl(times.Sunrise)}</div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8}}>
          <div style={{fontSize:10,fontWeight:200,color:"rgba(255,255,255,.1)"}}>Powered by Samil Fazlic</div>
          <div style={{display:"flex",gap:24}}>
            <span style={{fontSize:9,fontWeight:300,color:"rgba(255,255,255,.08)",letterSpacing:".1em"}}>api.aladhan.com</span>
            <span style={{fontSize:9,fontWeight:300,color:"rgba(255,255,255,.08)",letterSpacing:".1em"}}>MWL 18° / 17°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
