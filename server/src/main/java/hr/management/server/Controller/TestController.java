package hr.management.server.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/server")
    public String serverTest() {
        try{
            return "Hr Management Server is running on port : 8080 (spring-boot framework)";
        }catch(Exception error){
            return "Error : ${error}";
        }
    }


}
