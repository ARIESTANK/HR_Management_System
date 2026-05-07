package hr.management.server.Repo;

import hr.management.server.Model.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hr.management.server.Model.Employee;
import hr.management.server.Dto.Status;
import java.util.List;

@Repository
public interface LeaveRepo extends JpaRepository<Leave, Long> {
    List<Leave> findByEmployee(Employee employee);
    List<Leave> findByStatus(Status status);
}
