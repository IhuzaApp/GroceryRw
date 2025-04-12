"use client";

import React from "react";
import { Input, InputGroup, Panel, IconButton, FlexboxGrid } from "rsuite";


export default function SideBar() {
  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-1/4 z-50 ml-3 hidden rounded-full bg-white shadow-md md:block">
        <div className="flex flex-col items-center gap-6 p-4">
          <IconButton
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            }
            circle
            appearance="subtle"
            className="bg-green-50 text-green-600"
          />
          <IconButton
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16v16H4z" />
              </svg>
            }
            circle
            appearance="subtle"
          />
          <IconButton
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
          <IconButton
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            }
            circle
            appearance="subtle"
          />
        </div>
      </div>
    </>
  );
}

