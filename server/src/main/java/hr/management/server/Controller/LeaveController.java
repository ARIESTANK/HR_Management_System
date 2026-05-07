package hr.management.server.Controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import java.io.IOException;
import java.util.List;

import hr.management.server.Service.LeaveService;
import hr.management.server.Model.Leave;
import hr.management.server.Dto.LeaveRequest;
import hr.management.server.Dto.newLeave;
import hr.management.server.Dto.Status;

@RestController
@RequestMapping("/leaves")
public class LeaveController{
    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService){
        this.leaveService=leaveService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Leave>> allLeaves(){
        return ResponseEntity.ok(leaveService.allLeaves());
    }

    @GetMapping("/allPending")
    public ResponseEntity<List<Leave>> allPendingLeaves(){
        return ResponseEntity.ok(leaveService.allPendingLeaves());
    }

    
    @GetMapping("/leavesByEmp/{empID}")
    public ResponseEntity<List<Leave>> EmpLeaves(@PathVariable Long empID){
        return ResponseEntity.ok(leaveService.EmpLeaves(empID));
    }

    @PostMapping("/create")
    public ResponseEntity<String> createLeave(@RequestBody newLeave leave){
        leaveService.createLeave(leave);
        return ResponseEntity.ok("Leave Request Created");
    }

    @PutMapping("/statusUpdate/{id}")
    public ResponseEntity<String> updateLeave(@RequestBody Status status , @PathVariable Long id){
        leaveService.updateLeave(status,id);
        return ResponseEntity.ok("Leave Status updated");
    }

}