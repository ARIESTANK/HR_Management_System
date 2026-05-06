package hr.management.server.Model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="DEPARTMENTS")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Department{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deptID;

    @Column(nullable = false,unique = true)
    private String deptName;

    @OneToMany(mappedBy = "department" , cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Employee> employees;
    
}
