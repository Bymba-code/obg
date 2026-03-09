import { LoginApi, RegisterApi } from "../Api";
import { useAuth } from "../../../App/Hooks/useAuth";


export const RegisterService = async (e, payload, setWaiting, navigate, toast) => {
    e.preventDefault()
    setWaiting(true)
    try 
    {
        const response = await RegisterApi(payload)

        

        if(response && response.status === 2001)
        {
           toast.success("Хэрэглэгчийн бүртгэлийг амжилттай үүсгэлээ.")
        }

    }
    catch(err)
    {
        console.log(err)
    }
    finally
    {
        setWaiting(false)
    }
}

export const LoginService = async (e, payload, setWaiting) => {
    setWaiting(true)

    try 
    {
        const response = await LoginApi(payload)
        
        return response
    }
    catch(err)
    {
        return err
    }
    finally
    {
        setWaiting(false)
    }
}