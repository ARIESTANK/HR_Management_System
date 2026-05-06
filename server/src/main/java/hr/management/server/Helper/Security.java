package hr.management.server.Helper;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component; // Import this!

@Component
public class Security {
    private  final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
    public  String hashedPassword(String password){
        return encoder.encode(password);
    }
    public  Boolean verify(String rawPwd,String storedHash){
        return encoder.matches(rawPwd,storedHash);
    }
}