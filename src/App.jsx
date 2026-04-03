import { useState, useEffect, useMemo, useRef } from "react";

const C = {
  name: "Džemat Tevhid",
  org: "Islamska zajednica Bošnjaka u Njemačkoj",
  sub: "Medžlis IZ Bayern",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
  iqama: { Fajr:30, Dhuhr:15, Asr:15, Maghrib:7, Isha:15 },
  jumuah: { salat:"13:30", khutba:"13:00" },
  flash: [
    "Džuma-namaz petkom u 13:30h · Hutba u 13:00h",
    "Kur'anski kurs za djecu — subotom u 10:00h",
    "Dobrodošli u naš džemat · Willkommen in unserer Gemeinde",
  ],
};

function toH(d){const gd=d.getDate(),gm=d.getMonth()+1,gy=d.getFullYear();let jd=Math.floor((1461*(gy+4800+Math.floor((gm-14)/12)))/4)+Math.floor((367*(gm-2-12*Math.floor((gm-14)/12)))/12)-Math.floor((3*Math.floor((gy+4900+Math.floor((gm-14)/12))/100))/4)+gd-32075;const l=jd-1948440+10632,n=Math.floor((l-1)/10631),lp=l-10631*n+354,j=Math.floor((10985-lp)/5316)*Math.floor((50*lp)/17719)+Math.floor(lp/5670)*Math.floor((43*lp)/15238),lpp=lp-Math.floor((30-j)/15)*Math.floor((17719*j)/50)-Math.floor(j/16)*Math.floor((15238*j)/43)+29,hm=Math.floor((24*lpp)/709),hd=lpp-Math.floor((709*hm)/24),hy=30*n+j-30;const nm=["Muharrem","Safer","Rebi'u-l-evvel","Rebi'u-l-ahir","Džumade-l-ula","Džumade-l-ahira","Redžeb","Ša'ban","Ramazan","Ševval","Zu-l-ka'de","Zu-l-hidždže"];return{d:hd,mn:nm[hm-1]||"",y:hy};}

function loc(date,lat,lng){const D=Math.PI/180,R=180/Math.PI,s=d=>Math.sin(d*D),c=d=>Math.cos(d*D),t=d=>Math.tan(d*D);const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();const ay=m<=2?y-1:y,am=m<=2?m+12:m,A=Math.floor(ay/100),B=2-A+Math.floor(A/4);const jd=Math.floor(365.25*(ay+4716))+Math.floor(30.6001*(am+1))+d+B-1524.5,DD=jd-2451545,g=(357.529+.98560028*DD)%360,q=(280.459+.98564736*DD)%360,L=(q+1.915*s(g)+.02*s(2*g))%360,e=23.439-.00000036*DD,RA=Math.atan2(c(e)*s(L),c(L))*R/15,decl=Math.asin(s(e)*s(L))*R;let EqT=q/15-((RA+360)%24);if(EqT>12)EqT-=24;const tz=new Date().getTimezoneOffset()/-60,dh=12+tz-lng/15-EqT;const ha=a=>{const v=(s(a)-s(lat)*s(decl))/(c(lat)*c(decl));return v>1||v<-1?NaN:Math.acos(v)*R/15;};const f=h=>{if(isNaN(h))return"--:--";let hr=Math.floor(h),mn=Math.round((h-hr)*60);if(mn>=60){hr++;mn=0;}if(hr>=24)hr-=24;return`${String(hr).padStart(2,"0")}:${String(mn).padStart(2,"0")}`;};return{Fajr:f(dh-ha(-18)),Sunrise:f(dh-ha(-.833)),Dhuhr:f(dh),Asr:f(dh+ha(R*Math.atan(1/(1+t(Math.abs(lat-decl)))))),Maghrib:f(dh+ha(-.833)),Isha:f(dh+ha(-17))};}

const cl=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toM=t=>{if(!t||t==="--:--")return 0;const[h,m]=cl(t).split(":").map(Number);return h*60+m;};
const addM=(t,m)=>{if(!t||t==="--:--")return"--:--";const[h,mn]=cl(t).split(":").map(Number);const tot=h*60+mn+m;return`${String(Math.floor(tot/60)%24).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

export default function App(){
  const[now,setNow]=useState(new Date());
  const[times,setTimes]=useState(null);
  const[fi,setFi]=useState(0);
  const[fa,setFa]=useState(true);
  const ld=useRef("");

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setInterval(()=>{setFa(false);setTimeout(()=>{setFi(i=>(i+1)%C.flash.length);setFa(true);},500);},9000);return()=>clearInterval(t);},[]);

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
    // Find previous and next for progress
    let prevM=0,nextM=0,nextName="Sabah";
    for(let i=0;i<s.length;i++){
      const m=toM(times[s[i].k]);
      if(m>nM){nextM=m;nextName=s[i].n;prevM=i>0?toM(times[s[i-1].k]):0;break;}
    }
    const d=nextM-nM,ts=d*60-now.getSeconds();
    const h=Math.floor(ts/3600),mn=Math.floor((ts%3600)/60),sc=ts%60;
    const totalSpan=nextM-prevM||1;
    const elapsed=nM-prevM;
    const pct=Math.min(100,Math.max(0,(elapsed/totalSpan)*100));
    return{n:nextName,cd:`${String(h).padStart(2,"0")}:${String(mn).padStart(2,"0")}:${String(Math.max(0,sc)).padStart(2,"0")}`,pct};
  },[now,times]);

  const act=useMemo(()=>{if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nM<toM(times[k]))break;a=k;}return a;},[now,times]);

  const hh=String(now.getHours()).padStart(2,"0");
  const mi=String(now.getMinutes()).padStart(2,"0");
  const ss=String(now.getSeconds()).padStart(2,"0");
  const MO=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const DB=["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"];

  const prayers=times?[
    {k:"Fajr",bs:"Sabah",ar:"الفجر",t:cl(times.Fajr),iq:addM(cl(times.Fajr),C.iqama.Fajr)},
    {k:"Sunrise",bs:"Izlazak sunca",ar:"الشروق",t:cl(times.Sunrise),iq:null},
    {k:"Dhuhr",bs:"Podne",ar:"الظهر",t:cl(times.Dhuhr),iq:addM(cl(times.Dhuhr),C.iqama.Dhuhr)},
    {k:"Asr",bs:"Ikindija",ar:"العصر",t:cl(times.Asr),iq:addM(cl(times.Asr),C.iqama.Asr)},
    {k:"Maghrib",bs:"Akšam",ar:"المغرب",t:cl(times.Maghrib),iq:addM(cl(times.Maghrib),C.iqama.Maghrib)},
    {k:"Isha",bs:"Jacija",ar:"العشاء",t:cl(times.Isha),iq:addM(cl(times.Isha),C.iqama.Isha)},
  ]:[];

  // Accent color for active prayer
  const emerald = "#34d399";
  const emeraldDim = "rgba(52,211,153,";

  return(
    <div style={{width:"100%",height:"100vh",overflow:"hidden",position:"relative",fontFamily:"'Outfit',sans-serif",color:"#e8ebe4"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800&family=JetBrains+Mono:wght@100;200;300;400;500;600;700&family=Amiri:wght@400;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}

        .scene{position:fixed;inset:0;background:#080b12;overflow:hidden}
        .scene::after{content:'';position:absolute;inset:0;background:
          radial-gradient(ellipse 800px 600px at 15% 20%, rgba(52,211,153,.07), transparent),
          radial-gradient(ellipse 600px 500px at 85% 75%, rgba(99,102,241,.05), transparent),
          radial-gradient(ellipse 400px 400px at 50% 50%, rgba(255,255,255,.01), transparent);
        }

        .line-h{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)}
        .line-v{width:1px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.06),transparent)}

        .mono{font-family:'JetBrains Mono',monospace}
        .serif{font-family:'Amiri',serif}

        .colon-blink{animation:cb 2s ease-in-out infinite}
        @keyframes cb{0%,100%{opacity:.8}50%{opacity:.2}}

        .count-gradient{
          background:linear-gradient(135deg,#34d399 0%,#6ee7b7 50%,#34d399 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;
          animation:gradShift 4s ease infinite;
        }
        @keyframes gradShift{0%,100%{background-position:0% center}50%{background-position:200% center}}

        .prayer-enter{animation:prayerIn .7s cubic-bezier(.22,1,.36,1) both}
        @keyframes prayerIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

        .progress-track{position:relative;height:3px;border-radius:2px;background:rgba(255,255,255,.04);overflow:hidden}
        .progress-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,rgba(52,211,153,.3),rgba(52,211,153,.8));transition:width 1s linear}

        .fade-text{transition:opacity .6s ease,transform .6s ease}
      `}</style>

      <div className="scene"/>

      <div style={{position:"relative",zIndex:2,height:"100%",display:"grid",gridTemplateRows:"auto 1fr auto",padding:"28px 52px 20px"}}>

        {/* ═══════ HEADER ═══════ */}
        <header style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",paddingBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:18}}>
            <img src="/logo-bkz.png" alt="" style={{height:34,filter:"invert(1)",opacity:.5}}/>
            <div>
              <div style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,.2)",letterSpacing:".2em",textTransform:"uppercase"}}>{C.org}</div>
              <div style={{fontSize:28,fontWeight:700,letterSpacing:".01em",marginTop:2}}>{C.name}</div>
            </div>
          </div>
          <div style={{textAlign:"right",lineHeight:1.6}}>
            <span style={{fontSize:13,fontWeight:300,color:"rgba(255,255,255,.3)"}}>{DB[now.getDay()]}, {now.getDate()}. {MO[now.getMonth()]} {now.getFullYear()}</span>
            <br/>
            <span className="serif" style={{fontSize:16,fontWeight:400,color:emeraldDim+".5)"}}>{hij.d}. {hij.mn} {hij.y}.</span>
          </div>
        </header>

        <div className="line-h"/>

        {/* ═══════ BODY ═══════ */}
        <main style={{display:"grid",gridTemplateColumns:"1fr 1px 1.1fr",gap:0,alignItems:"center",padding:"20px 0"}}>

          {/* LEFT — Clock + Countdown */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 20px"}}>

            {/* Time */}
            <div className="mono" style={{textAlign:"center",lineHeight:.85}}>
              <span style={{fontSize:140,fontWeight:100,letterSpacing:"-0.07em",color:"rgba(255,255,255,.92)"}}>{hh}</span>
              <span className="colon-blink" style={{fontSize:110,fontWeight:100,color:emeraldDim+".4)",margin:"0 -6px"}}>:</span>
              <span style={{fontSize:140,fontWeight:100,letterSpacing:"-0.07em",color:"rgba(255,255,255,.92)"}}>{mi}</span>
            </div>
            <div className="mono" style={{fontSize:36,fontWeight:100,color:"rgba(255,255,255,.12)",marginTop:4,letterSpacing:".1em"}}>{ss}</div>

            {/* Progress bar */}
            <div className="progress-track" style={{width:200,marginTop:28}}>
              <div className="progress-fill" style={{width:`${nxt.pct}%`}}/>
            </div>

            {/* Next prayer label */}
            <div style={{marginTop:14,textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,.18)",textTransform:"uppercase",letterSpacing:".25em"}}>{nxt.n}</div>
              <div className="mono count-gradient" style={{fontSize:52,fontWeight:600,letterSpacing:"-0.04em",marginTop:6}}>{nxt.cd}</div>
            </div>

            {/* Jumuah */}
            <div style={{marginTop:36,display:"flex",gap:40,alignItems:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:500,letterSpacing:".2em",color:"rgba(255,255,255,.15)",textTransform:"uppercase"}}>Hutba</div>
                <div className="mono" style={{fontSize:26,fontWeight:200,color:"rgba(255,255,255,.4)",marginTop:4}}>{C.jumuah.khutba}</div>
              </div>
              <div style={{width:1,height:32,background:"rgba(255,255,255,.06)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:500,letterSpacing:".2em",color:"rgba(255,255,255,.15)",textTransform:"uppercase"}}>Džuma</div>
                <div className="mono" style={{fontSize:26,fontWeight:500,color:"rgba(255,255,255,.75)",marginTop:4}}>{C.jumuah.salat}</div>
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="line-v" style={{height:"80%",alignSelf:"center"}}/>

          {/* RIGHT — Prayer List */}
          <div style={{padding:"0 24px 0 40px",display:"flex",flexDirection:"column",justifyContent:"center",gap:0}}>

            {prayers.map((p,i)=>{
              const isA=p.k!=="Sunrise"&&act===p.k;
              const isSunrise=p.k==="Sunrise";
              return(
                <div key={p.k} className="prayer-enter" style={{
                  display:"grid",gridTemplateColumns:"1fr auto auto",
                  alignItems:"baseline",
                  padding:"18px 0",
                  borderBottom:i<prayers.length-1?"1px solid rgba(255,255,255,.03)":"none",
                  animationDelay:`${.15+i*.08}s`,
                  opacity:isSunrise?.4:1,
                }}>
                  {/* Name cluster */}
                  <div style={{display:"flex",alignItems:"baseline",gap:12}}>
                    {isA && <div style={{width:6,height:6,borderRadius:3,background:emerald,boxShadow:`0 0 12px ${emeraldDim}.5)`,flexShrink:0,alignSelf:"center"}}/>}
                    <span style={{
                      fontSize:isA?22:19,
                      fontWeight:isA?600:300,
                      color:isA?emerald:"rgba(255,255,255,.5)",
                      transition:"all .5s ease",
                    }}>{p.bs}</span>
                    <span className="serif" style={{fontSize:16,color:"rgba(255,255,255,.1)",direction:"rtl"}}>{p.ar}</span>
                  </div>

                  {/* Adhan time */}
                  <span className="mono" style={{
                    fontSize:isA?44:38,
                    fontWeight:isA?600:300,
                    color:isA?"#fff":"rgba(255,255,255,.7)",
                    letterSpacing:"-0.03em",
                    transition:"all .5s ease",
                    marginRight:p.iq?40:0,
                  }}>{p.t}</span>

                  {/* Iqama */}
                  {p.iq?(
                    <span className="mono" style={{
                      fontSize:20,fontWeight:300,
                      color:isA?emeraldDim+".6)":"rgba(255,255,255,.15)",
                      letterSpacing:"-0.02em",
                      transition:"all .5s ease",
                      minWidth:70,textAlign:"right",
                    }}>{p.iq}</span>
                  ):(
                    <span style={{minWidth:70}}/>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        <div className="line-h"/>

        {/* ═══════ FOOTER ═══════ */}
        <footer style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:14}}>
          <div className="fade-text" style={{fontSize:12,fontWeight:300,color:"rgba(255,255,255,.18)",opacity:fa?1:0,transform:fa?"translateY(0)":"translateY(6px)"}}>{C.flash[fi]}</div>
          <div style={{fontSize:9,fontWeight:300,color:"rgba(255,255,255,.08)",letterSpacing:".1em"}}>Powered by Samil Fazlic</div>
        </footer>
      </div>
    </div>
  );
}
