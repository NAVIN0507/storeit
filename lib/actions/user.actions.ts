"use server"

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { string } from "zod";
import { parseStringify } from "../utils";
import { emit } from "process";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { avatarPlaceholderUrl } from "@/constants";
import { error } from "console";

const getUserByEmail = async (email: string)=>{
    const {databases} = await createAdminClient()
     const result = await databases.listDocuments(
        appwriteConfig.databaseId, 
        appwriteConfig.usersCollectionId,
        [Query.equal('email', [email])]
     )
     return result.total > 0 ?  result.documents[0] : null;
}
 const hanldeError  = (error:unknown , message:string)=>{
    console.log(error , message)
    throw error;
}
export  const sentEmailOTP = async ({email}:{email:string})=>{
    const {account} = await createAdminClient();
    try {
        const session = await account.createEmailToken(ID.unique() , email)
        return session.userId
    } catch (error) {
        hanldeError(error , "Fail to sent OTP")
    }

}

export  const createAccount = async ({fullName , email} :{fullName : string; email:string;}) => {

    const existingUser = await getUserByEmail(email);
    const accountId = await sentEmailOTP({email});
    if(!accountId) throw new Error("Failed To send OTP");
    if(!existingUser){
        const {databases} = await createAdminClient();
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName, 
                email,
                avatar:avatarPlaceholderUrl,
                accountId
            },
        );
    }
    return parseStringify({accountId})
}
export const verifySecret =async({accountId , password}:{accountId:string; password:string})=>{

    try {
        const {account} = await createAdminClient();
        const session = await account.createSession(accountId , password);
        (await cookies()).set('appwrite-session' , session.secret , {
            path:'/',
        httpOnly:true,
        sameSite:"strict",
        secure:true
        }
        );
        return parseStringify({sessionId :session.$id})
    } catch (error) {
        hanldeError(error , "Fail to verify");
    }


}
export const getCurrentUser = async()=>{
    try {
        const {databases , account} = await createSessionClient();
    const result = await account.get()
    const user = await databases.listDocuments(
        appwriteConfig.databaseId, 
        appwriteConfig.usersCollectionId,
        [Query.equal('accountId', result.$id)]
 
    )
    if(user.total <=  0) return null;
    return parseStringify(user.documents[0])
    } catch (error) {
        console.log(error)
    }
    

}

export const signOutUser = async()=>{
    const {account} = await createSessionClient(); 
    try {
        await account.deleteSession("current");
        (await cookies()).delete("appwrite-session")
    } catch (error) {
        hanldeError(error , "Fail to delete session")
    }
    finally{
        redirect("/sign-in")
    }
}
export const  signInUser = async({email}:{email:string})=>{

    try {
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            await sentEmailOTP({email})
            return parseStringify({accountId : existingUser.accountId})
        }
        return parseStringify({accessible:null , error:'user not found '})
    } catch (error) {
        hanldeError(error , "Fail to sign in user")
    }

}