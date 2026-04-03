import { useState, useEffect, useMemo, useRef } from "react";

// ============================================================
// CONFIG
// ============================================================
const MOSQUE = {
  line1: "ISLAMSKA ZAJEDNICA BOŠNJAKA U NJEMAČKOJ",
  line2: "MEDŽLIS ISLAMSKE ZAJEDNICE BAYERN",
  line3: "Džemat Tevhid",
  welcomeLine1: "Islamska zajednica Bošnjaka u Njemačkoj",
  welcomeLine2: "Dobrodošli u džemat Tevhid",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
};

// HIJRI
function toHijri(d){const gd=d.getDate(),gm=d.getMonth()+1,gy=d.getFullYear();let jd=Math.floor((1461*(gy+4800+Math.floor((gm-14)/12)))/4)+Math.floor((367*(gm-2-12*Math.floor((gm-14)/12)))/12)-Math.floor((3*Math.floor((gy+4900+Math.floor((gm-14)/12))/100))/4)+gd-32075;const l=jd-1948440+10632,n=Math.floor((l-1)/10631),lp=l-10631*n+354,j=Math.floor((10985-lp)/5316)*Math.floor((50*lp)/17719)+Math.floor(lp/5670)*Math.floor((43*lp)/15238),lpp=lp-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29,hm=Math.floor((24*lpp)/709),hd=lpp-Math.floor((709*hm)/24),hy=30*n+j-30;const names=["Muharrem","Safer","Rebi'u-l-evvel","Rebi'u-l-ahir","Džumade-l-ula","Džumade-l-ahira","Redžeb","Ša'ban","Ramazan","Ševval","Zu-l-ka'de","Zu-l-hidždže"];return{day:hd,month:hm,monthName:names[hm-1]||"",year:hy};}

// LOCAL FALLBACK
function localCalc(date,lat,lng){const D=Math.PI/180,R=180/Math.PI,s=d=>Math.sin(d*D),c=d=>Math.cos(d*D),t=d=>Math.tan(d*D);const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();const ay=m<=2?y-1:y,am=m<=2?m+12:m,A=Math.floor(ay/100),B=2-A+Math.floor(A/4);const jd=Math.floor(365.25*(ay+4716))+Math.floor(30.6001*(am+1))+d+B-1524.5,DD=jd-2451545,g=(357.529+.98560028*DD)%360,q=(280.459+.98564736*DD)%360,L=(q+1.915*s(g)+.02*s(2*g))%360,e=23.439-.00000036*DD,RA=Math.atan2(c(e)*s(L),c(L))*R/15,decl=Math.asin(s(e)*s(L))*R;let EqT=q/15-((RA+360)%24);if(EqT>12)EqT-=24;const tz=new Date().getTimezoneOffset()/-60,dh=12+tz-lng/15-EqT;const ha=a=>{const v=(s(a)-s(lat)*s(decl))/(c(lat)*c(decl));return v>1||v<-1?NaN:Math.acos(v)*R/15;};const f=h=>{if(isNaN(h))return"--:--";let hr=Math.floor(h),mn=Math.round((h-hr)*60);if(mn>=60){hr++;mn=0;}if(hr>=24)hr-=24;return`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};return{Fajr:f(dh-ha(-18)),Sunrise:f(dh-ha(-.833)),Dhuhr:f(dh),Asr:f(dh+ha(R*Math.atan(1/(1+t(Math.abs(lat-decl)))))),Maghrib:f(dh+ha(-.833)),Isha:f(dh+ha(-17))};}

const clean=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toMin=t=>{if(!t||t==="--:--")return 0;const[h,m]=clean(t).split(":").map(Number);return h*60+m;};

const MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DAYS_SHORT = ["N","P","U","S","Č","P","S"];

// ============================================================
// CRESCENT + STAR SVG
// ============================================================
function CrescentStar({size=40}){
  return(
    <svg width={size} height={size} viewBox="0 0 50 50" style={{flexShrink:0}}>
      <circle cx="20" cy="24" r="15" fill="none" stroke="#2E7D32" strokeWidth="2"/>
      <circle cx="27" cy="24" r="13.5" fill="#ddd8c8"/>
      <polygon points="40,10 41.8,15 47,15 42.8,18 44.5,23 40,20 35.5,23 37.2,18 33,15 38.2,15" fill="#2E7D32"/>
    </svg>
  );
}

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

  const next=useMemo(()=>{
    if(!times)return{name:"...",cd:"--:--:--"};
    const o=[{k:"Fajr",n:"Sabah-namaz"},{k:"Sunrise",n:"Izlazak sunca"},{k:"Dhuhr",n:"Podne-namaz"},{k:"Asr",n:"Ikindija-namaz"},{k:"Maghrib",n:"Akšam-namaz"},{k:"Isha",n:"Jacija-namaz"}];
    for(const p of o){const m=toMin(times[p.k]);if(m>nowM){const diff=m-nowM;const ts=diff*60-now.getSeconds();const dh=Math.floor(ts/3600),dm=Math.floor((ts%3600)/60),ds=ts%60;return{name:p.n,cd:`${String(dh).padStart(2,"0")}:${String(dm).padStart(2,"0")}:${String(Math.max(0,ds)).padStart(2,"0")}`};}}
    return{name:"Sabah-namaz",cd:"--:--:--"};
  },[now,times]);

  const active=useMemo(()=>{
    if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nowM<toMin(times[k]))break;a=k;}return a;
  },[now,times]);

  const hh=String(now.getHours()).padStart(2,"0");
  const mm=String(now.getMinutes()).padStart(2,"0");
  const ss=String(now.getSeconds()).padStart(2,"0");
  const dateStr=`${String(now.getDate()).padStart(2,"0")}. ${MONTHS[now.getMonth()]} ${now.getFullYear()}.`;
  const hijriStr=`${hijri.day}. ${hijri.monthName}\n${hijri.year}.`;
  const todayIdx=now.getDay();

  const prayers=times?[
    {bs:"Zora",ar:"إمساك",t:clean(times.Fajr),k:"Fajr"},
    {bs:"Iz. sunca",ar:"الشروق",t:clean(times.Sunrise),k:"Sunrise"},
    {bs:"Podne",ar:"الظهر",t:clean(times.Dhuhr),k:"Dhuhr"},
    {bs:"Ikindija",ar:"العصر",t:clean(times.Asr),k:"Asr"},
    {bs:"Akšam",ar:"المغرب",t:clean(times.Maghrib),k:"Maghrib"},
    {bs:"Jacija",ar:"العشاء",t:clean(times.Isha),k:"Isha"},
  ]:[];

  // Shared shadow
  const cardShadow = "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)";
  const cardBg = "rgba(255,255,255,0.62)";
  const G = "#2E7D32";
  const GD = "#1B5E20";
  const GL = "#43A047";

  return(
    <div style={{
      position:"relative",width:"100%",height:"100vh",overflow:"hidden",
      fontFamily:"'Outfit',sans-serif",color:"#2a2a2a",
      display:"flex",flexDirection:"column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        @keyframes countPulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{margin:0;padding:0;box-sizing:border-box}
      `}</style>

      {/* BG pattern */}
      <div style={{position:"absolute",inset:0,backgroundImage:"url(/pattern-bg.jpg)",backgroundSize:"cover",backgroundPosition:"center"}}/>

      {/* Main layout */}
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",padding:"28px 32px 16px",gap:28}}>

        {/* ========== LEFT PANEL ========== */}
        <div style={{flex:"1 1 55%",display:"flex",flexDirection:"column"}}>

          {/* Header: Crescent + Name */}
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:24}}>
            <CrescentStar size={42}/>
            <div>
              <div style={{fontSize:13.5,fontWeight:700,color:GD,letterSpacing:".03em",lineHeight:1.35}}>{MOSQUE.line1}</div>
              <div style={{fontSize:11.5,fontWeight:600,color:"#5a5a5a",letterSpacing:".02em",lineHeight:1.35}}>{MOSQUE.line2}</div>
              <div style={{fontSize:15,fontWeight:500,color:G,fontStyle:"italic",marginTop:3,letterSpacing:".01em"}}>{MOSQUE.line3}</div>
            </div>
          </div>

          {/* Clock card */}
          <div style={{
            background:cardBg,backdropFilter:"blur(8px)",
            borderRadius:14,padding:"24px 0",textAlign:"center",
            boxShadow:cardShadow,marginBottom:20,
            border:"1px solid rgba(255,255,255,0.5)",
          }}>
            <div style={{
              fontSize:76,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",
              color:"#1a1a1a",letterSpacing:"-0.03em",lineHeight:1,
            }}>
              {hh}:{mm}<span style={{fontSize:52,fontWeight:500,color:"#555"}}>{ss}</span>
            </div>
          </div>

          {/* Day pills row */}
          <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:18}}>
            {DAYS_SHORT.map((d,i)=>(
              <div key={i} style={{
                width:38,height:38,borderRadius:"50%",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:14,fontWeight:i===todayIdx?800:500,
                background:i===todayIdx?G:"transparent",
                color:i===todayIdx?"#fff":"#888",
                boxShadow:i===todayIdx?"0 2px 8px rgba(46,125,50,0.35)":"none",
                border:i===todayIdx?"none":"1.5px solid rgba(0,0,0,0.08)",
                transition:"all .3s",
              }}>{d}</div>
            ))}
          </div>

          {/* Date badges */}
          <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:24}}>
            <div style={{
              background:G,color:"#fff",borderRadius:10,padding:"10px 24px",
              fontSize:15,fontWeight:700,boxShadow:"0 2px 8px rgba(46,125,50,0.3)",
              letterSpacing:".01em",
            }}>{dateStr}</div>
            <div style={{
              background:cardBg,backdropFilter:"blur(6px)",
              border:"1.5px solid rgba(0,0,0,0.08)",borderRadius:10,
              padding:"10px 24px",fontSize:15,fontWeight:700,color:"#2a2a2a",
              boxShadow:cardShadow,textAlign:"center",lineHeight:1.3,
            }}>{hijri.day}. {hijri.monthName}<br/>{hijri.year}.</div>
          </div>

          {/* Next prayer countdown */}
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:15,fontWeight:500,color:"#666",marginBottom:4}}>{next.name}</div>
            <div style={{
              fontSize:54,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",
              color:G,letterSpacing:"-0.02em",lineHeight:1,
              animation:"countPulse 2s ease-in-out infinite",
            }}>{next.cd}</div>
          </div>

          {/* Welcome banner */}
          <div style={{
            background:G,borderRadius:12,padding:"14px 24px",textAlign:"center",
            boxShadow:"0 3px 12px rgba(46,125,50,0.3)",
            marginTop:"auto",
          }}>
            <div style={{fontSize:14,fontWeight:600,color:"#fff",lineHeight:1.6}}>
              {MOSQUE.welcomeLine1}<br/>{MOSQUE.welcomeLine2}
            </div>
          </div>
        </div>

        {/* ========== RIGHT PANEL: Prayer Times ========== */}
        <div style={{flex:"0 0 400px",display:"flex",flexDirection:"column"}}>

          {/* Green header */}
          <div style={{
            background:`linear-gradient(135deg, ${GD}, ${GL})`,
            borderRadius:"14px 14px 0 0",padding:"14px 28px",textAlign:"center",
            boxShadow:"0 3px 10px rgba(46,125,50,0.25)",
          }}>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",letterSpacing:".1em"}}>VRIJEME NAMAZA</div>
          </div>

          {/* Prayer rows */}
          <div style={{
            background:cardBg,backdropFilter:"blur(8px)",
            borderRadius:"0 0 14px 14px",
            border:"1px solid rgba(255,255,255,0.5)",
            borderTop:"none",
            boxShadow:cardShadow,
            overflow:"hidden",flex:1,display:"flex",flexDirection:"column",
          }}>
            {prayers.map((p,i)=>{
              const isActive = (p.k==="Fajr"||p.k==="Dhuhr"||p.k==="Asr"||p.k==="Maghrib"||p.k==="Isha") && active===p.k;
              return(
                <div key={p.k} style={{
                  flex:1,display:"flex",alignItems:"center",
                  padding:"0 28px",
                  borderBottom:i<prayers.length-1?"1px solid rgba(0,0,0,0.06)":"none",
                  background:isActive?"rgba(46,125,50,0.06)":"transparent",
                  transition:"background .4s",
                }}>
                  {/* Bosnian name */}
                  <div style={{
                    width:95,fontSize:16,fontWeight:isActive?700:500,
                    color:isActive?G:"#444",
                  }}>{p.bs}</div>

                  {/* Time — big and bold */}
                  <div style={{flex:1,textAlign:"center"}}>
                    <span style={{
                      fontSize:42,fontWeight:800,
                      fontFamily:"'JetBrains Mono',monospace",
                      color:isActive?GD:"#1a1a1a",
                      letterSpacing:"-0.02em",
                    }}>{p.t}</span>
                  </div>

                  {/* Arabic name */}
                  <div style={{
                    width:70,textAlign:"right",
                    fontSize:22,fontFamily:"'Amiri',serif",
                    color:isActive?"#555":"#888",
                    direction:"rtl",
                  }}>{p.ar}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position:"relative",zIndex:1,textAlign:"center",
        padding:"8px 32px 12px",fontSize:11,fontWeight:400,color:"#aaa",
      }}>
        Powered by Samil Fazlic
      </div>
    </div>
  );
}
