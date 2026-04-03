import { useState, useEffect, useMemo, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */
const C = {
  line1: "ISLAMSKA ZAJEDNICA BOŠNJAKA U NJEMAČKOJ",
  line2: "MEDŽLIS ISLAMSKE ZAJEDNICE BAYERN",
  line3: "Džemat Tevhid",
  welcome1: "Islamska zajednica Bošnjaka u Njemačkoj",
  welcome2: "Dobrodošli u džemat Tevhid",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function toH(d){const gd=d.getDate(),gm=d.getMonth()+1,gy=d.getFullYear();let jd=Math.floor((1461*(gy+4800+Math.floor((gm-14)/12)))/4)+Math.floor((367*(gm-2-12*Math.floor((gm-14)/12)))/12)-Math.floor((3*Math.floor((gy+4900+Math.floor((gm-14)/12))/100))/4)+gd-32075;const l=jd-1948440+10632,n=Math.floor((l-1)/10631),lp=l-10631*n+354,j=Math.floor((10985-lp)/5316)*Math.floor((50*lp)/17719)+Math.floor(lp/5670)*Math.floor((43*lp)/15238),lpp=lp-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29,hm=Math.floor((24*lpp)/709),hd=lpp-Math.floor((709*hm)/24),hy=30*n+j-30;const nm=["Muharrem","Safer","Rebi'u-l-evvel","Rebi'u-l-ahir","Džumade-l-ula","Džumade-l-ahira","Redžeb","Ša'ban","Ramazan","Ševval","Zu-l-ka'de","Zu-l-hidždže"];return{d:hd,mn:nm[hm-1]||"",y:hy};}

function loc(date,lat,lng){const D=Math.PI/180,R=180/Math.PI,s=d=>Math.sin(d*D),c=d=>Math.cos(d*D),t=d=>Math.tan(d*D);const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();const ay=m<=2?y-1:y,am=m<=2?m+12:m,A=Math.floor(ay/100),B=2-A+Math.floor(A/4);const jd=Math.floor(365.25*(ay+4716))+Math.floor(30.6001*(am+1))+d+B-1524.5,DD=jd-2451545,g=(357.529+.98560028*DD)%360,q=(280.459+.98564736*DD)%360,L=(q+1.915*s(g)+.02*s(2*g))%360,e=23.439-.00000036*DD,RA=Math.atan2(c(e)*s(L),c(L))*R/15,decl=Math.asin(s(e)*s(L))*R;let EqT=q/15-((RA+360)%24);if(EqT>12)EqT-=24;const tz=new Date().getTimezoneOffset()/-60,dh=12+tz-lng/15-EqT;const ha=a=>{const v=(s(a)-s(lat)*s(decl))/(c(lat)*c(decl));return v>1||v<-1?NaN:Math.acos(v)*R/15;};const f=h=>{if(isNaN(h))return"--:--";let hr=Math.floor(h),mn=Math.round((h-hr)*60);if(mn>=60){hr++;mn=0;}if(hr>=24)hr-=24;return`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};return{Fajr:f(dh-ha(-18)),Sunrise:f(dh-ha(-.833)),Dhuhr:f(dh),Asr:f(dh+ha(R*Math.atan(1/(1+t(Math.abs(lat-decl)))))),Maghrib:f(dh+ha(-.833)),Isha:f(dh+ha(-17))};}

const cl=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toM=t=>{if(!t||t==="--:--")return 0;const[h,m]=cl(t).split(":").map(Number);return h*60+m;};

const MO=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DA=["N","P","U","S","Č","P","S"]; // Nedjelja first (index 0 = Sunday)

/* ═══════════════════════════════════════════════════════════════
   COLORS — exact from photo
   ═══════════════════════════════════════════════════════════════ */
const GREEN = "#3a8f47";       // primary green from photo
const GREEN_DARK = "#2d7a3a";  // darker shade
const GREEN_BG = "#43a047";    // banner green
const TEXT = "#222";
const TEXT_MED = "#555";
const TEXT_LIGHT = "#999";
const CARD = "rgba(255,255,255,0.65)";
const CARD_SOLID = "#fff";
const SHADOW = "0 1px 8px rgba(0,0,0,0.08)";
const BORDER = "rgba(0,0,0,0.06)";

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function App(){
  const[now,setNow]=useState(new Date());
  const[times,setTimes]=useState(null);
  const ld=useRef("");

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);

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

  // Next prayer
  const nxt=useMemo(()=>{
    if(!times)return{n:"...",cd:"--:--:--"};
    const s=[{k:"Fajr",n:"Sabah-namaz"},{k:"Sunrise",n:"Izlazak sunca"},{k:"Dhuhr",n:"Podne-namaz"},{k:"Asr",n:"Ikindija-namaz"},{k:"Maghrib",n:"Akšam-namaz"},{k:"Isha",n:"Jacija-namaz"}];
    for(const p of s){const m=toM(times[p.k]);if(m>nM){const d=m-nM,ts=d*60-now.getSeconds(),h=Math.floor(ts/3600),mn=Math.floor((ts%3600)/60),sc=ts%60;return{n:p.n,cd:`${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(Math.max(0,sc)).padStart(2,"0")}`};}}
    return{n:"Sabah-namaz",cd:"--:--:--"};
  },[now,times]);

  // Active prayer
  const act=useMemo(()=>{if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nM<toM(times[k]))break;a=k;}return a;},[now,times]);

  const hh=String(now.getHours()).padStart(2,"0");
  const mi=String(now.getMinutes()).padStart(2,"0");
  const ss=String(now.getSeconds()).padStart(2,"0");
  const dateStr=`${String(now.getDate()).padStart(2,"0")}. ${MO[now.getMonth()]} ${now.getFullYear()}.`;
  const hijStr1=`${hij.d}. ${hij.mn}`;
  const hijStr2=`${hij.y}.`;
  const todayIdx=now.getDay(); // 0=Sunday

  const prayers=times?[
    {k:"Fajr",bs:"Zora",ar:"إمساك",t:cl(times.Fajr)},
    {k:"Sunrise",bs:"Iz. sunca",ar:"الشروق",t:cl(times.Sunrise)},
    {k:"Dhuhr",bs:"Podne",ar:"الظهر",t:cl(times.Dhuhr)},
    {k:"Asr",bs:"Ikindija",ar:"العصر",t:cl(times.Asr)},
    {k:"Maghrib",bs:"Akšam",ar:"المغرب",t:cl(times.Maghrib)},
    {k:"Isha",bs:"Jacija",ar:"العشاء",t:cl(times.Isha)},
  ]:[];

  /* ═══════ RENDER ═══════ */
  return(
    <div style={{
      width:"100%",height:"100vh",overflow:"hidden",
      fontFamily:"'Outfit',sans-serif",color:TEXT,
      position:"relative",display:"flex",flexDirection:"column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
      `}</style>

      {/* BG Pattern */}
      <div style={{position:"absolute",inset:0,backgroundImage:"url(/pattern-bg.jpg)",backgroundSize:"cover",backgroundPosition:"center"}}/>

      {/* Main container */}
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",padding:"24px 28px 12px"}}>

        {/* ═══════════════════════════════════════
            LEFT SIDE — 52%
            ═══════════════════════════════════════ */}
        <div style={{flex:"0 0 52%",display:"flex",flexDirection:"column",paddingRight:20}}>

          {/* ── Header: Crescent + Mosque Name ── */}
          <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:18}}>
            {/* Crescent + Star */}
            <svg width="36" height="36" viewBox="0 0 50 50" style={{flexShrink:0,marginTop:2}}>
              <circle cx="19" cy="24" r="14" fill="none" stroke={GREEN_DARK} strokeWidth="2.2"/>
              <circle cx="26" cy="24" r="12.5" fill="#d5cebe"/>
              <polygon points="39,10 40.8,14.5 45.5,14.5 41.8,17.5 43.2,22 39,19 34.8,22 36.2,17.5 32.5,14.5 37.2,14.5" fill={GREEN_DARK}/>
            </svg>
            <div style={{lineHeight:1.35}}>
              <div style={{fontSize:12.5,fontWeight:700,color:GREEN_DARK,letterSpacing:".03em"}}>{C.line1}</div>
              <div style={{fontSize:11,fontWeight:600,color:TEXT_MED,letterSpacing:".02em"}}>{C.line2}</div>
              <div style={{fontSize:14,fontWeight:500,color:GREEN,fontStyle:"italic",marginTop:2}}>{C.line3}</div>
            </div>
          </div>

          {/* ── Clock Card ── */}
          <div style={{
            background:CARD_SOLID,borderRadius:12,
            padding:"20px 0",textAlign:"center",
            boxShadow:SHADOW,marginBottom:14,
            border:`1px solid ${BORDER}`,
          }}>
            <div style={{
              fontSize:68,fontWeight:600,
              fontFamily:"'JetBrains Mono',monospace",
              color:TEXT,letterSpacing:"-0.03em",lineHeight:1,
            }}>
              {hh}:{mi}<span style={{fontSize:42,fontWeight:400,color:TEXT_MED}}>{ss}</span>
            </div>
          </div>

          {/* ── Weekday Pills ── */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:14}}>
            {DA.map((d,i)=>{
              const isToday=i===todayIdx;
              return(
                <div key={i} style={{
                  width:34,height:34,borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:isToday?700:500,
                  background:isToday?GREEN_BG:"transparent",
                  color:isToday?"#fff":TEXT_LIGHT,
                  border:isToday?"none":`1.5px solid ${BORDER}`,
                }}>{d}</div>
              );
            })}
          </div>

          {/* ── Date Badges ── */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:18}}>
            {/* Gregorian — green badge */}
            <div style={{
              background:GREEN_BG,color:"#fff",borderRadius:8,
              padding:"8px 22px",fontSize:14,fontWeight:600,
            }}>{dateStr}</div>
            {/* Hijri — white badge */}
            <div style={{
              background:CARD_SOLID,borderRadius:8,
              padding:"8px 22px",fontSize:14,fontWeight:600,color:TEXT,
              border:`1px solid ${BORDER}`,boxShadow:SHADOW,
              textAlign:"center",lineHeight:1.3,
            }}>{hijStr1}<br/>{hijStr2}</div>
          </div>

          {/* ── Countdown ── */}
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{fontSize:14,fontWeight:500,color:TEXT_MED,marginBottom:4}}>{nxt.n}</div>
            <div style={{
              fontSize:50,fontWeight:700,
              fontFamily:"'JetBrains Mono',monospace",
              color:GREEN,letterSpacing:"-0.02em",lineHeight:1,
            }}>{nxt.cd}</div>
          </div>

          {/* ── Welcome Banner ── */}
          <div style={{
            marginTop:"auto",
            background:GREEN_BG,borderRadius:10,
            padding:"12px 20px",textAlign:"center",
          }}>
            <div style={{fontSize:13,fontWeight:600,color:"#fff",lineHeight:1.6}}>
              {C.welcome1}<br/>{C.welcome2}
            </div>
          </div>
        </div>

        {/* ── Vertical Divider ── */}
        <div style={{width:1,background:"rgba(0,0,0,0.06)",margin:"0 8px",flexShrink:0}}/>

        {/* ═══════════════════════════════════════
            RIGHT SIDE — 48%
            ═══════════════════════════════════════ */}
        <div style={{flex:1,display:"flex",flexDirection:"column",paddingLeft:12}}>

          {/* ── Green Header ── */}
          <div style={{
            background:GREEN_BG,borderRadius:"10px 10px 0 0",
            padding:"12px 24px",textAlign:"center",
          }}>
            <div style={{fontSize:18,fontWeight:800,color:"#fff",letterSpacing:".1em"}}>VRIJEME NAMAZA</div>
          </div>

          {/* ── Prayer Rows ── */}
          <div style={{
            background:CARD,borderRadius:"0 0 10px 10px",
            border:`1px solid ${BORDER}`,borderTop:"none",
            boxShadow:SHADOW,flex:1,
            display:"flex",flexDirection:"column",
          }}>
            {prayers.map((p,i)=>{
              const isA=p.k!=="Sunrise"&&act===p.k;
              return(
                <div key={p.k} style={{
                  flex:1,display:"flex",alignItems:"center",
                  padding:"0 28px",
                  borderBottom:i<prayers.length-1?`1px solid rgba(0,0,0,0.05)`:"none",
                  background:isA?"rgba(67,160,71,0.06)":"transparent",
                }}>
                  {/* Bosnian name */}
                  <div style={{
                    width:100,fontSize:16,
                    fontWeight:isA?600:400,
                    color:isA?GREEN_DARK:TEXT,
                  }}>{p.bs}</div>

                  {/* Time */}
                  <div style={{flex:1,textAlign:"center"}}>
                    <span style={{
                      fontSize:42,fontWeight:800,
                      fontFamily:"'JetBrains Mono',monospace",
                      color:isA?GREEN_DARK:TEXT,
                      letterSpacing:"-0.02em",
                    }}>{p.t}</span>
                  </div>

                  {/* Arabic */}
                  <div style={{
                    width:70,textAlign:"right",
                    fontSize:20,fontFamily:"'Amiri',serif",
                    color:TEXT_LIGHT,direction:"rtl",
                  }}>{p.ar}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ Footer ═══════ */}
      <div style={{
        position:"relative",zIndex:1,textAlign:"center",
        padding:"4px 0 10px",fontSize:10,color:TEXT_LIGHT,
      }}>Powered by Samil Fazlic</div>
    </div>
  );
}
