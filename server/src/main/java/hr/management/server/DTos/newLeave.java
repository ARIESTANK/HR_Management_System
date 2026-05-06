package hr.management.server.Dto;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import hr.management.server.Dto.LeaveRequest;
import hr.management.server.Dto.Status;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class newLeave{
    private Long leaveID;
    private LeaveRequest reason;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leaveDate;
    private int employeeId;
}