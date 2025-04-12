import React from "react";

export default function BottomBar(){
    return(
        <>
      <nav className="fixed bottom-0 left-0 flex w-full items-center justify-around border-t bg-white py-2 shadow md:hidden">
        <NavItem icon="🏠" label="Home" />
        <NavItem icon="🛒" label="Cart" />
        <NavItem icon="👤" label="Profile" />
      </nav>
        </>
    )
}


function NavItem({ icon, label }: { icon: string; label: string }) {
    return (
      <div className="flex flex-col items-center text-sm text-gray-600">
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </div>
    );
  }