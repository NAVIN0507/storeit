
"use client"
 
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
 
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import React, { useState } from 'react'
import Image from "next/image"
import Link from "next/link"
import { createAccount, signInUser } from "@/lib/actions/user.actions"
import OTPModel from "./OTPModel"
type FormType= "sign-in" | "sign-up"
const authFormScheme = (formType :FormType)=>{
  return z.object({
    email:z.string().email(),
    fullName :formType === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
  
  })
}

const AuthForm = ({type} : {type:FormType}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('')
  const [accoutnId, setAccoutnId] = useState(null)
  const formSchema = authFormScheme(type);
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "", fullName:""
    },
  })
 
  
  const  onSubmit = async(values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("")
    try{

const user =     type ==="sign-up"     
? await createAccount({fullName : values.fullName || "" , email : values.email})
: await signInUser({email : values.email})
    setAccoutnId  (user.accountId)
    }
    catch(error){
      setErrorMessage("Failed To create account. Please try again.")
    }
    finally{
      setIsLoading(false);
    }
  }
 return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <h1 className="form-title">{type === "sign-in" ? "Sign In" : "Sign Up"}</h1>
        {type==='sign-up' && (
          
          <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
              <FormLabel className="shad-form-label">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Your full name" className="shad-input" {...field} />
              </FormControl>
              </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}/>
          
          
         )}
         <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
              <FormLabel className="shad-form-label">E-Mail</FormLabel>
              <FormControl>
                <Input placeholder="Enter Your email" className="shad-input" {...field} />
              </FormControl>
              </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
          
        />
        <Button type="submit" className="form-submit-button" disabled={isLoading}>{type==='sign-in'?'Sign In' : "Sign Up"}

          {isLoading && (
            <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin"/>
          )}
        </Button>
        {errorMessage && 
        <p className="error-message">*{errorMessage}</p>
        }
        <div className="body-2 flex justify-center">
          <p>
            {
              type === "sign-in"
               ? "Don't have an account?"
                : "Already have an account?"
            }
          </p>
          <Link
          href = {type === "sign-in" ? "/sign-up" : "/sign-in" } className="ml-1 font-medium text-brand">
            {type === "sign-in"?"Sign Up" :"Sign In"}
          </Link>
        </div>
      </form>
    </Form>
{/* OTP VERIFICATION */}
{accoutnId && (
  <OTPModel email={form.getValues("email")} accountId={accoutnId}/>
)}
    </>
  )
}

export default AuthForm