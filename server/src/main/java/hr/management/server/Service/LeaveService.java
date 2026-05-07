package hr.management.server.Service;

import org.springframework.stereotype.Service;
import hr.management.server.Repo.LeaveRepo;
import hr.management.server.Repo.EmployeeRepo;
import java.util.stream.Collectors;
import hr.management.server.Model.Leave;
import hr.management.server.Model.Employee;
import hr.management.server.Dto.Status;
import hr.management.server.Dto.LeaveRequest;
import hr.management.server.Dto.newLeave;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

@Service
public class LeaveService{

    private final LeaveRepo leaveRepo;
    private final EmployeeRepo empRepo;
    public LeaveService(LeaveRepo leaveRepo,EmployeeRepo empRepo){
        this.leaveRepo=leaveRepo;
        this.empRepo=empRepo;
    }

    public List<Leave> allLeaves(){
        return leaveRepo.findAll();
    }

    public void createLeave(newLeave leave){
        empRepo.findById((long) leave.getEmployeeId()).ifPresent(leaveEmp -> {
            Leave leaveEntity = new Leave();
            leaveEntity.setReason(leave.getReason());
            leaveEntity.setLeaveDate(leave.getLeaveDate());
            leaveEntity.setEmployee(leaveEmp);
            leaveRepo.save(leaveEntity);
        });
    }

    public List<Leave> allPendingLeaves(){
        return leaveRepo.findByStatus(Status.Pending);
    }

    public List<Leave> EmpLeaves(Long empID) {
        Employee employee = empRepo.findById(empID).orElseThrow(() -> new RuntimeException("Employee not found"));
        return leaveRepo.findByEmployee(employee);
    }

    public void updateLeave(Status status,Long id){
        Leave leaveData=leaveRepo.findById(id).orElseThrow(()-> new RuntimeException("Leave Data not found"));
        leaveData.setStatus(status);
        leaveRepo.save(leaveData);
    }

}