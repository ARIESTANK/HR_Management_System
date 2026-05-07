
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HRDashboard from "./pages/Dashboard";
import EmployeeManagement from "./pages/EmployeeList";
import EmplyeeProfile from "./pages/EmployeeDetail";
import HRPortal from "./pages/Login";
import DepartmentManagement from "./pages/DepartmentList";
function App() {
  return(
        <Router>
          <Routes>
            <Route path="/" element={<HRPortal />} />
            <Route path="/dashboard" element={<HRDashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/employee/:id" element={<EmplyeeProfile />} />
            <Route path="/departments" element={<DepartmentManagement />} />
          </Routes>
        </Router>

  )
}
export default App
