
import Header from '@/components/Header'
import MobileNavigation from '@/components/MobileNavigation'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import React from 'react'
import { Toaster } from "@/components/ui/toaster"
export const dynamic = "force-dynamic";
const Layout = async({children} :{children : React.ReactNode}) => {
// root layout
    const currentUser = await getCurrentUser();
    if(!currentUser) return redirect("/sign-in");

     const fullName = currentUser.fullName;
     const email = currentUser.email;
    
  return (
    <main className='flex h-screen'>
       <Sidebar fullName={fullName} email={email}/>
        <section className='flex h-full flex-1 flex-col'>
           <MobileNavigation {...currentUser}/> 
           <Header userId={currentUser.$id} accountId={currentUser.accountId}/>
            <div className='main-content'>{children}</div>
        </section>
         <Toaster />
    </main>
  )
}

export default Layout