
class InvalidAgeException extends Exception{
    public InvalidAgeException(String s)
    {
        super(s);
    }
}


// class VoteClas {
//     public void checkEli(int age) throws InvalidAgeException{
//         if(age<18)
//         {
//             throw new InvalidAgeException(age+"bruh you are kidoo") ; 
//         }
//         else{
//             System.out.println("You can Vote");
//         }

//     }
// }

public class Except_hand{
    public static void main(String args[])
    {
        int x =0 ; 
        try{
            System.out.println(x);
            if (x<18)
            {
                throw new InvalidAgeException(x) ; 
            }
        }
        catch(ArithmeticException e)
        {
            System.out.println(e);
        }
        catch (InvalidAgeException e)
        {
            System.out.println(e.getMessage());
        }
        
        finally{
            System.out.println("final block");
        }

    }
}



