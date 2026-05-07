import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "../components/SideBar";

/* ── Types ─────────────────────────────────────────────────────── */
type Status = "Active" | "On Leave" | "Terminated";
type Department = "Engineering" | "Marketing" | "Sales" | "HR" | "Finance" | "Design" | "Operations";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: Department;
  role: string;
  status: Status;
  avatar: string; // initials
}

type ModalMode = "add" | "edit" | null;

/* ── Responsive hook ───────────────────────────────────────────────────── */
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

/* ── Seed data ─────────────────────────────────────────────────── */
// Employees are now fetched from API instead of using hardcoded SEED data


const STATUSES: Status[] = ["Active", "On Leave", "Terminated"];

const DEPT_COLORS: Record<Department, string> = {
  Engineering: "#6366f1",
  Marketing:   "#ec4899",
  Sales:       "#059669",
  HR:          "#f59e0b",
  Finance:     "#0ea5e9",
  Design:      "#8b5cf6",
  Operations:  "#f97316",
};

const STATUS_STYLES: Record<Status, boolean> = {
  Active: true,
  "On Leave": false,
  Terminated: false,
};

function getStatusStyle(status: Status) {
  if (status === "Active") {
    return { bg: "#ecfdf5", color: "#059669", dot: "#10b981" };
  }
  if (status === "Terminated") {
    return { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" };
  }
  return { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" };
}

/* ── Helpers ─────────────────────────────────────────────────────*/
let _uid = 100;
const uid = () => String(++_uid);

function Avatar({ initials, dept }: { initials: string; dept: Department }) {
  const color = DEPT_COLORS[dept] ?? "#6366f1";
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: `${color}1a`,
      border: `2px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11.5, fontWeight: 700, color, flexShrink: 0,
      letterSpacing: "0.05em",
    }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const s = getStatusStyle(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

/* ── Modal ───────────────────────────────────────────────────────*/
interface ModalProps {
  mode: ModalMode;
  initial?: Employee;
  onClose: () => void;
  onSave: (data: Omit<Employee, "id" | "avatar">) => void;
}

function EmployeeModal({ mode, initial, onClose, onSave ,reload}: ModalProps) {
  const [name, setName]       = useState(initial?.name ?? "");
  const [email,setEmail]      = useState("");
  const [salary,setSalary]    = useState("");
  const [empId, setEmpId]     = useState(initial?.employeeId ?? "");
  const [dept, setDept]       = useState<Department>(initial?.department ?? "Engineering");
  const [role, setRole]       = useState(initial?.role ?? "");
  const [status, setStatus]   = useState<Status>(initial?.status ?? "Active");
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);
  const [departments,setDepartment] = useState([]);
  const [selectedFile,setSelectedFile]=useState<File | null>(null);

  const deptFetch=async()=>{
    const response = await fetch("http://localhost:8080/departments/all",{method:"GET"})
    if(response.status==200){
        const data = await response.json();
        setDepartment(data);
    }
  }
  useEffect(() => { firstInput.current?.focus(); deptFetch() }, []);

  function createPwd(name:string){
    return name
    .toLowerCase()              // Convert to lowercase
    .replace(/[^a-z]/g, '');
  }
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Validation
  if (!name.trim() || !role.trim()) {
    setError("All fields are required.");
    return;
  }

  setSaving(true);

  try {
    // 2. Prepare the JSON data matching your backend's expected structure
    const employeeData = {
      name: name.trim(),
      email: email.trim(),
      salary: parseFloat(salary), // Ensure this is a number
      hireDate: new Date().toISOString().split('T')[0], // e.g., "2026-05-07"
      deptID: parseInt(dept),
      role: role.toUpperCase(),
      status: status === "Active" ? 1 : 0, // Convert status string to numeric if needed
      password: createPwd(name.trim())// Or handle via a state field
    };

    // 3. Create FormData object
    const formData = new FormData();
    
    // Append the JSON as a Blob with 'application/json' type
    formData.append(
      "newEmployee",
      new Blob([JSON.stringify(employeeData)], { type: "application/json" })
    );

    // Append the file (Assuming you have a 'selectedFile' state from an <input type="file" />)
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    // 4. Send Request using fetch or axios
    const response = await fetch("http://localhost:8080/employees/create", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      onClose();
      reload();
    } else {
      setError("Failed to save employee.");
    }
  } catch (err) {
    setError("Network error occurred.");
    console.error(err);
  } finally {
    setSaving(false);
  }
};

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    border: "1.5px solid #e8e7f3", borderRadius: 9,
    fontSize: 13.5, outline: "none",
    background: "#fafafa", color: "#1e1b4b",
    transition: "border-color 0.18s",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11.5, fontWeight: 600,
    color: "#64748b", marginBottom: 5, letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(15,15,30,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, backdropFilter: "blur(3px)",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 440,
        padding: "28px 28px 24px",
        boxShadow: "0 24px 60px rgba(99,102,241,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        animation: "modalIn 0.22s ease",
      }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e1b4b" }}>
              {mode === "add" ? "Add Employee" : "Edit Employee"}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
              {mode === "add" ? "Fill in the details below" : "Update employee information"}
            </p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f1f0fb", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }} >
          <div>
            <label style={labelStyle}>Full Name</label>
            <input ref={firstInput} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith"
              style={inputStyle} onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}/>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input ref={firstInput} value={email} onChange={e =>  setEmail(e.target.value)} placeholder="e.g. janesmith@gmail.com"
              style={inputStyle} onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}/>
          </div>
          <div>
            <label style={labelStyle}>Salary</label>
            <input ref={firstInput} value={salary} onChange={e =>  setSalary(e.target.value)} placeholder="e.g. 80000"
              style={inputStyle} onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Department</label>
              <select value={dept} onChange={e => setDept(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}>
                  <option value="0">Choose Department</option>
                {departments.map(d => <option value={d.deptID}>{d.deptName}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as Status)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Role / Title</label>
            <select value={role} onChange={e => setRole(e.target.value )}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}>
                <option value="0">Choose A Role</option>
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
              </select>
          </div>
          <div>
            <label style={labelStyle}>Profile Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={inputStyle}
            />
          </div>

          {error && <p style={{ margin: 0, fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "7px 10px", borderRadius: 7 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "10px 0", border: "1.5px solid #e8e7f3", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#64748b", fontFamily: "inherit" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: saving ? "default" : "pointer", background: saving ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontFamily: "inherit", transition: "opacity 0.18s" }}>
              {saving ? "Saving…" : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete confirm ──────────────────────────────────────────────*/
function DeleteModal({ employee, onClose, onConfirm }: { employee: Employee; onClose: () => void; onConfirm: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 320));
    onConfirm();
    setDeleting(false);
  };
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,15,30,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 380, padding: "28px 28px 24px", boxShadow: "0 24px 60px rgba(239,68,68,0.14), 0 4px 16px rgba(0,0,0,0.08)", textAlign: "center", animation: "modalIn 0.22s ease" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>⚠️</div>
        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#1e1b4b" }}>Remove Employee?</h3>
        <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "#64748b" }}>
          <strong style={{ color: "#1e1b4b" }}>{employee.name}</strong> will be permanently removed.
        </p>
        <p style={{ margin: "0 0 24px", fontSize: 12.5, color: "#94a3b8" }}>This action cannot be undone.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", border: "1.5px solid #e8e7f3", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", background: "#fff", color: "#64748b", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: deleting ? "default" : "pointer", background: deleting ? "#fca5a5" : "#ef4444", color: "#fff", fontFamily: "inherit" }}>
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Employee details floatbox ───────────────────────────────────*/
function EmployeeDetailsFloatbox({ employee, onClose }: { employee: any; onClose: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(15,15,30,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          background: "#fff",
          border: "1px solid #e8e7f3",
          borderRadius: 18,
          boxShadow: "0 24px 60px rgba(99,102,241,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          padding: "24px 22px",
          animation: "detailsSlideIn 0.25s ease",
          overflowY: "auto",
        }}
      >
        <style>{`@keyframes detailsSlideIn { from { opacity:0; transform: translateY(8px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }`}</style>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: "#1e1b4b", fontWeight: 700 }}>Employee Details</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#94a3b8" }}>Quick profile summary</p>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "#f1f0fb", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 12px", border: "1px solid #ecebfa", borderRadius: 12, background: "#faf9ff", marginBottom: 14 }}>
          <Avatar initials={(employee.name || "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()} dept={employee.department} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>{employee.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#64748b" }}>{employee.role}</p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "11px 12px", border: "1px solid #ecebfa", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Full Name</p>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#1e1b4b", fontWeight: 600 }}>{employee.name}</p>
          </div>

          <div style={{ padding: "11px 12px", border: "1px solid #ecebfa", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Role</p>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#1e1b4b", fontWeight: 600 }}>{employee.role}</p>
          </div>

          <div style={{ padding: "11px 12px", border: "1px solid #ecebfa", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Employee ID</p>
            <p style={{ margin: "6px 0 0", fontFamily: "monospace", fontSize: 13.5, color: "#6366f1", fontWeight: 700 }}>
              EMP-{employee.employeeID}
            </p>
          </div>

          <div style={{ padding: "11px 12px", border: "1px solid #ecebfa", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Department</p>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#1e1b4b", fontWeight: 600 }}>{employee.department?.deptName}</p>
          </div>

          <div style={{ padding: "11px 12px", border: "1px solid #ecebfa", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Status</p>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={employee.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────*/
function EmptyState({ query }: { query: boolean }) {
  return (
    <div style={{ padding: "56px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{query ? "🔍" : "👥"}</div>
      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#64748b" }}>
        {query ? "No results found" : "No employees yet"}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
        {query ? "Try adjusting your search or filters" : "Add your first employee to get started"}
      </p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────*/
export default function EmployeeManagement() {
  const [employees, setEmployees]   = useState([]);
  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState<Department | "">("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [modalMode, setModalMode]   = useState<ModalMode>(null);
  const [editing, setEditing]       = useState<Employee | undefined>();
  const [deleting, setDeleting]     = useState<Employee | undefined>();
  const [sortCol, setSortCol]       = useState<"name" | "department" | "status">("name");
  const [sortAsc, setSortAsc]       = useState(true);
  const { isTablet, isDesktop } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [departments,setDepartment] = useState([]);
  const px = isDesktop ? 24 : isTablet ? 18 : 14;

  const employeeFetch = async () => {
    try {
      const response = await fetch("http://localhost:8080/employees/all", { method: "GET" });
      if (response.status === 200) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const deptFetch=async()=>{
    const response = await fetch("http://localhost:8080/departments/all",{method:"GET"})
    if(response.status==200){
        const data = await response.json();
        setDepartment(data);
    }
  }
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(e => {
    if (q) {
        // Convert fields to String to prevent crashes if they are numbers or null
        const nameMatch = String(e.name || "").toLowerCase().includes(q);
        const idMatch = String(e.employeeID || "").toLowerCase().includes(q);
        const roleMatch = String(e.role || "").toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !roleMatch) return false;
    }
    
    if (deptFilter && e.department.deptName !== deptFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    
    return true;
  }).sort((a, b) => {
          const av = a[sortCol], bv = b[sortCol];
          return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }, [employees, search, deptFilter, statusFilter, sortCol, sortAsc]);

  const getInitials = (name:string) => {
  return name
    .split(' ')                  // Split the string into an array of words
    .filter(word => word !== "") // Remove extra spaces
    .map(word => word[0])        // Grab the first character of each word
    .join('')                    // Join them back together
    .toUpperCase();              // Make it look official
};
  const handleSave = (data: Omit<Employee, "id" | "avatar">) => {
    if (modalMode === "add") {
      const initials = data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      setEmployees(prev => [...prev, { ...data, id: uid(), avatar: initials }]);
    } else if (editing) {
      setEmployees(prev => prev.map(e => e.id === editing.id ? { ...e, ...data } : e));
    }
    setModalMode(null);
    setEditing(undefined);
  };

  const handleDelete = () => {
    if (deleting) setEmployees(prev => prev.filter(e => e.id !== deleting.id));
    setDeleting(undefined);
  };

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: typeof sortCol }) => (
    <span style={{ marginLeft: 4, fontSize: 10, opacity: sortCol === col ? 1 : 0.35 }}>
      {sortCol === col ? (sortAsc ? "▲" : "▼") : "⇅"}
    </span>
  );

  const activeCount = employees.filter(e => e.status === "Active").length;
  const onLeaveCount = employees.filter(e => e.status === "On Leave").length;

  const inputStyle: React.CSSProperties = {
    padding: "9px 12px", border: "1.5px solid #e8e7f3", borderRadius: 9,
    fontSize: 13, background: "#fff", color: "#1e1b4b", outline: "none",
    fontFamily: "inherit", transition: "border-color 0.18s",
  };
   useEffect(() => {
    employeeFetch();
    deptFetch();
   }, [])
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg,#f1f0fb 0%,#f5f3ff 60%,#fef9f3 100%)", fontFamily: "'DM Sans',sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes rowIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        .emp-row { animation: rowIn 0.25s ease both; }
        .emp-row:hover { background: #faf9ff !important; }
        .action-btn:hover { opacity: 0.75; transform: scale(1.08); }
        .sort-btn:hover { color: #6366f1 !important; }
        input:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 3px; }
      `}</style>

      {isDesktop && <Sidebar />}

      {!isDesktop && menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.38)", display: "flex" }}>
          <div onClick={e => e.stopPropagation()} style={{ height: "100%", boxShadow: "4px 0 24px rgba(0,0,0,0.12)" }}>
            <Sidebar isMobile onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8e7f3", padding: `0 ${px}px`, position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!isDesktop && (
              <button onClick={() => setMenuOpen(true)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 19, padding: "4px 6px", borderRadius: 7, color: "#64748b" }}>☰</button>
            )}
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👥</div>
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, color: "#1e1b4b", lineHeight: 1.2 }}>Employee Management</h1>
              <p style={{ margin: 0, fontSize: 11.5, color: "#94a3b8" }}>{activeCount} active · {onLeaveCount} on leave</p>
            </div>
          </div>
          <button
            onClick={() => { setEditing(undefined); setModalMode("add"); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(99,102,241,0.3)", transition: "opacity 0.18s, transform 0.18s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Employee
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: `${px}px ${px}px 40px` }}>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: employees.length, color: "#6366f1", bg: "#eef2ff" },
            { label: "Active", value: activeCount, color: "#059669", bg: "#ecfdf5" },
            { label: "On Leave", value: onLeaveCount, color: "#d97706", bg: "#fffbeb" },
            { label: "Terminated", value: employees.filter(e => e.status === "Terminated").length, color: "#dc2626", bg: "#fef2f2" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 11, background: s.bg, border: `1px solid ${s.color}20` }}>
              <span style={{ fontSize: 20, fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: s.color, fontWeight: 600, opacity: 0.8 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
            <input
              type="text" placeholder="Search name, ID, or role…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, width: "100%", paddingLeft: 34 }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")}
              onBlur={e => (e.target.style.borderColor = "#e8e7f3")}
            />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value as Department | "")}
            style={{ ...inputStyle, cursor: "pointer", minWidth: 150 }}
            onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.deptID}>{d.deptName}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | "")}
            style={{ ...inputStyle, cursor: "pointer", minWidth: 130 }}
            onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "#e8e7f3")}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          {(search || deptFilter || statusFilter) && (
            <button onClick={() => { setSearch(""); setDeptFilter(""); setStatusFilter(""); }}
              style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #e8e7f3", background: "#fff", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e7f3", overflow: "hidden", boxShadow: "0 4px 20px rgba(99,102,241,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg,#faf9ff,#f8f7ff)", borderBottom: "1px solid #e8e7f3" }}>
                  {[
                    { key: "name",       label: "Employee",   sortable: true  },
                    { key: "employeeId", label: "ID",         sortable: false },
                    { key: "department", label: "Department", sortable: true  },
                    { key: "role",       label: "Role",       sortable: false },
                    { key: "status",     label: "Status",     sortable: true  },
                    { key: "actions",    label: "Actions",    sortable: false },
                  ].map(col => (
                    <th key={col.key} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {col.sortable ? (
                        <button className="sort-btn"
                          onClick={() => toggleSort(col.key as typeof sortCol)}
                          style={{ border: "none", background: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: sortCol === col.key ? "#6366f1" : "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", padding: 0, fontFamily: "inherit", display: "flex", alignItems: "center" }}>
                          {col.label}<SortIcon col={col.key as typeof sortCol} />
                        </button>
                      ) : col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr
                    key={emp.employeeID}
                    className="emp-row"
                    onClick={() => setSelectedEmployee(emp)}
                    style={{ borderBottom: "1px solid #f1f0fb", background: "#fff", animationDelay: `${i * 0.04}s`, cursor: "pointer" }}
                  >
                    {/* Name */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar initials={getInitials(emp.name)} dept={emp.department}/>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#1e1b4b", fontSize: 13.5 }}>{emp.name}</p>
                        </div>
                      </div>
                    </td>
                    {/* ID */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#6366f1", background: "#eef2ff", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>EMP-{emp.employeeID}</span>
                    </td>
                    {/* Department */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#1e1b4b" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: DEPT_COLORS[emp.department], flexShrink: 0 }} />
                        {emp.department.deptName}
                      </span>
                    </td>
                    {/* Role */}
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 13 }}>{emp.role}</td>
                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={emp.status} /></td>
                    {/* Actions */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="action-btn"
                          onClick={e => { e.stopPropagation(); setEditing(emp); setModalMode("edit"); }}
                          title="Edit"
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#eef2ff", color: "#6366f1", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                          ✏️
                        </button>
                        <button className="action-btn"
                          onClick={e => { e.stopPropagation(); setDeleting(emp); }}
                          title="Remove"
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <EmptyState query={!!(search || deptFilter || statusFilter)} />}
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Showing <strong style={{ color: "#6366f1" }}>{filtered.length}</strong> of <strong>{employees.length}</strong> employees
          </p>
        )}
      </main>

      {/* Modals */}
      {modalMode && (
        <EmployeeModal
          mode={modalMode}
          initial={editing}
          onClose={() => { setModalMode(null); setEditing(undefined); }}
          onSave={handleSave}
          reload={employeeFetch}
        />
      )}
      {deleting && (
        <DeleteModal
          employee={deleting}
          onClose={() => setDeleting(undefined)}
          onConfirm={handleDelete}
        />
      )}
      {selectedEmployee && (
        <EmployeeDetailsFloatbox
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
      </div>
    </div>
  );
}
