import { useState, useEffect, useMemo, useRef } from "react";

// ============================================================
// CONFIG — Islamische Gemeinschaft Tevhid e.V.
// ============================================================
const MOSQUE = {
  name: "Islamische Gemeinschaft Tevhid e.V.",
  nameBs: "Džemat Tevhid Minhen",
  address: "Ligsalzstraße 31A, 80339 München",
  phone: "",
  facebook: "https://www.facebook.com/p/D%C5%BEemat-T-Minhen-100009328557787/",
  facebookName: "Džemat T. Minhen",
  lat: 48.1351,
  lng: 11.5650,
  // salatul.com uses Diyanet/IGMG method: Fajr 18°, Isha 17° (same as MWL)
  method: 99,
  methodSettings: "18,null,17",
  school: 0, // Hanafi=1, Shafi=0
  iqamaOffsets: { Fajr: 30, Dhuhr: 15, Asr: 15, Maghrib: 7, Isha: 15 },
  jumuah: "13:30",
  khutba: "13:00",
  flashMessages: [
    "Džuma-namaz / Freitagsgebet — 13:30 Uhr • Hutba / Predigt: 13:00",
    "Kur'anski kurs za djecu — subotom u 10:00 • Quran-Unterricht für Kinder — Samstag 10:00",
    "Pratite nas na Facebooku! / Folgt uns auf Facebook! — Džemat T. Minhen",
    "Dobrodošli u naš džemat! • Willkommen in unserer Gemeinde!",
  ],
};

// ============================================================
// HIJRI
// ============================================================
function toHijri(d){const gd=d.getDate(),gm=d.getMonth()+1,gy=d.getFullYear();let jd=Math.floor((1461*(gy+4800+Math.floor((gm-14)/12)))/4)+Math.floor((367*(gm-2-12*Math.floor((gm-14)/12)))/12)-Math.floor((3*Math.floor((gy+4900+Math.floor((gm-14)/12))/100))/4)+gd-32075;const l=jd-1948440+10632,n=Math.floor((l-1)/10631),lp=l-10631*n+354,j=Math.floor((10985-lp)/5316)*Math.floor((50*lp)/17719)+Math.floor(lp/5670)*Math.floor((43*lp)/15238),lpp=lp-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29,hm=Math.floor((24*lpp)/709),hd=lpp-Math.floor((709*hm)/24),hy=30*n+j-30;const names=["Muharrem","Safer","Rebi'u-l-evvel","Rebi'u-l-ahir","Džumade-l-ula","Džumade-l-ahira","Redžeb","Ša'ban","Ramazan","Ševval","Zu-l-ka'de","Zu-l-hidždže"];return{day:hd,month:hm,monthName:names[hm-1]||"",year:hy};}

// ============================================================
// LOCAL FALLBACK
// ============================================================
function localCalc(date,lat,lng){const D=Math.PI/180,R=180/Math.PI,s=d=>Math.sin(d*D),c=d=>Math.cos(d*D),t=d=>Math.tan(d*D);const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();const ay=m<=2?y-1:y,am=m<=2?m+12:m,A=Math.floor(ay/100),B=2-A+Math.floor(A/4);const jd=Math.floor(365.25*(ay+4716))+Math.floor(30.6001*(am+1))+d+B-1524.5,DD=jd-2451545,g=(357.529+.98560028*DD)%360,q=(280.459+.98564736*DD)%360,L=(q+1.915*s(g)+.02*s(2*g))%360,e=23.439-.00000036*DD,RA=Math.atan2(c(e)*s(L),c(L))*R/15,decl=Math.asin(s(e)*s(L))*R;let EqT=q/15-((RA+360)%24);if(EqT>12)EqT-=24;const tz=new Date().getTimezoneOffset()/-60,dh=12+tz-lng/15-EqT;const ha=a=>{const v=(s(a)-s(lat)*s(decl))/(c(lat)*c(decl));return v>1||v<-1?NaN:Math.acos(v)*R/15;};const f=h=>{if(isNaN(h))return"--:--";let hr=Math.floor(h),mn=Math.round((h-hr)*60);if(mn>=60){hr++;mn=0;}if(hr>=24)hr-=24;return`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};return{Fajr:f(dh-ha(-18)),Sunrise:f(dh-ha(-.833)),Dhuhr:f(dh),Asr:f(dh+ha(R*Math.atan(1/(1+t(Math.abs(lat-decl)))))),Maghrib:f(dh+ha(-.833)),Isha:f(dh+ha(-17))};}

// ============================================================
// HELPERS
// ============================================================
const clean=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toMin=t=>{if(!t||t==="--:--")return 0;const[h,m]=clean(t).split(":").map(Number);return h*60+m;};
const addMin=(t,m)=>{if(!t||t==="--:--")return"--:--";const[h,mn]=clean(t).split(":").map(Number);const tot=h*60+mn+m;return`${String(Math.floor(tot/60)%24).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

// ============================================================
// SVG LOGO (Tevhid-inspired mosque arch + minaret)
// ============================================================
function MosqueLogo({size=60}){
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Dome/arch */}
      <path d="M20 70 Q20 25 50 15 Q80 25 80 70" stroke="#1B8C3A" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Crescent on dome */}
      <circle cx="50" cy="14" r="4" fill="#1B8C3A"/>
      <circle cx="52" cy="13" r="3" fill="#0a1628"/>
      {/* Minaret */}
      <rect x="82" y="25" width="8" height="45" rx="2" fill="#7BC24B"/>
      <rect x="84" y="20" width="4" height="8" rx="1" fill="#7BC24B"/>
      {/* Crescent on minaret */}
      <circle cx="86" cy="18" r="3" fill="#7BC24B"/>
      <circle cx="87.5" cy="17" r="2.5" fill="#0a1628"/>
      {/* Book */}
      <path d="M40 58 Q50 52 60 58" stroke="#7BC24B" strokeWidth="2.5" fill="none"/>
      <path d="M40 58 Q50 64 60 58" stroke="#7BC24B" strokeWidth="2.5" fill="none"/>
      <line x1="50" y1="52" x2="50" y2="64" stroke="#7BC24B" strokeWidth="1.5"/>
      {/* Base */}
      <line x1="15" y1="72" x2="92" y2="72" stroke="#1B8C3A" strokeWidth="2"/>
    </svg>
  );
}

// ============================================================
// ANALOG CLOCK
// ============================================================
function AnalogClock({size=220, now}){
  const h=now.getHours()%12,m=now.getMinutes(),sec=now.getSeconds();
  const hAngle=(h+m/60)*30-90;
  const mAngle=(m+sec/60)*6-90;
  const sAngle=sec*6-90;
  const r=size/2;
  const hand=(angle,len,w,color)=>{
    const rad=angle*Math.PI/180;
    const x2=r+len*Math.cos(rad),y2=r+len*Math.sin(rad);
    return <line x1={r} y1={r} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round"/>;
  };
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="clockFace" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a3a5c"/>
          <stop offset="100%" stopColor="#0d1f33"/>
        </radialGradient>
        <filter id="clockShadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.5)"/></filter>
      </defs>
      <circle cx={r} cy={r} r={r-4} fill="url(#clockFace)" stroke="#2a6e3f" strokeWidth="4" filter="url(#clockShadow)"/>
      <circle cx={r} cy={r} r={r-10} fill="none" stroke="rgba(123,194,75,0.15)" strokeWidth="1"/>
      {/* Hour markers */}
      {Array.from({length:12}).map((_,i)=>{
        const a=(i*30-90)*Math.PI/180;
        const x1=r+(r-20)*Math.cos(a),y1=r+(r-20)*Math.sin(a);
        const x2=r+(r-30)*Math.cos(a),y2=r+(r-30)*Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i%3===0?"#7BC24B":"rgba(255,255,255,0.3)"} strokeWidth={i%3===0?3:1.5} strokeLinecap="round"/>;
      })}
      {/* Numbers */}
      {[12,1,2,3,4,5,6,7,8,9,10,11].map((n,i)=>{
        const a=(i*30-90)*Math.PI/180;
        const x=r+(r-42)*Math.cos(a),y=r+(r-42)*Math.sin(a);
        return <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={n%3===0?"#7BC24B":"rgba(255,255,255,0.6)"} fontSize={n%3===0?16:13} fontWeight={n%3===0?700:400} fontFamily="'JetBrains Mono',monospace">{n}</text>;
      })}
      {hand(hAngle,r*0.5,5,"#f8fafc")}
      {hand(mAngle,r*0.68,3,"#f8fafc")}
      {hand(sAngle,r*0.72,1.5,"#e74c3c")}
      <circle cx={r} cy={r} r={5} fill="#e74c3c"/>
      <circle cx={r} cy={r} r={2.5} fill="#fff"/>
    </svg>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function App(){
  const [now,setNow]=useState(new Date());
  const [times,setTimes]=useState(null);
  const [status,setStatus]=useState("loading");
  const [fi,setFi]=useState(0);
  const [fa,setFa]=useState(true);
  const lastDate=useRef("");

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setInterval(()=>{setFa(false);setTimeout(()=>{setFi(i=>(i+1)%MOSQUE.flashMessages.length);setFa(true);},400);},7000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    const today=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    if(today===lastDate.current&&times)return;
    (async()=>{
      try{
        const dd=String(now.getDate()).padStart(2,"0"),mm=String(now.getMonth()+1).padStart(2,"0"),yy=now.getFullYear();
        const r=await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yy}?latitude=${MOSQUE.lat}&longitude=${MOSQUE.lng}&method=${MOSQUE.method}&methodSettings=${MOSQUE.methodSettings}&school=${MOSQUE.school}`);
        const d=await r.json();
        if(d.code===200){const t=d.data.timings;setTimes({Fajr:t.Fajr,Sunrise:t.Sunrise,Dhuhr:t.Dhuhr,Asr:t.Asr,Maghrib:t.Maghrib,Isha:t.Isha});setStatus("online");lastDate.current=today;}
        else throw new Error();
      }catch(e){setTimes(localCalc(now,MOSQUE.lat,MOSQUE.lng));setStatus("offline");lastDate.current=today;}
    })();
  },[now.getDate()]);

  const hijri=useMemo(()=>toHijri(now),[now.getDate()]);
  const nowM=now.getHours()*60+now.getMinutes();

  const next=useMemo(()=>{
    if(!times)return{name:"...",bs:"",cd:"--:--:--"};
    const o=[{k:"Fajr",n:"Sabah",bs:"Zora"},{k:"Sunrise",n:"Izlazak",bs:"Izlazak sunca"},{k:"Dhuhr",n:"Podne",bs:"Podne"},{k:"Asr",n:"Ikindija",bs:"Ikindija"},{k:"Maghrib",n:"Akšam",bs:"Akšam"},{k:"Isha",n:"Jacija",bs:"Jacija"}];
    for(const p of o){const m=toMin(times[p.k]);if(m>nowM){const diff=m-nowM;const totalSec=diff*60-now.getSeconds();const dh=Math.floor(totalSec/3600),dm=Math.floor((totalSec%3600)/60),ds=totalSec%60;return{name:p.n,bs:p.bs,cd:`${String(dh).padStart(2,"0")}:${String(dm).padStart(2,"0")}:${String(Math.max(0,ds)).padStart(2,"0")}`};}}
    return{name:"Sabah",bs:"Zora",cd:"--:--:--"};
  },[now,times]);

  const active=useMemo(()=>{
    if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nowM<toMin(times[k]))break;a=k;}return a;
  },[now,times]);

  const clock=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
  const dateDe=now.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const dayBs=["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"][now.getDay()];

  const prayers=times?[
    {k:"Fajr",de:"Fajr",bs:"Sabah / Zora",icon:"🌙",t:clean(times.Fajr),o:MOSQUE.iqamaOffsets.Fajr,active:active==="Fajr"},
    {k:"Dhuhr",de:"Dhuhr",bs:"Podne",icon:"☀️",t:clean(times.Dhuhr),o:MOSQUE.iqamaOffsets.Dhuhr,active:active==="Dhuhr"},
    {k:"Asr",de:"Asr",bs:"Ikindija",icon:"🌤️",t:clean(times.Asr),o:MOSQUE.iqamaOffsets.Asr,active:active==="Asr"},
    {k:"Maghrib",de:"Maghrib",bs:"Akšam",icon:"🌅",t:clean(times.Maghrib),o:MOSQUE.iqamaOffsets.Maghrib,active:active==="Maghrib"},
    {k:"Isha",de:"Isha",bs:"Jacija",icon:"🌃",t:clean(times.Isha),o:MOSQUE.iqamaOffsets.Isha,active:active==="Isha"},
  ]:[];

  // Colors
  const G1="#1B8C3A",G2="#7BC24B",GOLD="#D4A017",BG="#0a1628",CARD="rgba(15,30,50,0.85)";

  return(
    <div style={{position:"relative",width:"100%",minHeight:"100vh",background:`linear-gradient(135deg, ${BG} 0%, #0d2137 40%, #0a1f2e 100%)`,fontFamily:"'Outfit',sans-serif",color:"#f0f4f8",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Amiri:wght@400;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes glow{0%,100%{filter:drop-shadow(0 0 8px rgba(123,194,75,.4))}50%{filter:drop-shadow(0 0 16px rgba(123,194,75,.7))}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes marquee{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
        *{margin:0;padding:0;box-sizing:border-box}
      `}</style>

      {/* Background image overlay - mosque silhouette effect */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 70% 30%, rgba(27,140,58,0.08) 0%, transparent 50%),radial-gradient(ellipse at 20% 80%, rgba(123,194,75,0.05) 0%, transparent 50%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,opacity:.03,backgroundImage:`repeating-linear-gradient(45deg,${G1} 0px,${G1} 1px,transparent 1px,transparent 20px),repeating-linear-gradient(-45deg,${G1} 0px,${G1} 1px,transparent 1px,transparent 20px)`,pointerEvents:"none"}}/>

      {/* GOLD TOP BORDER */}
      <div style={{height:4,background:`linear-gradient(90deg, ${GOLD}, #f5d442, ${GOLD})`,position:"relative",zIndex:5}}/>

      {/* ============ HEADER ============ */}
      <header style={{position:"relative",zIndex:3,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 24px",background:"rgba(10,22,40,0.9)",borderBottom:`2px solid ${G1}`}}>
        {/* Left: Logo + Name */}
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <MosqueLogo size={56}/>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:"#fff",letterSpacing:"-.02em"}}>{MOSQUE.name}</div>
            <div style={{fontSize:14,fontWeight:500,color:G2,marginTop:1}}>{MOSQUE.nameBs}</div>
            <div style={{fontSize:11,color:"#8899aa",marginTop:2}}>📍 {MOSQUE.address}</div>
          </div>
        </div>

        {/* Center: Date */}
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#c8d6e5"}}>• {dayBs}, {dateDe}</div>
          <div style={{fontSize:15,fontFamily:"'Amiri',serif",color:GOLD,marginTop:2}}>
            {hijri.day}. {hijri.monthName} {hijri.year}. h.
          </div>
        </div>

        {/* Right: Facebook */}
        <a href={MOSQUE.facebook} target="_blank" rel="noopener noreferrer" style={{
          display:"flex",alignItems:"center",gap:10,background:"rgba(24,119,242,0.15)",
          border:"1px solid rgba(24,119,242,0.3)",borderRadius:10,padding:"8px 14px",
          textDecoration:"none",color:"#fff",transition:"all .3s",cursor:"pointer",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <div>
            <div style={{fontSize:10,color:"#8899aa",fontWeight:500}}>Pratite nas / Folgt uns</div>
            <div style={{fontSize:13,fontWeight:700,color:"#4599FF"}}>{MOSQUE.facebookName}</div>
          </div>
        </a>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <main style={{position:"relative",zIndex:2,display:"flex",flex:1,padding:"16px 24px",gap:20}}>

        {/* LEFT: Prayer Times List */}
        <div style={{width:320,display:"flex",flexDirection:"column",gap:8}}>
          {prayers.map((p,i)=>(
            <div key={p.k} style={{
              display:"flex",alignItems:"center",gap:12,
              background:p.active?`linear-gradient(135deg, rgba(27,140,58,0.25), rgba(123,194,75,0.1))`:CARD,
              border:`1px solid ${p.active?G1:"rgba(255,255,255,0.06)"}`,
              borderRadius:12,padding:"10px 14px",
              boxShadow:p.active?`0 0 20px rgba(27,140,58,0.2), inset 0 0 20px rgba(27,140,58,0.05)`:"none",
              transform:p.active?"scale(1.02)":"none",transition:"all .4s",
              animation:`slideUp .5s ease-out both`,animationDelay:`${i*0.08}s`,
            }}>
              <div style={{fontSize:28,width:40,textAlign:"center"}}>{p.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:p.active?G2:"#8899aa",textTransform:"uppercase",letterSpacing:".06em"}}>{p.bs}</div>
                <div style={{fontSize:11,color:"#556677"}}>{p.de}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:30,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:p.active?"#fff":"#e0e8f0",letterSpacing:"-.02em"}}>{p.t}</div>
                <div style={{fontSize:10,color:"#556677"}}>Ikamet: <span style={{color:G2,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{addMin(p.t,p.o)}</span> <span style={{color:"#445566"}}>(+{p.o})</span></div>
              </div>
            </div>
          ))}

          {/* Sunrise extra */}
          {times&&(
            <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(212,160,23,0.08)",border:"1px solid rgba(212,160,23,0.15)",borderRadius:12,padding:"8px 14px",marginTop:2}}>
              <div style={{fontSize:22,width:40,textAlign:"center"}}>🌅</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:GOLD,textTransform:"uppercase",letterSpacing:".06em"}}>Izlazak sunca / Shurūq</div>
              </div>
              <div style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:GOLD}}>{clean(times.Sunrise)}</div>
            </div>
          )}
        </div>

        {/* CENTER: Clock + Countdown */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
          {/* Analog Clock */}
          <div style={{animation:"glow 3s ease-in-out infinite"}}>
            <AnalogClock size={200} now={now}/>
          </div>

          {/* Digital time */}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:42,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-.02em",background:`linear-gradient(135deg, #fff 40%, ${G2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{clock}</div>
          </div>

          {/* Next Prayer Countdown */}
          <div style={{background:CARD,border:`2px solid ${G1}`,borderRadius:14,padding:"14px 28px",textAlign:"center",minWidth:260}}>
            <div style={{fontSize:10,fontWeight:600,color:"#8899aa",textTransform:"uppercase",letterSpacing:".1em"}}>Sljedeći namaz / Nächstes Gebet</div>
            <div style={{fontSize:20,fontWeight:700,color:G2,marginTop:4}}>{next.name}</div>
            <div style={{fontSize:12,color:"#667788"}}>{next.bs}</div>
            <div style={{fontSize:32,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:"#fff",marginTop:6,animation:"pulse 2s ease-in-out infinite"}}>
              {next.cd}
            </div>
          </div>
        </div>

        {/* RIGHT: Info Panel */}
        <div style={{width:260,display:"flex",flexDirection:"column",gap:10}}>
          {/* Jumuah */}
          <div style={{background:CARD,border:`1px solid rgba(255,255,255,0.06)`,borderRadius:12,padding:16,textAlign:"center"}}>
            <div style={{fontSize:10,fontWeight:600,color:"#8899aa",textTransform:"uppercase",letterSpacing:".08em"}}>Džuma-namaz / Freitagsgebet</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:G2,marginTop:6}}>{MOSQUE.jumuah}</div>
            <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"10px 0"}}/>
            <div style={{fontSize:10,color:"#8899aa",textTransform:"uppercase",letterSpacing:".08em"}}>Hutba / Khutba</div>
            <div style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:GOLD,marginTop:4}}>{MOSQUE.khutba}</div>
          </div>

          {/* Facebook CTA */}
          <a href={MOSQUE.facebook} target="_blank" rel="noopener noreferrer" style={{
            background:"linear-gradient(135deg, rgba(24,119,242,0.12), rgba(24,119,242,0.05))",
            border:"1px solid rgba(24,119,242,0.2)",borderRadius:12,padding:16,
            textDecoration:"none",color:"#fff",textAlign:"center",display:"block",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#1877F2" style={{margin:"0 auto 8px"}}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <div style={{fontSize:13,fontWeight:700,color:"#4599FF"}}>Pratite nas na Facebooku!</div>
            <div style={{fontSize:12,color:"#8899aa",marginTop:2}}>Folgt uns auf Facebook</div>
            <div style={{fontSize:11,fontWeight:600,color:"#ccc",marginTop:6,wordBreak:"break-all"}}>{MOSQUE.facebookName}</div>
          </a>

          {/* Calculation Info */}
          <div style={{background:CARD,border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:14}}>
            <div style={{fontSize:10,fontWeight:600,color:"#8899aa",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Proračun / Berechnung</div>
            <div style={{fontSize:11,color:"#667788",lineHeight:1.7}}>
              <span style={{color:G2,fontWeight:600}}>MWL</span> — Muslim World League<br/>
              Fajr: 18° · Isha: 17° · Asr: Hanefi<br/>
              salatul.com / aladhan.com<br/>
              <span style={{fontSize:10,color:"#445566"}}>Izvor / Quelle: api.aladhan.com</span>
            </div>
            <div style={{fontSize:9,color:status==="online"?"#2dd4bf":"#f59e0b",marginTop:6}}>
              {status==="online"?"● API aktivan / online":status==="offline"?"● Lokalni proračun":"● Učitavanje..."}
            </div>
          </div>

          {/* Address */}
          <div style={{background:CARD,border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:14,textAlign:"center"}}>
            <div style={{fontSize:10,fontWeight:600,color:"#8899aa",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Adresa / Adresse</div>
            <div style={{fontSize:12,color:"#c8d6e5",lineHeight:1.5}}>{MOSQUE.address}</div>
            <div style={{fontSize:10,color:"#556677",marginTop:4}}>📍 {MOSQUE.lat.toFixed(4)}°N, {MOSQUE.lng.toFixed(4)}°E</div>
          </div>
        </div>
      </main>

      {/* ============ FLASH TICKER ============ */}
      <footer style={{position:"relative",zIndex:3,display:"flex",alignItems:"center",gap:10,padding:"10px 24px",background:`linear-gradient(90deg, rgba(27,140,58,0.2), rgba(123,194,75,0.08))`,borderTop:`1px solid ${G1}`,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".12em",color:G1,background:"rgba(27,140,58,0.15)",padding:"3px 8px",borderRadius:4,flexShrink:0}}>Info</span>
        <span style={{fontSize:13,color:"#e0e8f0",transition:"all .4s",opacity:fa?1:0,transform:fa?"translateY(0)":"translateY(6px)",fontFamily:"'Outfit','Amiri',sans-serif,serif"}}>{MOSQUE.flashMessages[fi]}</span>
      </footer>

      {/* GOLD BOTTOM BORDER */}
      <div style={{height:3,background:`linear-gradient(90deg, ${GOLD}, #f5d442, ${GOLD})`,position:"relative",zIndex:5}}/>
    </div>
  );
}
