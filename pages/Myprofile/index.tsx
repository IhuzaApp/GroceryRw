import RootLayout from "@components/ui/layout";
import React, { useState } from "react";
import { Avatar, Button, Divider, Drawer, IconButton, Input, Nav, Panel, Placeholder, Tag, Toggle } from "rsuite";
import Image from "next/image"
import Link from "next/link";
import UserProfile from "@components/userProfile/useProfile";

export default function MyProfilePage(){
 
    
    return(
        <RootLayout >
           <div className="p-4 md:ml-16">
        {" "}
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
   

   {/* Profile Header */}
   <div className="flex items-center mb-6">
     <Link href="/" className="flex items-center text-gray-700">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mr-2">
         <path d="M19 12H5M12 19l-7-7 7-7" />
       </svg>
     </Link>
     <h1 className="text-2xl font-bold">My Profile</h1>
   </div>

   {/* Profile Content */}
   <div className="flex flex-col md:flex-row gap-6">
<UserProfile />
   </div>
</div>
</div>
        </RootLayout>
    )
}