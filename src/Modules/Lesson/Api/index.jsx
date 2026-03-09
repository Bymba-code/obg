import axiosInstance from "../../../Services/Api/AxiosInstance"

export const LoginApi = async (payload) => {
    try 
    {
        const response = await axiosInstance.post("/user/login", payload)

        if(response && response?.status === 200)
        {
            return response
        }
    }   
    catch(err)
    {
       
        return err
    }
}

export const RegisterApi = async (payload) => {
    try 
    {   
        const response = await axiosInstance.post("/user/register", payload)

        if(response && response.status === 201)
        {
            return response
        }
    }
    catch(err)
    {
        return err
    }
}


export const fetchFirstUnits = async () => {
    
}