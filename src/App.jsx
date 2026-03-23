import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

/* ─── FONTS ─────────────────────────────────────────────────────── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap');
`;

/* ─── STAFF DIRECTORY ────────────────────────────────────────────── */
const STAFF = [
  { id:1, name:"Priya Menon",   role:"Senior Nurse",    dept:"ICU",        avatar:"PM", color:"#ef4444", score:2.1, trend:-0.8, risk:"high",   streak:12, checkins:12, history:[4.2,3.8,3.5,3.1,2.8,2.4,2.1] },
  { id:2, name:"Arjun Nair",    role:"Resident Doctor", dept:"Emergency",  avatar:"AN", color:"#f97316", score:2.6, trend:-0.4, risk:"high",   streak:7,  checkins:9,  history:[3.8,3.5,3.2,3.0,2.8,2.7,2.6] },
  { id:3, name:"Meera Pillai",  role:"Staff Nurse",     dept:"Pediatrics", avatar:"MP", color:"#f59e0b", score:3.2, trend:-0.3, risk:"medium", streak:5,  checkins:11, history:[3.8,3.7,3.6,3.5,3.4,3.3,3.2] },
  { id:4, name:"Rohit Das",     role:"Paramedic",       dept:"Emergency",  avatar:"RD", color:"#8b5cf6", score:3.1, trend:0.1,  risk:"medium", streak:4,  checkins:8,  history:[2.8,2.9,3.0,3.1,3.0,3.1,3.1] },
  { id:5, name:"Sunita Rao",    role:"Head Surgeon",    dept:"Surgery",    avatar:"SR", color:"#06b6d4", score:3.7, trend:0.2,  risk:"low",    streak:14, checkins:14, history:[3.3,3.4,3.5,3.5,3.6,3.7,3.7] },
  { id:6, name:"Kiran Iyer",    role:"Radiologist",     dept:"Radiology",  avatar:"KI", color:"#10b981", score:4.1, trend:0.3,  risk:"low",    streak:9,  checkins:13, history:[3.6,3.7,3.8,3.9,4.0,4.0,4.1] },
  { id:7, name:"Divya Thomas",  role:"Staff Nurse",     dept:"Oncology",   avatar:"DT", color:"#ec4899", score:2.9, trend:-0.2, risk:"medium", streak:3,  checkins:7,  history:[3.5,3.3,3.2,3.1,3.0,2.9,2.9] },
  { id:8, name:"Anil Kumar",    role:"Intensivist",     dept:"ICU",        avatar:"AK", color:"#10b981", score:4.4, trend:0.1,  risk:"low",    streak:21, checkins:21, history:[4.0,4.1,4.2,4.3,4.3,4.4,4.4] },
];

const DEPTS = [
  { name:"ICU",        score:3.2, workers:8,  risk:"medium" },
  { name:"Emergency",  score:2.8, workers:12, risk:"high"   },
  { name:"Pediatrics", score:3.8, workers:6,  risk:"low"    },
  { name:"Surgery",    score:3.5, workers:9,  risk:"low"    },
  { name:"Oncology",   score:2.9, workers:7,  risk:"medium" },
  { name:"Radiology",  score:4.1, workers:4,  risk:"low"    },
];

const WEEK = [
  {day:"Mon",score:3.6},{day:"Tue",score:3.4},{day:"Wed",score:3.1},
  {day:"Thu",score:3.3},{day:"Fri",score:2.9},{day:"Sat",score:3.0},{day:"Sun",score:3.2},
];

/* ─── HELPERS ────────────────────────────────────────────────────── */
const riskColor = r => r==="high"?"#ef4444":r==="medium"?"#f59e0b":"#10b981";
const riskBg    = r => r==="high"?"rgba(239,68,68,0.12)":r==="medium"?"rgba(245,158,11,0.1)":"rgba(16,185,129,0.1)";
const firstName = n => n.split(" ")[0];

async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Unable to generate insight.";
}

/* ─── AI BUTTON COMPONENT ────────────────────────────────────────── */
function AiBtn({ prompt, label="✦ Generate AI Insight", variant="dark" }) {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => { setLoading(true); setText(await callClaude(prompt)); setLoading(false); };
  const isDark = variant === "dark";
  const boxStyle = isDark
    ? { background:"linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.08))", border:"1px solid rgba(6,182,212,0.2)", borderRadius:12, padding:16, fontSize:13, lineHeight:1.7, color:"#c8d8f0" }
    : { background:"rgba(255,255,255,0.7)", border:"1px solid rgba(20,184,166,0.25)", borderRadius:12, padding:16, fontSize:13.5, lineHeight:1.8, color:"#134e4a", backdropFilter:"blur(4px)" };
  const btnStyle = isDark
    ? { padding:"7px 14px", background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.25)", borderRadius:8, color:"#06b6d4", fontSize:12, fontWeight:600, cursor:"pointer" }
    : { padding:"10px 20px", background:"#0d9488", border:"none", borderRadius:10, color:"white", fontSize:13, fontWeight:600, cursor:"pointer" };
  const labelStyle = isDark
    ? { display:"flex", alignItems:"center", gap:6, fontSize:11, textTransform:"uppercase", letterSpacing:"0.8px", color:"#06b6d4", fontWeight:600, marginBottom:8 }
    : { display:"flex", alignItems:"center", gap:6, fontSize:11, textTransform:"uppercase", letterSpacing:"0.8px", color:"#0d9488", fontWeight:600, marginBottom:8 };

  if (!text && !loading) return <button style={btnStyle} onClick={run}>{label}</button>;
  if (loading) return (
    <div style={boxStyle}>
      <div style={labelStyle}>✦ BurnoutRadar AI</div>
      <span style={{color:isDark?"#6b7a99":"#5eead4"}}>Analysing<Dots/></span>
    </div>
  );
  return (
    <div style={boxStyle}>
      <div style={labelStyle}>✦ BurnoutRadar AI</div>
      {text}
    </div>
  );
}

function Dots() {
  return (
    <>
      {[0,1,2].map(i=>(
        <span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:"currentColor",margin:"0 2px",animation:`blink 1.2s ${i*0.2}s ease infinite`}}/>
      ))}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LOGIN PAGE
   Two sections: Admin card on left, staff grid on right
═══════════════════════════════════════════════════════════════════════ */
function LoginPage({ onLogin }) {
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [selected, setSelected] = useState(null);
  const [staffPw, setStaffPw] = useState("");
  const [staffErr, setStaffErr] = useState(false);

  const handleAdmin = () => {
    if (adminPw === "admin123") onLogin({ role:"admin" });
    else setAdminErr(true);
  };
  const handleStaff = () => {
    if (staffPw === "staff123") onLogin({ role:"staff", user: selected });
    else setStaffErr(true);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0b1120", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:24 }}>
      <style>{FONTS}
        {`
          @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
          .login-wrap{display:flex;gap:24px;width:100%;max-width:900px;animation:fadeUp 0.6s ease}
          .admin-card{flex:0 0 300px;background:#111827;border:1px solid #1e2d45;border-radius:20px;padding:32px;display:flex;flex-direction:column}
          .staff-card{flex:1;background:#111827;border:1px solid #1e2d45;border-radius:20px;padding:32px}
          .section-badge{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:20px;display:inline-block;padding:4px 10px;border-radius:20px}
          .admin-badge{background:rgba(245,158,11,0.12);color:#f59e0b;border:1px solid rgba(245,158,11,0.25)}
          .staff-badge{background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2)}
          .pw-input{width:100%;background:#1a2234;border:1.5px solid #1e2d45;border-radius:10px;color:#e8eaf2;font-family:'DM Sans',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:border-color 0.2s;display:block;margin-bottom:10px}
          .pw-input:focus{border-color:#f59e0b}
          .pw-input.teal:focus{border-color:#0d9488}
          .admin-login-btn{width:100%;padding:12px;background:#f59e0b;color:#000;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s}
          .admin-login-btn:hover{background:#fbbf24}
          .staff-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
          .staff-tile{border-radius:12px;padding:14px 10px;cursor:pointer;border:1.5px solid #1e2d45;background:#1a2234;text-align:center;transition:all 0.18s}
          .staff-tile:hover{border-color:#0d9488;transform:translateY(-2px)}
          .staff-tile.picked{border-color:#0d9488;background:rgba(13,148,136,0.1)}
          .staff-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;margin:0 auto 8px}
          .staff-name{font-size:12px;font-weight:500;color:#e8eaf2;margin-bottom:2px}
          .staff-dept{font-size:10.5px;color:#6b7a99}
          .staff-login-btn{width:100%;padding:12px;background:#0d9488;color:white;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s}
          .staff-login-btn:hover{background:#0f766e}
          .staff-login-btn:disabled{opacity:0.4;cursor:not-allowed}
          .err-msg{font-size:12px;color:#ef4444;margin-top:4px}
          .hint{font-size:11px;color:#6b7a99;margin-top:6px}
        `}
      </style>

      <div className="login-wrap">
        {/* ADMIN CARD */}
        <div className="admin-card">
          <div style={{marginBottom:28}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{width:38,height:38,background:"#f59e0b",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🧠</div>
              <div>
                <div style={{fontFamily:"Syne",fontSize:16,fontWeight:700,color:"#e8eaf2"}}>BurnoutRadar</div>
                <div style={{fontSize:11,color:"#6b7a99"}}>Wellbeing Intelligence</div>
              </div>
            </div>
            <span className="section-badge admin-badge">Hospital Admin</span>
            <p style={{fontSize:13,color:"#6b7a99",lineHeight:1.6,marginBottom:20}}>Access the full institutional dashboard, team analytics, and AI-generated alerts.</p>
          </div>
          <input className="pw-input" type="password" placeholder="Admin password" value={adminPw}
            onChange={e=>{setAdminPw(e.target.value);setAdminErr(false)}}
            onKeyDown={e=>e.key==="Enter"&&handleAdmin()}/>
          {adminErr && <div className="err-msg">Incorrect password. Try "admin123"</div>}
          <p className="hint">Demo password: admin123</p>
          <div style={{flex:1}}/>
          <button className="admin-login-btn" style={{marginTop:24}} onClick={handleAdmin}>Sign in as Admin →</button>
        </div>

        {/* STAFF CARD */}
        <div className="staff-card">
          <span className="section-badge staff-badge">Healthcare Staff Login</span>
          <p style={{fontSize:13,color:"#6b7a99",marginBottom:18,lineHeight:1.6}}>Select your name below, then enter the staff password to access your personal wellbeing dashboard.</p>

          <div className="staff-grid">
            {STAFF.map(s=>(
              <div key={s.id} className={`staff-tile ${selected?.id===s.id?"picked":""}`} onClick={()=>{setSelected(s);setStaffErr(false);}}>
                <div className="staff-avatar" style={{background:s.color+"25",color:s.color}}>{s.avatar}</div>
                <div className="staff-name">{s.name}</div>
                <div className="staff-dept">{s.dept}</div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{borderTop:"1px solid #1e2d45",paddingTop:18}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:selected.color+"25",color:selected.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>{selected.avatar}</div>
                <div>
                  <div style={{fontSize:13.5,fontWeight:500,color:"#e8eaf2"}}>Logging in as <strong>{selected.name}</strong></div>
                  <div style={{fontSize:11.5,color:"#6b7a99"}}>{selected.role} · {selected.dept}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <input className="pw-input teal" type="password" placeholder="Staff password" value={staffPw}
                    onChange={e=>{setStaffPw(e.target.value);setStaffErr(false)}}
                    onKeyDown={e=>e.key==="Enter"&&handleStaff()}/>
                  {staffErr && <div className="err-msg">Incorrect. Try "staff123"</div>}
                  <p className="hint">Demo password: staff123</p>
                </div>
                <button className="staff-login-btn" style={{flex:"0 0 140px",marginTop:0}} onClick={handleStaff}>Continue →</button>
              </div>
            </div>
          )}
          {!selected && <p style={{fontSize:12,color:"#6b7a99",textAlign:"center",paddingTop:8}}>👆 Select your name to continue</p>}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN UI — Dark command-centre aesthetic
   Syne font, deep navy, amber accents, data-dense
═══════════════════════════════════════════════════════════════════════ */
const ADMIN_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-ring{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.4);opacity:0}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes slideR{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}
  .a-app{display:flex;min-height:100vh;background:#08101e;color:#dde4f0;font-family:'DM Sans',sans-serif}
  .a-sidebar{width:210px;background:#0e1626;border-right:1px solid #182236;display:flex;flex-direction:column;padding:0;position:fixed;top:0;left:0;bottom:0;z-index:20}
  .a-logo{padding:22px 20px 20px;border-bottom:1px solid #182236;margin-bottom:12px}
  .a-logo-mark{width:34px;height:34px;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;margin-bottom:9px}
  .a-logo-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;letter-spacing:-0.3px;color:#e8eaf2}
  .a-logo-sub{font-size:10px;color:#4a5a7a;letter-spacing:0.5px}
  .a-nav-item{display:flex;align-items:center;gap:9px;padding:9px 20px;color:#4a5a7a;cursor:pointer;font-size:13px;font-weight:500;border-left:3px solid transparent;transition:all 0.18s}
  .a-nav-item:hover{color:#dde4f0;background:#121e30}
  .a-nav-item.on{color:#f59e0b;border-left-color:#f59e0b;background:#121e30}
  .a-sidebar-footer{margin-top:auto;padding:14px 18px;border-top:1px solid #182236}
  .a-main{margin-left:210px;flex:1;padding:28px 32px;min-height:100vh}
  .a-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}
  .a-page-title{font-family:'Syne',sans-serif;font-size:23px;font-weight:800;letter-spacing:-0.4px;color:#e8eaf2}
  .a-page-sub{font-size:12.5px;color:#4a5a7a;margin-top:3px}
  .a-card{background:#0e1626;border:1px solid #182236;border-radius:13px;padding:20px}
  .a-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
  .a-stat{background:#0e1626;border:1px solid #182236;border-radius:13px;padding:18px;animation:fadeUp 0.5s ease forwards;opacity:0}
  .a-stat:nth-child(1){animation-delay:0.05s}.a-stat:nth-child(2){animation-delay:0.1s}.a-stat:nth-child(3){animation-delay:0.15s}.a-stat:nth-child(4){animation-delay:0.2s}
  .a-stat-label{font-size:10.5px;color:#4a5a7a;text-transform:uppercase;letter-spacing:1px;font-weight:600}
  .a-stat-val{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;margin:5px 0 3px}
  .a-stat-sub{font-size:11px;color:#4a5a7a}
  .a-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
  .a-section-title{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:#e8eaf2;margin-bottom:13px;display:flex;align-items:center;gap:7px}
  .a-table{width:100%;border-collapse:collapse}
  .a-table th{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#4a5a7a;padding:9px 12px;border-bottom:1px solid #182236;text-align:left;font-weight:600}
  .a-table td{padding:11px 12px;border-bottom:1px solid rgba(24,34,54,0.6);font-size:13px}
  .a-table tr:last-child td{border-bottom:none}
  .a-table tr:hover td{background:rgba(18,30,48,0.5)}
  .a-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
  .a-chip{padding:3px 9px;border-radius:6px;font-size:11px;background:#121e30;color:#6b7a99;border:1px solid #182236}
  .a-bar-wrap{display:flex;align-items:center;gap:7px}
  .a-bar{flex:1;height:4px;background:#182236;border-radius:2px;overflow:hidden}
  .a-bar-fill{height:100%;border-radius:2px}
  .a-score-n{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;width:24px;text-align:right}
  .a-dept-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .a-dept-cell{border-radius:9px;padding:12px;cursor:pointer;transition:all 0.18s}
  .a-dept-cell:hover{transform:translateY(-2px)}
  .a-dept-name{font-size:11px;font-weight:600;margin-bottom:3px}
  .a-dept-score{font-family:'Syne',sans-serif;font-size:21px;font-weight:800}
  .a-dept-w{font-size:10px;opacity:0.6;margin-top:2px}
  .a-alert{padding:12px 14px;border-radius:9px;border-left:3px solid;background:#121e30;margin-bottom:9px}
  .a-panel{position:fixed;right:0;top:0;bottom:0;width:370px;background:#0e1626;border-left:1px solid #182236;z-index:50;padding:26px;overflow-y:auto;animation:slideR 0.3s ease}
  .a-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:49}
  .filter-row{display:flex;gap:6px;flex-wrap:wrap}
  .f-chip{padding:5px 11px;border-radius:20px;font-size:11.5px;font-weight:500;border:1px solid #182236;background:transparent;color:#4a5a7a;cursor:pointer;transition:all 0.15s}
  .f-chip:hover{border-color:#f59e0b;color:#f59e0b}
  .f-chip.on{background:rgba(245,158,11,0.1);border-color:#f59e0b;color:#f59e0b}
  .pulse-dot{position:relative;width:7px;height:7px;display:inline-block}
  .pulse-inner{width:7px;height:7px;border-radius:50%;position:absolute}
  .pulse-ring{width:7px;height:7px;border-radius:50%;position:absolute;animation:pulse-ring 1.5s ease-out infinite}
  .p-red .pulse-inner,.p-red .pulse-ring{background:#ef4444}
  .p-yellow .pulse-inner,.p-yellow .pulse-ring{background:#f59e0b}
  .p-green .pulse-inner,.p-green .pulse-ring{background:#10b981}
  .a-tooltip{background:#121e30;border:1px solid #182236;border-radius:8px;padding:9px 13px;font-size:12px}
`;

function AdminApp({ onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const high   = STAFF.filter(w=>w.risk==="high").length;
  const medium = STAFF.filter(w=>w.risk==="medium").length;
  const low    = STAFF.filter(w=>w.risk==="low").length;
  const avg    = (STAFF.reduce((s,w)=>s+w.score,0)/STAFF.length).toFixed(1);

  const filtered = filter==="all" ? STAFF : STAFF.filter(w=>w.risk===filter);

  const ATip = ({active,payload,label}) => {
    if(!active||!payload?.length) return null;
    return <div className="a-tooltip"><p style={{color:"#4a5a7a",fontSize:11}}>{label}</p><span style={{color:"#f59e0b",fontFamily:"Syne",fontWeight:700,fontSize:15}}>{payload[0].value.toFixed(1)}</span></div>;
  };

  const NavItem = ({id,icon,label}) => (
    <div className={`a-nav-item ${page===id?"on":""}`} onClick={()=>setPage(id)}>
      <span style={{fontSize:15}}>{icon}</span>{label}
    </div>
  );

  const deptPrompt = `You are BurnoutRadar AI for a hospital admin. Departments: ${DEPTS.map(d=>`${d.name}(score:${d.score},risk:${d.risk},${d.workers} workers)`).join("; ")}. High-risk workers: ${high}. Avg: ${avg}/5. Give a 3-sentence institutional summary: most urgent dept, key pattern, one recommendation. Under 65 words. Clinical and direct.`;

  return (
    <div className="a-app">
      <style>{FONTS + ADMIN_CSS}</style>
      <div className="a-sidebar">
        <div className="a-logo">
          <div className="a-logo-mark">🧠</div>
          <div className="a-logo-name">BurnoutRadar</div>
          <div className="a-logo-sub">ADMIN CONSOLE</div>
        </div>
        <NavItem id="dashboard" icon="◈" label="Overview"/>
        <NavItem id="workers"   icon="◉" label="All Workers"/>
        <NavItem id="insights"  icon="✦" label="AI Insights"/>
        <NavItem id="alerts"    icon="⚡" label="Alerts"/>
        <div className="a-sidebar-footer">
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#000"}}>AD</div>
            <div><div style={{fontSize:12.5,fontWeight:500,color:"#dde4f0"}}>Hospital Admin</div><div style={{fontSize:10.5,color:"#4a5a7a"}}>Administrator</div></div>
          </div>
          <div style={{fontSize:11.5,color:"#4a5a7a",cursor:"pointer",display:"flex",alignItems:"center",gap:5}} onClick={onLogout}>← Sign out</div>
        </div>
      </div>

      <div className="a-main">
        {/* DASHBOARD */}
        {page==="dashboard" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div className="a-topbar">
              <div><div className="a-page-title">Overview</div><div className="a-page-sub">Institution-wide wellbeing · {new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}</div></div>
            </div>
            <div className="a-stats">
              {[[avg,"Avg Score","#f59e0b","Out of 5.0"],[high,"High Risk","#ef4444","Need immediate action"],[medium,"Monitoring","#f59e0b","Declining trend"],[low,"Stable","#10b981","Doing well"]].map(([v,l,c,s],i)=>(
                <div key={i} className="a-stat"><div className="a-stat-label">{l}</div><div className="a-stat-val" style={{color:c}}>{v}</div><div className="a-stat-sub">{s}</div></div>
              ))}
            </div>
            <div className="a-grid2">
              <div className="a-card">
                <div className="a-section-title">Weekly Score Trend</div>
                <div style={{height:165}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WEEK}>
                      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="day" tick={{fill:"#4a5a7a",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[1,5]} hide/>
                      <Tooltip content={<ATip/>}/>
                      <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} fill="url(#ag)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="a-card">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div className="a-section-title" style={{marginBottom:0}}>Department Heatmap</div>
                  <AiBtn prompt={deptPrompt} label="✦ AI Summary" variant="dark"/>
                </div>
                <div className="a-dept-grid">
                  {DEPTS.map(d=>(
                    <div key={d.name} className="a-dept-cell" style={{background:riskBg(d.risk),border:`1px solid ${riskColor(d.risk)}25`}}>
                      <div className="a-dept-name" style={{color:riskColor(d.risk)}}>{d.name}</div>
                      <div className="a-dept-score" style={{color:riskColor(d.risk)}}>{d.score.toFixed(1)}</div>
                      <div className="a-dept-w">{d.workers} workers</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="a-card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div className="a-section-title" style={{marginBottom:0}}>At-Risk Workers</div>
                <button onClick={()=>setPage("workers")} style={{padding:"5px 12px",background:"transparent",border:"1px solid #182236",borderRadius:7,color:"#4a5a7a",fontSize:11.5,cursor:"pointer"}}>View all →</button>
              </div>
              <table className="a-table">
                <thead><tr><th>Worker</th><th>Department</th><th>Score</th><th>7d Trend</th><th>Risk</th><th></th></tr></thead>
                <tbody>
                  {STAFF.filter(w=>w.risk==="high").concat(STAFF.filter(w=>w.risk==="medium")).map((w,i)=>(
                    <tr key={w.id} style={{cursor:"pointer",opacity:0,animation:`fadeUp 0.4s ${i*0.07+0.1}s ease forwards`}} onClick={()=>setSelected(w)}>
                      <td><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:28,height:28,borderRadius:"50%",background:w.color+"20",color:w.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{w.avatar}</div><div><div style={{fontWeight:500,fontSize:13}}>{w.name}</div><div style={{fontSize:11,color:"#4a5a7a"}}>{w.role}</div></div></div></td>
                      <td><span className="a-chip">{w.dept}</span></td>
                      <td><div className="a-bar-wrap"><div className="a-bar"><div className="a-bar-fill" style={{width:`${(w.score/5)*100}%`,background:riskColor(w.risk)}}/></div><span className="a-score-n" style={{color:riskColor(w.risk)}}>{w.score.toFixed(1)}</span></div></td>
                      <td><span style={{fontSize:12,color:w.trend<0?"#ef4444":w.trend>0?"#10b981":"#4a5a7a"}}>{w.trend<0?`▼ ${Math.abs(w.trend).toFixed(1)}`:w.trend>0?`▲ ${w.trend.toFixed(1)}`:"—"}</span></td>
                      <td><span className="a-badge" style={{background:riskBg(w.risk),color:riskColor(w.risk)}}><div className={`pulse-dot p-${w.risk==="high"?"red":w.risk==="medium"?"yellow":"green"}`}><div className="pulse-inner"/><div className="pulse-ring"/></div>{w.risk}</span></td>
                      <td><span style={{fontSize:11,color:"#4a5a7a"}}>View →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALL WORKERS */}
        {page==="workers" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div className="a-topbar">
              <div><div className="a-page-title">All Workers</div><div className="a-page-sub">{STAFF.length} staff members tracked</div></div>
              <div className="filter-row">
                {["all","high","medium","low"].map(f=>(
                  <button key={f} className={`f-chip ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>
                    {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="a-card">
              <table className="a-table">
                <thead><tr><th>Worker</th><th>Department</th><th>Score</th><th>7d Trend</th><th>Streak</th><th>Risk</th><th></th></tr></thead>
                <tbody>
                  {filtered.map((w,i)=>(
                    <tr key={w.id} style={{cursor:"pointer",opacity:0,animation:`fadeUp 0.4s ${i*0.05+0.05}s ease forwards`}} onClick={()=>setSelected(w)}>
                      <td><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:28,height:28,borderRadius:"50%",background:w.color+"20",color:w.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{w.avatar}</div><div><div style={{fontWeight:500,fontSize:13}}>{w.name}</div><div style={{fontSize:11,color:"#4a5a7a"}}>{w.role}</div></div></div></td>
                      <td><span className="a-chip">{w.dept}</span></td>
                      <td><div className="a-bar-wrap"><div className="a-bar"><div className="a-bar-fill" style={{width:`${(w.score/5)*100}%`,background:riskColor(w.risk)}}/></div><span className="a-score-n" style={{color:riskColor(w.risk)}}>{w.score.toFixed(1)}</span></div></td>
                      <td><span style={{fontSize:12,color:w.trend<0?"#ef4444":w.trend>0?"#10b981":"#4a5a7a"}}>{w.trend<0?`▼ ${Math.abs(w.trend).toFixed(1)}`:w.trend>0?`▲ ${w.trend.toFixed(1)}`:"— Stable"}</span></td>
                      <td><span style={{fontSize:13,color:"#f59e0b"}}>🔥 {w.streak}d</span></td>
                      <td><span className="a-badge" style={{background:riskBg(w.risk),color:riskColor(w.risk)}}>{w.risk}</span></td>
                      <td><span style={{fontSize:11,color:"#4a5a7a"}}>Details →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI INSIGHTS */}
        {page==="insights" && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div className="a-topbar"><div><div className="a-page-title">AI Insights</div><div className="a-page-sub">On-demand analysis per worker and department</div></div></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {STAFF.filter(w=>w.risk!=="low").map((w,i)=>(
                <div key={w.id} className="a-card" style={{borderLeft:`3px solid ${riskColor(w.risk)}`,opacity:0,animation:`fadeUp 0.5s ${i*0.08+0.05}s ease forwards`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:w.color+"20",color:w.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12}}>{w.avatar}</div>
                      <div><div style={{fontFamily:"Syne",fontSize:13.5,fontWeight:700,color:"#e8eaf2"}}>{w.name}</div><div style={{fontSize:11,color:"#4a5a7a"}}>{w.role} · {w.dept}</div></div>
                    </div>
                    <span className="a-badge" style={{background:riskBg(w.risk),color:riskColor(w.risk)}}>{w.risk}</span>
                  </div>
                  <AiBtn variant="dark" prompt={`You are BurnoutRadar AI. Analyze: ${w.name}, ${w.role}, ${w.dept}. Score: ${w.score}/5. History (7 days): ${w.history.join(",")}. Trend: ${w.trend}. Risk: ${w.risk}. Give a 2-sentence clinical insight and 1 action. Under 55 words. Direct tone.`} label="✦ Analyse"/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALERTS */}
        {page==="alerts" && (
          <div style={{animation:"fadeUp 0.4s ease",maxWidth:640}}>
            <div className="a-topbar"><div><div className="a-page-title">Active Alerts</div><div className="a-page-sub">Requires admin attention</div></div></div>
            {[
              {type:"high",title:"Critical — Priya Menon (ICU)",body:"Score below 2.5 for 3 consecutive days. Immediate supervisor check-in required.",time:"2 hrs ago"},
              {type:"high",title:"Critical — Arjun Nair (Emergency)",body:"Consistent post-night-shift decline. Score at 2.6 and falling.",time:"4 hrs ago"},
              {type:"medium",title:"Watch — Divya Thomas (Oncology)",body:"Slow but steady score decline. At current rate, will reach high-risk in ~10 days.",time:"Yesterday"},
              {type:"medium",title:"Watch — Emergency Dept",body:"Department average dropped 0.4 points this week. Review shift allocations.",time:"Yesterday"},
              {type:"medium",title:"Low Check-in Rate — Oncology",body:"Only 3 of 7 members checked in this week. Risk data may be incomplete.",time:"2 days ago"},
            ].map((a,i)=>(
              <div key={i} className="a-alert" style={{borderLeftColor:riskColor(a.type),opacity:0,animation:`fadeUp 0.5s ${i*0.08+0.05}s ease forwards`}}>
                <div style={{fontWeight:600,fontSize:13.5,color:"#dde4f0",marginBottom:4}}>{a.title}</div>
                <div style={{fontSize:12.5,color:"#4a5a7a",lineHeight:1.5}}>{a.body}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                  <span style={{fontSize:11,color:"#4a5a7a"}}>{a.time}</span>
                  <button style={{fontSize:11.5,color:"#f59e0b",background:"transparent",border:"1px solid rgba(245,158,11,0.25)",borderRadius:6,padding:"3px 10px",cursor:"pointer"}}>Mark as actioned</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WORKER DETAIL SIDE PANEL */}
      {selected && (
        <>
          <div className="a-overlay" onClick={()=>setSelected(null)}/>
          <div className="a-panel">
            <div style={{position:"absolute",top:18,right:18,width:28,height:28,background:"#182236",border:"1px solid #1e2d45",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#4a5a7a",fontSize:14}} onClick={()=>setSelected(null)}>✕</div>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:22,marginTop:6}}>
              <div style={{width:46,height:46,borderRadius:"50%",background:selected.color+"22",color:selected.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16}}>{selected.avatar}</div>
              <div><div style={{fontFamily:"Syne",fontWeight:700,fontSize:16,color:"#e8eaf2"}}>{selected.name}</div><div style={{fontSize:12,color:"#4a5a7a"}}>{selected.role} · {selected.dept}</div></div>
            </div>
            <div style={{display:"flex",gap:9,marginBottom:18}}>
              {[[selected.score.toFixed(1),"Score",riskColor(selected.risk)],[`${selected.streak}🔥`,"Streak","#f59e0b"],[selected.checkins,"Check-ins","#06b6d4"]].map(([v,l,c])=>(
                <div key={l} style={{flex:1,background:"#121e30",border:"1px solid #182236",borderRadius:9,padding:"11px",textAlign:"center"}}>
                  <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,color:c}}>{v}</div>
                  <div style={{fontSize:10.5,color:"#4a5a7a"}}>{l}</div>
                </div>
              ))}
            </div>
            <div className="a-section-title">7-Day Score Trend</div>
            <div style={{height:120,marginBottom:18}}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selected.history.map((s,i)=>({day:`D-${6-i}`,score:s}))}>
                  <defs><linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={riskColor(selected.risk)} stopOpacity={0.2}/><stop offset="95%" stopColor={riskColor(selected.risk)} stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="day" tick={{fill:"#4a5a7a",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[1,5]} hide/>
                  <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="a-tooltip"><p style={{color:"#4a5a7a",fontSize:10}}>{label}</p><span style={{color:riskColor(selected.risk),fontWeight:700}}>{payload[0].value.toFixed(1)}</span></div>:null}/>
                  <Area type="monotone" dataKey="score" stroke={riskColor(selected.risk)} strokeWidth={2} fill="url(#pg2)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="a-section-title">AI Analysis</div>
            <AiBtn variant="dark" prompt={`BurnoutRadar AI for hospital admin. Worker: ${selected.name}, ${selected.role}, ${selected.dept}. Score: ${selected.score}/5. History: ${selected.history.join(",")}. Trend: ${selected.trend>0?"+":""}${selected.trend}. Risk: ${selected.risk}. Streak: ${selected.streak} days. Give a 3-sentence clinical insight: trend observation, likely cause, specific admin action. Address by first name. Under 65 words. Direct, evidence-based tone.`}/>
            <div className="a-section-title" style={{marginTop:16}}>Recommended Actions</div>
            {selected.risk==="high"&&["🚨 Schedule immediate check-in call","📋 Review shift load and overtime","💬 Refer to peer support program"].map(a=>(
              <div key={a} style={{padding:"9px 12px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.18)",borderRadius:8,fontSize:12.5,marginBottom:7,color:"#fca5a5"}}>{a}</div>
            ))}
            {selected.risk==="medium"&&["⚠️ Monitor score daily for 7 days","🗓 Offer optional wellbeing conversation"].map(a=>(
              <div key={a} style={{padding:"9px 12px",background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.18)",borderRadius:8,fontSize:12.5,marginBottom:7,color:"#fcd34d"}}>{a}</div>
            ))}
            {selected.risk==="low"&&<div style={{padding:"9px 12px",background:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:8,fontSize:12.5,color:"#6ee7b7"}}>✅ No action needed. Continue monitoring.</div>}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STAFF UI — Warm, light, personal wellness companion
   DM Serif Display, warm cream, teal accents
═══════════════════════════════════════════════════════════════════════ */
const STAFF_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  .s-app{min-height:100vh;background:#f4f0eb;font-family:'DM Sans',sans-serif;color:#1c2b2b}
  .s-topbar{background:white;border-bottom:1px solid #e5e0d8;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  .s-logo{display:flex;align-items:center;gap:9px}
  .s-logo-mark{width:32px;height:32px;background:#0d9488;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px}
  .s-logo-name{font-family:'DM Serif Display',serif;font-size:17px;color:#0f4040}
  .s-nav{display:flex;gap:4px}
  .s-nav-btn{padding:8px 16px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:#6b7a6a;transition:all 0.18s}
  .s-nav-btn:hover{background:#ece8e2;color:#1c2b2b}
  .s-nav-btn.on{background:#0d9488;color:white}
  .s-user-pill{display:flex;align-items:center;gap:8px;padding:6px 12px;background:#ece8e2;border-radius:20px}
  .s-main{padding:32px;max-width:760px;margin:0 auto}
  .s-card{background:white;border-radius:16px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);margin-bottom:18px;animation:fadeUp 0.5s ease forwards}
  .s-serif{font-family:'DM Serif Display',serif}
  .s-greeting{font-family:'DM Serif Display',serif;font-size:30px;color:#0f4040;line-height:1.3;margin-bottom:6px}
  .s-greeting em{color:#0d9488;font-style:italic}
  .s-subtitle{font-size:14px;color:#7a8c7a;line-height:1.6}
  .s-question{font-size:14.5px;font-weight:500;color:#2d3d2d;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
  .s-score-badge{font-family:'DM Serif Display',serif;font-size:16px;color:#0d9488}
  .s-emoji-row{display:flex;gap:8px}
  .s-emoji-btn{flex:1;height:52px;border-radius:12px;border:2px solid #ece8e2;background:#faf8f5;font-size:22px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center}
  .s-emoji-btn:hover{border-color:#0d9488;transform:scale(1.06)}
  .s-emoji-btn.picked{background:#e6f4f2;border-color:#0d9488;transform:scale(1.08);box-shadow:0 4px 12px rgba(13,148,136,0.2)}
  .s-scale{display:flex;justify-content:space-between;margin-top:5px}
  .s-scale span{font-size:11px;color:#9aaa9a}
  .s-textarea{width:100%;background:#faf8f5;border:2px solid #ece8e2;border-radius:12px;color:#2d3d2d;font-family:'DM Sans',sans-serif;font-size:14px;padding:13px 15px;resize:none;outline:none;transition:border-color 0.2s;line-height:1.6}
  .s-textarea:focus{border-color:#0d9488}
  .s-submit{width:100%;padding:15px;background:#0d9488;color:white;border:none;border-radius:13px;font-family:'DM Serif Display',serif;font-size:17px;cursor:pointer;transition:all 0.2s;margin-top:4px;letter-spacing:0.3px}
  .s-submit:hover:not(:disabled){background:#0f766e;transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,0.3)}
  .s-submit:disabled{opacity:0.45;cursor:not-allowed}
  .s-streak{display:inline-flex;align-items:center;gap:7px;background:#fff8ed;border:1px solid #fcd34d40;border-radius:20px;padding:6px 14px;font-size:13px;font-weight:500;color:#b45309;margin-bottom:22px}
  .s-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;vertical-align:middle;margin-right:7px}
  .s-metric{background:#faf8f5;border-radius:12px;padding:16px;text-align:center;flex:1}
  .s-metric-val{font-family:'DM Serif Display',serif;font-size:28px;margin-bottom:3px}
  .s-metric-label{font-size:11px;color:#7a8c7a;text-transform:uppercase;letter-spacing:0.7px;font-weight:500}
  .s-section-title{font-family:'DM Serif Display',serif;font-size:18px;color:#0f4040;margin-bottom:14px}
  .s-res-item{padding:11px 14px;border-radius:10px;font-size:13.5px;margin-bottom:8px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:10px}
  .s-res-item:hover{transform:translateX(3px)}
  .s-ai-box{background:linear-gradient(135deg,#e6f4f2,#f0faf9);border:1px solid rgba(13,148,136,0.2);border-radius:14px;padding:18px;font-size:14px;line-height:1.75;color:#134e4a}
  .s-ai-label{font-size:10.5px;text-transform:uppercase;letter-spacing:1px;color:#0d9488;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:5px}
  .s-success-icon{font-size:60px;margin-bottom:16px}
`;

function StaffApp({ user, onLogout }) {
  const [page, setPage] = useState("home");
  const [scores, setScores] = useState({ mood:0, energy:0, workload:0 });
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiReply, setAiReply] = useState(null);

  const qs = [
    { key:"mood",     label:"How is your mood right now?",           emojis:["😞","😕","😐","🙂","😄"] },
    { key:"energy",   label:"How are your energy levels today?",     emojis:["🪫","😴","⚡","🔋","✨"] },
    { key:"workload", label:"How manageable is your workload today?", emojis:["🔥","😰","😤","👍","🌟"] },
  ];
  const allDone = scores.mood && scores.energy && scores.workload;

  const handleSubmit = async () => {
    if (!allDone) return;
    setLoading(true);
    const raw = (scores.mood + scores.energy + (6 - scores.workload)) / 3;
    const risk = raw < 2.5 ? "high" : raw < 3.5 ? "medium" : "low";
    const prompt = `You are BurnoutRadar, a compassionate healthcare wellbeing companion. A healthcare worker just completed their daily check-in.

Worker: ${user.name} (${user.role}, ${user.dept})
Mood: ${scores.mood}/5 ${["😞","😕","😐","🙂","😄"][scores.mood-1]}
Energy: ${scores.energy}/5 ${["🪫","😴","⚡","🔋","✨"][scores.energy-1]}
Workload manageability: ${scores.workload}/5 ${["🔥","😰","😤","👍","🌟"][scores.workload-1]}
${note ? `Their note: "${note}"` : "No note added."}
Calculated score: ${raw.toFixed(1)}/5 — Risk: ${risk}

Write a warm, personal 2–3 sentence response. Acknowledge their feelings genuinely. If scores are low, validate their struggle and suggest one small, specific self-care action. If good, celebrate warmly. Address by first name. Caring and human. Under 55 words.`;
    const text = await callClaude(prompt);
    setAiReply(text); setLoading(false); setSubmitted(true);
  };

  const resetCheckin = () => { setScores({mood:0,energy:0,workload:0}); setNote(""); setSubmitted(false); setAiReply(null); };

  const personalData = user.history.map((s,i)=>({day:["M","T","W","T","F","S","S"][i],score:s}));

  const summaryPrompt = `You are BurnoutRadar, a caring wellbeing companion. Generate a personal weekly summary for ${user.name} (${user.role}, ${user.dept}).
Score this week: ${user.history.join(", ")} — Current: ${user.score}/5, Risk: ${user.risk}, Streak: ${user.streak} days.
Write 3 warm sentences: (1) a pattern you noticed, (2) what it suggests, (3) one specific, gentle self-care suggestion. Address by first name. Compassionate, human tone. Under 70 words.`;

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  return (
    <div className="s-app">
      <style>{FONTS + STAFF_CSS}</style>
      <div className="s-topbar">
        <div className="s-logo">
          <div className="s-logo-mark">🧠</div>
          <div className="s-logo-name">BurnoutRadar</div>
        </div>
        <div className="s-nav">
          <button className={`s-nav-btn ${page==="home"?"on":""}`} onClick={()=>setPage("home")}>Home</button>
          <button className={`s-nav-btn ${page==="checkin"?"on":""}`} onClick={()=>setPage("checkin")}>Check-in</button>
          <button className={`s-nav-btn ${page==="wellbeing"?"on":""}`} onClick={()=>setPage("wellbeing")}>My Wellbeing</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div className="s-user-pill">
            <div style={{width:24,height:24,borderRadius:"50%",background:user.color+"25",color:user.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{user.avatar}</div>
            <span style={{fontSize:13,fontWeight:500}}>{user.name}</span>
          </div>
          <button onClick={onLogout} style={{fontSize:12,color:"#7a8c7a",background:"transparent",border:"none",cursor:"pointer"}}>Sign out</button>
        </div>
      </div>

      <div className="s-main">

        {/* HOME */}
        {page==="home" && (
          <div style={{animation:"fadeUp 0.5s ease"}}>
            <div style={{marginBottom:28}}>
              <div className="s-greeting">{getTimeGreeting()}, <em>{firstName(user.name)}.</em></div>
              <div className="s-subtitle">Here's how you've been doing. Your wellbeing matters — we're keeping track so you don't have to.</div>
            </div>

            {/* Score card */}
            <div className="s-card" style={{background:user.risk==="high"?"#fff5f5":user.risk==="medium"?"#fffbf0":"#f0faf6",border:`1px solid ${riskColor(user.risk)}25`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
                <div>
                  <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:"0.8px",fontWeight:600,color:riskColor(user.risk),marginBottom:6}}>Current Wellbeing Score</div>
                  <div style={{fontFamily:"DM Serif Display,serif",fontSize:52,color:riskColor(user.risk),lineHeight:1}}>{user.score.toFixed(1)}</div>
                  <div style={{fontSize:13,color:"#7a8c7a",marginTop:4}}>out of 5.0 · {user.risk==="high"?"At Risk":user.risk==="medium"?"Keep an eye out":"You're doing well"}</div>
                </div>
                <div style={{display:"flex",gap:12}}>
                  {[[`${user.streak}🔥`,"Day Streak","#b45309"],[user.checkins,"Check-ins","#0d9488"]].map(([v,l,c])=>(
                    <div key={l} className="s-metric">
                      <div className="s-metric-val" style={{color:c}}>{v}</div>
                      <div className="s-metric-label">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {user.risk === "high" && (
                <div style={{marginTop:16,padding:"12px 14px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:10,fontSize:13,color:"#991b1b",lineHeight:1.6}}>
                  💙 Your scores have been lower recently. That's okay — healthcare is tough. Please consider speaking with your wellbeing officer. You don't have to carry this alone.
                </div>
              )}
            </div>

            {/* Quick check-in nudge */}
            {!submitted && (
              <div className="s-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
                <div>
                  <div style={{fontFamily:"DM Serif Display,serif",fontSize:18,color:"#0f4040",marginBottom:4}}>Today's check-in is waiting</div>
                  <div style={{fontSize:13,color:"#7a8c7a"}}>It takes 10 seconds. Every response helps us support you better.</div>
                </div>
                <button onClick={()=>setPage("checkin")} style={{padding:"11px 22px",background:"#0d9488",color:"white",border:"none",borderRadius:11,fontFamily:"DM Serif Display,serif",fontSize:15,cursor:"pointer",whiteSpace:"nowrap"}}>Check in now →</button>
              </div>
            )}

            {/* 7-day sparkline */}
            <div className="s-card">
              <div className="s-section-title">Your Score This Week</div>
              <div style={{height:140}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={personalData}>
                    <defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={riskColor(user.risk)} stopOpacity={0.18}/><stop offset="95%" stopColor={riskColor(user.risk)} stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="day" tick={{fill:"#9aaa9a",fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[1,5]} hide/>
                    <Tooltip contentStyle={{background:"white",border:"1px solid #ece8e2",borderRadius:9,fontSize:12,color:"#2d3d2d"}}/>
                    <Area type="monotone" dataKey="score" stroke={riskColor(user.risk)} strokeWidth={2.5} fill="url(#sg2)" dot={{r:3,fill:riskColor(user.risk),strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resources */}
            <div className="s-card">
              <div className="s-section-title">Support Resources</div>
              {[
                {icon:"💆",label:"5-minute breathing exercise",color:"#0d9488",bg:"#e6f4f2"},
                {icon:"🧠",label:"iCall Mental Health · 9152987821",color:"#6366f1",bg:"#eef2ff"},
                {icon:"📞",label:"Talk to your Wellbeing Officer",color:"#059669",bg:"#ecfdf5"},
              ].map(r=>(
                <div key={r.label} className="s-res-item" style={{background:r.bg,color:r.color}}>
                  <span style={{fontSize:18}}>{r.icon}</span>{r.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECK-IN */}
        {page==="checkin" && (
          <div style={{animation:"fadeUp 0.5s ease"}}>
            {!submitted ? (
              <>
                <div style={{textAlign:"center",marginBottom:28}}>
                  <div className="s-streak">🔥 {user.streak}-day check-in streak — keep going!</div>
                  <div style={{fontFamily:"DM Serif Display,serif",fontSize:30,color:"#0f4040",marginBottom:6}}>How are you today, {firstName(user.name)}?</div>
                  <div style={{fontSize:14,color:"#7a8c7a"}}>10 seconds · completely confidential</div>
                </div>
                <div className="s-card">
                  {qs.map(q=>(
                    <div key={q.key} style={{marginBottom:26}}>
                      <div className="s-question">
                        {q.label}
                        <span className="s-score-badge">{scores[q.key] ? `${scores[q.key]}/5` : "—"}</span>
                      </div>
                      <div className="s-emoji-row">
                        {[1,2,3,4,5].map(v=>(
                          <button key={v} className={`s-emoji-btn ${scores[q.key]===v?"picked":""}`}
                            onClick={()=>setScores(s=>({...s,[q.key]:v}))}>{q.emojis[v-1]}</button>
                        ))}
                      </div>
                      <div className="s-scale"><span>Not at all</span><span>Excellent</span></div>
                    </div>
                  ))}
                  <div style={{marginBottom:20}}>
                    <div className="s-question">Anything on your mind? <span style={{color:"#9aaa9a",fontSize:12,fontWeight:400}}>optional</span></div>
                    <textarea className="s-textarea" rows={3}
                      placeholder="A tough shift, something stressing you, or even something good..."
                      value={note} onChange={e=>setNote(e.target.value)}/>
                  </div>
                  <button className="s-submit" disabled={!allDone || loading} onClick={handleSubmit}>
                    {loading ? <><span className="s-spinner"/>Getting your response...</> : "Submit check-in →"}
                  </button>
                  {!allDone && <p style={{textAlign:"center",fontSize:12,color:"#9aaa9a",marginTop:8}}>Answer all 3 questions to submit</p>}
                </div>
              </>
            ) : (
              <div className="s-card" style={{textAlign:"center",padding:"44px 32px"}}>
                <div className="s-success-icon">✅</div>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:28,color:"#0f4040",marginBottom:8}}>Done, {firstName(user.name)}!</div>
                <p style={{color:"#7a8c7a",fontSize:14,marginBottom:24}}>Your response has been recorded. Here's a note from BurnoutRadar:</p>
                {aiReply && (
                  <div className="s-ai-box" style={{textAlign:"left",marginBottom:20}}>
                    <div className="s-ai-label">✦ BurnoutRadar · Just for you</div>
                    {aiReply}
                  </div>
                )}
                <div style={{padding:"12px 16px",background:"#fff8ed",border:"1px solid #fcd34d40",borderRadius:10,fontSize:13,color:"#b45309",marginBottom:20}}>
                  🔥 {user.streak}-day streak maintained!
                </div>
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  <button onClick={()=>setPage("wellbeing")} style={{padding:"11px 22px",background:"#0d9488",color:"white",border:"none",borderRadius:11,fontFamily:"DM Serif Display,serif",fontSize:15,cursor:"pointer"}}>View my wellbeing →</button>
                  <button onClick={resetCheckin} style={{padding:"11px 22px",background:"transparent",color:"#7a8c7a",border:"1px solid #e5e0d8",borderRadius:11,fontSize:14,cursor:"pointer"}}>New check-in</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY WELLBEING */}
        {page==="wellbeing" && (
          <div style={{animation:"fadeUp 0.5s ease"}}>
            <div style={{marginBottom:22}}>
              <div style={{fontFamily:"DM Serif Display,serif",fontSize:28,color:"#0f4040",marginBottom:4}}>Your Wellbeing</div>
              <div style={{fontSize:13.5,color:"#7a8c7a"}}>A personal view of your burnout trends. Only you can see this.</div>
            </div>

            <div style={{display:"flex",gap:18,marginBottom:18}}>
              <div className="s-card" style={{flex:"0 0 200px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{position:"relative",width:110,height:110,margin:"0 auto 14px"}}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="48" fill="none" stroke="#ece8e2" strokeWidth="8"/>
                    <circle cx="55" cy="55" r="48" fill="none" stroke={riskColor(user.risk)} strokeWidth="8"
                      strokeDasharray={`${(user.score/5)*301} 301`} strokeLinecap="round"
                      style={{transform:"rotate(-90deg)",transformOrigin:"55px 55px"}}/>
                  </svg>
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                    <div style={{fontFamily:"DM Serif Display,serif",fontSize:26,color:riskColor(user.risk)}}>{user.score.toFixed(1)}</div>
                    <div style={{fontSize:10,color:"#9aaa9a"}}>/5.0</div>
                  </div>
                </div>
                <div style={{fontFamily:"DM Serif Display,serif",fontSize:15,color:riskColor(user.risk),marginBottom:4}}>
                  {user.risk==="high"?"At Risk":user.risk==="medium"?"Watch Out":"Doing Well"}
                </div>
                <div style={{fontSize:11.5,color:"#9aaa9a",lineHeight:1.5}}>Based on your last 7 check-ins</div>
              </div>

              <div className="s-card" style={{flex:1}}>
                <div className="s-section-title">This Week</div>
                <div style={{height:150}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={personalData}>
                      <XAxis dataKey="day" tick={{fill:"#9aaa9a",fontSize:12}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[1,5]} hide/>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #ece8e2",borderRadius:9,fontSize:12}}/>
                      <Line type="monotone" dataKey="score" stroke={riskColor(user.risk)} strokeWidth={2.5} dot={{r:4,fill:riskColor(user.risk),strokeWidth:0}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="s-card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div className="s-section-title" style={{marginBottom:0}}>AI Weekly Summary</div>
                <AiBtn variant="light" prompt={summaryPrompt} label="✦ Generate my summary"/>
              </div>
              <p style={{fontSize:13,color:"#9aaa9a",marginBottom:4}}>Click above to get a personalised AI summary of your week, based on your check-in data.</p>
            </div>

            <div className="s-card">
              <div className="s-section-title">Support & Resources</div>
              {[
                {icon:"💆",label:"5-minute breathing exercise",color:"#0d9488",bg:"#e6f4f2"},
                {icon:"🧠",label:"iCall Mental Health Helpline · 9152987821",color:"#6366f1",bg:"#eef2ff"},
                {icon:"📞",label:"Connect with your Wellbeing Officer",color:"#059669",bg:"#ecfdf5"},
                {icon:"📖",label:"Self-care resource library",color:"#b45309",bg:"#fff8ed"},
              ].map(r=>(
                <div key={r.label} className="s-res-item" style={{background:r.bg,color:r.color}}>
                  <span style={{fontSize:18}}>{r.icon}</span>{r.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [session, setSession] = useState(null);
  const login  = (s) => setSession(s);
  const logout = ()  => setSession(null);
  if (!session)              return <LoginPage onLogin={login}/>;
  if (session.role==="admin") return <AdminApp onLogout={logout}/>;
  return <StaffApp user={session.user} onLogout={logout}/>;
}
