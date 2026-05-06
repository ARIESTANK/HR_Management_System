package hr.management.server.Dto;

import hr.management.server.Model.Employee;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class EmployeeLoginData {
    private Long employeeID;
    private String name;
    private String email;
    private Double salary;
    private LocalDate hireDate;
    private Role role;
    private Boolean status;
    private Long deptID;
    private String deptName;

    public static EmployeeLoginData from(Employee employee) {
        return new EmployeeLoginData(
                employee.getEmployeeID(),
                employee.getName(),
                employee.getEmail(),
                employee.getSalary(),
                employee.getHireDate(),
                employee.getRole(),
                employee.getStatus(),
                employee.getDepartment() == null ? null : employee.getDepartment().getDeptID(),
                employee.getDepartment() == null ? null : employee.getDepartment().getDeptName());
    }
}
