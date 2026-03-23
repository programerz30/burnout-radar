import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap');`;

/* ─── INITIAL STAFF DATA ─────────────────────────────────────────── */
const INITIAL_WORKERS = [
  { id:1, name:"Priya Menon",   role:"Senior Nurse",    dept:"ICU",        avatar:"PM", color:"#ef4444", score:2.1, trend:-0.8, risk:"high",   streak:12, checkins:12, history:[4.2,3.8,3.5,3.1,2.8,2.4,2.1], checkedInToday:false, lastNote:"" },
  { id:2, name:"Arjun Nair",    role:"Resident Doctor", dept:"Emergency",  avatar:"AN", color:"#f97316", score:2.6, trend:-0.4, risk:"high",   streak:7,  checkins:9,  history:[3.8,3.5,3.2,3.0,2.8,2.7,2.6], checkedInToday:false, lastNote:"" },
  { id:3, name:"Meera Pillai",  role:"Staff Nurse",     dept:"Pediatrics", avatar:"MP", color:"#f59e0b", score:3.2, trend:-0.3, risk:"medium", streak:5,  checkins:11, history:[3.8,3.7,3.6,3.5,3.4,3.3,3.2], checkedInToday:false, lastNote:"" },
  { id:4, name:"Rohit Das",     role:"Paramedic",       dept:"Emergency",  avatar:"RD", color:"#8b5cf6", score:3.1, trend:0.1,  risk:"medium", streak:4,  checkins:8,  history:[2.8,2.9,3.0,3.1,3.0,3.1,3.1], checkedInToday:false, lastNote:"" },
  { id:5, name:"Sunita Rao",    role:"Head Surgeon",    dept:"Surgery",    avatar:"SR", color:"#06b6d4", score:3.7, trend:0.2,  risk:"low",    streak:14, checkins:14, history:[3.3,3.4,3.5,3.5,3.6,3.7,3.7], checkedInToday:false, lastNote:"" },
  { id:6, name:"Kiran Iyer",    role:"Radiologist",     dept:"Radiology",  avatar:"KI", color:"#10b981", score:4.1, trend:0.3,  risk:"low",    streak:9,  checkins:13, history:[3.6,3.7,3.8,3.9,4.0,4.0,4.1], checkedInToday:false, lastNote:"" },
  { id:7, name:"Divya Thomas",  role:"Staff Nurse",     dept:"Oncology",   avatar:"DT", color:"#ec4899", score:2.9, trend:-0.2, risk:"medium", streak:3,  checkins:7,  history:[3.5,3.3,3.2,3.1,3.0,2.9,2.9], checkedInToday:false, lastNote:"" },
  { id:8, name:"Anil Kumar",    role:"Intensivist",     dept:"ICU",        avatar:"AK", color:"#10b981", score:4.4, trend:0.1,  risk:"low",    streak:21, checkins:21, history:[4.0,4.1,4.2,4.3,4.3,4.4,4.4], checkedInToday:false, lastNote:"" },
];

const INITIAL_DEPTS = [
  { name:"ICU",        score:3.2, workers:8,  risk:"medium" },
  { name:"Emergency",  score:2.8, workers:12, risk:"high"   },
  { name:"Pediatrics", score:3.8, workers:6,  risk:"low"    },
  { name:"Surgery",    score:3.5, workers:9,  risk:"low"    },
  { name:"Oncology",   score:2.9, workers:7,  risk:"medium" },
  { name:"Radiology",  score:4.1, workers:4,  risk:"low"    },
];

const WEEK_TREND = [
  {day:"Mon",score:3.6},{day:"Tue",score:3.4},{day:"Wed",score:3.1},
  {day:"Thu",score:3.3},{day:"Fri",score:2.9},{day:"Sat",score:3.0},{day:"Sun",score:3.2},
];

/* ─── HELPERS ────────────────────────────────────────────────────── */
const riskColor = r => r==="high"?"#ef4444":r==="medium"?"#f59e0b":"#10b981";
const riskBg    = r => r==="high"?"rgba(239,68,68,0.12)":r==="medium"?"rgba(245,158,11,0.1)":"rgba(16,185,129,0.1)";
const firstName = n => n.split(" ")[0];

/* ─── SCORE CALCULATOR ───────────────────────────────────────────── */
function calcScore(mood, energy, workload) {
  // workload is inverted: 5 = easy (good), 1 = overwhelming (bad)
  return parseFloat(((mood + energy + workload) / 3).toFixed(1));
}

function calcRisk(score) {
  return score < 2.5 ? "high" : score < 3.5 ? "medium" : "low";
}

/* ─── CLAUDE API ─────────────────────────────────────────────────── */
async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Unable to generate insight.";
}

/* ─── AI BUTTON ──────────────────────────────────────────────────── */
function AiBtn({ prompt, label="✦ Generate AI Insight", variant="dark" }) {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => { setLoading(true); setText(await callClaude(prompt)); setLoading(false); };
  const isDark = variant === "dark";
  return (
    <div>
      {!text && !loading && (
        <button onClick={run} style={{ padding:"6px 14px", background:isDark?"rgba(6,182,212,0.1)":"#0d9488", border:isDark?"1px solid rgba(6,182,212,0.25)":"none", borderRadius:8, color:isDark?"#06b6d4":"white", fontSize:12, fontWeight:600, cursor:"pointer" }}>
          {label}
        </button>
      )}
      {loading && (
        <div style={{ background:isDark?"linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.08))":"rgba(255,255,255,0.7)", border:isDark?"1px solid rgba(6,182,212,0.2)":"1px solid rgba(13,148,136,0.25)", borderRadius:12, padding:14, fontSize:13, color:isDark?"#c8d8f0":"#134e4a" }}>
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.8px", color:isDark?"#06b6d4":"#0d9488", fontWeight:600, marginBottom:6 }}>✦ BurnoutRadar AI</div>
          <span style={{ color:isDark?"#6b7a99":"#5eead4" }}>Analysing <Dots/></span>
        </div>
      )}
      {text && !loading && (
        <div style={{ background:isDark?"linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.08))":"rgba(255,255,255,0.7)", border:isDark?"1px solid rgba(6,182,212,0.2)":"1px solid rgba(13,148,136,0.25)", borderRadius:12, padding:14, fontSize:13, lineHeight:1.7, color:isDark?"#c8d8f0":"#134e4a" }}>
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.8px", color:isDark?"#06b6d4":"#0d9488", fontWeight:600, marginBottom:6 }}>✦ BurnoutRadar AI</div>
          {text}
        </div>
      )}
    </div>
  );
}

function Dots() {
  return <>{[0,1,2].map(i=><span key={i} style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:"currentColor",margin:"0 2px",animation:`blink 1.2s ${i*0.2}s ease infinite`}}/>)}</>;
}

/* ════════════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════════════ */
function LoginPage({ onLogin, workers }) {
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [selected, setSelected] = useState(null);
  const [staffPw, setStaffPw] = useState("");
  const [staffErr, setStaffErr] = useState(false);

  return (
    <div style={{ minHeight:"100vh", background:"#0b1120", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:24 }}>
      <style>{FONTS}{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.4);opacity:0}}
        .lw{display:flex;gap:24px;width:100%;max-width:900px;animation:fadeUp 0.6s ease}
        .ac{flex:0 0 300px;background:#111827;border:1px solid #1e2d45;border-radius:20px;padding:32px;display:flex;flex-direction:column}
        .sc{flex:1;background:#111827;border:1px solid #1e2d45;border-radius:20px;padding:32px}
        .pw{width:100%;background:#1a2234;border:1.5px solid #1e2d45;border-radius:10px;color:#e8eaf2;font-family:'DM Sans',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:border-color 0.2s;display:block;margin-bottom:10px}
        .pw:focus{border-color:#f59e0b}
        .pw.teal:focus{border-color:#0d9488}
        .sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
        .stile{border-radius:12px;padding:14px 10px;cursor:pointer;border:1.5px solid #1e2d45;background:#1a2234;text-align:center;transition:all 0.18s;position:relative}
        .stile:hover{border-color:#0d9488;transform:translateY(-2px)}
        .stile.picked{border-color:#0d9488;background:rgba(13,148,136,0.1)}
        .checked-badge{position:absolute;top:6px;right:6px;width:16px;height:16px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:white}
        .pulse-dot{position:relative;width:7px;height:7px;display:inline-block;margin-right:4px}
        .pulse-inner{width:7px;height:7px;border-radius:50%;position:absolute}
        .pulse-ring{width:7px;height:7px;border-radius:50%;position:absolute;animation:pulse-ring 1.5s ease-out infinite}
        .p-red .pulse-inner,.p-red .pulse-ring{background:#ef4444}
        .p-yellow .pulse-inner,.p-yellow .pulse-ring{background:#f59e0b}
        .p-green .pulse-inner,.p-green .pulse-ring{background:#10b981}
      `}</style>
      <div className="lw">
        {/* ADMIN */}
        <div className="ac">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:38, height:38, background:"#f59e0b", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🧠</div>
            <div><div style={{ fontFamily:"Syne", fontSize:16, fontWeight:700, color:"#e8eaf2" }}>BurnoutRadar</div><div style={{ fontSize:11, color:"#6b7a99" }}>Wellbeing Intelligence</div></div>
          </div>
          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"1.5px", fontWeight:600, padding:"4px 10px", borderRadius:20, background:"rgba(245,158,11,0.12)", color:"#f59e0b", border:"1px solid rgba(245,158,11,0.25)", display:"inline-block", marginBottom:16 }}>Hospital Admin</div>
          <p style={{ fontSize:13, color:"#6b7a99", lineHeight:1.6, marginBottom:20 }}>Access the full institutional dashboard, team analytics, and AI-generated alerts.</p>
          <input className="pw" type="password" placeholder="Admin password" value={adminPw} onChange={e=>{setAdminPw(e.target.value);setAdminErr(false)}} onKeyDown={e=>e.key==="Enter"&&(adminPw==="admin123"?onLogin({role:"admin"}):setAdminErr(true))}/>
          {adminErr && <div style={{ fontSize:12, color:"#ef4444", marginBottom:8 }}>Incorrect. Try "admin123"</div>}
          <p style={{ fontSize:11, color:"#6b7a99", marginBottom:"auto" }}>Demo password: admin123</p>
          <button style={{ width:"100%", padding:12, background:"#f59e0b", color:"#000", border:"none", borderRadius:10, fontFamily:"Syne", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:24 }}
            onClick={()=>adminPw==="admin123"?onLogin({role:"admin"}):setAdminErr(true)}>
            Sign in as Admin →
          </button>
        </div>

        {/* STAFF */}
        <div className="sc">
          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"1.5px", fontWeight:600, padding:"4px 10px", borderRadius:20, background:"rgba(6,182,212,0.1)", color:"#06b6d4", border:"1px solid rgba(6,182,212,0.2)", display:"inline-block", marginBottom:12 }}>Healthcare Staff Login</div>
          <p style={{ fontSize:13, color:"#6b7a99", marginBottom:18, lineHeight:1.6 }}>Select your name, then enter the staff password.</p>
          <div className="sgrid">
            {workers.map(s => (
              <div key={s.id} className={`stile ${selected?.id===s.id?"picked":""}`} onClick={()=>{setSelected(s);setStaffErr(false);}}>
                {s.checkedInToday && <div className="checked-badge">✓</div>}
                <div style={{ width:42, height:42, borderRadius:"50%", background:s.color+"25", color:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, margin:"0 auto 8px" }}>{s.avatar}</div>
                <div style={{ fontSize:12, fontWeight:500, color:"#e8eaf2", marginBottom:2 }}>{s.name}</div>
                <div style={{ fontSize:10.5, color:"#6b7a99", marginBottom:4 }}>{s.dept}</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div className={`pulse-dot p-${s.risk==="high"?"red":s.risk==="medium"?"yellow":"green"}`}><div className="pulse-inner"/><div className="pulse-ring"/></div>
                  <span style={{ fontSize:10, color:riskColor(s.risk), fontWeight:600 }}>{s.score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
          {selected && (
            <div style={{ borderTop:"1px solid #1e2d45", paddingTop:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:selected.color+"25", color:selected.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13 }}>{selected.avatar}</div>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:500, color:"#e8eaf2" }}>Logging in as <strong>{selected.name}</strong></div>
                  <div style={{ fontSize:11.5, color:"#6b7a99" }}>{selected.role} · {selected.dept}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}>
                  <input className="pw teal" type="password" placeholder="Staff password" value={staffPw}
                    onChange={e=>{setStaffPw(e.target.value);setStaffErr(false)}}
                    onKeyDown={e=>e.key==="Enter"&&(staffPw==="staff123"?onLogin({role:"staff",user:selected}):setStaffErr(true))}/>
                  {staffErr && <div style={{ fontSize:12, color:"#ef4444" }}>Incorrect. Try "staff123"</div>}
                  <p style={{ fontSize:11, color:"#6b7a99", marginTop:4 }}>Demo password: staff123</p>
                </div>
                <button style={{ flex:"0 0 130px", padding:12, background:"#0d9488", color:"white", border:"none", borderRadius:10, fontFamily:"Syne", fontSize:14, fontWeight:700, cursor:"pointer", alignSelf:"flex-start" }}
                  onClick={()=>staffPw==="staff123"?onLogin({role:"staff",user:selected}):setStaffErr(true)}>
                  Continue →
                </button>
              </div>
            </div>
          )}
          {!selected && <p style={{ fontSize:12, color:"#6b7a99", textAlign:"center", paddingTop:8 }}>👆 Select your name to continue</p>}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ADMIN UI
═══════════════════════════════════════════════════════════════════════ */
const ADMIN_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-ring{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.4);opacity:0}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes slideR{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes newUpdate{0%{background:rgba(16,185,129,0.2)}100%{background:transparent}}
  .a-app{display:flex;min-height:100vh;background:#08101e;color:#dde4f0;font-family:'DM Sans',sans-serif}
  .a-sidebar{width:210px;background:#0e1626;border-right:1px solid #182236;display:flex;flex-direction:column;padding:0;position:fixed;top:0;left:0;bottom:0;z-index:20}
  .a-logo{padding:22px 20px 20px;border-bottom:1px solid #182236;margin-bottom:12px}
  .a-nav-item{display:flex;align-items:center;gap:9px;padding:9px 20px;color:#4a5a7a;cursor:pointer;font-size:13px;font-weight:500;border-left:3px solid transparent;transition:all 0.18s}
  .a-nav-item:hover{color:#dde4f0;background:#121e30}
  .a-nav-item.on{color:#f59e0b;border-left-color:#f59e0b;background:#121e30}
  .a-sidebar-footer{margin-top:auto;padding:14px 18px;border-top:1px solid #182236}
  .a-main{margin-left:210px;flex:1;padding:28px 32px;min-height:100vh}
  .a-card{background:#0e1626;border:1px solid #182236;border-radius:13px;padding:20px}
  .a-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
  .a-stat{background:#0e1626;border:1px solid #182236;border-radius:13px;padding:18px;animation:fadeUp 0.5s ease forwards;opacity:0}
  .a-stat:nth-child(1){animation-delay:0.05s}.a-stat:nth-child(2){animation-delay:0.1s}.a-stat:nth-child(3){animation-delay:0.15s}.a-stat:nth-child(4){animation-delay:0.2s}
  .a-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
  .a-section-title{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:#e8eaf2;margin-bottom:13px;display:flex;align-items:center;gap:7px}
  .a-table{width:100%;border-collapse:collapse}
  .a-table th{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#4a5a7a;padding:9px 12px;border-bottom:1px solid #182236;text-align:left;font-weight:600}
  .a-table td{padding:11px 12px;border-bottom:1px solid rgba(24,34,54,0.6);font-size:13px;transition:background 0.3s}
  .a-table tr:last-child td{border-bottom:none}
  .a-table tr:hover td{background:rgba(18,30,48,0.5)}
  .a-table tr.just-updated td{animation:newUpdate 2s ease}
  .a-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
  .a-chip{padding:3px 9px;border-radius:6px;font-size:11px;background:#121e30;color:#6b7a99;border:1px solid #182236}
  .a-bar-wrap{display:flex;align-items:center;gap:7px}
  .a-bar{flex:1;height:4px;background:#182236;border-radius:2px;overflow:hidden}
  .a-bar-fill{height:100%;border-radius:2px;transition:width 0.8s ease}
  .a-score-n{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;width:24px;text-align:right}
  .a-dept-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .a-dept-cell{border-radius:9px;padding:12px;cursor:pointer;transition:all 0.18s}
  .a-dept-cell:hover{transform:translateY(-2px)}
  .a-alert{padding:12px 14px;border-radius:9px;border-left:3px solid;background:#121e30;margin-bottom:9px}
  .a-panel{position:fixed;right:0;top:0;bottom:0;width:370px;background:#0e1626;border-left:1px solid #182236;z-index:50;padding:26px;overflow-y:auto;animation:slideR 0.3s ease}
  .a-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:49}
  .f-chip{padding:5px 11px;border-radius:20px;font-size:11.5px;font-weight:500;border:1px solid #182236;background:transparent;color:#4a5a7a;cursor:pointer;transition:all 0.15s}
  .f-chip:hover{border-color:#f59e0b;color:#f59e0b}
  .f-chip.on{background:rgba(245,158,11,0.1);border-color:#f59e0b;color:#f59e0b}
  .pulse-dot{position:relative;width:7px;height:7px;display:inline-block}
  .pulse-inner{width:7px;height:7px;border-radius:50%;position:absolute}
  .pulse-ring{width:7px;height:7px;border-radius:50%;position:absolute;animation:pulse-ring 1.5s ease-out infinite}
  .p-red .pulse-inner,.p-red .pulse-ring{background:#ef4444}
  .p-yellow .pulse-inner,.p-yellow .pulse-ring{background:#f59e0b}
  .p-green .pulse-inner,.p-green .pulse-ring{background:#10b981}
  .live-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);color:#10b981;font-size:11px;font-weight:600}
  .a-tooltip{background:#121e30;border:1px solid #182236;border-radius:8px;padding:9px 13px;font-size:12px}
  .new-tag{font-size:10px;background:rgba(16,185,129,0.15);color:#10b981;padding:2px 7px;border-radius:10px;margin-left:6px;font-weight:600}
`;

function AdminApp({ onLogout, workers }) {
  const [page, setPage] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const high   = workers.filter(w=>w.risk==="high").length;
  const medium = workers.filter(w=>w.risk==="medium").length;
  const low    = workers.filter(w=>w.risk==="low").length;
  const avg    = (workers.reduce((s,w)=>s+w.score,0)/workers.length).toFixed(1);
  const checkedInToday = workers.filter(w=>w.checkedInToday).length;

  const filtered = filter==="all" ? workers : workers.filter(w=>w.risk===filter);

  // Update selected panel when workers data changes
  const selectedWorker = selected ? workers.find(w=>w.id===selected.id) : null;

  const ATip = ({active,payload,label}) => {
    if(!active||!payload?.length) return null;
    return <div className="a-tooltip"><p style={{color:"#4a5a7a",fontSize:11}}>{label}</p><span style={{color:"#f59e0b",fontFamily:"Syne",fontWeight:700,fontSize:15}}>{payload[0].value.toFixed(1)}</span></div>;
  };

  return (
    <div className="a-app">
      <style>{FONTS + ADMIN_CSS}</style>
      <div className="a-sidebar">
        <div className="a-logo">
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#f59e0b,#f97316)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, marginBottom:9 }}>🧠</div>
          <div style={{ fontFamily:"Syne", fontSize:15, fontWeight:800, color:"#e8eaf2" }}>BurnoutRadar</div>
          <div style={{ fontSize:10, color:"#4a5a7a", letterSpacing:"0.5px" }}>ADMIN CONSOLE</div>
        </div>
        {[["dashboard","◈","Overview"],["workers","◉","All Workers"],["insights","✦","AI Insights"],["alerts","⚡","Alerts"]].map(([id,icon,label])=>(
          <div key={id} className={`a-nav-item ${page===id?"on":""}`} onClick={()=>setPage(id)}>
            <span style={{fontSize:15}}>{icon}</span>{label}
          </div>
        ))}
        <div className="a-sidebar-footer">
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#f59e0b,#f97316)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#000" }}>AD</div>
            <div><div style={{ fontSize:12.5, fontWeight:500, color:"#dde4f0" }}>Hospital Admin</div><div style={{ fontSize:10.5, color:"#4a5a7a" }}>Administrator</div></div>
          </div>
          {/* Live indicator */}
          <div className="live-badge" style={{ marginBottom:10 }}>
            <div className="pulse-dot p-green" style={{ width:6, height:6 }}><div className="pulse-inner" style={{ width:6, height:6 }}/><div className="pulse-ring" style={{ width:6, height:6 }}/></div>
            Live · {checkedInToday}/{workers.length} checked in
          </div>
          <div style={{ fontSize:11.5, color:"#4a5a7a", cursor:"pointer" }} onClick={onLogout}>← Sign out</div>
        </div>
      </div>

      <div className="a-main">

        {/* DASHBOARD */}
        {page==="dashboard" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26 }}>
              <div>
                <div style={{ fontFamily:"Syne", fontSize:23, fontWeight:800, color:"#e8eaf2" }}>Overview</div>
                <div style={{ fontSize:12.5, color:"#4a5a7a", marginTop:3 }}>Live data · updates when staff check in</div>
              </div>
              <div className="live-badge">
                <div className="pulse-dot p-green" style={{ width:6, height:6 }}><div className="pulse-inner" style={{ width:6, height:6 }}/><div className="pulse-ring" style={{ width:6, height:6 }}/></div>
                {checkedInToday} check-ins today
              </div>
            </div>

            <div className="a-stats">
              {[[avg,"Avg Score","#f59e0b","Out of 5.0"],[high,"High Risk","#ef4444","Need immediate action"],[medium,"Monitoring","#f59e0b","Declining trend"],[low,"Stable","#10b981","Doing well"]].map(([v,l,c,s],i)=>(
                <div key={i} className="a-stat">
                  <div style={{ fontSize:10.5, color:"#4a5a7a", textTransform:"uppercase", letterSpacing:"1px", fontWeight:600 }}>{l}</div>
                  <div style={{ fontFamily:"Syne", fontSize:30, fontWeight:800, color:c, margin:"5px 0 3px" }}>{v}</div>
                  <div style={{ fontSize:11, color:"#4a5a7a" }}>{s}</div>
                </div>
              ))}
            </div>

            <div className="a-grid2">
              <div className="a-card">
                <div className="a-section-title">Weekly Score Trend</div>
                <div style={{ height:165 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WEEK_TREND}>
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
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div className="a-section-title" style={{ marginBottom:0 }}>Department Heatmap</div>
                  <AiBtn variant="dark" prompt={`BurnoutRadar admin AI. Workers: ${workers.map(w=>`${w.name}(${w.dept},score:${w.score},risk:${w.risk})`).join(";")}. Avg: ${avg}/5. High risk: ${high}. Give 3-sentence summary: urgent dept, pattern, recommendation. Under 65 words.`} label="✦ AI Summary"/>
                </div>
                <div className="a-dept-grid">
                  {INITIAL_DEPTS.map(d=>(
                    <div key={d.name} className="a-dept-cell" style={{ background:riskBg(d.risk), border:`1px solid ${riskColor(d.risk)}25` }}>
                      <div style={{ fontSize:11, fontWeight:600, color:riskColor(d.risk), marginBottom:3 }}>{d.name}</div>
                      <div style={{ fontFamily:"Syne", fontSize:21, fontWeight:800, color:riskColor(d.risk) }}>{d.score.toFixed(1)}</div>
                      <div style={{ fontSize:10, opacity:0.6, marginTop:2 }}>{d.workers} workers</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LIVE WORKER TABLE */}
            <div className="a-card">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div className="a-section-title" style={{ marginBottom:0 }}>
                  All Workers
                  <span className="live-badge" style={{ fontSize:10, padding:"2px 8px" }}>● Live</span>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {["all","high","medium","low"].map(f=>(
                    <button key={f} className={`f-chip ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>
                      {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <table className="a-table">
                <thead><tr><th>Worker</th><th>Dept</th><th>Score</th><th>Trend</th><th>Checked In</th><th>Risk</th></tr></thead>
                <tbody>
                  {filtered.map((w,i)=>(
                    <tr key={w.id} className={w.checkedInToday?"just-updated":""} onClick={()=>setSelected(w)} style={{ cursor:"pointer", opacity:0, animation:`fadeUp 0.4s ${i*0.05+0.05}s ease forwards` }}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:w.color+"20", color:w.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{w.avatar}</div>
                          <div>
                            <div style={{ fontWeight:500, fontSize:13 }}>{w.name}{w.checkedInToday && <span className="new-tag">Updated</span>}</div>
                            <div style={{ fontSize:11, color:"#4a5a7a" }}>{w.role}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="a-chip">{w.dept}</span></td>
                      <td>
                        <div className="a-bar-wrap">
                          <div className="a-bar"><div className="a-bar-fill" style={{ width:`${(w.score/5)*100}%`, background:riskColor(w.risk) }}/></div>
                          <span className="a-score-n" style={{ color:riskColor(w.risk) }}>{w.score.toFixed(1)}</span>
                        </div>
                      </td>
                      <td><span style={{ fontSize:12, color:w.trend<0?"#ef4444":w.trend>0?"#10b981":"#4a5a7a" }}>{w.trend<0?`▼ ${Math.abs(w.trend).toFixed(1)}`:w.trend>0?`▲ ${w.trend.toFixed(1)}`:"—"}</span></td>
                      <td><span style={{ fontSize:12, color:w.checkedInToday?"#10b981":"#4a5a7a" }}>{w.checkedInToday?"✓ Today":"Not yet"}</span></td>
                      <td><span className="a-badge" style={{ background:riskBg(w.risk), color:riskColor(w.risk) }}><div className={`pulse-dot p-${w.risk==="high"?"red":w.risk==="medium"?"yellow":"green"}`}><div className="pulse-inner"/><div className="pulse-ring"/></div>{w.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {page==="alerts" && (
          <div style={{ animation:"fadeUp 0.4s ease", maxWidth:640 }}>
            <div style={{ fontFamily:"Syne", fontSize:23, fontWeight:800, color:"#e8eaf2", marginBottom:4 }}>Active Alerts</div>
            <div style={{ fontSize:12.5, color:"#4a5a7a", marginBottom:24 }}>Auto-generated from live check-in data</div>
            {workers.filter(w=>w.risk==="high").map((w,i)=>(
              <div key={w.id} className="a-alert" style={{ borderLeftColor:"#ef4444" }}>
                <div style={{ fontWeight:600, fontSize:13.5, color:"#dde4f0", marginBottom:4 }}>
                  🚨 Critical — {w.name} ({w.dept})
                  {w.checkedInToday && <span className="new-tag">Just updated</span>}
                </div>
                <div style={{ fontSize:12.5, color:"#4a5a7a", lineHeight:1.5 }}>
                  Current score: {w.score.toFixed(1)}/5. {w.checkedInToday ? `Checked in today — score ${w.trend < 0 ? "declined further" : "has improved slightly"}.` : "Has not checked in today."}
                </div>
                {w.lastNote && <div style={{ fontSize:12, color:"#6b8a6b", marginTop:6, fontStyle:"italic" }}>Note: "{w.lastNote}"</div>}
              </div>
            ))}
            {workers.filter(w=>w.risk==="medium").map((w,i)=>(
              <div key={w.id} className="a-alert" style={{ borderLeftColor:"#f59e0b" }}>
                <div style={{ fontWeight:600, fontSize:13.5, color:"#dde4f0", marginBottom:4 }}>
                  ⚠ Watch — {w.name} ({w.dept})
                  {w.checkedInToday && <span className="new-tag">Just updated</span>}
                </div>
                <div style={{ fontSize:12.5, color:"#4a5a7a", lineHeight:1.5 }}>Score: {w.score.toFixed(1)}/5 · Trend: {w.trend < 0 ? `↓ declining` : "stable"}</div>
              </div>
            ))}
          </div>
        )}

        {/* AI INSIGHTS */}
        {page==="insights" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ fontFamily:"Syne", fontSize:23, fontWeight:800, color:"#e8eaf2", marginBottom:4 }}>AI Insights</div>
            <div style={{ fontSize:12.5, color:"#4a5a7a", marginBottom:24 }}>On-demand analysis using live check-in data</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {workers.filter(w=>w.risk!=="low").map((w,i)=>(
                <div key={w.id} className="a-card" style={{ borderLeft:`3px solid ${riskColor(w.risk)}`, opacity:0, animation:`fadeUp 0.5s ${i*0.08+0.05}s ease forwards` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:w.color+"20", color:w.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12 }}>{w.avatar}</div>
                      <div>
                        <div style={{ fontFamily:"Syne", fontSize:13.5, fontWeight:700, color:"#e8eaf2" }}>{w.name}{w.checkedInToday && <span className="new-tag">Live data</span>}</div>
                        <div style={{ fontSize:11, color:"#4a5a7a" }}>{w.role} · {w.dept} · Score: {w.score.toFixed(1)}</div>
                      </div>
                    </div>
                    <span className="a-badge" style={{ background:riskBg(w.risk), color:riskColor(w.risk) }}>{w.risk}</span>
                  </div>
                  <AiBtn variant="dark"
                    prompt={`BurnoutRadar AI for admin. Worker: ${w.name}, ${w.role}, ${w.dept}. Score: ${w.score}/5. History: ${w.history.join(",")}. Trend: ${w.trend}. Risk: ${w.risk}. ${w.checkedInToday?`Just checked in today.`:"Has not checked in today."} ${w.lastNote?`Note from worker: "${w.lastNote}"`:""}. Give 3-sentence clinical insight and 1 action. Under 65 words.`}
                    label="✦ Analyse"/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKERS PAGE */}
        {page==="workers" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ fontFamily:"Syne", fontSize:23, fontWeight:800, color:"#e8eaf2", marginBottom:4 }}>All Workers</div>
            <div style={{ fontSize:12.5, color:"#4a5a7a", marginBottom:20 }}>{workers.length} staff · {checkedInToday} checked in today</div>
            <div className="a-card">
              <table className="a-table">
                <thead><tr><th>Worker</th><th>Dept</th><th>Score</th><th>Trend</th><th>Streak</th><th>Checked In</th><th>Risk</th></tr></thead>
                <tbody>
                  {workers.map((w,i)=>(
                    <tr key={w.id} className={w.checkedInToday?"just-updated":""} onClick={()=>setSelected(w)} style={{ cursor:"pointer", opacity:0, animation:`fadeUp 0.4s ${i*0.05+0.05}s ease forwards` }}>
                      <td><div style={{ display:"flex", alignItems:"center", gap:9 }}><div style={{ width:28, height:28, borderRadius:"50%", background:w.color+"20", color:w.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{w.avatar}</div><div><div style={{ fontWeight:500 }}>{w.name}</div><div style={{ fontSize:11, color:"#4a5a7a" }}>{w.role}</div></div></div></td>
                      <td><span className="a-chip">{w.dept}</span></td>
                      <td><div className="a-bar-wrap"><div className="a-bar"><div className="a-bar-fill" style={{ width:`${(w.score/5)*100}%`, background:riskColor(w.risk) }}/></div><span className="a-score-n" style={{ color:riskColor(w.risk) }}>{w.score.toFixed(1)}</span></div></td>
                      <td><span style={{ fontSize:12, color:w.trend<0?"#ef4444":w.trend>0?"#10b981":"#4a5a7a" }}>{w.trend<0?`▼ ${Math.abs(w.trend).toFixed(1)}`:w.trend>0?`▲ ${w.trend.toFixed(1)}`:"—"}</span></td>
                      <td><span style={{ fontSize:13, color:"#f59e0b" }}>🔥 {w.streak}d</span></td>
                      <td><span style={{ fontSize:12, color:w.checkedInToday?"#10b981":"#4a5a7a" }}>{w.checkedInToday?"✓ Yes":"No"}</span></td>
                      <td><span className="a-badge" style={{ background:riskBg(w.risk), color:riskColor(w.risk) }}>{w.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* WORKER PANEL */}
      {selectedWorker && (
        <>
          <div className="a-overlay" onClick={()=>setSelected(null)}/>
          <div className="a-panel">
            <div style={{ position:"absolute", top:18, right:18, width:28, height:28, background:"#182236", border:"1px solid #1e2d45", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#4a5a7a" }} onClick={()=>setSelected(null)}>✕</div>
            <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:22, marginTop:6 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:selectedWorker.color+"22", color:selectedWorker.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16 }}>{selectedWorker.avatar}</div>
              <div>
                <div style={{ fontFamily:"Syne", fontWeight:700, fontSize:16, color:"#e8eaf2" }}>{selectedWorker.name}{selectedWorker.checkedInToday && <span className="new-tag">Live</span>}</div>
                <div style={{ fontSize:12, color:"#4a5a7a" }}>{selectedWorker.role} · {selectedWorker.dept}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:9, marginBottom:18 }}>
              {[[selectedWorker.score.toFixed(1),"Score",riskColor(selectedWorker.risk)],[`${selectedWorker.streak}🔥`,"Streak","#f59e0b"],[selectedWorker.checkins,"Check-ins","#06b6d4"]].map(([v,l,c])=>(
                <div key={l} style={{ flex:1, background:"#121e30", border:"1px solid #182236", borderRadius:9, padding:"11px", textAlign:"center" }}>
                  <div style={{ fontFamily:"Syne", fontSize:21, fontWeight:800, color:c }}>{v}</div>
                  <div style={{ fontSize:10.5, color:"#4a5a7a" }}>{l}</div>
                </div>
              ))}
            </div>
            {selectedWorker.lastNote && (
              <div style={{ padding:"10px 13px", background:"rgba(6,182,212,0.06)", border:"1px solid rgba(6,182,212,0.15)", borderRadius:9, fontSize:12.5, color:"#93c5d0", marginBottom:16, fontStyle:"italic" }}>
                💬 Latest note: "{selectedWorker.lastNote}"
              </div>
            )}
            <div className="a-section-title">7-Day Trend</div>
            <div style={{ height:120, marginBottom:18 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedWorker.history.map((s,i)=>({day:`D-${6-i}`,score:s}))}>
                  <defs><linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={riskColor(selectedWorker.risk)} stopOpacity={0.2}/><stop offset="95%" stopColor={riskColor(selectedWorker.risk)} stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="day" tick={{fill:"#4a5a7a",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[1,5]} hide/>
                  <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="a-tooltip"><span style={{color:riskColor(selectedWorker.risk),fontWeight:700}}>{payload[0].value.toFixed(1)}</span></div>:null}/>
                  <Area type="monotone" dataKey="score" stroke={riskColor(selectedWorker.risk)} strokeWidth={2} fill="url(#pg2)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="a-section-title">AI Analysis</div>
            <AiBtn variant="dark" prompt={`BurnoutRadar AI. Worker: ${selectedWorker.name}, ${selectedWorker.role}, ${selectedWorker.dept}. Score: ${selectedWorker.score}/5. 7-day history: ${selectedWorker.history.join(",")}. Trend: ${selectedWorker.trend}. Risk: ${selectedWorker.risk}. ${selectedWorker.checkedInToday?"Checked in today.":"Not yet checked in today."} ${selectedWorker.lastNote?`Latest note: "${selectedWorker.lastNote}"`:""}. Give 3-sentence clinical insight + 1 action. Under 65 words.`}/>
            <div className="a-section-title" style={{ marginTop:16 }}>Actions</div>
            {selectedWorker.risk==="high"&&["🚨 Schedule immediate 1:1 check-in","📋 Review shift load and overtime","💬 Refer to peer support program"].map(a=>(
              <div key={a} style={{ padding:"9px 12px", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:8, fontSize:12.5, marginBottom:7, color:"#fca5a5" }}>{a}</div>
            ))}
            {selectedWorker.risk==="medium"&&["⚠️ Monitor score daily","🗓 Offer optional wellbeing conversation"].map(a=>(
              <div key={a} style={{ padding:"9px 12px", background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:8, fontSize:12.5, marginBottom:7, color:"#fcd34d" }}>{a}</div>
            ))}
            {selectedWorker.risk==="low"&&<div style={{ padding:"9px 12px", background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.18)", borderRadius:8, fontSize:12.5, color:"#6ee7b7" }}>✅ No action needed.</div>}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STAFF UI
═══════════════════════════════════════════════════════════════════════ */
const STAFF_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .s-app{min-height:100vh;background:#f4f0eb;font-family:'DM Sans',sans-serif;color:#1c2b2b}
  .s-topbar{background:white;border-bottom:1px solid #e5e0d8;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  .s-nav-btn{padding:8px 16px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:#6b7a6a;transition:all 0.18s}
  .s-nav-btn:hover{background:#ece8e2;color:#1c2b2b}
  .s-nav-btn.on{background:#0d9488;color:white}
  .s-main{padding:32px;max-width:760px;margin:0 auto}
  .s-card{background:white;border-radius:16px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.03);margin-bottom:18px}
  .s-section-title{font-family:'DM Serif Display',serif;font-size:18px;color:#0f4040;margin-bottom:14px}
  .s-emoji-btn{flex:1;height:52px;border-radius:12px;border:2px solid #ece8e2;background:#faf8f5;font-size:22px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center}
  .s-emoji-btn:hover{border-color:#0d9488;transform:scale(1.06)}
  .s-emoji-btn.picked{background:#e6f4f2;border-color:#0d9488;transform:scale(1.08);box-shadow:0 4px 12px rgba(13,148,136,0.2)}
  .s-textarea{width:100%;background:#faf8f5;border:2px solid #ece8e2;border-radius:12px;color:#2d3d2d;font-family:'DM Sans',sans-serif;font-size:14px;padding:13px 15px;resize:none;outline:none;transition:border-color 0.2s;line-height:1.6}
  .s-textarea:focus{border-color:#0d9488}
  .s-submit{width:100%;padding:15px;background:#0d9488;color:white;border:none;border-radius:13px;font-family:'DM Serif Display',serif;font-size:17px;cursor:pointer;transition:all 0.2s;margin-top:4px}
  .s-submit:hover:not(:disabled){background:#0f766e;transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,0.3)}
  .s-submit:disabled{opacity:0.45;cursor:not-allowed}
  .s-streak{display:inline-flex;align-items:center;gap:7px;background:#fff8ed;border:1px solid #fcd34d40;border-radius:20px;padding:6px 14px;font-size:13px;font-weight:500;color:#b45309;margin-bottom:22px}
  .s-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;vertical-align:middle;margin-right:7px}
  .s-metric{background:#faf8f5;border-radius:12px;padding:16px;text-align:center;flex:1}
  .s-metric-val{font-family:'DM Serif Display',serif;font-size:28px;margin-bottom:3px}
  .s-metric-label{font-size:11px;color:#7a8c7a;text-transform:uppercase;letter-spacing:0.7px;font-weight:500}
  .s-res-item{padding:11px 14px;border-radius:10px;font-size:13.5px;margin-bottom:8px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:10px}
  .s-res-item:hover{transform:translateX(3px)}
`;

function StaffApp({ user, onLogout, onCheckinSubmit }) {
  const [page, setPage] = useState("home");
  const [scores, setScores] = useState({ mood:0, energy:0, workload:0 });
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(user.checkedInToday);
  const [loading, setLoading] = useState(false);
  const [aiReply, setAiReply] = useState(null);
  const [newScore, setNewScore] = useState(user.score);
  const [newRisk, setNewRisk] = useState(user.risk);

  const qs = [
    { key:"mood",     label:"How is your mood right now?",           emojis:["😞","😕","😐","🙂","😄"] },
    { key:"energy",   label:"How are your energy levels today?",     emojis:["🪫","😴","⚡","🔋","✨"] },
    { key:"workload", label:"How manageable is your workload today?", emojis:["🔥","😰","😤","👍","🌟"] },
  ];
  const allDone = scores.mood && scores.energy && scores.workload;

  const handleSubmit = async () => {
    if (!allDone) return;
    setLoading(true);

    const calculatedScore = calcScore(scores.mood, scores.energy, scores.workload);
    const calculatedRisk  = calcRisk(calculatedScore);
    const oldScore        = user.score;
    const trendChange     = parseFloat((calculatedScore - oldScore).toFixed(1));

    // ★ UPDATE SHARED STATE — this is what the admin sees live
    onCheckinSubmit(user.id, {
      score:      calculatedScore,
      risk:       calculatedRisk,
      trend:      trendChange,
      history:    [...user.history.slice(1), calculatedScore],
      checkins:   user.checkins + 1,
      streak:     user.streak + 1,
      checkedInToday: true,
      lastNote:   note,
    });

    setNewScore(calculatedScore);
    setNewRisk(calculatedRisk);

    const prompt = `You are BurnoutRadar, a compassionate healthcare wellbeing AI. A healthcare worker just submitted their daily check-in.

Worker: ${user.name} (${user.role}, ${user.dept})
Mood: ${scores.mood}/5 ${["😞","😕","😐","🙂","😄"][scores.mood-1]}
Energy: ${scores.energy}/5 ${["🪫","😴","⚡","🔋","✨"][scores.energy-1]}
Workload manageability: ${scores.workload}/5 ${["🔥","😰","😤","👍","🌟"][scores.workload-1]}
${note ? `Their note: "${note}"` : "No note added."}
New score: ${calculatedScore}/5 (was ${oldScore}/5) — Risk: ${calculatedRisk}
Change: ${trendChange > 0 ? `+${trendChange} improvement` : trendChange < 0 ? `${trendChange} decline` : "no change"}

Write a warm 2–3 sentence response. Acknowledge how they feel. If scores are low, validate and suggest one small self-care action. If improved, celebrate it. Address by first name. Human and caring. Under 55 words.`;

    const text = await callClaude(prompt);
    setAiReply(text);
    setLoading(false);
    setSubmitted(true);
  };

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const personalData = user.history.map((s,i) => ({ day:["M","T","W","T","F","S","S"][i], score:s }));

  return (
    <div className="s-app">
      <style>{FONTS + STAFF_CSS}</style>
      <div className="s-topbar">
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:32, height:32, background:"#0d9488", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🧠</div>
          <span style={{ fontFamily:"DM Serif Display,serif", fontSize:17, color:"#0f4040" }}>BurnoutRadar</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[["home","Home"],["checkin","Check-in"],["wellbeing","My Wellbeing"]].map(([id,label])=>(
            <button key={id} className={`s-nav-btn ${page===id?"on":""}`} onClick={()=>setPage(id)}>{label}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:"#ece8e2", borderRadius:20 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", background:user.color+"25", color:user.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{user.avatar}</div>
            <span style={{ fontSize:13, fontWeight:500 }}>{user.name}</span>
          </div>
          <button onClick={onLogout} style={{ fontSize:12, color:"#7a8c7a", background:"transparent", border:"none", cursor:"pointer" }}>Sign out</button>
        </div>
      </div>

      <div className="s-main">

        {/* HOME */}
        {page==="home" && (
          <div style={{ animation:"fadeUp 0.5s ease" }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:"DM Serif Display,serif", fontSize:30, color:"#0f4040", lineHeight:1.3, marginBottom:6 }}>
                {getTimeGreeting()}, <em style={{ color:"#0d9488", fontStyle:"italic" }}>{firstName(user.name)}.</em>
              </div>
              <div style={{ fontSize:14, color:"#7a8c7a" }}>Your wellbeing matters. Here's how you've been doing.</div>
            </div>

            <div className="s-card" style={{ background:newRisk==="high"?"#fff5f5":newRisk==="medium"?"#fffbf0":"#f0faf6", border:`1px solid ${riskColor(newRisk)}25` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                <div>
                  <div style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:600, color:riskColor(newRisk), marginBottom:6 }}>Current Wellbeing Score</div>
                  <div style={{ fontFamily:"DM Serif Display,serif", fontSize:52, color:riskColor(newRisk), lineHeight:1 }}>{newScore.toFixed(1)}</div>
                  <div style={{ fontSize:13, color:"#7a8c7a", marginTop:4 }}>
                    out of 5.0 · {newRisk==="high"?"At Risk":newRisk==="medium"?"Keep watch":"You're doing well"}
                  </div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  {[[`${user.streak}🔥`,"Streak","#b45309"],[user.checkins,"Check-ins","#0d9488"]].map(([v,l,c])=>(
                    <div key={l} className="s-metric"><div className="s-metric-val" style={{ color:c }}>{v}</div><div className="s-metric-label">{l}</div></div>
                  ))}
                </div>
              </div>
              {newRisk==="high" && (
                <div style={{ marginTop:16, padding:"12px 14px", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:10, fontSize:13, color:"#991b1b", lineHeight:1.6 }}>
                  💙 Your scores have been lower recently. Please consider speaking with your wellbeing officer. You're not alone.
                </div>
              )}
            </div>

            {!submitted && (
              <div className="s-card" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
                <div>
                  <div style={{ fontFamily:"DM Serif Display,serif", fontSize:18, color:"#0f4040", marginBottom:4 }}>Today's check-in is waiting</div>
                  <div style={{ fontSize:13, color:"#7a8c7a" }}>10 seconds · helps us support you better.</div>
                </div>
                <button onClick={()=>setPage("checkin")} style={{ padding:"11px 22px", background:"#0d9488", color:"white", border:"none", borderRadius:11, fontFamily:"DM Serif Display,serif", fontSize:15, cursor:"pointer", whiteSpace:"nowrap" }}>Check in now →</button>
              </div>
            )}
            {submitted && (
              <div className="s-card" style={{ background:"#f0faf6", border:"1px solid rgba(13,148,136,0.2)", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ fontSize:28 }}>✅</div>
                <div>
                  <div style={{ fontFamily:"DM Serif Display,serif", fontSize:17, color:"#0f4040" }}>You've checked in today!</div>
                  <div style={{ fontSize:13, color:"#7a8c7a" }}>Your admin dashboard has been updated with your latest score.</div>
                </div>
              </div>
            )}

            <div className="s-card">
              <div className="s-section-title">Your Score This Week</div>
              <div style={{ height:140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={personalData}>
                    <defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={riskColor(newRisk)} stopOpacity={0.18}/><stop offset="95%" stopColor={riskColor(newRisk)} stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="day" tick={{fill:"#9aaa9a",fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[1,5]} hide/>
                    <Tooltip contentStyle={{background:"white",border:"1px solid #ece8e2",borderRadius:9,fontSize:12}}/>
                    <Area type="monotone" dataKey="score" stroke={riskColor(newRisk)} strokeWidth={2.5} fill="url(#sg2)" dot={{r:3,fill:riskColor(newRisk),strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* CHECK-IN */}
        {page==="checkin" && (
          <div style={{ animation:"fadeUp 0.5s ease" }}>
            {!submitted ? (
              <>
                <div style={{ textAlign:"center", marginBottom:28 }}>
                  <div className="s-streak">🔥 {user.streak}-day streak!</div>
                  <div style={{ fontFamily:"DM Serif Display,serif", fontSize:30, color:"#0f4040", marginBottom:6 }}>How are you today, {firstName(user.name)}?</div>
                  <div style={{ fontSize:14, color:"#7a8c7a" }}>10 seconds · completely confidential</div>
                </div>
                <div className="s-card">
                  {qs.map(q=>(
                    <div key={q.key} style={{ marginBottom:26 }}>
                      <div style={{ fontSize:14.5, fontWeight:500, color:"#2d3d2d", marginBottom:12, display:"flex", justifyContent:"space-between" }}>
                        {q.label}
                        <span style={{ fontFamily:"DM Serif Display,serif", fontSize:16, color:"#0d9488" }}>{scores[q.key] ? `${scores[q.key]}/5` : "—"}</span>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {[1,2,3,4,5].map(v=>(
                          <button key={v} className={`s-emoji-btn ${scores[q.key]===v?"picked":""}`} onClick={()=>setScores(s=>({...s,[q.key]:v}))}>{q.emojis[v-1]}</button>
                        ))}
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                        <span style={{ fontSize:11, color:"#9aaa9a" }}>Not at all</span>
                        <span style={{ fontSize:11, color:"#9aaa9a" }}>Excellent</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:14.5, fontWeight:500, marginBottom:10 }}>Anything on your mind? <span style={{ color:"#9aaa9a", fontSize:12, fontWeight:400 }}>optional</span></div>
                    <textarea className="s-textarea" rows={3} placeholder="A tough shift, something stressing you, or something good..." value={note} onChange={e=>setNote(e.target.value)}/>
                  </div>
                  <button className="s-submit" disabled={!allDone||loading} onClick={handleSubmit}>
                    {loading ? <><span className="s-spinner"/>Updating your dashboard...</> : "Submit check-in →"}
                  </button>
                  {!allDone && <p style={{ textAlign:"center", fontSize:12, color:"#9aaa9a", marginTop:8 }}>Answer all 3 questions to submit</p>}
                </div>
              </>
            ) : (
              <div className="s-card" style={{ textAlign:"center", padding:"44px 32px" }}>
                <div style={{ fontSize:56, marginBottom:14 }}>✅</div>
                <div style={{ fontFamily:"DM Serif Display,serif", fontSize:28, color:"#0f4040", marginBottom:8 }}>Done, {firstName(user.name)}!</div>
                <p style={{ color:"#7a8c7a", fontSize:14, marginBottom:24 }}>Your score has been updated. The admin dashboard now reflects your latest check-in.</p>
                {aiReply && (
                  <div style={{ background:"linear-gradient(135deg,#e6f4f2,#f0faf9)", border:"1px solid rgba(13,148,136,0.2)", borderRadius:14, padding:18, fontSize:14, lineHeight:1.75, color:"#134e4a", textAlign:"left", marginBottom:20 }}>
                    <div style={{ fontSize:10.5, textTransform:"uppercase", letterSpacing:"1px", color:"#0d9488", fontWeight:600, marginBottom:8 }}>✦ BurnoutRadar · Just for you</div>
                    {aiReply}
                  </div>
                )}
                <div style={{ padding:"12px 16px", background:"rgba(13,148,136,0.08)", border:"1px solid rgba(13,148,136,0.2)", borderRadius:10, fontSize:13, color:"#0d9488", marginBottom:16 }}>
                  📊 Your new score: <strong>{newScore.toFixed(1)}/5</strong> · Risk level: <strong>{newRisk}</strong>
                </div>
                <button onClick={()=>setPage("wellbeing")} style={{ padding:"11px 22px", background:"#0d9488", color:"white", border:"none", borderRadius:11, fontFamily:"DM Serif Display,serif", fontSize:15, cursor:"pointer" }}>View my wellbeing →</button>
              </div>
            )}
          </div>
        )}

        {/* WELLBEING */}
        {page==="wellbeing" && (
          <div style={{ animation:"fadeUp 0.5s ease" }}>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontFamily:"DM Serif Display,serif", fontSize:28, color:"#0f4040", marginBottom:4 }}>My Wellbeing</div>
              <div style={{ fontSize:13.5, color:"#7a8c7a" }}>Only you can see this.</div>
            </div>
            <div style={{ display:"flex", gap:18, marginBottom:18 }}>
              <div className="s-card" style={{ flex:"0 0 200px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ position:"relative", width:110, height:110, margin:"0 auto 14px" }}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="48" fill="none" stroke="#ece8e2" strokeWidth="8"/>
                    <circle cx="55" cy="55" r="48" fill="none" stroke={riskColor(newRisk)} strokeWidth="8"
                      strokeDasharray={`${(newScore/5)*301} 301`} strokeLinecap="round"
                      style={{ transform:"rotate(-90deg)", transformOrigin:"55px 55px", transition:"stroke-dasharray 1s ease" }}/>
                  </svg>
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
                    <div style={{ fontFamily:"DM Serif Display,serif", fontSize:26, color:riskColor(newRisk) }}>{newScore.toFixed(1)}</div>
                    <div style={{ fontSize:10, color:"#9aaa9a" }}>/5.0</div>
                  </div>
                </div>
                <div style={{ fontFamily:"DM Serif Display,serif", fontSize:15, color:riskColor(newRisk), marginBottom:4 }}>
                  {newRisk==="high"?"At Risk":newRisk==="medium"?"Watch Out":"Doing Well"}
                </div>
              </div>
              <div className="s-card" style={{ flex:1 }}>
                <div className="s-section-title">This Week</div>
                <div style={{ height:150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={personalData}>
                      <XAxis dataKey="day" tick={{fill:"#9aaa9a",fontSize:12}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[1,5]} hide/>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #ece8e2",borderRadius:9,fontSize:12}}/>
                      <Line type="monotone" dataKey="score" stroke={riskColor(newRisk)} strokeWidth={2.5} dot={{r:4,fill:riskColor(newRisk),strokeWidth:0}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="s-card">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div className="s-section-title" style={{ marginBottom:0 }}>AI Weekly Summary</div>
                <AiBtn variant="light"
                  prompt={`BurnoutRadar AI for ${user.name} (${user.role}, ${user.dept}). Score: ${newScore}/5. Risk: ${newRisk}. 7-day history: ${user.history.join(",")}. Streak: ${user.streak} days. Write 3 warm sentences: (1) pattern noticed, (2) what it suggests, (3) one gentle self-care suggestion. First name only. Caring tone. Under 70 words.`}
                  label="✦ Generate my summary"/>
              </div>
              <p style={{ fontSize:13, color:"#9aaa9a" }}>Get a personalised AI summary of your week.</p>
            </div>
            <div className="s-card">
              <div className="s-section-title">Support & Resources</div>
              {[["💆","5-minute breathing exercise","#0d9488","#e6f4f2"],["🧠","iCall Mental Health · 9152987821","#6366f1","#eef2ff"],["📞","Talk to your Wellbeing Officer","#059669","#ecfdf5"]].map(([icon,label,color,bg])=>(
                <div key={label} className="s-res-item" style={{ background:bg, color }}><span style={{fontSize:18}}>{icon}</span>{label}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ROOT — Holds shared workers state
═══════════════════════════════════════════════════════════════════════ */
export default function App() {
  // ★ SHARED STATE — both admin and staff read/write from here
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [session, setSession] = useState(null);

  // Called when a staff member submits their check-in
  const handleCheckinSubmit = (workerId, updates) => {
    setWorkers(prev => prev.map(w =>
      w.id === workerId ? { ...w, ...updates } : w
    ));
  };

  const login  = (s) => setSession(s);
  const logout = ()  => setSession(null);

  // Pass latest worker data to login page so scores show on tiles
  if (!session) return <LoginPage onLogin={login} workers={workers}/>;

  if (session.role === "admin") return <AdminApp onLogout={logout} workers={workers}/>;

  // Get the latest version of this user from shared state
  const liveUser = workers.find(w => w.id === session.user.id);
  return <StaffApp user={liveUser} onLogout={logout} onCheckinSubmit={handleCheckinSubmit}/>;
}
