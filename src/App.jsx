import { useState, useEffect, useMemo, useRef } from "react";

// ============================================================
// CONFIG — Easy to edit!
// ============================================================
const MOSQUE = {
  name: "BOSNIAKISCHES KULTURZENTRUM FEDŽR",
  nameSub: "Islamische Gemeinschaft Tevhid e.V.",
  address: "Ligsalzstraße 31A, 80339 München",
  lat: 48.1351, lng: 11.5650,
  method: 99, methodSettings: "18,null,17", school: 0,
  iqamaOffsets: { Fajr: 30, Dhuhr: 15, Asr: 15, Maghrib: 7, Isha: 15 },
  jumuahTime: "13:30",
  jumuahKhutba: "13:00",
  // Social Media — QR codes will be generated automatically
  social: {
    facebook: "https://www.facebook.com/p/D%C5%BEemat-T-Minhen-100009328557787/",
    facebookHandle: "Džemat T. Minhen",
    instagram: "", // Add your Instagram URL here
    instagramHandle: "",
    whatsapp: "", // Add WhatsApp group link here
  },
  // NEWS / ANNOUNCEMENTS — Change these regularly from home!
  news: [
    {
      title: "Džuma-namaz",
      text: "Svaki petak u 13:30h. Hutba počinje u 13:00h.",
      type: "recurring", // recurring, event, important
    },
    {
      title: "Kur'anski kurs",
      text: "Subotom u 10:00h za djecu i omladinu.",
      type: "event",
    },
    {
      title: "Dobrodošli!",
      text: "Naš džemat je otvoren za sve. Willkommen!",
      type: "important",
    },
  ],
  flashMessages: [
    "Džuma-namaz petkom u 13:30h · Freitagsgebet 13:30 Uhr",
    "Pratite nas na Facebooku · Folgt uns auf Facebook",
    "Dobrodošli u BKZ Fedžr · Willkommen im BKZ Fedžr",
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

const clean=t=>t?t.replace(/\s*\(.*\)/,""):"--:--";
const toMin=t=>{if(!t||t==="--:--")return 0;const[h,m]=clean(t).split(":").map(Number);return h*60+m;};
const addMin=(t,m)=>{if(!t||t==="--:--")return"--:--";const[h,mn]=clean(t).split(":").map(Number);const tot=h*60+mn+m;return`${String(Math.floor(tot/60)%24).padStart(2,"0")}:${String(tot%60).padStart(2,"0")}`;};

// ============================================================
// MAIN
// ============================================================
export default function App(){
  const [now,setNow]=useState(new Date());
  const [times,setTimes]=useState(null);
  const [status,setStatus]=useState("loading");
  const [fi,setFi]=useState(0);
  const [fa,setFa]=useState(true);
  const [newsIdx,setNewsIdx]=useState(0);
  const lastDate=useRef("");

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setInterval(()=>{setFa(false);setTimeout(()=>{setFi(i=>(i+1)%MOSQUE.flashMessages.length);setFa(true);},400);},7000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setInterval(()=>setNewsIdx(i=>(i+1)%MOSQUE.news.length),8000);return()=>clearInterval(t);},[]);

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
    if(!times)return{name:"...",cd:"--:--:--"};
    const o=[{k:"Fajr",n:"Sabah"},{k:"Sunrise",n:"Izlazak sunca"},{k:"Dhuhr",n:"Podne"},{k:"Asr",n:"Ikindija"},{k:"Maghrib",n:"Akšam"},{k:"Isha",n:"Jacija"}];
    for(const p of o){const m=toMin(times[p.k]);if(m>nowM){const diff=m-nowM;const ts=diff*60-now.getSeconds();const dh=Math.floor(ts/3600),dm=Math.floor((ts%3600)/60),ds=ts%60;return{name:p.n,cd:`${String(dh).padStart(2,"0")}:${String(dm).padStart(2,"0")}:${String(Math.max(0,ds)).padStart(2,"0")}`};}}
    return{name:"Sabah",cd:"--:--:--"};
  },[now,times]);

  const active=useMemo(()=>{
    if(!times)return"Isha";let a="Isha";for(const k of["Fajr","Dhuhr","Asr","Maghrib","Isha"]){if(nowM<toMin(times[k]))break;a=k;}return a;
  },[now,times]);

  const clock=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const secs=String(now.getSeconds()).padStart(2,"0");
  const dateDe=now.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const dayBs=["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"][now.getDay()];

  const prayers=times?[
    {k:"Fajr",bs:"Sabah",t:clean(times.Fajr),o:MOSQUE.iqamaOffsets.Fajr},
    {k:"Dhuhr",bs:"Podne",t:clean(times.Dhuhr),o:MOSQUE.iqamaOffsets.Dhuhr},
    {k:"Asr",bs:"Ikindija",t:clean(times.Asr),o:MOSQUE.iqamaOffsets.Asr},
    {k:"Maghrib",bs:"Akšam",t:clean(times.Maghrib),o:MOSQUE.iqamaOffsets.Maghrib},
    {k:"Isha",bs:"Jacija",t:clean(times.Isha),o:MOSQUE.iqamaOffsets.Isha},
  ]:[];

  const newsItem=MOSQUE.news[newsIdx];
  const typeColors={recurring:"#2a8c4e",event:"#c9a84c",important:"#e85d3a"};

  return(
    <div style={{position:"relative",width:"100%",height:"100vh",fontFamily:"'Outfit',sans-serif",color:"#fff",overflow:"hidden",display:"flex",flexDirection:"column",background:"#000"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{margin:0;padding:0;box-sizing:border-box}
      `}</style>

      {/* BG: mosque photo with dark overlay */}
      <div style={{position:"absolute",inset:0,backgroundImage:"url(/mosque-bg.png)",backgroundSize:"cover",backgroundPosition:"center 35%",opacity:0.3}}/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)"}}/>

      {/* ============ TOP BAR: Logo + Name + Date ============ */}
      <header style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",padding:"12px 32px",gap:16}}>
        <img src="/logo-bkz.png" alt="BKZ" style={{height:44,filter:"invert(1) brightness(0.9)",opacity:0.9}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:".08em",color:"#fff"}}>{MOSQUE.name}</div>
          <div style={{fontSize:12,fontWeight:400,color:"rgba(255,255,255,0.5)",marginTop:1}}>{MOSQUE.nameSub} · {MOSQUE.address}</div>
        </div>
      </header>

      {/* ============ MAIN AREA ============ */}
      <main style={{position:"relative",zIndex:10,flex:1,display:"flex",flexDirection:"column",padding:"0 32px"}}>

        {/* ROW 1: Chourouk | CLOCK | Jumua */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,padding:"8px 0 12px"}}>
          {/* Sunrise left */}
          <div style={{width:180,textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.5)"}}>Izlazak sunca</div>
            <div style={{fontSize:36,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:"#fff"}}>{times?clean(times.Sunrise):"--:--"}</div>
          </div>

          {/* Center clock */}
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{display:"inline-flex",alignItems:"baseline",gap:4}}>
              <span style={{fontSize:80,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.03em",color:"#fff"}}>{clock}</span>
              <span style={{fontSize:36,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,255,255,0.35)"}}>{secs}</span>
            </div>
            <div style={{fontSize:14,fontWeight:500,color:"rgba(255,255,255,0.6)",marginTop:2}}>{dayBs}, {dateDe}</div>
            <div style={{fontSize:16,fontWeight:600,color:"rgba(255,255,255,0.45)",marginTop:2,fontFamily:"'Amiri',serif"}}>{hijri.day} {hijri.monthName} {hijri.year}</div>
          </div>

          {/* Jumuah right */}
          <div style={{width:180,textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.5)"}}>Džuma</div>
            <div style={{fontSize:36,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:"#fff"}}>{MOSQUE.jumuahKhutba}</div>
            <div style={{height:1,width:60,background:"rgba(255,255,255,0.15)",margin:"4px auto"}}/>
            <div style={{fontSize:28,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,255,255,0.6)"}}>{MOSQUE.jumuahTime}</div>
          </div>
        </div>

        {/* Next prayer countdown */}
        <div style={{textAlign:"center",marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:".15em"}}>{next.name}</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.2)",margin:"0 8px"}}>·</span>
          <span style={{fontSize:14,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:"#2a8c4e",animation:"pulse 2s ease-in-out infinite"}}>{next.cd}</span>
        </div>

        {/* ROW 2: Prayer times — horizontal cards */}
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          {prayers.map((p)=>{
            const isA=active===p.k;
            return(
              <div key={p.k} style={{
                flex:1,textAlign:"center",
                background:isA?"rgba(42,140,78,0.2)":"rgba(255,255,255,0.04)",
                border:`1px solid ${isA?"rgba(42,140,78,0.5)":"rgba(255,255,255,0.08)"}`,
                borderRadius:10,padding:"16px 8px",
                transition:"all .4s",
                boxShadow:isA?"0 0 20px rgba(42,140,78,0.15)":"none",
              }}>
                <div style={{fontSize:14,fontWeight:600,color:isA?"#4ade80":"rgba(255,255,255,0.5)"}}>{p.bs}</div>
                <div style={{fontSize:36,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:"#fff",margin:"6px 0 4px",letterSpacing:"-0.02em"}}>{p.t}</div>
                <div style={{fontSize:12,fontWeight:500,color:isA?"#4ade80":"rgba(255,255,255,0.3)"}}>+{p.o}</div>
              </div>
            );
          })}
        </div>

        {/* ROW 3: Bottom — News + Social Media */}
        <div style={{display:"flex",gap:16,flex:1,minHeight:0}}>

          {/* News / Announcements */}
          <div style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:16,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:".15em",marginBottom:10}}>Obavještenja · Ankündigungen</div>
            {MOSQUE.news.map((n,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:i<MOSQUE.news.length-1?"1px solid rgba(255,255,255,0.04)":"none",opacity:i===newsIdx?1:0.4,transform:i===newsIdx?"scale(1.01)":"none",transition:"all .5s"}}>
                <div style={{width:4,height:4,borderRadius:2,background:typeColors[n.type]||"#666",marginTop:6,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{n.title}</div>
                  <div style={{fontSize:11,fontWeight:400,color:"rgba(255,255,255,0.45)",marginTop:2,lineHeight:1.4}}>{n.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Media QR Codes + Links */}
          <div style={{width:280,display:"flex",flexDirection:"column",gap:10}}>
            {/* Facebook */}
            <div style={{background:"rgba(24,119,242,0.08)",border:"1px solid rgba(24,119,242,0.15)",borderRadius:10,padding:14,display:"flex",alignItems:"center",gap:12}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#4599FF"}}>{MOSQUE.social.facebookHandle}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Pratite nas na Facebooku</div>
              </div>
              {/* QR placeholder — replace with actual QR image in /public/qr-facebook.png */}
              <div style={{width:48,height:48,background:"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",fontWeight:600,textAlign:"center",lineHeight:1.2,padding:4}}>
                QR<br/>Code
              </div>
            </div>

            {/* Instagram */}
            <div style={{background:"rgba(228,64,95,0.08)",border:"1px solid rgba(228,64,95,0.15)",borderRadius:10,padding:14,display:"flex",alignItems:"center",gap:12}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#E4405F"}}>{MOSQUE.social.instagramHandle||"Uskoro / Coming soon"}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Instagram</div>
              </div>
              <div style={{width:48,height:48,background:"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",fontWeight:600,textAlign:"center",lineHeight:1.2,padding:4}}>
                QR<br/>Code
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.15)",borderRadius:10,padding:14,display:"flex",alignItems:"center",gap:12}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#25D366"}}>WhatsApp Grupa</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Skeniraj QR kod</div>
              </div>
              <div style={{width:48,height:48,background:"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#000",fontWeight:600,textAlign:"center",lineHeight:1.2,padding:4}}>
                QR<br/>Code
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============ FLASH TICKER ============ */}
      <footer style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 32px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,0.5)",transition:"all .4s",opacity:fa?1:0,transform:fa?"translateY(0)":"translateY(6px)"}}>{MOSQUE.flashMessages[fi]}</span>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>Powered by Samil Fazlic</span>
      </footer>
    </div>
  );
}
