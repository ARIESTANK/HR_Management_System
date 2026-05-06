package hr.management.server.Service;

import org.springframework.stereotype.Service;
import hr.management.server.Model.Department;
import hr.management.server.Model.Employee;
import hr.management.server.Repo.DepartmentRepo;
import hr.management.server.Repo.EmployeeRepo;
import hr.management.server.Dto.EmployeeCount;
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

    public void createDepartment(Department department) {
         deptRepo.save(department);
    }
    
    public void deleteDepartment(Long deptID) {
        deptRepo.deleteById(deptID);
    }

    
}