package hr.management.server.Dto;

import hr.management.server.Model.Department;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import hr.management.server.Model.Employee;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminCount{
    private Department department;
    private List<Employee> employee;


}
