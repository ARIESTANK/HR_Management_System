import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════════ */
type Status        = "Active" | "On Leave" | "Terminated";
type Tab           = "personal" | "job" | "attendance" | "payroll" | "leaveRequest";
type LeaveType     = "Personal" | "Sick" | "Others";
type LeaveStatus   = "Pending" | "Approved" | "Rejected";
type CheckInStatus = "Present" | "Late" | "Half-Day" | "Remote";

interface Department {
  deptId:   number;
  deptName: string;
}

interface Employee {
  employeeID:     number;
  name:           string;
  email:          string;
  phone:          string | null;
  hireDate:       string;
  salary:         number;
  attendanceRate: number;
  role:           string;
  status:         Status;
  department:     Department;
  photo?:         string; // base64
}

/** Shape returned by GET /leaves/leavesByEmp/{empID} */
interface ApiLeave {
  leaveId:    number;
  employeeId: number;
  reason:     LeaveType;
  leaveDate:  string;        // "YYYY-MM-DD"
  status:     LeaveStatus;
}

/** Normalised leave (used in UI) */
interface LeaveRequest {
  id:        string;
  type:      LeaveType;
  from:      string;
  to:        string;
  days:      number;
  reason:    string;
  status:    LeaveStatus;
  appliedOn: string;
}

interface AttendanceRecord {
  id: string; date: string; checkIn: string; checkOut: string;
  status: CheckInStatus; hours: number; note: string;
}

interface PayslipRecord {
  id: string; month: string; year: number;
  gross: number; tax: number; deductions: number; net: number;
  paid: boolean; paidOn: string;
}

/* ══════════════════════════════════════════════════════════════════
   SEED / FALLBACK DATA
══════════════════════════════════════════════════════════════════ */
const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id:"a1", date:"Mon, May 5, 2025",  checkIn:"09:02", checkOut:"18:10", status:"Present",  hours:9.1, note:"" },
  { id:"a2", date:"Tue, May 6, 2025",  checkIn:"09:28", checkOut:"18:00", status:"Late",     hours:8.5, note:"Traffic delay" },
  { id:"a3", date:"Wed, May 7, 2025",  checkIn:"09:00", checkOut:"18:05", status:"Present",  hours:9.0, note:"" },
  { id:"a4", date:"Thu, May 8, 2025",  checkIn:"08:55", checkOut:"18:00", status:"Remote",   hours:9.1, note:"WFH" },
  { id:"a5", date:"Fri, May 9, 2025",  checkIn:"09:05", checkOut:"13:00", status:"Half-Day", hours:4.0, note:"Doctor appointment" },
];

const SEED_PAYSLIPS: PayslipRecord[] = [
  { id:"p1", month:"April",    year:2025, gross:10625, tax:1594, deductions:531, net:8500, paid:true, paidOn:"Apr 15, 2025" },
  { id:"p2", month:"March",    year:2025, gross:10625, tax:1594, deductions:531, net:8500, paid:true, paidOn:"Mar 15, 2025" },
  { id:"p3", month:"February", year:2025, gross:10625, tax:1594, deductions:531, net:8500, paid:true, paidOn:"Feb 15, 2025" },
  { id:"p4", month:"January",  year:2025, gross:10625, tax:1594, deductions:531, net:8500, paid:true, paidOn:"Jan 15, 2025" },
];

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════════ */
const DEPT_COLOR_POOL = [
  { from:"#6366f1", to:"#8b5cf6", light:"#eef2ff", text:"#6366f1" },
  { from:"#ec4899", to:"#f43f5e", light:"#fdf2f8", text:"#ec4899" },
  { from:"#059669", to:"#10b981", light:"#ecfdf5", text:"#059669" },
  { from:"#f59e0b", to:"#f97316", light:"#fffbeb", text:"#d97706" },
  { from:"#0ea5e9", to:"#6366f1", light:"#f0f9ff", text:"#0284c7" },
  { from:"#8b5cf6", to:"#d946ef", light:"#faf5ff", text:"#7c3aed" },
];
const getDeptColor = (id: number) => DEPT_COLOR_POOL[id % DEPT_COLOR_POOL.length];

const STATUS_STYLES: Record<Status, { bg: string; color: string; dot: string }> = {
  "Active":     { bg:"#ecfdf5", color:"#059669", dot:"#10b981" },
  "On Leave":   { bg:"#fffbeb", color:"#d97706", dot:"#f59e0b" },
  "Terminated": { bg:"#fef2f2", color:"#dc2626", dot:"#ef4444" },
};

const LEAVE_STATUS_STYLES: Record<LeaveStatus, { bg: string; color: string; icon: string }> = {
  Pending:  { bg:"#fffbeb", color:"#d97706", icon:"⏳" },
  Approved: { bg:"#ecfdf5", color:"#059669", icon:"✅" },
  Rejected: { bg:"#fef2f2", color:"#dc2626", icon:"❌" },
};

const CHECK_STATUS_STYLES: Record<CheckInStatus, { bg: string; color: string; dot: string }> = {
  Present:   { bg:"#ecfdf5", color:"#059669", dot:"#10b981" },
  Late:      { bg:"#fffbeb", color:"#d97706", dot:"#f59e0b" },
  "Half-Day":{ bg:"#eff6ff", color:"#2563eb", dot:"#3b82f6" },
  Remote:    { bg:"#faf5ff", color:"#7c3aed", dot:"#8b5cf6" },
};

const STATUSES: Status[]         = ["Active","On Leave","Terminated"];
const LEAVE_TYPES: LeaveType[]   = ["Personal","Sick","Others"];
const CHECK_STATUSES: CheckInStatus[] = ["Present","Late","Half-Day","Remote"];

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key:"personal",     label:"Personal Info",   icon:"👤" },
  { key:"job",          label:"Job Info",         icon:"💼" },
  { key:"attendance",   label:"Attendance",       icon:"📅" },
  { key:"payroll",      label:"Payroll",          icon:"💳" },
  { key:"leaveRequest", label:"Leave Requests",   icon:"📝" },
];

/* ══════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════ */
const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2);

const fmtMoney = (n: number) => n ? `$${n.toLocaleString()}` : "—";

const daysBetween = (a: string, b: string) => {
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(diff / 86400000) + 1);
};

const todayStr = () => new Date().toISOString().split("T")[0];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Convert ApiLeave → LeaveRequest */
const normaliseLeave = (a: ApiLeave): LeaveRequest => ({
  id:        String(a.leaveId),
  type:      a.reason,
  from:      a.leaveDate,
  to:        a.leaveDate,
  days:      1,
  reason:    a.reason,
  status:    a.status,
  appliedOn: a.leaveDate,
});

/* ══════════════════════════════════════════════════════════════════
   SHARED STYLE CONSTANTS
══════════════════════════════════════════════════════════════════ */
const OVERLAY: React.CSSProperties = {
  position:"fixed", inset:0, zIndex:60,
  background:"rgba(15,15,30,0.5)",
  display:"flex", alignItems:"center", justifyContent:"center",
  padding:16, backdropFilter:"blur(4px)",
};
const MODAL_BOX: React.CSSProperties = {
  background:"#fff", borderRadius:18, width:"100%",
  boxShadow:"0 24px 64px rgba(99,102,241,0.18)",
  animation:"modalIn 0.22s ease",
};
const inputSt: React.CSSProperties = {
  width:"100%", padding:"9px 12px",
  border:"1.5px solid #e8e7f3", borderRadius:9,
  fontSize:13.5, outline:"none", fontFamily:"inherit",
  background:"#fafafa", color:"#1e1b4b",
  transition:"border-color 0.18s", boxSizing:"border-box",
};
const labelSt: React.CSSProperties = {
  display:"block", fontSize:11, fontWeight:700,
  color:"#94a3b8", marginBottom:5,
  letterSpacing:"0.05em", textTransform:"uppercase",
};
const primaryBtn = (disabled = false): React.CSSProperties => ({
  flex:1, padding:"10px 0", border:"none", borderRadius:10,
  fontSize:13.5, fontWeight:600,
  cursor: disabled ? "default" : "pointer",
  background: disabled ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color:"#fff", fontFamily:"inherit",
});
const ghostBtn: React.CSSProperties = {
  flex:1, padding:"10px 0", border:"1.5px solid #e8e7f3", borderRadius:10,
  fontSize:13.5, fontWeight:600, cursor:"pointer",
  background:"#fff", color:"#64748b", fontFamily:"inherit",
};

/* ══════════════════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
══════════════════════════════════════════════════════════════════ */
function ModalHeader({ title, sub, onClose }: { title: string; sub: string; onClose: () => void }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
      <div>
        <h2 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:17, color:"#1e1b4b" }}>{title}</h2>
        <p style={{ margin:"3px 0 0", fontSize:12.5, color:"#94a3b8" }}>{sub}</p>
      </div>
      <button onClick={onClose} style={{ border:"none", background:"#f1f0fb", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:14, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999,  fontSize:11.5, fontWeight:600 }}>
      <span style={{ width:6, height:6, borderRadius:"50%",  flexShrink:0 }} />{status}
    </span>
  );
}

function InfoCard({ label, value, mono = false, children }: { label: string; value?: string; mono?: boolean; children?: React.ReactNode }) {
  return (
    <div style={{ padding:"14px 16px", background:"#faf9ff", borderRadius:12, border:"1px solid #e8e7f3" }}>
      <p style={{ margin:"0 0 6px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
      {children ?? <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#1e1b4b", fontFamily:mono?"monospace":"inherit" }}>{value || "—"}</p>}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div style={{
      position:"fixed", bottom:28, right:24, zIndex:100,
      display:"flex", alignItems:"center", gap:10,
      padding:"12px 18px", borderRadius:12,
      background: type === "success" ? "#ecfdf5" : "#fef2f2",
      border:`1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
      color: type === "success" ? "#059669" : "#dc2626",
      fontSize:13.5, fontWeight:600,
      boxShadow:"0 8px 24px rgba(0,0,0,0.10)",
      animation:"slideIn 0.3s ease",
    }}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 0", gap:14 }}>
      <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #e8e7f3", borderTopColor:"#6366f1", animation:"spin 0.7s linear infinite" }} />
      <p style={{ margin:0, fontSize:13, color:"#94a3b8", fontWeight:500 }}>Loading…</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MODAL — REQUEST LEAVE
══════════════════════════════════════════════════════════════════ */
function RequestLeaveModal({ emp, leaves, onClose, onSubmit }: {
  emp: Employee;
  leaves: LeaveRequest[];
  onClose: () => void;
  onSubmit: (r: LeaveRequest) => void;
}) {
  const [type,   setType]   = useState<LeaveType>("Personal");
  const [from,   setFrom]   = useState(todayStr());
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const usedPersonal = leaves.filter(l => l.type === "Personal" && l.status === "Approved").reduce((s, l) => s + l.days, 0);
  const balance: Record<LeaveType, number> = { Personal: 20 - usedPersonal, Sick: 12, Others: 30 };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!reason.trim()) { setErr("Please provide a reason."); return; }
    if (balance[type] < 1) { setErr(`Insufficient ${type} leave balance.`); return; }
    setSaving(true);
    try {
      await fetch("http://localhost:8080/leaves/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: emp.employeeID,
          reason:     type,
          leaveDate:  from,
          status:     "Pending",
        }),
      });
    } catch (_) { /* network error — still add optimistically */ }
    onSubmit({
      id: `l${Date.now()}`, type, from, to: from, days: 1, reason,
      status: "Pending", appliedOn: todayStr(),
    });
    setSaving(false);
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={OVERLAY}>
      <div style={{ ...MODAL_BOX, maxWidth:500, maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ padding:"26px 26px 0" }}>
          <ModalHeader title="Request Leave" sub={`Submitting for ${emp.name} · EMP-${emp.employeeID}`} onClose={onClose} />
        </div>

        {/* Balance tiles */}
        <div style={{ margin:"0 26px 20px", display:"flex", gap:8, flexWrap:"wrap" }}>
          {(Object.entries(balance) as [LeaveType, number][]).map(([t, b]) => (
            <div key={t} onClick={() => setType(t)}
              style={{ padding:"8px 14px", borderRadius:9, background: type === t ? "#eef2ff" : "#faf9ff", border:`1px solid ${type === t ? "#6366f1" : "#e8e7f3"}`, cursor:"pointer", transition:"all 0.15s", minWidth:72 }}>
              <p style={{ margin:0, fontSize:10, fontWeight:700, color: type === t ? "#6366f1" : "#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em" }}>{t}</p>
              <p style={{ margin:0, fontSize:16, fontWeight:800, color: type === t ? "#6366f1" : "#1e1b4b" }}>{b}d</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ padding:"0 26px 26px", display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={labelSt}>Leave Type</label>
            <select value={type} onChange={e => setType(e.target.value as LeaveType)} style={inputSt}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"}>
              {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={labelSt}>Leave Date</label>
            <input type="date" value={from} min={todayStr()} onChange={e => setFrom(e.target.value)} style={inputSt}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
          </div>

          {/* Preview pill */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, background:"linear-gradient(135deg,#eef2ff,#faf5ff)", border:"1px solid #c7d2fe" }}>
            <span style={{ fontSize:18 }}>🗓️</span>
            <div>
              <p style={{ margin:0, fontSize:12, color:"#6366f1", fontWeight:700 }}>1 working day</p>
              <p style={{ margin:0, fontSize:11.5, color:"#8b5cf6" }}>{fmtDate(from)}</p>
            </div>
          </div>

          <div>
            <label style={labelSt}>Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Briefly describe the reason for your leave…"
              style={{ ...inputSt, resize:"vertical", lineHeight:1.6 }}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
          </div>

          {err && <p style={{ margin:0, fontSize:12, color:"#dc2626", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>⚠️ {err}</p>}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={primaryBtn(saving)}>
              {saving ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MODAL — COMMIT ATTENDANCE
══════════════════════════════════════════════════════════════════ */
function CommitAttendanceModal({ emp, attendance, onClose, onSubmit }: {
  emp: Employee;
  attendance: AttendanceRecord[];
  onClose: () => void;
  onSubmit: (r: AttendanceRecord) => void;
}) {
  const [date,     setDate]     = useState(todayStr());
  const [checkIn,  setCheckIn]  = useState("09:00");
  const [checkOut, setCheckOut] = useState("18:00");
  const [status,   setStatus]   = useState<CheckInStatus>("Present");
  const [note,     setNote]     = useState("");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");

  const alreadyLogged = attendance.some(a =>
    a.date.includes(new Date(date + "T00:00:00").toDateString().slice(4))
  );

  const calcHours = () => {
    const [ih, im] = checkIn.split(":").map(Number);
    const [oh, om] = checkOut.split(":").map(Number);
    return Math.max(0, Math.round(((oh * 60 + om) - (ih * 60 + im)) / 6) / 10);
  };
  const hours = calcHours();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (checkOut <= checkIn) { setErr("Check-out must be after check-in."); return; }
    if (hours < 1) { setErr("Logged hours seem too short. Please verify."); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 450));
    const d = new Date(date + "T00:00:00");
    onSubmit({
      id: `a${Date.now()}`,
      date: d.toLocaleDateString("en-US", { weekday:"short", year:"numeric", month:"short", day:"numeric" }),
      checkIn, checkOut, status, hours, note,
    });
    setSaving(false);
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={OVERLAY}>
      <div style={{ ...MODAL_BOX, maxWidth:480, maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ padding:"26px 26px 0" }}>
          <ModalHeader title="Commit Attendance" sub={`Logging for ${emp.name} · EMP-${emp.employeeID}`} onClose={onClose} />
        </div>

        {/* Status tiles */}
        <div style={{ margin:"0 26px 20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {CHECK_STATUSES.map(s => {
            const st = CHECK_STATUS_STYLES[s];
            return (
              <div key={s} onClick={() => setStatus(s)}
                style={{ padding:"10px 14px", borderRadius:10, cursor:"pointer", background: status === s ? st.bg : "#faf9ff", border:`1.5px solid ${status === s ? st.color : "#e8e7f3"}`, transition:"all 0.15s", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:10, height:10, borderRadius:"50%", background:st.dot, flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:600, color: status === s ? st.color : "#64748b" }}>{s}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ padding:"0 26px 26px", display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={labelSt}>Date</label>
            <input type="date" value={date} max={todayStr()} onChange={e => setDate(e.target.value)} style={inputSt}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
            <p style={{ margin:"5px 0 0", fontSize:12, color:"#94a3b8" }}>
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
            </p>
          </div>

          {alreadyLogged && (
            <div style={{ padding:"10px 14px", borderRadius:10, background:"#fffbeb", border:"1px solid #fde68a", color:"#d97706", fontSize:13, fontWeight:500 }}>
              ⚠️ Attendance already logged for this date — submitting adds a new record.
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelSt}>Check-In</label>
              <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={inputSt}
                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
            </div>
            <div>
              <label style={labelSt}>Check-Out</label>
              <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={inputSt}
                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
            </div>
          </div>

          {/* Hours pill */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, background:"linear-gradient(135deg,#ecfdf5,#f0fdf4)", border:"1px solid #bbf7d0" }}>
            <span style={{ fontSize:18 }}>⏱️</span>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#059669" }}>{hours} hours logged</p>
              <p style={{ margin:0, fontSize:11.5, color:"#34d399" }}>{checkIn} → {checkOut}</p>
            </div>
          </div>

          <div>
            <label style={labelSt}>Note (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. WFH, client visit…" style={inputSt}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
          </div>

          {err && <p style={{ margin:0, fontSize:12, color:"#dc2626", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>⚠️ {err}</p>}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={primaryBtn(saving)}>
              {saving ? "Saving…" : "Commit Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MODAL — PAYROLL CHECK
══════════════════════════════════════════════════════════════════ */
function PayrollCheckModal({ emp, payslips, onClose }: { emp: Employee; payslips: PayslipRecord[]; onClose: () => void }) {
  const [selected,    setSelected]    = useState<PayslipRecord>(payslips[0]);
  const [downloading, setDownloading] = useState(false);

  const Row = ({ label, value, bold = false, red = false }: { label: string; value: string; bold?: boolean; red?: boolean }) => (
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13.5, padding:"6px 0" }}>
      <span style={{ color:"#64748b" }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color: red ? "#dc2626" : "#1e1b4b" }}>{value}</span>
    </div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={OVERLAY}>
      <div style={{ ...MODAL_BOX, maxWidth:520, maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ padding:"26px 26px 0" }}>
          <ModalHeader title="Payroll Check" sub={`${emp.name} · EMP-${emp.employeeID}`} onClose={onClose} />
        </div>

        {/* Month selector */}
        <div style={{ margin:"0 26px 20px", display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {payslips.map(p => (
            <button key={p.id} onClick={() => setSelected(p)}
              style={{ padding:"8px 14px", borderRadius:9, border:`1.5px solid ${selected.id === p.id ? "#6366f1" : "#e8e7f3"}`, background: selected.id === p.id ? "#eef2ff" : "#faf9ff", color: selected.id === p.id ? "#6366f1" : "#64748b", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0, fontFamily:"inherit" }}>
              {p.month} {p.year}
            </button>
          ))}
        </div>

        <div style={{ padding:"0 26px 26px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ margin:0, fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Pay Period</p>
              <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#1e1b4b" }}>{selected.month} {selected.year}</p>
            </div>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:999, background: selected.paid ? "#ecfdf5" : "#fef2f2", color: selected.paid ? "#059669" : "#dc2626", fontSize:12.5, fontWeight:700 }}>
              {selected.paid ? `✅ Paid · ${selected.paidOn}` : "⏳ Pending"}
            </span>
          </div>

          {/* Net hero */}
          <div style={{ padding:"20px", borderRadius:14, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", textAlign:"center" }}>
            <p style={{ margin:"0 0 4px", fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Net Pay</p>
            <p style={{ margin:0, fontSize:36, fontWeight:800, color:"#fff", fontFamily:"'Outfit',sans-serif" }}>{fmtMoney(selected.net)}</p>
          </div>

          <div style={{ padding:"16px", borderRadius:12, background:"#faf9ff", border:"1px solid #e8e7f3" }}>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Breakdown</p>
            <Row label="Gross Pay"       value={fmtMoney(selected.gross)} />
            <div style={{ borderTop:"1px dashed #e8e7f3", margin:"6px 0" }} />
            <Row label="Income Tax"      value={`−${fmtMoney(selected.tax)}`}        red />
            <Row label="Deductions"      value={`−${fmtMoney(selected.deductions)}`} red />
            <div style={{ borderTop:"2px solid #e8e7f3", margin:"8px 0" }} />
            <Row label="Net Pay"         value={fmtMoney(selected.net)} bold />
          </div>

          {/* Visual bar */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:11.5, fontWeight:600, color:"#6366f1" }}>Net {Math.round(selected.net / selected.gross * 100)}%</span>
              <span style={{ fontSize:11.5, color:"#94a3b8" }}>Deducted {Math.round((selected.gross - selected.net) / selected.gross * 100)}%</span>
            </div>
            <div style={{ height:10, borderRadius:999, background:"#e8e7f3", overflow:"hidden", display:"flex" }}>
              <div style={{ flex:selected.net,         background:"linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
              <div style={{ flex:selected.tax,         background:"#fca5a5" }} />
              <div style={{ flex:selected.deductions,  background:"#fcd34d" }} />
            </div>
            <div style={{ display:"flex", gap:14, marginTop:7, fontSize:11 }}>
              <span style={{ color:"#6366f1" }}>■ Net</span>
              <span style={{ color:"#f87171" }}>■ Tax</span>
              <span style={{ color:"#f59e0b" }}>■ Deductions</span>
            </div>
          </div>

          {/* YTD */}
          <div style={{ padding:"14px 16px", borderRadius:12, background:"linear-gradient(135deg,#ecfdf5,#f0fdf4)", border:"1px solid #bbf7d0" }}>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#059669", textTransform:"uppercase", letterSpacing:"0.06em" }}>Year-to-Date</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { label:"Gross", value: fmtMoney(payslips.filter(p => p.paid).reduce((s, p) => s + p.gross, 0)) },
                { label:"Tax",   value: fmtMoney(payslips.filter(p => p.paid).reduce((s, p) => s + p.tax,   0)) },
                { label:"Net",   value: fmtMoney(payslips.filter(p => p.paid).reduce((s, p) => s + p.net,   0)) },
              ].map(c => (
                <div key={c.label} style={{ textAlign:"center" }}>
                  <p style={{ margin:"0 0 3px", fontSize:10.5, fontWeight:700, color:"#34d399", textTransform:"uppercase" }}>{c.label}</p>
                  <p style={{ margin:0, fontSize:15, fontWeight:800, color:"#059669", fontFamily:"'Outfit',sans-serif" }}>{c.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} style={ghostBtn}>Close</button>
            <button onClick={async () => { setDownloading(true); await new Promise(r => setTimeout(r, 800)); setDownloading(false); }}
              disabled={downloading}
              style={{ ...primaryBtn(downloading), display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {downloading ? "Generating…" : "⬇ Download Payslip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MODAL — EDIT EMPLOYEE
══════════════════════════════════════════════════════════════════ */
function EditModal({ employee, onClose, onSave }: { employee: Employee; onClose: () => void; onSave: (e: Employee) => void }) {
  const [form,   setForm]   = useState<Employee>({ ...employee });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Employee>(k: K, v: Employee[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    await new Promise(r => setTimeout(r, 350));
    onSave(form); setSaving(false);
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={OVERLAY}>
      <div style={{ ...MODAL_BOX, maxWidth:560, maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ padding:"26px 26px 0" }}>
          <ModalHeader title="Edit Employee" sub={`Updating ${employee.name}`} onClose={onClose} />
        </div>
        <form onSubmit={handleSave} style={{ padding:"0 26px 26px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {([
              ["Full Name", "name",     "text"],
              ["Email",     "email",    "email"],
              ["Phone",     "phone",    "text"],
              ["Role",      "role",     "text"],
              ["Hire Date", "hireDate", "text"],
            ] as const).map(([label, key, type]) => (
              <div key={key}>
                <label style={labelSt}>{label}</label>
                <input type={type} value={String(form[key] ?? "")} onChange={e => set(key as any, e.target.value as any)} style={inputSt}
                  onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
              </div>
            ))}
            <div>
              <label style={labelSt}>Department</label>
              <input value={form.department?.deptName ?? ""} disabled style={{ ...inputSt, background:"#f1f0fb", color:"#94a3b8" }} />
            </div>
            <div>
              <label style={labelSt}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value as Status)} style={inputSt}
                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Annual Salary ($)</label>
              <input type="number" disabled value={employee.salary} style={{ ...inputSt, background:"#f1f0fb", color:"#94a3b8" }} />
            </div>
            <div>
              <label style={labelSt}>Attendance Rate (%)</label>
              <input type="number" min={0} max={100} value={form.attendanceRate}
                onChange={e => set("attendanceRate", Number(e.target.value))} style={inputSt}
                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e8e7f3"} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20, paddingTop:18, borderTop:"1px solid #e8e7f3" }}>
            <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={primaryBtn(saving)}>{saving ? "Saving…" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB — PERSONAL
══════════════════════════════════════════════════════════════════ */
function PersonalTab({ emp }: { emp: Employee }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
      <InfoCard label="Full Name"    value={emp.name} />
      <InfoCard label="Email"        value={emp.email} />
      <InfoCard label="Phone"        value={emp.phone ?? "—"} />
      {/* <InfoCard label="Employee ID"  value={String(emp.employeeID)} mono /> */}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB — JOB
══════════════════════════════════════════════════════════════════ */
function JobTab({ emp }: { emp: Employee }) {
  const dc = getDeptColor(emp.department?.deptId ?? 0);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
      <InfoCard label="Department">
        <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:14, fontWeight:600, color:dc.text }}>
          <span style={{ width:9, height:9, borderRadius:"50%", background:dc.from, flexShrink:0 }} />
          {emp.department?.deptName ?? "—"}
        </span>
      </InfoCard>
      <InfoCard label="Role"      value={emp.role} />
      <InfoCard label="Hire Date" value={emp.hireDate} />
      {/* <InfoCard label="Status"><StatusBadge status={emp.status} /></InfoCard> */}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB — ATTENDANCE
══════════════════════════════════════════════════════════════════ */
function AttendanceTab({ emp, attendance, onCommit }: { emp: Employee; attendance: AttendanceRecord[]; onCommit: () => void }) {
  const present = Math.round(257 * (emp.attendanceRate / 100));
  const absent  = 257 - present;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:14 }}>
        {[
          { label:"Rate",    value:`${emp.attendanceRate}%`, bg:"#ecfdf5", border:"#bbf7d0", color:"#059669" },
          { label:"Present", value:String(present),          bg:"#eff6ff", border:"#bfdbfe", color:"#2563eb" },
          { label:"Absent",  value:String(absent),           bg:"#fffbeb", border:"#fde68a", color:"#d97706" },
        ].map(s => (
          <div key={s.label} style={{ padding:16, borderRadius:12, background:s.bg, border:`1px solid ${s.border}` }}>
            <p style={{ margin:"0 0 6px", fontSize:11, fontWeight:700, color:s.color, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</p>
            <p style={{ margin:0, fontSize:28, fontWeight:800, color:s.color, fontFamily:"'Outfit',sans-serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ padding:"14px 16px", background:"#faf9ff", borderRadius:12, border:"1px solid #e8e7f3" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:11.5, fontWeight:600, color:"#64748b" }}>Annual attendance</span>
          <span style={{ fontSize:11.5, fontWeight:700, color:"#6366f1" }}>{emp.attendanceRate}%</span>
        </div>
        <div style={{ height:8, borderRadius:999, background:"#e8e7f3", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${emp.attendanceRate}%`, background:"linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius:999, transition:"width 0.6s ease" }} />
        </div>
      </div>

      <div style={{ padding:"14px 16px", background:"#faf9ff", borderRadius:12, border:"1px solid #e8e7f3" }}>
        <p style={{ margin:"0 0 12px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Recent Records</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {attendance.slice().reverse().map(a => {
            const st = CHECK_STATUS_STYLES[a.status];
            return (
              <div key={a.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:st.dot, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:"#64748b" }}>{a.date}</span>
                  {a.note && <span style={{ fontSize:11, color:"#94a3b8" }}>· {a.note}</span>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:"#94a3b8" }}>{a.checkIn}–{a.checkOut} ({a.hours}h)</span>
                  <span style={{ fontSize:11.5, fontWeight:600, padding:"2px 8px", borderRadius:6, background:st.bg, color:st.color }}>{a.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={onCommit} style={{ ...primaryBtn(), display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        📋 Commit Today's Attendance
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB — PAYROLL
══════════════════════════════════════════════════════════════════ */
function PayrollTab({ emp, payslips, onPayrollCheck }: { emp: Employee; payslips: PayslipRecord[]; onPayrollCheck: () => void }) {
  const monthly = Math.round(emp.salary / 12);
  const gross   = Math.round(monthly * 1.1);
  const net     = Math.round(monthly * 0.85);
  const tax     = gross - net;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
        <InfoCard label="Annual Salary">
          <p style={{ margin:0, fontSize:22, fontWeight:800, color:"#1e1b4b", fontFamily:"'Outfit',sans-serif" }}>{fmtMoney(emp.salary)}</p>
        </InfoCard>
        <InfoCard label="Monthly Salary">
          <p style={{ margin:0, fontSize:22, fontWeight:800, color:"#1e1b4b", fontFamily:"'Outfit',sans-serif" }}>{fmtMoney(monthly)}</p>
        </InfoCard>
      </div>
      <div style={{ padding:"16px 18px", borderRadius:12, background:"linear-gradient(135deg,#eff6ff,#f0f9ff)", border:"1px solid #bfdbfe" }}>
        <p style={{ margin:"0 0 14px", fontSize:11, fontWeight:700, color:"#2563eb", textTransform:"uppercase", letterSpacing:"0.06em" }}>Last Payslip — {payslips[0].paidOn}</p>
        {[["Gross Amount", fmtMoney(gross)], ["Tax & Deductions", `−${fmtMoney(tax)}`]].map(([l, v]) => (
          <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13.5, color:"#1e40af", marginBottom:6 }}>
            <span style={{ color:"#3b82f6" }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
          </div>
        ))}
        <div style={{ borderTop:"1px solid #bfdbfe", paddingTop:10, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontWeight:700, color:"#1e40af", fontSize:14.5 }}>Net Amount</span>
          <span style={{ fontWeight:800, color:"#1e40af", fontSize:14.5, fontFamily:"'Outfit',sans-serif" }}>{fmtMoney(net)}</span>
        </div>
      </div>
      <button onClick={onPayrollCheck} style={{ ...primaryBtn(), display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        💳 Full Payroll Check
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB — LEAVE REQUESTS  ← NEW
   Fetches from GET /leaves/leavesByEmp/{empID}
══════════════════════════════════════════════════════════════════ */
function LeaveRequestTab({ emp, onRequest }: { emp: Employee; onRequest: () => void }) {
  const [leaves,      setLeaves]      = useState<LeaveRequest[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "All">("All");
  const [typeFilter,   setTypeFilter]   = useState<LeaveType | "All">("All");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`http://localhost:8080/leaves/leavesByEmp/${emp.employeeID}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiLeave[] = await res.json();
      setLeaves(data.map(normaliseLeave));
    } catch (e: any) {
      setFetchError(e.message ?? "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }, [emp.employeeID]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  /* filtered + sorted newest-first */
  const filtered = leaves
    .filter(l => statusFilter === "All" || l.status === statusFilter)
    .filter(l => typeFilter   === "All" || l.type   === typeFilter)
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));

  /* summary counts */
  const counts: Record<LeaveStatus, number> = {
    Pending:  leaves.filter(l => l.status === "Pending").length,
    Approved: leaves.filter(l => l.status === "Approved").length,
    Rejected: leaves.filter(l => l.status === "Rejected").length,
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

      {/* ── Summary tiles ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:12 }}>
        {(["Pending","Approved","Rejected"] as LeaveStatus[]).map(s => {
          const st = LEAVE_STATUS_STYLES[s];
          return (
            <div key={s}
              onClick={() => setStatusFilter(prev => prev === s ? "All" : s)}
              style={{ padding:"14px 16px", borderRadius:12, background: statusFilter === s ? st.bg : "#faf9ff", border:`1.5px solid ${statusFilter === s ? st.color : "#e8e7f3"}`, cursor:"pointer", transition:"all 0.18s" }}>
              <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, color: statusFilter === s ? st.color : "#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s}</p>
              <p style={{ margin:0, fontSize:26, fontWeight:800, color: statusFilter === s ? st.color : "#1e1b4b", fontFamily:"'Outfit',sans-serif" }}>{counts[s]}</p>
            </div>
          );
        })}
        <div style={{ padding:"14px 16px", borderRadius:12, background:"#f1f0fb", border:"1.5px solid #c7d2fe" }}>
          <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.06em" }}>Total</p>
          <p style={{ margin:0, fontSize:26, fontWeight:800, color:"#6366f1", fontFamily:"'Outfit',sans-serif" }}>{leaves.length}</p>
        </div>
      </div>

      {/* ── Filters row ── */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        {/* Type filter */}
        <div style={{ display:"flex", gap:6 }}>
          {(["All", ...LEAVE_TYPES] as (LeaveType | "All")[]).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${typeFilter === t ? "#6366f1" : "#e8e7f3"}`, background: typeFilter === t ? "#eef2ff" : "#fff", color: typeFilter === t ? "#6366f1" : "#64748b", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ flex:1 }} />

        {/* Refresh */}
        <button onClick={fetchLeaves} disabled={loading}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8, border:"1px solid #e8e7f3", background:"#fff", color:"#64748b", fontSize:12.5, fontWeight:600, cursor: loading ? "default" : "pointer", fontFamily:"inherit" }}>
          {loading ? "⟳ Loading…" : "⟳ Refresh"}
        </button>

        {/* New request */}
        <button onClick={onRequest}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 16px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 3px 10px rgba(99,102,241,0.3)" }}>
          🌴 New Request
        </button>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <Spinner />
      ) : fetchError ? (
        <div style={{ padding:"28px 20px", borderRadius:14, background:"#fef2f2", border:"1px solid #fecaca", textAlign:"center" }}>
          <p style={{ margin:"0 0 6px", fontSize:15, fontWeight:700, color:"#dc2626" }}>❌ Failed to load</p>
          <p style={{ margin:"0 0 14px", fontSize:13, color:"#f87171" }}>{fetchError}</p>
          <button onClick={fetchLeaves}
            style={{ padding:"7px 18px", borderRadius:9, border:"none", background:"#ef4444", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:"48px 20px", textAlign:"center" }}>
          <p style={{ margin:0, fontSize:32 }}>🌴</p>
          <p style={{ margin:"10px 0 4px", fontSize:15, fontWeight:600, color:"#64748b" }}>No leave requests found</p>
          <p style={{ margin:0, fontSize:13, color:"#94a3b8" }}>
            {statusFilter !== "All" || typeFilter !== "All" ? "Try clearing the filters" : "Submit a new leave request to get started"}
          </p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map((l, i) => {
            const st  = LEAVE_STATUS_STYLES[l.status];
            return (
              <div key={l.id}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, padding:"14px 16px", borderRadius:13, background:"#faf9ff", border:`1px solid ${l.status === "Pending" ? "#fde68a" : l.status === "Approved" ? "#bbf7d0" : "#fecaca"}`, animation:`rowIn 0.25s ease ${i * 0.04}s both` }}>

                {/* Left — type + dates */}
                <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background: st.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                    {l.type === "Sick" ? "🤒" : l.type === "Personal" ? "🌴" : "📋"}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:14, fontWeight:700, color:"#1e1b4b" }}>{l.type} Leave</span>
                      <span style={{ fontSize:11.5, fontWeight:600, padding:"2px 9px", borderRadius:999, background:st.bg, color:st.color }}>
                        {st.icon} {l.status}
                      </span>
                    </div>
                    <p style={{ margin:"3px 0 0", fontSize:12.5, color:"#64748b" }}>
                      📅 {fmtDate(l.from)}
                      {l.from !== l.to && ` → ${fmtDate(l.to)}`}
                      <span style={{ marginLeft:8, color:"#94a3b8" }}>({l.days} day{l.days !== 1 ? "s" : ""})</span>
                    </p>
                    {l.reason && l.reason !== l.type && (
                      <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        "{l.reason}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right — applied date */}
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ margin:0, fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em" }}>Applied</p>
                  <p style={{ margin:0, fontSize:12.5, fontWeight:600, color:"#64748b" }}>{fmtDate(l.appliedOn)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════════ */
export default function EmployeeProfile() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const [employee,   setEmployee]   = useState<Employee | null>(null);
  const [image,      setImage]      = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab,  setActiveTab]  = useState<Tab>("personal");

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(SEED_ATTENDANCE);
  const [payslips]                  = useState<PayslipRecord[]>(SEED_PAYSLIPS);

  /* optimistic local leaves (new submissions) */
  const [localLeaves, setLocalLeaves] = useState<LeaveRequest[]>([]);

  const [showEdit,    setShowEdit]    = useState(false);
  const [showLeave,   setShowLeave]   = useState(false);
  const [showAttend,  setShowAttend]  = useState(false);
  const [showPayroll, setShowPayroll] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* fetch employee */
  useEffect(() => {
    if (!id) return;
    (async () => {
      setPageLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/employees/employee-by-id/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Employee = await res.json();
        setEmployee(data);
        if (data.photo) setImage(`data:image/png;base64,${data.photo}`);
      } catch (e: any) {
        showToast(`Failed to load employee: ${e.message}`, "error");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id]);

  const dc = getDeptColor(employee?.department?.deptId ?? 0);

  const handleSaveEmployee = (updated: Employee) => {
    setEmployee(updated);
    setShowEdit(false);
    showToast("Employee profile updated.");
  };

  const handleLeaveSubmit = (r: LeaveRequest) => {
    setLocalLeaves(prev => [r, ...prev]);
    setShowLeave(false);
    showToast(`Leave request submitted — ${r.type} on ${fmtDate(r.from)}.`);
  };

  const handleAttendanceSubmit = (r: AttendanceRecord) => {
    setAttendance(prev => [...prev, r]);
    setShowAttend(false);
    showToast(`Attendance committed for ${r.date} (${r.hours}h · ${r.status}).`);
  };

  /* ── Loading state ── */
  if (pageLoading) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f1f0fb 0%,#f5f3ff 60%,#fef9f3 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Spinner />
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f1f0fb,#fef9f3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:32, margin:"0 0 12px" }}>⚠️</p>
          <p style={{ fontSize:16, color:"#64748b" }}>Employee not found.</p>
          <button onClick={() => navigate("/")} style={{ marginTop:16, padding:"9px 22px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const tabContent: Record<Tab, React.ReactNode> = {
    personal:     <PersonalTab   emp={employee} />,
    job:          <JobTab        emp={employee} />,
    attendance:   <AttendanceTab emp={employee} attendance={attendance} onCommit={() => setShowAttend(true)} />,
    payroll:      <PayrollTab    emp={employee} payslips={payslips}     onPayrollCheck={() => setShowPayroll(true)} />,
    leaveRequest: (
      <LeaveRequestTab
        emp={employee}
        onRequest={() => { setShowLeave(true); }}
      />
    ),
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f1f0fb 0%,#f5f3ff 60%,#fef9f3 100%)", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rowIn   { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .tab-content   { animation: fadeUp 0.22s ease both; }
        .tab-btn:hover { color: #6366f1 !important; }
        .action-chip:hover { opacity:0.85; transform:translateY(-1px); }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#c4b5fd; border-radius:3px; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ background:"#fff", borderBottom:"1px solid #e8e7f3", padding:"0 24px", position:"sticky", top:0, zIndex:40 }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${dc.from},${dc.to})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700 }}>
              {getInitials(employee.name)}
            </div>
            <h1 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:"#1e1b4b" }}>Employee Profile</h1>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setShowEdit(true)}
              style={{ padding:"8px 16px", border:"none", borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 12px rgba(99,102,241,0.3)" }}>
              ✏️ Edit
            </button>
            <button onClick={() => navigate("/")}
              style={{ padding:"8px 16px", border:"1.5px solid #e8e7f3", borderRadius:10, background:"#fff", color:"#64748b", fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:900, margin:"0 auto", padding:"24px 24px 48px" }}>

        {/* ── Profile card ── */}
        <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e8e7f3", overflow:"hidden", marginBottom:20, boxShadow:"0 4px 20px rgba(99,102,241,0.07)" }}>
          <div style={{ height:80,  position:"relative" }}>
            <div style={{ position:"absolute", inset:0, opacity:0.15,  }} />
          </div>

          <div style={{ padding:"0 24px 24px", marginTop:-44 }}>
            <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginBottom:20, flexWrap:"wrap" }}>
              {/* Avatar / photo */}
              <div style={{ width:80, height:80, borderRadius:16, background:`linear-gradient(135deg,${dc.from},${dc.to})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:26, fontWeight:800, border:"4px solid #fff", boxShadow:"0 8px 20px rgba(0,0,0,0.15)", flexShrink:0, overflow:"hidden" }}>
                {image
                  ? <img src={image} alt={employee.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : getInitials(employee.name)
                }
              </div>

              <div style={{ paddingBottom:4, flex:1, minWidth:0 }}>
                <h2 style={{ margin:0, fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:"#1e1b4b" }}>{employee.name}</h2>
                <p style={{ margin:"2px 0 8px", fontSize:14, color:"#64748b", fontWeight:500 }}>{employee.role}</p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontFamily:"monospace", fontSize:12, color:dc.text, background:dc.light, padding:"2px 8px", borderRadius:6, fontWeight:600 }}>
                    EMP-{employee.employeeID}
                  </span>
                  <StatusBadge status={employee.status} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:14, paddingTop:16, borderTop:"1px solid #e8e7f3", marginBottom:20 }}>
              {[
                { label:"Department", value: employee.department?.deptName ?? "—" },
                { label:"Email",      value: employee.email },
                { label:"Phone",      value: employee.phone ?? "—" },
                { label:"Hire Date",  value: employee.hireDate },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ margin:"0 0 3px", fontSize:10.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>{f.label}</p>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#1e1b4b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={f.value}>{f.value}</p>
                </div>
              ))}
            </div>

            {/* Action chips */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[
                { label:"🌴 Request Leave",     color:"#059669", bg:"#ecfdf5", border:"#bbf7d0", onClick:() => { setActiveTab("leaveRequest"); setShowLeave(true); } },
                { label:"📋 Commit Attendance", color:"#6366f1", bg:"#eef2ff", border:"#c7d2fe", onClick:() => { setActiveTab("attendance");   setShowAttend(true); } },
                { label:"💳 Payroll Check",     color:"#0284c7", bg:"#f0f9ff", border:"#bae6fd", onClick:() => { setActiveTab("payroll");      setShowPayroll(true); } },
              ].map(a => (
                <button key={a.label} onClick={a.onClick} className="action-chip"
                  style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:`1.5px solid ${a.border}`, background:a.bg, color:a.color, fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s" }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e8e7f3", overflow:"hidden", boxShadow:"0 4px 20px rgba(99,102,241,0.07)" }}>
          <div style={{ display:"flex", borderBottom:"1px solid #e8e7f3", background:"#faf9ff", overflowX:"auto" }}>
            {TABS.map(t => (
              <button key={t.key} className="tab-btn" onClick={() => setActiveTab(t.key)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"13px 20px", border:"none", cursor:"pointer", fontSize:13.5, fontWeight:600, flexShrink:0, fontFamily:"inherit", background:"transparent", color: activeTab === t.key ? "#6366f1" : "#64748b", borderBottom: activeTab === t.key ? "2.5px solid #6366f1" : "2.5px solid transparent", marginBottom:-1, transition:"all 0.18s" }}>
                <span>{t.icon}</span>{t.label}
                {/* Badge for pending leaves */}
                {t.key === "leaveRequest" && localLeaves.filter(l => l.status === "Pending").length > 0 && (
                  <span style={{ marginLeft:4, minWidth:18, height:18, borderRadius:999, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"0 5px" }}>
                    {localLeaves.filter(l => l.status === "Pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="tab-content" key={activeTab} style={{ padding:22 }}>
            {tabContent[activeTab]}
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
      {showEdit    && <EditModal employee={employee} onClose={() => setShowEdit(false)} onSave={handleSaveEmployee} />}
      {showLeave   && (
        <RequestLeaveModal
          emp={employee}
          leaves={localLeaves}
          onClose={() => setShowLeave(false)}
          onSubmit={handleLeaveSubmit}
        />
      )}
      {showAttend  && <CommitAttendanceModal emp={employee} attendance={attendance} onClose={() => setShowAttend(false)} onSubmit={handleAttendanceSubmit} />}
      {showPayroll && <PayrollCheckModal emp={employee} payslips={payslips} onClose={() => setShowPayroll(false)} />}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}