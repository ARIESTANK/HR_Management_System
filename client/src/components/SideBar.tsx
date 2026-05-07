import { useState } from "react";
import {useNavigate} from "react-router-dom";


const navItems = [
  { icon: "⊞", label: "Dashboard" ,route:"/dashboard"},
  { icon: "👥", label: "Employees" ,route:"/employees"},
  { icon: "📅", label: "Attendance" ,route:"/test"},
  { icon: "🌴", label: "Leave Management",route:"/test" },
  { icon: "💳", label: "Payroll" ,route:"/test"},
  { icon: "📊", label: "Departments" ,route:"/departments"},
  { icon: "⚙️", label: "Settings" ,route:"/test"},
];

/* ─── Sidebar ───────────────────────────────────────────────────── */
export default function Sidebar({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const [active, setActive] = useState("Dashboard");
  const navigate = useNavigate();
  return (
    <aside style={{
      width: 240, minWidth: 240, height: "100%",
      display: "flex", flexDirection: "column",
      background: "linear-gradient(180deg,#fff 0%,#f8f7ff 100%)",
      borderRight: isMobile ? "none" : "1px solid #e8e7f3",
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid #e8e7f3" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🏢</div>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:17, color:"#1e1b4b" }}>Acme Corp</span>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", fontSize:18, color:"#64748b" }}>✕</button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
        {navItems.map(item => (
          <button key={item.label} className="nav-btn"
            onClick={() => { setActive(item.label); if (isMobile) onClose?.(); navigate(item.route) }}
            style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 12px", borderRadius:9, border:"none", cursor:"pointer",
              textAlign:"left", fontSize:13.5, fontWeight:500, fontFamily:"'DM Sans',sans-serif",
              background: active === item.label ? "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))" : "transparent",
              color: active === item.label ? "#6366f1" : "#64748b",
            }}>
            <span style={{ fontSize:15, width:20, textAlign:"center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding:"14px 16px", borderTop:"1px solid #e8e7f3", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>JD</div>
        <div>
          <p style={{ margin:0, fontSize:13.5, fontWeight:600, color:"#1e1b4b" }}>Jane Doe</p>
          <p style={{ margin:0, fontSize:11.5, color:"#94a3b8" }}>HR Admin</p>
        </div>
      </div>
    </aside>
  );
}
