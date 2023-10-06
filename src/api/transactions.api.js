// import { TrophyFilled } from '@ant-design/icons';
import apiClient from './index';

/**
 * function that fetches the payment records according to the params provided
 * @params : params(Type:Object)
 * @response : response (Type:Object) 
 * @author Sahil
 */
export async function getTransactions(params){
    try{
        let response = await apiClient.get("/transactions",{params})
        return response.data;
    }
    catch(err){
        console.log("error in getTransasctions ::: ",err)
        return false
    }
}