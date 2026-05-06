package hr.management.server.Controller;

import hr.management.server.Service.EmployeeService;
import hr.management.server.Service.DepartmentService;
import hr.management.server.Model.Employee;
import hr.management.server.Model.Department;
import hr.management.server.Dto.newEmployee;
import hr.management.server.Helper.Security;
import hr.management.server.Dto.LoginFormat;
import hr.management.server.Dto.LoginResponse;
import hr.management.server.Dto.EmployeeLoginData;
import hr.management.server.Helper.JwtUtil;
import java.util.List;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import java.io.IOException;

@RestController
@RequestMapping("/employees")

public class EmployeeController {
    private final EmployeeService empService;
    private final DepartmentService departmentService;
    private final Security security;
    private final JwtUtil jwt;
    public EmployeeController(EmployeeService empService,DepartmentService departmentService,Security security,JwtUtil jwt) {
         this.empService = empService; 
         this.departmentService = departmentService; 
         this.jwt=jwt;
         this.security=security; 
        }

    @GetMapping("/all")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(empService.getAllEmployees());
    }
    @GetMapping("/employee-by-id/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id){
        return ResponseEntity.ok(empService.getEmployeeById(id));
    }

    @PostMapping("/login")
    public ResponseEntity<?> getAuth(@RequestBody LoginFormat login){
        Employee employee = empService.login(login);
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied : User Credentials wrong");
        }

        String token = jwt.generateToken(employee.getEmail());
        LoginResponse response = new LoginResponse(token, EmployeeLoginData.from(employee));
        return ResponseEntity.ok(response);
    }

    @PostMapping(value="/create",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> create(@RequestPart("newEmployee") newEmployee newEmployee,@RequestPart("file") MultipartFile file) throws IOException {
        try{
        Employee employee = new Employee();
        employee.setName(newEmployee.getName());
        employee.setEmail(newEmployee.getEmail());
        employee.setSalary(newEmployee.getSalary());
        employee.setHireDate(newEmployee.getHireDate());
        employee.setPassword(security.hashedPassword(newEmployee.getPassword()));
        employee.setStatus(newEmployee.getStatus());
        employee.setRole(newEmployee.getRole());
        Department dept = departmentService.getDepartmentById(newEmployee.getDeptID());
        if(dept==null) return ResponseEntity.badRequest().body("Bad Request : Dept Not found");
        employee.setDepartment(dept);

        if(file != null && !file.isEmpty()) {
            employee.setPhoto(file.getBytes());
        }

        empService.createEmployee(employee);
        return ResponseEntity.ok("Employee created successfully");
        }catch(Exception error){
            return ResponseEntity.badRequest().body(error.getMessage());
        }
    }
}