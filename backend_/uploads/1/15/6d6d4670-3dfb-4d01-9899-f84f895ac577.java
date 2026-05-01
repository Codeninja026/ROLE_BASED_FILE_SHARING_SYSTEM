import java.util.*;
import java.util.stream.Collectors;

public class Lamb_exp {
    public static void main(String[] args) {

        List<Integer> li = Arrays.asList(64,1028,4,5,8,62,97,34,6);
        

        List<Integer> res = li.stream()
                            .filter(n -> ((n & (n-1)) == 0))
                            .map(n -> n*n*n)
                            .sorted((a,b) -> b-a)
                            .limit(3)
                            .collect(Collectors.toList()) ; 

        System.out.println(res);


        int n = 12 ; 

        
            
        


    }
}
