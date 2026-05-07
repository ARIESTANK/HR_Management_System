package hr.management.server.Service;

import org.springframework.stereotype.Service;
import hr.management.server.Model.Department;
import hr.management.server.Model.Employee;
import hr.management.server.Repo.DepartmentRepo;
import hr.management.server.Repo.EmployeeRepo;
import hr.management.server.Dto.EmployeeCount;
import hr.management.server.Dto.AdminCount;
import hr.management.server.Dto.Role;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;

@Service
public class DepartmentService {
    private final DepartmentRepo deptRepo;
    private final EmployeeRepo empRepo;
    public DepartmentService(DepartmentRepo deptRepo,EmployeeRepo empRepo) { 
        this.deptRepo = deptRepo;
        this.empRepo=empRepo;
     }

    public List<Department> getAllDepartments() {
        return deptRepo.findAll();
    }
    
    public Department getDepartmentById(Long deptID) {
        return deptRepo.findById(deptID).orElse(null);
    }

    public List<EmployeeCount> getDepartmentWithEmployeeCount() {
        List<EmployeeCount> response = new ArrayList<>();
        List<Department> depts = deptRepo.findAll();

        for (Department dept : depts) {
            int count = 0;
            List<Employee> emps = empRepo.findAll();
            for (Employee emp : emps) {
                if (dept.getDeptID() == emp.getDepartment().getDeptID()) {
                    count++;
                }
            }
            response.add(new EmployeeCount(dept, count));
        }
        return response;
    }
    public List<AdminCount> getDepartmentWithAdminCount() {
    List<AdminCount> response = new ArrayList<>();
    List<Department> depts = deptRepo.findAll();
    List<Employee> allAdmins = empRepo.findByRole(Role.ADMIN);

    for (Department dept : depts) {
        // 1. Create the list for THIS specific department
        List<Employee> currentDeptAdmins = new ArrayList<>();

        for (Employee emp : allAdmins) {
            if (dept.getDeptID().equals(emp.getDepartment().getDeptID())) {
                currentDeptAdmins.add(emp);
            }
        }
        
        // 3. PASS THE LIST (currentDeptAdmins), NOT 'emp'
        response.add(new AdminCount(dept, currentDeptAdmins));
    }
    return response;
}

    public void createDepartment(Department department) {
         deptRepo.save(department);
    }
    
    public void deleteDepartment(Long deptID) {
        deptRepo.deleteById(deptID);
    }

    
}