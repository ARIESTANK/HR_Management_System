package hr.management.server.Model;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import hr.management.server.Model.Leave;
import hr.management.server.Dto.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="EMPLOYEES")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Employee {

    @Id //pr key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeID;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false , unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false )
    private Double salary;

    @Column(nullable = false , name ="hire_date")
    private LocalDate hireDate;

    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean status = true;

    @Lob
    @Column(nullable = true)
    private byte[] photo;

    @ManyToOne
    @JoinColumn(name="deptID")
    private Department department;

    @OneToMany(mappedBy = "employee" , cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Leave> leaves;

}
