package hr.management.server.Model;

import jakarta.persistence.*;
import hr.management.server.Model.Employee;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import hr.management.server.Dto.LeaveRequest;
import hr.management.server.Dto.Status;

@Entity
@Table(name="LEAVES")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Leave{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long leaveID;

    @Column(nullable=false)
    private LeaveRequest reason;

    @Column(nullable = false , name ="leave_date")
    private LocalDate leaveDate;

    @Column(nullable = false)
    private Status status = Status.Pending;

    @ManyToOne
    @JoinColumn(name="employeeID")
    private Employee employee;
    

}