import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "../components/SideBar";
/* ══════════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════════ */
interface Department {
  id: string;
  name: string;
  head: string;
  initials: string;
  colorBg: string;
  colorText: string;
  count: number;
}

type SortKey   = "name" | "count" | "id";
type ModalMode = "add" | "edit" | null;
interface ToastItem { id: string; message: string; type: "success" | "error" | "info" }

/* ══════════════════════════════════════════════════════════════════
   SEED DATA
══════════════════════════════════════════════════════════════════ */
const SEED: Department[] = [
  { id:"DEPT-01", name:"Information Technology", head:"Sarah Chen",     initials:"SC", colorBg:"#eef2ff", colorText:"#4f46e5", count:42 },
  { id:"DEPT-02", name:"Finance & Accounting",   head:"Michael Torres", initials:"MT", colorBg:"#ecfdf5", colorText:"#059669", count:28 },
  { id:"DEPT-03", name:"Marketing",              head:"Priya Sharma",   initials:"PS", colorBg:"#fdf2f8", colorText:"#db2777", count:19 },
  { id:"DEPT-04", name:"Human Resources",        head:"James Wilson",   initials:"JW", colorBg:"#fffbeb", colorText:"#d97706", count:12 },
  { id:"DEPT-05", name:"Operations",             head:"Lisa Nakamura",  initials:"LN", colorBg:"#ecfeff", colorText:"#0891b2", count:35 },
  { id:"DEPT-06", name:"Sales",                  head:"David Park",     initials:"DP", colorBg:"#f5f3ff", colorText:"#7c3aed", count:24 },
];

const COLOR_POOL: { bg: string; text: string }[] = [
  { bg:"#eef2ff", text:"#4f46e5" }, { bg:"#ecfdf5", text:"#059669" },
  { bg:"#fdf2f8", text:"#db2777" }, { bg:"#fffbeb", text:"#d97706" },
  { bg:"#ecfeff", text:"#0891b2" }, { bg:"#f5f3ff", text:"#7c3aed" },
  { bg:"#fff1f2", text:"#e11d48" }, { bg:"#f0fdf4", text:"#16a34a" },
];

const NAV_ITEMS = [
  { icon:"⊞",  label:"Dashboard" },
  { icon:"👥",  label:"Employees" },
  { icon:"📅",  label:"Attendance" },
  { icon:"🌴",  label:"Leave Management" },
  { icon:"💳",  label:"Payroll" },
  { icon:"🏢",  label:"Departments" },
  { icon:"📊",  label:"Reports" },
  { icon:"⚙️", label:"Settings" },
];

/* ══════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════ */
let _uid = 6;
const nextId     = () => `DEPT-${String(++_uid).padStart(2, "0")}`;
const pickColor  = (i: number) => COLOR_POOL[i % COLOR_POOL.length];
const toInitials = (name: string) =>
  name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);

/* ══════════════════════════════════════════════════════════════════
   RESPONSIVE HOOK
══════════════════════════════════════════════════════════════════ */
function useBreakpoint() {
  const snap = () => {
    const w = window.innerWidth;
    return { w, isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
  };
  const [bp, setBp] = useState(snap);
  useEffect(() => {
    const h = () => setBp(snap());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return bp;
}

/* ══════════════════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
══════════════════════════════════════════════════════════════════ */
const OVERLAY: React.CSSProperties = {
  position:"fixed", inset:0, zIndex:100,
  background:"rgba(15,15,30,0.45)",
  display:"flex", alignItems:"center", justifyContent:"center",
  padding:16, backdropFilter:"blur(4px)",
};
const MODAL_CARD: React.CSSProperties = {
  background:"#fff", borderRadius:18, width:"100%",
  padding:"28px 28px 24px",
  boxShadow:"0 24px 60px rgba(99,102,241,0.18)",
  animation:"modalIn 0.22s ease",
};
const GHOST_BTN: React.CSSProperties = {
  flex:1, padding:"10px 0", border:"1.5px solid #e2e8f0", borderRadius:10,
  fontSize:14, fontWeight:600, cursor:"pointer",
  background:"#fff", color:"#64748b", fontFamily:"inherit",
};
const INPUT: React.CSSProperties = {
  width:"100%", padding:"10px 13px",
  border:"1.5px solid #e2e8f0", borderRadius:9,
  fontSize:14, outline:"none", fontFamily:"inherit",
  background:"#fafafa", color:"#1e1b4b",
  transition:"border-color 0.18s", boxSizing:"border-box",
};
const LABEL: React.CSSProperties = {
  display:"block", fontSize:11.5, fontWeight:700,
  color:"#94a3b8", marginBottom:6,
  letterSpacing:"0.05em", textTransform:"uppercase",
};


/* ══════════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════════ */
function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = (message: string, type: ToastItem["type"] = "success") => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, add };
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:200, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {toasts.map(t => {
        const bg =
          t.type === "success" ? "linear-gradient(135deg,#10b981,#059669)" :
          t.type === "error"   ? "linear-gradient(135deg,#ef4444,#dc2626)" :
                                 "linear-gradient(135deg,#6366f1,#8b5cf6)";
        return (
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 18px", borderRadius:12, background:bg, color:"#fff", fontSize:13.5, fontWeight:600, animation:"toastIn 0.3s ease", minWidth:260, pointerEvents:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.12)" }}>
            <span style={{ fontSize:16 }}>
              {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
            </span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CONFIRM DELETE MODAL
══════════════════════════════════════════════════════════════════ */
function ConfirmModal({ dept, onClose, onConfirm }: { dept: Department; onClose: () => void; onConfirm: () => void }) {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    await new Promise(r => setTimeout(r, 350));
    onConfirm();
  };
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={OVERLAY}>
      <div style={{ ...MODAL_CARD, maxWidth:380, textAlign:"center" }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 16px" }}>🗑️</div>
        <h3 style={{ margin:"0 0 8px", fontWeight:700, fontSize:17, color:"#1e1b4b" }}>Delete Department?</h3>
        <p style={{ margin:"0 0 6px", fontSize:14, color:"#64748b" }}>
          <strong style={{ color:"#1e1b4b" }}>{dept.name}</strong> will be permanently removed.
        </p>
        <p style={{ margin:"0 0 24px", fontSize:12.5, color:"#94a3b8" }}>This action cannot be undone.</p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={GHOST_BTN}>Cancel</button>
          <button onClick={handle} disabled={busy}
            style={{ ...GHOST_BTN, background: busy ? "#fca5a5" : "#ef4444", color:"#fff", border:"none", fontWeight:700 }}>
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ADD / EDIT MODAL
══════════════════════════════════════════════════════════════════ */
interface FormModalProps {
  mode: ModalMode;
  initial?: Department;
  onClose: () => void;
  onSave: (d: { name: string; head: string; count: number }) => void;
}
function DeptModal({ mode, initial, onClose, onSave }: FormModalProps) {
  const [name,   setName]   = useState(initial?.name  ?? "");
  const [head,   setHead]   = useState(initial?.head  ?? "");
  const [count,  setCount]  = useState(initial?.count ?? 0);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) { setErr("Department name is required."); return; }
    if (!head.trim()) { setErr("Head of department is required."); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 380));
    onSave({ name: name.trim(), head: head.trim(), count });
    setSaving(false);
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={OVERLAY}>
      <div style={{ ...MODAL_CARD, maxWidth:460 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
          <div>
            <h2 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:"#1e1b4b" }}>
              {mode === "add" ? "Add Department" : "Edit Department"}
            </h2>
            <p style={{ margin:"3px 0 0", fontSize:13, color:"#94a3b8" }}>
              {mode === "add" ? "Create a new department record" : `Editing ${initial?.name}`}
            </p>
          </div>
          <button onClick={onClose} style={{ border:"none", background:"#f1f0fb", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:14, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:15 }}>
          <div>
            <label style={LABEL}>Department Name</label>
            <input ref={ref} value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Information Technology" style={INPUT}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <div>
            <label style={LABEL}>Head of Department</label>
            <input value={head} onChange={e => setHead(e.target.value)}
              placeholder="e.g. Sarah Chen" style={INPUT}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <div>
            <label style={LABEL}>Employee Count</label>
            <input type="number" min={0} value={count}
              onChange={e => setCount(Number(e.target.value))} style={INPUT}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>

          {err && (
            <p style={{ margin:0, fontSize:12.5, color:"#dc2626", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>
              ⚠️ {err}
            </p>
          )}

          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <button type="button" onClick={onClose} style={GHOST_BTN}>Cancel</button>
            <button type="submit" disabled={saving}
              style={{ flex:1, padding:"11px 0", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor: saving ? "default" : "pointer", background: saving ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontFamily:"inherit" }}>
              {saving ? "Saving…" : mode === "add" ? "Create Department" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════════════ */
function StatCard({ icon, label, value, bg }: { icon: string; label: string; value: string | number; bg: string }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"18px 20px", border:"1px solid #f1f0fb", boxShadow:"0 2px 12px rgba(99,102,241,0.06)", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
      <div>
        <p style={{ margin:0, fontSize:12.5, color:"#94a3b8", fontWeight:500 }}>{label}</p>
        <p style={{ margin:0, fontSize:22, fontWeight:800, color:"#1e1b4b", fontFamily:"'Outfit',sans-serif", lineHeight:1.2 }}>{value}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TABLE ROW
══════════════════════════════════════════════════════════════════ */
function DeptRow({ dept, idx, maxCount, onEdit, onDelete }: {
  dept: Department; idx: number; maxCount: number;
  onEdit: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const barPct = maxCount > 0 ? Math.round((dept.count / maxCount) * 100) : 0;

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderBottom:"1px solid #f8f7ff", background: hovered ? "#faf9ff" : "#fff", transition:"background 0.15s", animation:`rowIn 0.25s ease ${idx * 0.04}s both` }}>

      {/* Name */}
      <td style={{ padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:dept.colorBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:dept.colorText, flexShrink:0 }}>
            {dept.department.deptName.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontWeight:600, fontSize:14, color:"#1e1b4b" }}>{dept.department.deptName}</span>
        </div>
      </td>

      {/* ID */}
      <td style={{ padding:"14px 18px" }}>
        <span style={{ fontFamily:"monospace", fontSize:12.5, color:dept.colorText, background:dept.colorBg, padding:"3px 8px", borderRadius:6, fontWeight:600 }}>
          {dept.department.deptID}
        </span>
      </td>

      {/* Head */}
      <td style={{ padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:dept.colorBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:dept.colorText, flexShrink:0 }}>
            {dept.employeeCount}
          </div>
          <span style={{ fontSize:13.5, color:"#374151" }}>{dept.head}</span>
        </div>
      </td>
      {/* Actions */}
      <td style={{ padding:"14px 18px" }}>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={onEdit} title="Edit"
            style={{ width:32, height:32, borderRadius:8, border:"none", background:"#eef2ff", color:"#6366f1", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#ddd6fe"}
            onMouseLeave={e => e.currentTarget.style.background = "#eef2ff"}>
            ✏️
          </button>
          <button onClick={onDelete} title="Delete"
            style={{ width:32, height:32, borderRadius:8, border:"none", background:"#fef2f2", color:"#ef4444", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fecaca"}
            onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT — PROPER SIDEBAR + MAIN LAYOUT
══════════════════════════════════════════════════════════════════ */
export default function DepartmentManagement() {
  const { isMobile, isDesktop } = useBreakpoint();

  const [departments, setDepartments] = useState([]);
  const [search,      setSearch]      = useState("");
  const [sortKey,     setSortKey]     = useState<SortKey>("name");
  const [modalMode,   setModalMode]   = useState<ModalMode>(null);
  const [editing,     setEditing]     = useState<Department | undefined>();
  const [deleting,    setDeleting]    = useState<Department | undefined>();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [activeNav,   setActiveNav]   = useState("Departments");

  const { toasts, add: toast } = useToast();

  const deptFetch=async()=>{
    const response = await fetch("http://localhost:8080/departments/getAlongWithEmployee",{method:"GET"})
    if(response.status==200){
        const data = await response.json();
        setDepartments(data);
    }
  }
  const deptAdminFetch=async()=>{
    const response = await fetch("http://localhost:8080/departments/getAlongWithAdmin",{method:"GET"})
    if(response.status==200){
        const data = await response.json();
        setDepartments(data);
    }
  }
  // Close mobile drawer when resizing to desktop
  useEffect(() => { if (isDesktop) setMenuOpen(false); deptFetch(); }, [isDesktop]);


  /* filtered + sorted list */
  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return departments
      .filter(d =>
        d.department.deptName.toLowerCase().includes(q) ||
        d.department.deptID.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sortKey === "count") return b.count - a.count;
        if (sortKey === "id")    return a.id.localeCompare(b.id);
        return a.department.deptName.localeCompare(b.deptName);
      });
  }, [departments, search, sortKey]);

  const maxCount       = Math.max(...departments.map(d => d.employeeCount), 1);
  const totalEmployees = departments.reduce((s, d) => s + d.employeeCount, 0);

  const handleSave = (data: { name: string; head: string; count: number }) => {
    if (modalMode === "add") {
      const col = pickColor(departments.length);
      setDepartments(prev => [...prev, {
        ...data,
        id:        nextId(),
        initials:  toInitials(data.head),
        colorBg:   col.bg,
        colorText: col.text,
      }]);
      toast("Department created successfully.");
    } else if (editing) {
      setDepartments(prev => prev.map(d =>
        d.id === editing.id ? { ...d, ...data, initials: toInitials(data.head) } : d
      ));
      toast("Department updated.");
    }
    setModalMode(null);
    setEditing(undefined);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setDepartments(prev => prev.filter(d => d.id !== deleting.id));
    toast(`"${deleting.name}" removed.`, "info");
    setDeleting(undefined);
  };

  return (
    <div style={{
      display:"flex", height:"100vh", overflow:"hidden",
      background:"linear-gradient(135deg,#f1f0fb 0%,#f5f3ff 50%,#fef9f3 100%)",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes rowIn   { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        .add-btn:hover { opacity:0.88 !important; transform:translateY(-1px) !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#c4b5fd; border-radius:3px; }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* ── DESKTOP SIDEBAR (always visible ≥1024px) ── */}
      {isDesktop && (
        <Sidebar

        />
      )}

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.38)", display:"flex" }}>
          <div onClick={e => e.stopPropagation()}>
            <Sidebar
              isMobile
              onClose={() => setMenuOpen(false)}
              activeLabel={activeNav}
              onNav={label => { setActiveNav(label); setMenuOpen(false); }}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MAIN CONTENT AREA (flex:1, scrollable)
      ══════════════════════════════════════════════ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* ── Sticky top header ── */}
        <header style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px", height:64, flexShrink:0,
          background:"linear-gradient(90deg,#ffffff 0%,#f8f7ff 100%)",
          borderBottom:"1px solid #e8e7f3",
          gap:12,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Hamburger — only on mobile/tablet */}
            {!isDesktop && (
              <button
                onClick={() => setMenuOpen(true)}
                style={{ border:"none", background:"none", cursor:"pointer", fontSize:20, color:"#64748b", padding:"4px 6px", borderRadius:7 }}>
                ☰
              </button>
            )}
            <div>
              <h1 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 20, color:"#1e1b4b", lineHeight:1.2 }}>
                Department Management
              </h1>
              {!isMobile && <p style={{ margin:0, fontSize:12.5, color:"#94a3b8" }}>Manage your organisational structure</p>}
            </div>
          </div>

          {/* Add button lives in the header for all screen sizes */}
          <button
            className="add-btn"
            onClick={() => { setEditing(undefined); setModalMode("add"); }}
            style={{ display:"flex", alignItems:"center", gap:7, padding: isMobile ? "8px 14px" : "10px 20px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontSize: isMobile ? 13 : 14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 5px 18px rgba(99,102,241,0.32)", transition:"all 0.2s", whiteSpace:"nowrap" }}>
            <span style={{ fontSize:16 }}>＋</span>
            {!isMobile && "Add Department"}
          </button>
        </header>

        {/* ── Scrollable page body ── */}
        <main style={{ flex:1, overflowY:"auto", padding: isMobile ? "16px 14px" : "24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
            <StatCard icon="🏢" label="Total Departments"   value={departments.length}               bg="#eef2ff" />
            <StatCard icon="👔" label="Head of Departments" value={departments.length}               bg="#ecfdf5" />
            <StatCard icon="👥" label="Total Employees"     value={totalEmployees.toLocaleString()}  bg="#fffbeb" />
          </div>

          {/* Table card */}
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f1f0fb", boxShadow:"0 4px 20px rgba(99,102,241,0.07)", overflow:"hidden" }}>

            {/* Toolbar */}
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f0fb", display:"flex", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              {/* Search */}
              <div style={{ position:"relative", flex:"1 1 180px", maxWidth:360 }}>
                <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"#94a3b8", pointerEvents:"none" }}>🔍</span>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search departments, heads, IDs…"
                  style={{ ...INPUT, paddingLeft:34, background:"#faf9ff" }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              {/* Sort */}
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                style={{ ...INPUT, width:"auto", flex:"0 0 auto", background:"#faf9ff", cursor:"pointer" }}>
                <option value="name">Sort: Name A–Z</option>
                <option value="count">Sort: Most Employees</option>
                <option value="id">Sort: Dept. ID</option>
              </select>

              <p style={{ margin:0, marginLeft:"auto", fontSize:13, color:"#94a3b8", whiteSpace:"nowrap" }}>
                {visible.length} / {departments.length}
              </p>
            </div>

            {/* Table */}
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead>
                  <tr style={{ background:"#faf9ff", borderBottom:"1px solid #f1f0fb" }}>
                    {["Department Name","Dept. ID","Employees","Actions"].map(h => (
                      <th key={h} style={{ padding:"12px 18px", textAlign:"left", fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.07em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((dept, i) => (
                    <DeptRow
                      key={dept.id}
                      dept={dept}
                      idx={i}
                      maxCount={maxCount}
                      onEdit={() => { setEditing(dept); setModalMode("edit"); }}
                      onDelete={() => setDeleting(dept)}
                    />
                  ))}
                </tbody>
              </table>

              {/* Empty state */}
              {visible.length === 0 && (
                <div style={{ padding:"56px 24px", textAlign:"center" }}>
                  <p style={{ fontSize:32, margin:"0 0 12px" }}>🏢</p>
                  <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:600, color:"#64748b" }}>
                    {search ? "No departments match your search" : "No departments yet"}
                  </p>
                  <p style={{ margin:0, fontSize:13, color:"#94a3b8" }}>
                    {search ? "Try a different keyword" : `Click "Add Department" to get started`}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {visible.length > 0 && (
              <div style={{ padding:"12px 20px", borderTop:"1px solid #f1f0fb", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                <p style={{ margin:0, fontSize:12.5, color:"#94a3b8" }}>
                  Showing <strong style={{ color:"#6366f1" }}>{visible.length}</strong> department{visible.length !== 1 ? "s" : ""}
                </p>
                <p style={{ margin:0, fontSize:12.5, color:"#94a3b8" }}>
                  {totalEmployees.toLocaleString()} total employees across all departments
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {modalMode && (
        <DeptModal
          mode={modalMode}
          initial={editing}
          onClose={() => { setModalMode(null); setEditing(undefined); }}
          onSave={handleSave}
        />
      )}
      {deleting && (
        <ConfirmModal
          dept={deleting}
          onClose={() => setDeleting(undefined)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}