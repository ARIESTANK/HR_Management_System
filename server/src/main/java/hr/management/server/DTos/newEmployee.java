package hr.management.server.Dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class newEmployee {
    private String name;
    private String email;
    private Double salary;
    private LocalDate hireDate;
    private Role role;
    private Boolean status;
    private String password;
    private Long deptID; // Just the ID to link the department
}