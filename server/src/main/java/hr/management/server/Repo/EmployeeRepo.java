package hr.management.server.Repo;

import hr.management.server.Model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import hr.management.server.Model.Department;
import org.springframework.stereotype.Repository;
import hr.management.server.Dto.Role;
import java.util.List;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long> {

    public Employee findByEmail(String email);

    public List<Employee> findByRole(Role role);

}
