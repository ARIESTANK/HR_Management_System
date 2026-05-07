import { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
/* ─── data ─────────────────────────────────────────────────────── */


const navItems = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "👥", label: "Employees" },
  { icon: "📅", label: "Attendance" },
  { icon: "🌴", label: "Leave Management" },
  { icon: "💳", label: "Payroll" },
  { icon: "📊", label: "Reports" },
  { icon: "⚙️", label: "Settings" },
];

const weekData = [
  { day: "Mon", pct: 85, accent: "#6366f1" },
  { day: "Tue", pct: 92, accent: "#6366f1" },
  { day: "Wed", pct: 78, accent: "#6366f1" },
  { day: "Thu", pct: 95, accent: "#6366f1" },
  { day: "Fri", pct: 88, accent: "#6366f1" },
  { day: "Sat", pct: 42, accent: "#f59e0b" },
  { day: "Sun", pct: 15, accent: "#e5e7eb" },
];



const payrollItems = [
  { icon: "💵", label: "Base Salary", sub: "1,284 employees",    amount: "$680K", bg: "#eef2ff" },
  { icon: "🎁", label: "Bonuses",     sub: "Q2 performance",     amount: "$100K", bg: "#ecfdf5" },
  { icon: "🛡️", label: "Benefits",   sub: "Health & retirement", amount: "$62K",  bg: "#fef3c7" },
];

/* ─── Responsive hook ───────────────────────────────────────────── */
function useBreakpoint() {
  const snap = () => {
    const w = window.innerWidth;
    return { w, isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
  };
  const [bp, setBp] = useState(snap);
  useEffect(() => {
    const handler = () => setBp(snap());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return bp;
}

/* ─── Global CSS injected once ──────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#c4b5fd,#a5f3fc); border-radius: 3px; }
  .nav-btn { transition: background 0.18s, color 0.18s; }
  .nav-btn:hover { background: linear-gradient(135deg,rgba(99,102,241,0.09),rgba(139,92,246,0.07)) !important; color: #6366f1 !important; }
  .metric-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .metric-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 30px rgba(99,102,241,0.13) !important; }
  .action-btn:hover { opacity: 0.75; }
`;


/* ─── MetricCard ────────────────────────────────────────────────── */
function MetricCard({ bg, badge, badgeBg, badgeColor, icon, iconBg, value, label, footer, delay }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="metric-card" style={{
      borderRadius:15, padding:"18px 20px", border:"1px solid #e8e7f3", background: bg,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(14px)",
      transition:"opacity 0.45s ease, transform 0.45s ease", minWidth:0,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
        <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 9px", borderRadius:999, background:badgeBg, color:badgeColor }}>{badge}</span>
      </div>
      <p style={{ margin:0, fontSize:22, fontWeight:700, fontFamily:"'Outfit',sans-serif", color:"#1e1b4b", lineHeight:1.2 }}>{value}</p>
      <p style={{ margin:"4px 0 10px", fontSize:13, color:"#94a3b8" }}>{label}</p>
      {footer}
    </div>
  );
}

/* ─── AttendanceChart ───────────────────────────────────────────── */
function AttendanceChart() {
  const [anim, setAnim] = useState(false);
  
  useEffect(() => { const t = setTimeout(() => setAnim(true), 250); return () => clearTimeout(t); }, []);
  return (
    <div style={{ borderRadius:15, padding:"20px 22px", background:"linear-gradient(135deg,#fff 0%,#f8f7ff 100%)", border:"1px solid #e8e7f3", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:8 }}>
        <div>
          <h3 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:15, color:"#1e1b4b" }}>Weekly Attendance</h3>
          <p style={{ margin:"3px 0 0", fontSize:12.5, color:"#94a3b8" }}>This week's overview</p>
        </div>
        <select style={{ fontSize:12.5, padding:"5px 10px", borderRadius:8, border:"1px solid #e8e7f3", color:"#64748b", outline:"none", background:"#fff" }}>
          <option>This Week</option><option>Last Week</option>
        </select>
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:145 }}>
        {weekData.map((d, i) => (
          <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, height:"100%", minWidth:0 }}>
            <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
              <div style={{
                width:"100%", borderRadius:"5px 5px 0 0",
                background: d.accent === "#e5e7eb" ? "linear-gradient(180deg,#e5e7eb,#f3f4f6)"
                  : d.accent === "#f59e0b" ? "linear-gradient(180deg,#f59e0b,#fbbf24)"
                  : "linear-gradient(180deg,#6366f1,#818cf8)",
                height: anim ? `${d.pct}%` : "0%",
                transition: `height 0.75s ease ${i * 0.08}s`,
              }}/>
            </div>
            <span style={{ fontSize:11, color:"#94a3b8" }}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── DonutChart ────────────────────────────────────────────────── */
function DonutChart({ employees, departments }) {
  function getRandomColor() {
    const randomNum = Math.floor(Math.random() * 16777215);
    return "#" + randomNum.toString(16).padStart(6, "0");
  }

  // Assign colors once
  const departmentsWithColors = departments.map(d => ({
    ...d,
    color: getRandomColor()
  }));

  // Total circumference of the circle
  const circumference = 2 * Math.PI * 54; // r=54

  // Track where the next arc should start
  let offset = 0;

  return (
    <div style={{ borderRadius:15, padding:"20px 22px", background:"linear-gradient(135deg,#fff 0%,#f0fef9 100%)", border:"1px solid #e8e7f3", height:"100%" }}>
      <h3 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:15, color:"#1e1b4b" }}>Department Split</h3>
      <p style={{ margin:"3px 0 16px", fontSize:12.5, color:"#94a3b8" }}>Employee distribution</p>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
        <svg width="130" height="130" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#e8e7f3" strokeWidth="15"/>
          {departmentsWithColors.map(d => {
            const dashLength = (d.employeeCount / employees) * circumference;
            const circle = (
              <circle
                key={d.department.deptName}
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke={d.color}
                strokeWidth="10"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += dashLength; // move start point for next arc
            return circle;
          })}
          <text x="70" y="66" textAnchor="middle" style={{ fontSize:19, fontWeight:700, fill:"#1e1b4b", fontFamily:"'Outfit',sans-serif" }}>{departments.length}</text>
          <text x="70" y="81" textAnchor="middle" style={{ fontSize:10, fill:"#94a3b8" }}>Total</text>
        </svg>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {departmentsWithColors.map(d => (
          <div key={d.department.deptID} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:13 }}>
            <span style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ width:9, height:9, borderRadius:"50%", background:d.color, display:"inline-block", flexShrink:0 }}/>
              <span style={{ color:"#64748b" }}>{d.department.deptName}</span>
            </span>
            <span style={{ fontWeight:600, color:"#1e1b4b" }}>{d.employeeCount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



/* ─── LeaveRequests ─────────────────────────────────────────────── */
function LeaveRequests({leaveData,refreshData}) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const approveLeave = async(id)=>{
    const response = await fetch(`http://localhost:8080/leaves/statusUpdate/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify("Approved")
    });
    console.log(response.status);
    if(response.status==200){ 
      addToast("Leave approved", "success");
      refreshData();
    }
  }

  const [items, setItems] = useState(leaveData.map(l => ({ ...l, done: false })));
  const dismiss = i => setItems(p => p.map((x, idx) => idx === i ? { ...x, done: true } : x));
  return (
    <div style={{ borderRadius:15, padding:"20px 22px", background:"linear-gradient(135deg,#fff 0%,#f9f8ff 100%)", border:"1px solid #e8e7f3", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
        <h3 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:15, color:"#1e1b4b" }}>Pending Leave Requests</h3>
        <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 9px", borderRadius:999, background:"#fee2e2", color:"#dc2626" }}>{leaveData.length} Pending</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {leaveData.map((item, i) => (
          <div key={i} style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 12px", borderRadius:11, background:"#f8f7ff",
            transition:"opacity 0.3s", flexWrap:"wrap", gap:8,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:item.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>{item.employee.name}</div>
              <div style={{ minWidth:0 }}>
                <p style={{ margin:0, fontSize:13.5, fontWeight:500, color:"#1e1b4b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.employee.name}</p>
                <p style={{ margin:0, fontSize:11.5, color:"#94a3b8" }}>{item.employee.department.deptName} · {item.reason}</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
              <span style={{ fontSize:12, color:"#64748b", marginRight:2 }}>{item.days}</span>
              <button disabled={item.status!="Pending"} onClick={() => approveLeave(item.leaveID)} className="action-btn"
                style={{ width:27, height:27, borderRadius:7, border:"none", background:"#ecfdf5", cursor:item.done?"default":"pointer", fontSize:13, color:"#059669" }}>✓</button>
              <button disabled={item.status!="Pending"} onClick={() => dismiss(i)} className="action-btn"
                style={{ width:27, height:27, borderRadius:7, border:"none", background:"#fee2e2", cursor:item.done?"default":"pointer", fontSize:13, color:"#ef4444" }}>✕</button>
            </div>
          </div>
        ))}
        {toasts.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div>
      )}
      </div>
      
    </div>
  );
}

/* ─── PayrollSummary ────────────────────────────────────────────── */
function PayrollSummary({totalSalaries}) {

  function getMonth(){
    const date = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month=monthNames[date.getMonth()];
    const year=date.getFullYear();
    return `${month} ${year}`;
  }

  return (
    <div style={{ borderRadius:15, padding:"20px 22px", background:"linear-gradient(135deg,#fff 0%,#fef9f3 100%)", border:"1px solid #e8e7f3", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <h3 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:15, color:"#1e1b4b" }}>Payroll Summary</h3>
        <span style={{ fontSize:13, color:"#94a3b8" }}>{getMonth()}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {payrollItems.map(item => (
          <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 12px", borderRadius:11, background:"#f8f7ff" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:item.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{item.icon}</div>
              <div>
                <p style={{ margin:0, fontSize:13.5, fontWeight:500, color:"#1e1b4b" }}>{item.label}</p>
                <p style={{ margin:0, fontSize:11.5, color:"#94a3b8" }}>{item.sub}</p>
              </div>
            </div>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:14.5, color:"#1e1b4b" }}>{item.amount}</span>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderRadius:11, background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          <span style={{ fontSize:13.5, fontWeight:500, color:"#fff" }}>Total Payroll</span>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:17, color:"#fff" }}>${totalSalaries}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast Notification ───────────────────────────────────────── */
interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
}

function Toast({ toast }: { toast: ToastMessage }) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const isSuccess = toast.type === "success";
  return (
    <div
      style={{
        animation: isVisible ? "slideIn 0.3s ease" : "slideOut 0.3s ease",
        background: isSuccess ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)",
        color: "#fff",
        padding: "14px 20px",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 300,
        boxShadow: isSuccess ? "0 8px 24px rgba(16,185,129,0.25)" : "0 8px 24px rgba(239,68,68,0.25)",
        fontSize: 13.5,
        fontWeight: 500,
        backdropFilter: "blur(10px)",
      }}
    >
      <span style={{ fontSize: 18 }}>{isSuccess ? "✓" : "✕"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

/* ─── Root ──────────────────────────────────────────────────────── */
export default function HRDashboard() {
  const { w, isMobile, isTablet, isDesktop } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);
  const [totalSalaries,setTotalSalaries] = useState(0);
  const [departments,setDepartments] = useState([]);
  // Auto-close drawer when resizing to desktop
  useEffect(() => { if (isDesktop) setMenuOpen(false); }, [isDesktop]);

  // Horizontal padding scales with screen size
  const px = isDesktop ? 28 : isTablet ? 20 : 14;

  // Metric grid: 4-col desktop | 2-col tablet | 1-col mobile
  const metricCols = isDesktop ? "repeat(4,1fr)" : isTablet ? "repeat(2,1fr)" : "repeat(2,1fr)";

  // Charts and bottom row go side-by-side at ≥768
  const sideBySide = w >= 768;

  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [leaveData,setLeaveData] = useState([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const leaveDataFetch=async()=>{
    const response=await fetch("http://localhost:8080/leaves/allPending",{method:"GET"});
    if(response.status==200){
      const data=await response.json()
      setLeaveData(data);
      addToast("Pending leaves loaded successfully");
    }
  }
  const employeeFetch = async () => {
    try {
      const response = await fetch("http://localhost:8080/employees/all", { method: "GET" });
      if (response.status === 200) {
        const data = await response.json();
        let totalSalary=0;
        data.forEach(e=>{totalSalary+=e.salary;})
        setTotalSalaries(totalSalary);
        setEmployees(data);
        addToast("Employees loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      addToast("Failed to load employees", "error");
    }
  };
  const deptFetch = async()=>{
    try {
      const response = await fetch("http://localhost:8080/departments/getAlongWithEmployee", { method: "GET" });
      if (response.status === 200) {
        const data = await response.json();
        setDepartments(data);
        addToast("Departments loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      addToast("Failed to load departments", "error");
    }
  }
  useEffect(()=>{
    employeeFetch();
    deptFetch();
    leaveDataFetch();
  },[])


  return (
    <div style={{ display:"flex", height:"100vh", background:"linear-gradient(135deg,#f1f0fb 0%,#f5f3ff 50%,#fef9f3 100%)", fontFamily:"'DM Sans',sans-serif", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Toasts */}
      <div style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}>
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(400px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(400px); }
          }
        `}</style>
        {/* {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: "auto" }}>
            <Toast toast={toast} />
          </div>
        ))} */}
      </div>

      {/* Desktop sidebar */}
      {isDesktop && <Sidebar />}

      {/* Mobile drawer */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.38)", display:"flex" }}>
          <div onClick={e => e.stopPropagation()} style={{ height:"100%", boxShadow:"4px 0 24px rgba(0,0,0,0.12)" }}>
            <Sidebar isMobile onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* Header */}
        <header style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:`12px ${px}px`, borderBottom:"1px solid #e8e7f3",
          background:"linear-gradient(90deg,#fff 0%,#f8f7ff 100%)",
          flexShrink:0, gap:8,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {!isDesktop && (
              <button onClick={() => setMenuOpen(true)} style={{ border:"none", background:"none", cursor:"pointer", fontSize:19, padding:"4px 6px", borderRadius:7, color:"#64748b" }}>☰</button>
            )}
            <div>
              <h1 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:isMobile?17:20, color:"#1e1b4b", lineHeight:1.2 }}>HR Dashboard</h1>
              {!isMobile && <p style={{ margin:0, fontSize:12.5, color:"#94a3b8" }}>Welcome back, Admin</p>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {!isMobile && (
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 12px", borderRadius:9, background:"linear-gradient(135deg,#f0ebff,#fef3e8)" }}>
                <span style={{ fontSize:13, color:"#94a3b8" }}>🔍</span>
                <input type="text" placeholder="Search..." style={{ border:"none", background:"transparent", outline:"none", fontSize:13, color:"#1e1b4b", width:isTablet?90:120 }}/>
              </div>
            )}
            <button style={{ position:"relative", padding:"6px 8px", borderRadius:8, border:"none", background:"none", cursor:"pointer", fontSize:17 }}>
              🔔
              <span style={{ position:"absolute", top:5, right:5, width:7, height:7, borderRadius:"50%", background:"#ef4444" }}/>
            </button>
          </div>
        </header>

        {/* Body */}
        <main style={{ flex:1, overflowY:"auto", padding:`${isMobile?14:20}px ${px}px`, display:"flex", flexDirection:"column", gap:14 }}>

          {/* Metric cards — always 2-col minimum so they never collapse to 1 */}
          <div style={{ display:"grid", gridTemplateColumns:metricCols, gap:12 }}>
            <MetricCard delay={50}  bg="linear-gradient(135deg,#fff 0%,#f9f8ff 100%)"
              icon="👥" iconBg="#eef2ff" badge="" badgeBg="#ecfdf5" badgeColor="#059669"
              value={employees.length} label="Total Employees"
              footer={<div style={{ display:"flex", gap:10, fontSize:11.5, flexWrap:"wrap" }}><span style={{ color:"#6366f1" }}>● 842 Active</span><span style={{ color:"#f59e0b" }}>● 38 On Leave</span></div>}/>

            <MetricCard delay={100} bg="linear-gradient(135deg,#fff 0%,#fef9f3 100%)"
              icon="📅" iconBg="#fef3c7" badge="" badgeBg="#fef3c7" badgeColor="#d97706"
              value="94.2%" label="Attendance Rate"
              footer={<div style={{ width:"100%", height:7, borderRadius:999, background:"#f1f0fb" }}><div style={{ width:"94.2%", height:7, borderRadius:999, background:"linear-gradient(90deg,#6366f1,#8b5cf6)" }}/></div>}/>

            <MetricCard delay={150} bg="linear-gradient(135deg,#fff 0%,#fff5f0 100%)"
              icon="⏰" iconBg="#fee2e2" badge="Today" badgeBg="#fee2e2" badgeColor="#d97706"
              value={leaveData.length} label="Pending Leaves"
              footer={<div style={{ display:"flex", gap:10, fontSize:11.5 }}><span style={{ color:"#ef4444" }}>● 5 Sick</span><span style={{ color:"#6366f1" }}>● 7 Casual</span></div>}/>


            <MetricCard delay={200} bg="linear-gradient(135deg,#fff 0%,#f0fef9 100%)"
              icon="💳" iconBg="#ecfdf5" badge="Processed" badgeBg="#ecfdf5" badgeColor="#059669"
              value={totalSalaries} label="Monthly Payroll"
              footer={<div style={{ display:"flex", gap:10, fontSize:11.5, flexWrap:"wrap" }}><span style={{ color:"#059669" }}>● $780K Salary</span><span style={{ color:"#8b5cf6" }}>● $62K Benefits</span></div>}/>
          </div>

          {/* Charts */}
          <div style={{ display:"grid", gridTemplateColumns: sideBySide ? "2fr 1fr" : "1fr", gap:14 }}>
            <AttendanceChart/>
            <DonutChart employees={employees.length} departments={departments} />
          </div>

          {/* Leave + Payroll */}
          <div style={{ display:"grid", gridTemplateColumns: sideBySide ? "1fr 1fr" : "1fr", gap:14 }}>
            <LeaveRequests leaveData={leaveData} refreshData={leaveDataFetch} />
            <PayrollSummary totalSalaries={totalSalaries}/>
          </div>

        </main>
      </div>
    </div>
  );
}