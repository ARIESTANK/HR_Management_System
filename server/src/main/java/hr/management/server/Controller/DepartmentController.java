package hr.management.server.Controller;

import hr.management.server.Service.DepartmentService;
import hr.management.server.Model.Department;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import hr.management.server.Dto.EmployeeCount;
import hr.management.server.Dto.AdminCount;
import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {
    private final DepartmentService deptService;
    public DepartmentController(DepartmentService deptService) { this.deptService = deptService; }


    @GetMapping("/all")
    public ResponseEntity<List<Department>> allDept(){
        return ResponseEntity.ok(deptService.getAllDepartments());
    }

    @GetMapping("/getAlongWithEmployee")
    public ResponseEntity<List<EmployeeCount>> depts(){
        return ResponseEntity.ok(deptService.getDepartmentWithEmployeeCount());
    }

    @GetMapping("/getAlongWithAdmin")
    public ResponseEntity<List<AdminCount>> deptsAdminEmp(){
        return ResponseEntity.ok(deptService.getDepartmentWithAdminCount());
    }

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody Department department) {
        deptService.createDepartment(department);
        return ResponseEntity.ok("Department created successfully");
    }
}