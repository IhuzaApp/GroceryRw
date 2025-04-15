import Link from "next/link";
import React, { useState } from "react";
import { Avatar, Button, Divider, Drawer, IconButton, Input, Nav, Panel, Placeholder, Tag, Toggle } from "rsuite";
import Image from "next/image"

type UserProfileProps = {
    name: string;
    gender: string;
    phone: string;
    address: string;
    photoUrl?: string;
  };

export default function UserProfile({
    name,
    gender,
    phone,
    address,
    photoUrl,
  } : UserProfileProps | any){
    const [open, setOpen] = React.useState(false);
    const [activeTab, setActiveTab] = useState("account")
    return(
        <>
                  <IconButton
                  onClick={() => setOpen(true)}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              </svg>
            }
            circle
            appearance="subtle"
          />
      <Drawer open={open} size="lg" onClose={() => setOpen(false)}>
 
      </Drawer>
        </>
    )
}