import { useState, useEffect, useMemo, useRef } from "react";

// ============================================================
// CONFIG
// ============================================================
const MOSQUE = {
  name: "Bosniakisches Kulturzentrum Fedžr",
  nameBs: "BKZ Fedžr",
  nameOrg: "Islamische Gemeinschaft Tevhid e.V.",
  address: "Ligsalzstraße 31A, 80339 München",
  facebook: "https://www.facebook.com/p/D%C5%BEemat-T-Minhen-100009328557787/",
  facebookName: "@DžematTMinhen",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
  iqamaOffsets: { Fajr: 30, Dhuhr: 15, Asr: 15, Maghrib: 7, Isha: 15 },
  jumuah: "13:30", khutba: "13:00",
  flashMessages: [
    "Džuma-namaz / Freitagsgebet — 13:30h · Hutba / Predigt: 13:00h",
    "Kur'anski kurs za djecu — subotom u 10:00h · Quran-Unterricht — Samstag 10:00",
    "Pratite nas na Facebooku! · Folgt uns auf Facebook! — @DžematTMinhen",
    "Dobrodošli u naš džemat! · Willkommen in unserer Gemeinde!",
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

// HELPERS
const clean=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toMin=t=>{if(!t||t==="--:--")return 0;const[h,m]=clean(t).split(":").map(Number);return h*60+m;};
const addMin=(t,m)=>{if(!t||t==="--:--")return"--:--";const[h,mn]=clean(t).split(":").map(Number);const tot=h*60+mn+m;return`${String(Math.floor(tot/60)%24).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

// ============================================================
// ANALOG CLOCK — elegant gold style
// ============================================================
function AnalogClock({size=200,now}){
  const h=now.getHours()%12,m=now.getMinutes(),sec=now.getSeconds();
  const hA=(h+m/60)*30-90,mA=(m+sec/60)*6-90,sA=sec*6-90;
  const r=size/2;
  const hand=(a,len,w,col)=>{const rad=a*Math.PI/180;return<line x1={r} y1={r} x2={r+len*Math.cos(rad)} y2={r+len*Math.sin(rad)} stroke={col} strokeWidth={w} strokeLinecap="round"/>;};
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="cf" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a3828"/><stop offset="100%" stopColor="#0d1f14"/>
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r-3} fill="url(#cf)" stroke="#c9a84c" strokeWidth="3"/>
      <circle cx={r} cy={r} r={r-10} fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1"/>
      {Array.from({length:60}).map((_,i)=>{
        const a=(i*6-90)*Math.PI/180;
        const isHour=i%5===0;
        const l1=r-(isHour?20:14),l2=r-(isHour?30:18);
        return<line key={i} x1={r+l1*Math.cos(a)} y1={r+l1*Math.sin(a)} x2={r+l2*Math.cos(a)} y2={r+l2*Math.sin(a)} stroke={isHour?"#c9a84c":"rgba(255,255,255,0.15)"} strokeWidth={isHour?2.5:0.8} strokeLinecap="round"/>;
      })}
      {[12,3,6,9].map((n,i)=>{
        const a=(i*90-90)*Math.PI/180;
        return<text key={n} x={r+(r-42)*Math.cos(a)} y={r+(r-42)*Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill="#c9a84c" fontSize="15" fontWeight="700" fontFamily="'Cormorant Garamond',serif">{n}</text>;
      })}
      {hand(hA,r*0.45,4.5,"#e8dcc8")}
      {hand(mA,r*0.62,2.5,"#e8dcc8")}
      {hand(sA,r*0.68,1,"#c9a84c")}
      <circle cx={r} cy={r} r={4} fill="#c9a84c"/>
      <circle cx={r} cy={r} r={2} fill="#e8dcc8"/>
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
    const o=[{k:"Fajr",n:"Sabah",bs:"Zora"},{k:"Sunrise",n:"Izlazak sunca",bs:"Izlazak"},{k:"Dhuhr",n:"Podne",bs:"Podne"},{k:"Asr",n:"Ikindija",bs:"Ikindija"},{k:"Maghrib",n:"Akšam",bs:"Akšam"},{k:"Isha",n:"Jacija",bs:"Jacija"}];
    for(const p of o){const m=toMin(times[p.k]);if(m>nowM){const diff=m-nowM;const ts=diff*60-now.getSeconds();const dh=Math.floor(ts/3600),dm=Math.floor((ts%3600)/60),ds=ts%60;return{name:p.n,bs:p.bs,cd:`${String(dh).padStart(2,"0")}:${String(dm).padStart(2,"0")}:${String(Math.max(0,ds)).padStart(2,"0")}`};}}
    return{name:"Sabah",bs:"Zora",cd:"--:--:--"};
  },[now,times]);

  const active=useMemo(()=>{
    if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nowM<toMin(times[k]))break;a=k;}return a;
  },[now,times]);

  const clock=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
  const dateDe=now.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const dayBs=["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"][now.getDay()];

  const prayers=times?[
    {k:"Fajr",bs:"Sabah",de:"Fajr",t:clean(times.Fajr),o:MOSQUE.iqamaOffsets.Fajr},
    {k:"Dhuhr",bs:"Podne",de:"Dhuhr",t:clean(times.Dhuhr),o:MOSQUE.iqamaOffsets.Dhuhr},
    {k:"Asr",bs:"Ikindija",de:"Asr",t:clean(times.Asr),o:MOSQUE.iqamaOffsets.Asr},
    {k:"Maghrib",bs:"Akšam",de:"Maghrib",t:clean(times.Maghrib),o:MOSQUE.iqamaOffsets.Maghrib},
    {k:"Isha",bs:"Jacija",de:"Isha",t:clean(times.Isha),o:MOSQUE.iqamaOffsets.Isha},
  ]:[];

  // COLORS
  const GOLD="#c9a84c",GOLD_L="#d4b65e",GREEN="#1B6B3A",GREEN_D="#0f4424",GREEN_L="#2a8c4e",CREAM="#f5efe0",CREAM_D="#e8dcc8",BG_DARK="rgba(12,28,18,0.88)";

  return(
    <div style={{position:"relative",width:"100%",minHeight:"100vh",fontFamily:"'Cormorant Garamond','Amiri',serif",color:CREAM,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{margin:0;padding:0;box-sizing:border-box}
      `}</style>

      {/* Background: Mosque photo */}
      <div style={{position:"absolute",inset:0,backgroundImage:"url(/mosque-bg.png)",backgroundSize:"cover",backgroundPosition:"center 40%",zIndex:0}}/>
      {/* Dark green overlay */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg, rgba(12,28,18,0.92) 0%, rgba(15,40,24,0.88) 40%, rgba(10,22,14,0.94) 100%)",zIndex:1}}/>
      {/* Geometric pattern overlay */}
      <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:`repeating-conic-gradient(${GOLD} 0% 25%, transparent 0% 50%)`,backgroundSize:"50px 50px",zIndex:2,pointerEvents:"none"}}/>

      {/* GOLD TOP BORDER */}
      <div style={{height:3,background:`linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_L}, ${GOLD}, transparent)`,position:"relative",zIndex:10}}/>

      {/* ============ HEADER ============ */}
      <header style={{position:"relative",zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 28px",background:"rgba(10,22,14,0.6)",borderBottom:`1px solid rgba(201,168,76,0.2)`,backdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <img src="/logo-bkz.png" alt="BKZ Fedžr" style={{height:48,filter:"invert(1) brightness(0.95)"}}/>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:CREAM,letterSpacing:".02em",fontFamily:"'Cormorant Garamond',serif"}}>{MOSQUE.name}</div>
            <div style={{fontSize:13,fontWeight:400,color:GOLD,fontFamily:"'Outfit',sans-serif",marginTop:1}}>{MOSQUE.nameOrg}</div>
          </div>
        </div>

        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,fontWeight:500,color:CREAM_D,fontFamily:"'Outfit',sans-serif"}}>{dayBs} · {dateDe}</div>
          <div style={{fontSize:17,fontWeight:600,color:GOLD,marginTop:2}}>{hijri.day}. {hijri.monthName} {hijri.year}. h.</div>
        </div>

        <a href={MOSQUE.facebook} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,background:"rgba(24,119,242,0.1)",border:"1px solid rgba(24,119,242,0.25)",borderRadius:8,padding:"8px 12px",textDecoration:"none",color:"#fff"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <div>
            <div style={{fontSize:9,color:"#8899aa",fontFamily:"'Outfit',sans-serif"}}>Pratite nas</div>
            <div style={{fontSize:12,fontWeight:600,color:"#4599FF",fontFamily:"'Outfit',sans-serif"}}>{MOSQUE.facebookName}</div>
          </div>
        </a>
      </header>

      {/* ============ MAIN ============ */}
      <main style={{position:"relative",zIndex:10,display:"flex",flex:1,padding:"14px 28px",gap:24}}>

        {/* LEFT: Prayer Times */}
        <div style={{width:340,display:"flex",flexDirection:"column",gap:6}}>
          {/* Column headers */}
          <div style={{display:"flex",alignItems:"center",padding:"0 14px 4px",gap:12}}>
            <div style={{flex:1}}/>
            <div style={{width:90,textAlign:"center",fontSize:10,fontWeight:600,color:"rgba(201,168,76,0.6)",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".1em"}}>Vakti</div>
            <div style={{width:90,textAlign:"center",fontSize:10,fontWeight:600,color:"rgba(201,168,76,0.6)",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".1em"}}>Ikamet</div>
          </div>

          {prayers.map((p,i)=>{
            const isA=active===p.k;
            return(
              <div key={p.k} style={{
                display:"flex",alignItems:"center",gap:12,
                background:isA?`linear-gradient(135deg, rgba(27,107,58,0.35), rgba(201,168,76,0.1))`:"rgba(10,22,14,0.6)",
                border:`1px solid ${isA?`rgba(201,168,76,0.4)`:"rgba(201,168,76,0.08)"}`,
                borderRadius:10,padding:"12px 14px",
                backdropFilter:"blur(6px)",
                boxShadow:isA?`0 0 24px rgba(201,168,76,0.12), inset 0 0 24px rgba(27,107,58,0.08)`:"none",
                transform:isA?"scale(1.02)":"none",transition:"all .4s",
                animation:`slideUp .5s ease-out both`,animationDelay:`${i*0.07}s`,
              }}>
                <div style={{flex:1}}>
                  <div style={{fontSize:18,fontWeight:700,color:isA?GOLD:CREAM,fontFamily:"'Cormorant Garamond',serif"}}>{p.bs}</div>
                  <div style={{fontSize:11,color:"rgba(232,220,200,0.4)",fontFamily:"'Outfit',sans-serif"}}>{p.de}</div>
                </div>
                <div style={{width:90,textAlign:"center"}}>
                  <div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:isA?"#fff":CREAM_D}}>{p.t}</div>
                </div>
                <div style={{width:90,textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:GOLD}}>{addMin(p.t,p.o)}</div>
                  <div style={{fontSize:9,color:"rgba(201,168,76,0.4)",fontFamily:"'Outfit',sans-serif"}}>+{p.o} min</div>
                </div>
              </div>
            );
          })}

          {/* Sunrise */}
          {times&&(
            <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.1)",borderRadius:10,padding:"8px 14px",marginTop:2}}>
              <div style={{flex:1,fontSize:14,fontWeight:600,color:GOLD,fontFamily:"'Cormorant Garamond',serif"}}>Izlazak sunca / Shurūq</div>
              <div style={{fontSize:20,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:GOLD}}>{clean(times.Sunrise)}</div>
            </div>
          )}
        </div>

        {/* CENTER: Clock */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
          <div style={{animation:"float 6s ease-in-out infinite"}}>
            <AnalogClock size={200} now={now}/>
          </div>
          <div style={{fontSize:44,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-.02em",color:CREAM,textShadow:`0 0 40px rgba(201,168,76,0.2)`}}>{clock}</div>

          {/* Countdown */}
          <div style={{background:"rgba(10,22,14,0.7)",border:`1.5px solid rgba(201,168,76,0.25)`,borderRadius:12,padding:"14px 32px",textAlign:"center",backdropFilter:"blur(8px)",minWidth:280}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(232,220,200,0.5)",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".12em"}}>Sljedeći namaz / Nächstes Gebet</div>
            <div style={{fontSize:22,fontWeight:700,color:GOLD,marginTop:4,fontFamily:"'Cormorant Garamond',serif"}}>{next.name}</div>
            <div style={{fontSize:36,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:"#fff",marginTop:4,animation:"pulse 2s ease-in-out infinite"}}>{next.cd}</div>
          </div>
        </div>

        {/* RIGHT: Info */}
        <div style={{width:240,display:"flex",flexDirection:"column",gap:10}}>
          {/* Jumuah */}
          <div style={{background:"rgba(10,22,14,0.65)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:10,padding:16,textAlign:"center",backdropFilter:"blur(6px)"}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(232,220,200,0.5)",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".1em"}}>Džuma-namaz</div>
            <div style={{fontSize:11,color:"rgba(232,220,200,0.3)",fontFamily:"'Outfit',sans-serif"}}>Freitagsgebet</div>
            <div style={{fontSize:30,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:GOLD,marginTop:6}}>{MOSQUE.jumuah}</div>
            <div style={{height:1,background:"rgba(201,168,76,0.1)",margin:"10px 0"}}/>
            <div style={{fontSize:10,color:"rgba(232,220,200,0.5)",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".1em"}}>Hutba / Khutba</div>
            <div style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:CREAM_D,marginTop:4}}>{MOSQUE.khutba}</div>
          </div>

          {/* Facebook */}
          <a href={MOSQUE.facebook} target="_blank" rel="noopener noreferrer" style={{background:"rgba(24,119,242,0.08)",border:"1px solid rgba(24,119,242,0.15)",borderRadius:10,padding:16,textDecoration:"none",color:"#fff",textAlign:"center",display:"block",backdropFilter:"blur(6px)"}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#1877F2" style={{margin:"0 auto 6px"}}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <div style={{fontSize:13,fontWeight:600,color:"#4599FF",fontFamily:"'Outfit',sans-serif"}}>Pratite nas!</div>
            <div style={{fontSize:11,color:"rgba(232,220,200,0.4)",fontFamily:"'Outfit',sans-serif"}}>Folgt uns auf Facebook</div>
          </a>

          {/* Info */}
          <div style={{background:"rgba(10,22,14,0.65)",border:"1px solid rgba(201,168,76,0.1)",borderRadius:10,padding:14,backdropFilter:"blur(6px)"}}>
            <div style={{fontSize:10,fontWeight:600,color:"rgba(201,168,76,0.5)",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Proračun / Berechnung</div>
            <div style={{fontSize:11,color:"rgba(232,220,200,0.4)",fontFamily:"'Outfit',sans-serif",lineHeight:1.7}}>
              MWL — Fajr: 18° · Isha: 17°<br/>
              salatul.com · aladhan.com
            </div>
            <div style={{fontSize:9,color:status==="online"?"rgba(42,140,78,0.8)":"rgba(245,158,11,0.7)",fontFamily:"'Outfit',sans-serif",marginTop:6}}>
              {status==="online"?"● API aktivan":"● Lokalni proračun"}
            </div>
          </div>

          {/* Address */}
          <div style={{background:"rgba(10,22,14,0.65)",border:"1px solid rgba(201,168,76,0.1)",borderRadius:10,padding:14,textAlign:"center",backdropFilter:"blur(6px)"}}>
            <div style={{fontSize:12,color:CREAM_D,fontFamily:"'Outfit',sans-serif",lineHeight:1.5}}>{MOSQUE.address}</div>
          </div>
        </div>
      </main>

      {/* ============ FLASH ============ */}
      <footer style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",gap:10,padding:"9px 28px",background:"rgba(10,22,14,0.7)",borderTop:`1px solid rgba(201,168,76,0.15)`,backdropFilter:"blur(8px)"}}>
        <span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",color:GREEN_L,background:"rgba(27,107,58,0.2)",padding:"3px 8px",borderRadius:4,fontFamily:"'Outfit',sans-serif",flexShrink:0}}>Info</span>
        <span style={{fontSize:13,color:CREAM_D,transition:"all .4s",opacity:fa?1:0,transform:fa?"translateY(0)":"translateY(6px)",fontFamily:"'Outfit','Amiri',sans-serif,serif"}}>{MOSQUE.flashMessages[fi]}</span>
      </footer>

      {/* GOLD BOTTOM BORDER */}
      <div style={{height:2,background:`linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_L}, ${GOLD}, transparent)`,position:"relative",zIndex:10}}/>
    </div>
  );
}
