import { useState, useEffect, useMemo, useRef } from "react";

/* CONFIG */
const C = {
  line1: "ISLAMSKA ZAJEDNICA BOŠNJAKA U NJEMAČKOJ",
  line2: "MEDŽLIS ISLAMSKE ZAJEDNICE BAYERN",
  line3: "Džemat Tevhid",
  welcome1: "Islamska zajednica Bošnjaka u Njemačkoj",
  welcome2: "Dobrodošli u džemat Tevhid",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
};

function toH(d){const gd=d.getDate(),gm=d.getMonth()+1,gy=d.getFullYear();let jd=Math.floor((1461*(gy+4800+Math.floor((gm-14)/12)))/4)+Math.floor((367*(gm-2-12*Math.floor((gm-14)/12)))/12)-Math.floor((3*Math.floor((gy+4900+Math.floor((gm-14)/12))/100))/4)+gd-32075;const l=jd-1948440+10632,n=Math.floor((l-1)/10631),lp=l-10631*n+354,j=Math.floor((10985-lp)/5316)*Math.floor((50*lp)/17719)+Math.floor(lp/5670)*Math.floor((43*lp)/15238),lpp=lp-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29,hm=Math.floor((24*lpp)/709),hd=lpp-Math.floor((709*hm)/24),hy=30*n+j-30;const nm=["Muharrem","Safer","Rebi'u-l-evvel","Rebi'u-l-ahir","Džumade-l-ula","Džumade-l-ahira","Redžeb","Ša'ban","Ramazan","Ševval","Zu-l-ka'de","Zu-l-hidždže"];return{d:hd,mn:nm[hm-1]||"",y:hy};}

function loc(date,lat,lng){const D=Math.PI/180,R=180/Math.PI,s=d=>Math.sin(d*D),c=d=>Math.cos(d*D),t=d=>Math.tan(d*D);const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();const ay=m<=2?y-1:y,am=m<=2?m+12:m,A=Math.floor(ay/100),B=2-A+Math.floor(A/4);const jd=Math.floor(365.25*(ay+4716))+Math.floor(30.6001*(am+1))+d+B-1524.5,DD=jd-2451545,g=(357.529+.98560028*DD)%360,q=(280.459+.98564736*DD)%360,L=(q+1.915*s(g)+.02*s(2*g))%360,e=23.439-.00000036*DD,RA=Math.atan2(c(e)*s(L),c(L))*R/15,decl=Math.asin(s(e)*s(L))*R;let EqT=q/15-((RA+360)%24);if(EqT>12)EqT-=24;const tz=new Date().getTimezoneOffset()/-60,dh=12+tz-lng/15-EqT;const ha=a=>{const v=(s(a)-s(lat)*s(decl))/(c(lat)*c(decl));return v>1||v<-1?NaN:Math.acos(v)*R/15;};const f=h=>{if(isNaN(h))return"--:--";let hr=Math.floor(h),mn=Math.round((h-hr)*60);if(mn>=60){hr++;mn=0;}if(hr>=24)hr-=24;return`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};return{Fajr:f(dh-ha(-18)),Sunrise:f(dh-ha(-.833)),Dhuhr:f(dh),Asr:f(dh+ha(R*Math.atan(1/(1+t(Math.abs(lat-decl)))))),Maghrib:f(dh+ha(-.833)),Isha:f(dh+ha(-17))};}

const cl=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toM=t=>{if(!t||t==="--:--")return 0;const[h,m]=cl(t).split(":").map(Number);return h*60+m;};
const MO=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DA=["N","P","U","S","Č","P","S"];

export default function App(){
  const[now,setNow]=useState(new Date());
  const[times,setTimes]=useState(null);
  const ld=useRef("");
  const canvasRef=useRef(null);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);

  // Particles
  useEffect(()=>{
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext("2d");
    let w=cv.width=window.innerWidth,h=cv.height=window.innerHeight,raf;
    const pts=Array.from({length:50},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:Math.random()*1.2+.4,o:Math.random()*.12+.02,p:Math.random()*6.28}));
    const draw=()=>{
      ctx.clearRect(0,0,w,h);const t=Date.now()*.001;
      pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);ctx.fillStyle=`rgba(160,210,180,${p.o*(.5+.5*Math.sin(t+p.p))})`;ctx.fill();});
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(120,200,160,${.015*(1-d/120)})`;ctx.lineWidth=.5;ctx.stroke();}}
      raf=requestAnimationFrame(draw);};
    draw();
    const rs=()=>{w=cv.width=innerWidth;h=cv.height=innerHeight;};
    window.addEventListener("resize",rs);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",rs);};
  },[]);

  useEffect(()=>{
    const k=`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if(k===ld.current&&times)return;
    (async()=>{try{const dd=String(now.getDate()).padStart(2,"0"),mm=String(now.getMonth()+1).padStart(2,"0");
      const r=await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${now.getFullYear()}?latitude=${C.lat}&longitude=${C.lng}&method=${C.method}&methodSettings=${C.methodSettings}&school=${C.school}`);
      const d=await r.json();if(d.code===200){const t=d.data.timings;setTimes({Fajr:t.Fajr,Sunrise:t.Sunrise,Dhuhr:t.Dhuhr,Asr:t.Asr,Maghrib:t.Maghrib,Isha:t.Isha});ld.current=k;}else throw 0;
    }catch{setTimes(loc(now,C.lat,C.lng));ld.current=k;}})();
  },[now.getDate()]);

  const hij=useMemo(()=>toH(now),[now.getDate()]);
  const nM=now.getHours()*60+now.getMinutes();
  const nxt=useMemo(()=>{
    if(!times)return{n:"...",cd:"--:--:--"};
    const s=[{k:"Fajr",n:"Sabah-namaz"},{k:"Sunrise",n:"Izlazak sunca"},{k:"Dhuhr",n:"Podne-namaz"},{k:"Asr",n:"Ikindija-namaz"},{k:"Maghrib",n:"Akšam-namaz"},{k:"Isha",n:"Jacija-namaz"}];
    for(const p of s){const m=toM(times[p.k]);if(m>nM){const d=m-nM,ts=d*60-now.getSeconds(),h=Math.floor(ts/3600),mn=Math.floor((ts%3600)/60),sc=ts%60;return{n:p.n,cd:`${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(Math.max(0,sc)).padStart(2,"0")}`};}}
    return{n:"Sabah-namaz",cd:"--:--:--"};
  },[now,times]);
  const act=useMemo(()=>{if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nM<toM(times[k]))break;a=k;}return a;},[now,times]);

  const hh=String(now.getHours()).padStart(2,"0");
  const mi=String(now.getMinutes()).padStart(2,"0");
  const ss=String(now.getSeconds()).padStart(2,"0");
  const dateStr=`${String(now.getDate()).padStart(2,"0")}. ${MO[now.getMonth()]} ${now.getFullYear()}.`;

  const prayers=times?[
    {k:"Fajr",bs:"Zora",ar:"إمساك",t:cl(times.Fajr)},
    {k:"Sunrise",bs:"Iz. sunca",ar:"الشروق",t:cl(times.Sunrise)},
    {k:"Dhuhr",bs:"Podne",ar:"الظهر",t:cl(times.Dhuhr)},
    {k:"Asr",bs:"Ikindija",ar:"العصر",t:cl(times.Asr)},
    {k:"Maghrib",bs:"Akšam",ar:"المغرب",t:cl(times.Maghrib)},
    {k:"Isha",bs:"Jacija",ar:"العشاء",t:cl(times.Isha)},
  ]:[];

  const G="rgba(52,211,153,";

  return(
    <div style={{width:"100%",height:"100vh",overflow:"hidden",position:"relative",fontFamily:"'Outfit',sans-serif",color:"#fff",background:"#070b11"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes colonB{0%,100%{opacity:.6}50%{opacity:.12}}
        @keyframes countG{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes dotPulse{0%,100%{box-shadow:0 0 6px ${G}.3)}50%{box-shadow:0 0 18px ${G}.7)}}
      `}</style>

      <canvas ref={canvasRef} style={{position:"absolute",inset:0,zIndex:1}}/>
      <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",background:`radial-gradient(ellipse 55% 45% at 25% 35%,${G}.035),transparent),radial-gradient(ellipse 45% 40% at 80% 70%,rgba(80,100,220,.025),transparent)`}}/>

      <div style={{position:"relative",zIndex:3,height:"100%",display:"flex",padding:"28px 40px 16px"}}>

        {/* ═══════ LEFT — 52% ═══════ */}
        <div style={{flex:"0 0 52%",display:"flex",flexDirection:"column",paddingRight:28,animation:"fadeUp .8s ease both"}}>

          {/* Header */}
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:24}}>
            <svg width="34" height="34" viewBox="0 0 50 50" style={{flexShrink:0,marginTop:2,opacity:.6}}>
              <circle cx="19" cy="24" r="13.5" fill="none" stroke={`${G}.5)`} strokeWidth="1.5"/>
              <circle cx="26" cy="24" r="12" fill="#070b11"/>
              <polygon points="39,10 40.8,14.5 45.5,14.5 41.8,17.5 43.2,22 39,19 34.8,22 36.2,17.5 32.5,14.5 37.2,14.5" fill={`${G}.4)`}/>
            </svg>
            <div>
              <div style={{fontSize:10.5,fontWeight:500,letterSpacing:".12em",color:"rgba(255,255,255,.25)"}}>{C.line1}</div>
              <div style={{fontSize:9.5,fontWeight:400,letterSpacing:".08em",color:"rgba(255,255,255,.15)",marginTop:2}}>{C.line2}</div>
              <div style={{fontSize:15,fontWeight:300,color:`${G}.55)`,fontStyle:"italic",marginTop:5}}>{C.line3}</div>
            </div>
          </div>

          {/* Clock — glass card */}
          <div style={{
            background:"rgba(255,255,255,.025)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
            border:"1px solid rgba(255,255,255,.04)",borderRadius:20,
            padding:"28px 0",textAlign:"center",marginBottom:20,
            boxShadow:"0 4px 40px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.03)",
          }}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>
              <span style={{fontSize:76,fontWeight:200,letterSpacing:"-0.05em",color:"rgba(255,255,255,.9)"}}>{hh}</span>
              <span style={{fontSize:76,fontWeight:200,color:`${G}.3)`,animation:"colonB 2s ease-in-out infinite",margin:"0 -2px"}}>:</span>
              <span style={{fontSize:76,fontWeight:200,letterSpacing:"-0.05em",color:"rgba(255,255,255,.9)"}}>{mi}</span>
              <span style={{fontSize:40,fontWeight:100,color:"rgba(255,255,255,.12)",marginLeft:4}}>{ss}</span>
            </div>
          </div>

          {/* Weekday pills */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:18}}>
            {DA.map((d,i)=>{
              const isT=i===now.getDay();
              return <div key={i} style={{
                width:36,height:36,borderRadius:"50%",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,fontWeight:isT?700:400,
                background:isT?`${G}.8)`:"transparent",
                color:isT?"#070b11":"rgba(255,255,255,.15)",
                border:isT?"none":"1px solid rgba(255,255,255,.04)",
                boxShadow:isT?`0 0 16px ${G}.3)`:undefined,
                transition:"all .5s ease",
              }}>{d}</div>;
            })}
          </div>

          {/* Date badges */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:24}}>
            <div style={{
              background:`${G}.12)`,border:`1px solid ${G}.15)`,borderRadius:12,
              padding:"9px 24px",fontSize:14,fontWeight:500,
              color:`${G}.8)`,letterSpacing:".01em",
            }}>{dateStr}</div>
            <div style={{
              background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.04)",borderRadius:12,
              padding:"9px 24px",fontSize:14,fontWeight:400,color:"rgba(255,255,255,.5)",
              textAlign:"center",lineHeight:1.3,
            }}>{hij.d}. {hij.mn}<br/>{hij.y}.</div>
          </div>

          {/* Countdown */}
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:12,fontWeight:400,color:"rgba(255,255,255,.2)",letterSpacing:".15em",textTransform:"uppercase"}}>{nxt.n}</div>
            <div style={{
              fontSize:54,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"-0.03em",marginTop:6,
              background:`linear-gradient(135deg,#34d399,#6ee7b7,#34d399)`,backgroundSize:"200% 200%",
              animation:"countG 3s ease infinite",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
            }}>{nxt.cd}</div>
          </div>

          {/* Welcome */}
          <div style={{
            marginTop:"auto",
            background:`linear-gradient(135deg,${G}.12),${G}.06))`,
            border:`1px solid ${G}.1)`,borderRadius:16,
            padding:"14px 24px",textAlign:"center",
            boxShadow:`0 2px 20px ${G}.05)`,
          }}>
            <div style={{fontSize:13,fontWeight:400,color:"rgba(255,255,255,.5)",lineHeight:1.7}}>
              {C.welcome1}<br/><span style={{color:`${G}.7)`,fontWeight:500}}>{C.welcome2}</span>
            </div>
          </div>
        </div>

        {/* ═══════ DIVIDER ═══════ */}
        <div style={{width:1,background:`linear-gradient(180deg,transparent,${G}.1),transparent)`,margin:"20px 12px",flexShrink:0}}/>

        {/* ═══════ RIGHT — 48% ═══════ */}
        <div style={{flex:1,display:"flex",flexDirection:"column",paddingLeft:16,animation:"fadeUp .8s ease both",animationDelay:".15s"}}>

          {/* Header */}
          <div style={{
            background:`linear-gradient(135deg,${G}.15),${G}.05))`,
            border:`1px solid ${G}.12)`,borderRadius:16,
            padding:"14px 32px",textAlign:"center",marginBottom:12,
            boxShadow:`0 2px 20px ${G}.06)`,
          }}>
            <div style={{fontSize:16,fontWeight:700,letterSpacing:".18em",color:`${G}.8)`}}>VRIJEME NAMAZA</div>
          </div>

          {/* Prayer rows */}
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:0}}>
            {prayers.map((p,i)=>{
              const isA=p.k!=="Sunrise"&&act===p.k;
              return(
                <div key={p.k} style={{
                  display:"flex",alignItems:"center",padding:"16px 8px",
                  borderBottom:i<prayers.length-1?`1px solid rgba(255,255,255,.02)`:"none",
                  position:"relative",
                  animation:"fadeUp .6s ease both",animationDelay:`${.3+i*.08}s`,
                }}>
                  {/* Active dot */}
                  {isA&&<div style={{position:"absolute",left:-8,width:5,height:5,borderRadius:"50%",background:"#34d399",animation:"dotPulse 2.5s ease-in-out infinite"}}/>}

                  {/* BS name */}
                  <div style={{width:100,fontSize:isA?17:15,fontWeight:isA?500:300,color:isA?`${G}.9)`:"rgba(255,255,255,.35)",transition:"all .5s ease"}}>{p.bs}</div>

                  {/* Time */}
                  <div style={{flex:1,textAlign:"center"}}>
                    <span style={{
                      fontSize:isA?46:40,fontWeight:isA?700:200,
                      fontFamily:"'JetBrains Mono',monospace",
                      color:isA?"rgba(255,255,255,.95)":"rgba(255,255,255,.6)",
                      letterSpacing:"-0.03em",transition:"all .5s ease",
                    }}>{p.t}</span>
                  </div>

                  {/* Arabic */}
                  <div style={{width:60,textAlign:"right",fontSize:18,fontFamily:"'Amiri',serif",color:isA?"rgba(255,255,255,.25)":"rgba(255,255,255,.08)",direction:"rtl",transition:"all .5s ease"}}>{p.ar}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{position:"absolute",bottom:10,left:0,right:0,zIndex:4,textAlign:"center",fontSize:9,fontWeight:300,color:"rgba(255,255,255,.08)",letterSpacing:".1em"}}>
        Powered by Samil Fazlic
      </div>
    </div>
  );
}
