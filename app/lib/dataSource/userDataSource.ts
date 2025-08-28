import axios from 'axios'
import { User } from '../types'
import { maiPath } from './global'


export interface AuthTypes{
    email : string,
    password : string,
    name ? : string
}
export const signIn =async (data : AuthTypes,onSuccess : (user : User)=> void, onFailure : (reason : string)=> void)=>{
    try {
        const res = await axios.post(maiPath + "/signin/",data)
        if(res.status == 200){
            if(res.data.success){
              return  onSuccess(res.data.user)
            }else{
              return  onFailure("Access denied, please make sure your credentials are correct.")
            }
        }
        return onFailure("Something went wrong, please try again later." + JSON.stringify(res.data))
    } catch (error) {
        console.log(error);
        onFailure("Something went, please try again later.")
        
    }

}

export const register = async(data : AuthTypes, onSuccess : ()=> void, onFailure : (reason : string)=> void)=>{
    try {
        const res = await axios.post(maiPath + "/signup/",data)
        if(res.status == 200){
            res.data.success ? onSuccess() : onFailure("Wrong or incomplete credentials.")
            return
        }
     if(res.status == 400){
       return onFailure("wrong credentials.")
     }
    onFailure("Something went wrong, please try again later.")
    } catch (error) {
        console.log(error);
        onFailure("Something went wrong, please try again later.")
    }
}