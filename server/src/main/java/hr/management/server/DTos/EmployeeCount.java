package hr.management.server.Dto;

import hr.management.server.Model.Department;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmployeeCount {
    private Department department;
    private Integer employeeCount;

    public EmployeeCount(Department department, int employeeCount) {
        this.department = department;
        this.employeeCount = employeeCount;
    }

}
