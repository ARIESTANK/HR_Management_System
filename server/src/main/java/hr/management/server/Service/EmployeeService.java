package hr.management.server.Service;

import org.springframework.stereotype.Service;

// required imports
import hr.management.server.Model.Employee;
import hr.management.server.Repo.EmployeeRepo;
import hr.management.server.Dto.LoginFormat;
import hr.management.server.Helper.Security;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepo empRepo;
    private final Security security;
    public EmployeeService(EmployeeRepo empRepo,Security security) {
         this.empRepo = empRepo; 
         this.security = security;
         }

    public List<Employee> getAllEmployees() {
        return empRepo.findAll();
    }

    public Employee getEmployeeById(Long employeeID) {
        return empRepo.findById(employeeID).orElse(null);
    }

    public void createEmployee(Employee employee) {
        empRepo.save(employee);
    }

    public Employee login(LoginFormat login){
        Employee empData = empRepo.findByEmail(login.getEmail());
        if (empData == null) return null;
        if (security.verify(login.getPassword(), empData.getPassword())) return empData;
        return null;
    }

}