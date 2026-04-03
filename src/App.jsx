import { useState, useEffect, useMemo, useRef } from "react";

// ============================================================
// CONFIG
// ============================================================
const MOSQUE = {
  line1: "ISLAMSKA ZAJEDNICA BOŠNJAKA U NJEMAČKOJ",
  line2: "MEDŽLIS ISLAMSKE ZAJEDNICE BAYERN",
  line3: "Džemat Tevhid",
  address: "Ligsalzstraße 31A, 80339 München",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
  iqamaOffsets: { Fajr: 30, Dhuhr: 15, Asr: 15, Maghrib: 7, Isha: 15 },
  welcomeMsg: "Islamska zajednica Bošnjaka u Njemačkoj\nDobrodošli u džemat Tevhid",
};

// HIJRI
function toHijri(d){const gd=d.getDate(),gm=d.getMonth()+1,gy=d.getFullYear();let jd=Math.floor((1461*(gy+4800+Math.floor((gm-14)/12)))/4)+Math.floor((367*(gm-2-12*Math.floor((gm-14)/12)))/12)-Math.floor((3*Math.floor((gy+4900+Math.floor((gm-14)/12))/100))/4)+gd-32075;const l=jd-1948440+10632,n=Math.floor((l-1)/10631),lp=l-10631*n+354,j=Math.floor((10985-lp)/5316)*Math.floor((50*lp)/17719)+Math.floor(lp/5670)*Math.floor((43*lp)/15238),lpp=lp-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29,hm=Math.floor((24*lpp)/709),hd=lpp-Math.floor((709*hm)/24),hy=30*n+j-30;const names=["Muharrem","Safer","Rebi'u-l-evvel","Rebi'u-l-ahir","Džumade-l-ula","Džumade-l-ahira","Redžeb","Ša'ban","Ramazan","Ševval","Zu-l-ka'de","Zu-l-hidždže"];return{day:hd,month:hm,monthName:names[hm-1]||"",year:hy};}

// LOCAL FALLBACK
function localCalc(date,lat,lng){const D=Math.PI/180,R=180/Math.PI,s=d=>Math.sin(d*D),c=d=>Math.cos(d*D),t=d=>Math.tan(d*D);const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();const ay=m<=2?y-1:y,am=m<=2?m+12:m,A=Math.floor(ay/100),B=2-A+Math.floor(A/4);const jd=Math.floor(365.25*(ay+4716))+Math.floor(30.6001*(am+1))+d+B-1524.5,DD=jd-2451545,g=(357.529+.98560028*DD)%360,q=(280.459+.98564736*DD)%360,L=(q+1.915*s(g)+.02*s(2*g))%360,e=23.439-.00000036*DD,RA=Math.atan2(c(e)*s(L),c(L))*R/15,decl=Math.asin(s(e)*s(L))*R;let EqT=q/15-((RA+360)%24);if(EqT>12)EqT-=24;const tz=new Date().getTimezoneOffset()/-60,dh=12+tz-lng/15-EqT;const ha=a=>{const v=(s(a)-s(lat)*s(decl))/(c(lat)*c(decl));return v>1||v<-1?NaN:Math.acos(v)*R/15;};const f=h=>{if(isNaN(h))return"--:--";let hr=Math.floor(h),mn=Math.round((h-hr)*60);if(mn>=60){hr++;mn=0;}if(hr>=24)hr-=24;return`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};return{Fajr:f(dh-ha(-18)),Sunrise:f(dh-ha(-.833)),Dhuhr:f(dh),Asr:f(dh+ha(R*Math.atan(1/(1+t(Math.abs(lat-decl)))))),Maghrib:f(dh+ha(-.833)),Isha:f(dh+ha(-17))};}

const clean=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toMin=t=>{if(!t||t==="--:--")return 0;const[h,m]=clean(t).split(":").map(Number);return h*60+m;};

// ============================================================
// COLORS
// ============================================================
const GREEN = "#2E7D32";
const GREEN_L = "#43A047";
const GREEN_D = "#1B5E20";
const TEXT_DARK = "#2c2c2c";
const TEXT_MED = "#555";
const TEXT_LIGHT = "#888";
const BG = "#e8e0d0";

// ============================================================
// DAY ABBREVIATIONS (Bosnian)
// ============================================================
const DAY_ABBR = ["N","P","U","S","Č","P","S"];
const DAY_FULL = ["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"];
const MONTHS_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

// ============================================================
// MAIN
// ============================================================
export default function App(){
  const [now,setNow]=useState(new Date());
  const [times,setTimes]=useState(null);
  const lastDate=useRef("");

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    const today=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    if(today===lastDate.current&&times)return;
    (async()=>{
      try{
        const dd=String(now.getDate()).padStart(2,"0"),mm=String(now.getMonth()+1).padStart(2,"0"),yy=now.getFullYear();
        const r=await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yy}?latitude=${MOSQUE.lat}&longitude=${MOSQUE.lng}&method=${MOSQUE.method}&methodSettings=${MOSQUE.methodSettings}&school=${MOSQUE.school}`);
        const d=await r.json();
        if(d.code===200){const t=d.data.timings;setTimes({Fajr:t.Fajr,Sunrise:t.Sunrise,Dhuhr:t.Dhuhr,Asr:t.Asr,Maghrib:t.Maghrib,Isha:t.Isha});lastDate.current=today;}
        else throw new Error();
      }catch(e){setTimes(localCalc(now,MOSQUE.lat,MOSQUE.lng));lastDate.current=today;}
    })();
  },[now.getDate()]);

  const hijri=useMemo(()=>toHijri(now),[now.getDate()]);
  const nowM=now.getHours()*60+now.getMinutes();

  // Next prayer
  const next=useMemo(()=>{
    if(!times)return{name:"...",cd:"--:--:--"};
    const o=[{k:"Fajr",n:"Sabah-namaz"},{k:"Sunrise",n:"Izlazak sunca"},{k:"Dhuhr",n:"Podne-namaz"},{k:"Asr",n:"Ikindija-namaz"},{k:"Maghrib",n:"Akšam-namaz"},{k:"Isha",n:"Jacija-namaz"}];
    for(const p of o){const m=toMin(times[p.k]);if(m>nowM){const diff=m-nowM;const ts=diff*60-now.getSeconds();const dh=Math.floor(ts/3600),dm=Math.floor((ts%3600)/60),ds=ts%60;return{name:p.n,cd:`${String(dh).padStart(2,"0")}:${String(dm).padStart(2,"0")}:${String(Math.max(0,ds)).padStart(2,"0")}`};}}
    return{name:"Sabah-namaz",cd:"--:--:--"};
  },[now,times]);

  // Active prayer highlight
  const active=useMemo(()=>{
    if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nowM<toMin(times[k]))break;a=k;}return a;
  },[now,times]);

  const clock=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
  const dateStr=`${String(now.getDate()).padStart(2,"0")}. ${MONTHS_DE[now.getMonth()]} ${now.getFullYear()}.`;
  const hijriStr=`${hijri.day}. ${hijri.monthName} ${hijri.year}.`;
  const todayIdx=now.getDay();

  const prayers=times?[
    {k:"Fajr",bs:"Zora",ar:"إمساك",t:clean(times.Fajr)},
    {k:"Sunrise",bs:"Iz. sunca",ar:"الشروق",t:clean(times.Sunrise)},
    {k:"Dhuhr",bs:"Podne",ar:"الظهر",t:clean(times.Dhuhr)},
    {k:"Asr",bs:"Ikindija",ar:"العصر",t:clean(times.Asr)},
    {k:"Maghrib",bs:"Akšam",ar:"المغرب",t:clean(times.Maghrib)},
    {k:"Isha",bs:"Jacija",ar:"العشاء",t:clean(times.Isha)},
  ]:[];

  // ============================================================
  // RENDER
  // ============================================================
  return(
    <div style={{position:"relative",width:"100%",height:"100vh",overflow:"hidden",fontFamily:"'Outfit',sans-serif",color:TEXT_DARK,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
        *{margin:0;padding:0;box-sizing:border-box}
      `}</style>

      {/* Arabesque pattern background */}
      <div style={{position:"absolute",inset:0,backgroundImage:"url(/pattern-bg.jpg)",backgroundSize:"cover",backgroundPosition:"center",zIndex:0}}/>

      {/* Content */}
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",padding:24,gap:24}}>

        {/* ============ LEFT SIDE ============ */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:0}}>

          {/* Header: Logo + Mosque Name */}
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20}}>
            {/* Crescent + Star Icon */}
            <div style={{marginTop:2}}>
              <svg width="44" height="44" viewBox="0 0 50 50">
                <circle cx="22" cy="25" r="16" fill="none" stroke={GREEN_D} strokeWidth="2.5"/>
                <circle cx="28" cy="25" r="14" fill={BG}/>
                <polygon points="38,12 39.5,16 44,16 40.5,18.5 42,23 38,20 34,23 35.5,18.5 32,16 36.5,16" fill={GREEN_D}/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:GREEN_D,letterSpacing:".04em",lineHeight:1.3}}>{MOSQUE.line1}</div>
              <div style={{fontSize:12,fontWeight:600,color:TEXT_MED,letterSpacing:".03em"}}>{MOSQUE.line2}</div>
              <div style={{fontSize:16,fontWeight:500,color:GREEN,fontStyle:"italic",marginTop:2}}>{MOSQUE.line3}</div>
            </div>
          </div>

          {/* BIG CLOCK */}
          <div style={{background:"rgba(255,255,255,0.5)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:12,padding:"20px 32px",textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:72,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:TEXT_DARK,letterSpacing:"-0.02em",lineHeight:1}}>{clock}</div>
          </div>

          {/* Day of week pills */}
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16}}>
            {DAY_ABBR.map((d,i)=>(
              <div key={i} style={{
                width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,fontWeight:700,
                background:i===todayIdx?GREEN:"transparent",
                color:i===todayIdx?"#fff":TEXT_MED,
                border:i===todayIdx?"none":"1px solid rgba(0,0,0,0.1)",
              }}>{d}</div>
            ))}
          </div>

          {/* Date row */}
          <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:20}}>
            <div style={{background:GREEN,color:"#fff",borderRadius:8,padding:"8px 20px",fontSize:14,fontWeight:600}}>{dateStr}</div>
            <div style={{background:"rgba(255,255,255,0.6)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"8px 20px",fontSize:14,fontWeight:600,color:TEXT_DARK}}>{hijriStr}</div>
          </div>

          {/* Next prayer countdown */}
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:500,color:TEXT_MED}}>{next.name}</div>
            <div style={{fontSize:48,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:GREEN,letterSpacing:"-0.02em",animation:"pulse 2s ease-in-out infinite"}}>{next.cd}</div>
          </div>

          {/* Welcome message */}
          <div style={{background:GREEN,borderRadius:10,padding:"12px 20px",textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:600,color:"#fff",lineHeight:1.5}}>
              {MOSQUE.welcomeMsg.split("\n").map((line,i)=><div key={i}>{line}</div>)}
            </div>
          </div>
        </div>

        {/* ============ RIGHT SIDE: Prayer Times ============ */}
        <div style={{width:420,display:"flex",flexDirection:"column",gap:0}}>
          {/* Header */}
          <div style={{background:GREEN,borderRadius:"10px 10px 0 0",padding:"10px 24px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#fff",letterSpacing:".08em"}}>VRIJEME NAMAZA</div>
          </div>

          {/* Prayer rows */}
          <div style={{background:"rgba(255,255,255,0.55)",borderRadius:"0 0 10px 10px",border:"1px solid rgba(0,0,0,0.06)",overflow:"hidden"}}>
            {prayers.map((p,i)=>{
              const isA=active===p.k;
              const isMaghrib=p.k==="Maghrib";
              return(
                <div key={p.k} style={{
                  display:"flex",alignItems:"center",
                  padding:"14px 24px",
                  borderBottom:i<prayers.length-1?"1px solid rgba(0,0,0,0.06)":"none",
                  background:isA?"rgba(46,125,50,0.08)":"transparent",
                }}>
                  {/* Bosnian name */}
                  <div style={{width:100,fontSize:16,fontWeight:isA?700:500,color:isA?GREEN:TEXT_DARK}}>{p.bs}</div>
                  {/* Time */}
                  <div style={{flex:1,textAlign:"center"}}>
                    <span style={{fontSize:36,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:isA?GREEN_D:TEXT_DARK}}>{p.t}</span>
                  </div>
                  {/* Arabic name */}
                  <div style={{width:80,textAlign:"right",fontSize:20,fontFamily:"'Amiri',serif",color:TEXT_MED,direction:"rtl"}}>{p.ar}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"6px 32px",fontSize:11,color:TEXT_LIGHT}}>
        Powered by Samil Fazlic
      </div>
    </div>
  );
}
