import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { Data } from "../../../types";
import ShopCard from "./ShopCard";
import SortDropdown from "./SortDropdown";
import { Button, Dropdown } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import LoadingScreen from "../../ui/LoadingScreen";

// Helper Components
const CategoryIcon = ({ category }: { category: string }) => {
  const icons: { [key: string]: string } = {
    "Super Market": "🛒",
    "Public Markets": "🏪",
    Bakeries: "🥖",
    Butchers: "🥩",
    Delicatessen: "🥪",
    "Organic Shops": "🌿",
    "Specialty Foods": "🍱",
    Restaurant: "🍽️",
  };

  // Restaurant SVG component
  const RestaurantIcon = () => (
    <svg 
      version="1.1" 
      id="Layer_1" 
      xmlns="http://www.w3.org/2000/svg" 
      xmlnsXlink="http://www.w3.org/1999/xlink" 
      viewBox="0 0 488 488" 
      xmlSpace="preserve" 
      width="32px" 
      height="32px"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier"> 
        <path style={{fill:"#FCB23C"}} d="M239.984,113.336c-79.304,0-143.816,64.512-143.816,143.824s64.512,143.824,143.816,143.824 c79.336,0,143.872-64.512,143.872-143.824S319.32,113.336,239.984,113.336z"></path> 
        <path style={{fill:"#FDC163"}} d="M120.168,281.152c0-79.304,64.512-143.824,143.816-143.824c33.568,0,64.416,11.64,88.92,30.976 c-26.368-33.416-67.136-54.976-112.92-54.976c-79.304,0-143.816,64.512-143.816,143.824c0,45.76,21.552,86.504,54.96,112.864 C131.808,345.528,120.168,314.696,120.168,281.152z"></path> 
        <path style={{fill:"#FDD18A"}} d="M239.992,160.624c-53.232,0-96.536,43.304-96.536,96.536s43.312,96.536,96.536,96.536 c53.232,0,96.536-43.312,96.536-96.536S293.224,160.624,239.992,160.624z"></path> 
        <path style={{fill:"#FCB23C"}} d="M239.992,314.2c-31.44,0-57.008-25.592-57.008-57.048c0-4.416,3.584-8,8-8s8,3.584,8,8 c0,22.632,18.4,41.048,41.008,41.048c22.632,0,41.048-18.416,41.048-41.048c0-4.416,3.576-8,8-8s8,3.584,8,8 C297.04,288.616,271.448,314.2,239.992,314.2z"></path> 
        <path style={{fill:"#9ff4b9"}} d="M72,216H24c-4.416,0-8,3.584-8,8v168c0,4.416,3.584,8,8,8h48c4.416,0,8-3.584,8-8V224 C80,219.584,76.416,216,72,216z"></path> 
        <g> 
          <rect x="16" y="264" style={{fill:"#2e8a49"}} width="64" height="40"></rect> 
          <path style={{fill:"#2e8a49"}} d="M16,408c0,13.232,10.768,24,24,24h16c13.232,0,24-10.768,24-24v-24H16V408z"></path> 
        </g> 
        <path style={{fill:"#6bdb82"}} d="M88,64c-4.416,0-8,3.584-8,8v80H56V72c0-4.416-3.584-8-8-8s-8,3.584-8,8v80H16V72 c0-4.416-3.584-8-8-8s-8,3.584-8,8v88v48c0,13.232,10.768,24,24,24h48c13.232,0,24-10.768,24-24v-48V72C96,67.584,92.416,64,88,64z"></path> 
        <path style={{fill:"#9ff4b9"}} d="M456,208h-48c-4.424,0-8,3.584-8,8v176c0,4.416,3.576,8,8,8h48c4.424,0,8-3.584,8-8V216 C464,211.584,460.424,208,456,208z"></path> 
        <g> 
          <rect x="400" y="264" style={{fill:"#2e8a49"}} width="64" height="40"></rect> 
          <path style={{fill:"#2e8a49"}} d="M400,408c0,13.232,10.768,24,24,24h16c13.232,0,24-10.768,24-24v-24h-64V408z"></path> 
        </g> 
        <path style={{fill:"#6bdb82"}} d="M432,56c-31.4,0-56,38.656-56,88s24.6,88,56,88s56-38.656,56-88S463.4,56,432,56z"></path> 
      </g>
    </svg>
  );

  // Specialty Foods SVG component
  const SpecialtyFoodsIcon = () => (
    <svg 
      width="32px" 
      height="32px" 
      viewBox="0 0 1024 1024" 
      className="icon" 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M579.8 289.5l-42-169.2L389 143.7c-9.8 1.5-18.9-5.1-20.5-14.9l-2.2-14c-1.5-9.8 5.1-18.9 14.9-20.5L556 66.9c10.8-1.7 21.2 5.2 23.8 15.8l48.4 194.8c2.4 9.6-3.5 19.3-13.1 21.7l-13.7 3.4c-9.5 2.4-19.3-3.5-21.6-13.1z" fill="#656666"></path>
        <path d="M240.7 749.9m-176.5 0a176.5 176.5 0 1 0 353 0 176.5 176.5 0 1 0-353 0Z" fill="#FF9D00"></path>
        <path d="M164.2 601.3c28.6 14.4 59.3 20.3 89.1 18.7-4.1-60.1-38.9-116.6-96.6-145.7-28.6-14.4-59.3-20.3-89.1-18.7 4.1 60.2 38.9 116.6 96.6 145.7z" fill="#02BA4D"></path>
        <path d="M860.4 926.9H542.6c-18 0-32.9-12.3-34.5-28.3l-60-601.7c-0.7-7.4 5.8-13.9 14.2-13.9h479.2c8.4 0 14.9 6.5 14.1 13.9l-63.4 604c-1.5 14.7-15.3 26-31.8 26z" fill="#008a55"></path>
      </g>
    </svg>
  );

  // Bakeries SVG component
  const BakeriesIcon = () => (
    <svg 
      width="32px" 
      height="32px" 
      viewBox="0 0 1024 1024" 
      className="icon" 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M175.4 866.3c39.1 25.7 166.1 114.6 488.5-229.7s223-425.9 196.2-454.9c-26.8-29-263.6-149.6-556 122.5C21.6 567 175.4 866.3 175.4 866.3z" fill="#EAAD6A"></path>
        <path d="M241.9 696.5s26.7 26.1 48.6 4.5c21.9-21.7-2.2-40.2-2.2-40.2L171.6 514l-27.3 67.4 97.6 115.1zM623.3 323.5s26.7 26.1 48.6 4.5c21.9-21.7-2.2-40.2-2.2-40.2L565.9 153.9l-62.1 19.2 119.5 150.4zM386.5 463.8s26.7 26.1 48.6 4.5c21.9-21.7-2.2-40.2-2.2-40.2L322.4 287.5 280.8 332l105.7 131.8z" fill="#FFC661"></path>
        <path d="M604.8 577.4c-227.5 243-389.5 280.3-455.1 229.3 10.4 34.3 20.7 54.5 20.7 54.5 39.1 25.7 166.1 114.6 488.5-229.7s223-425.9 196.2-454.9c-6.1-6.6-22.9-17.8-48.6-28.1 36.5 54.7 15.2 197.1-201.7 428.9z" fill="#D19152"></path>
        <path d="M310.5 281c-4.3 4-8.6 8.1-12.9 12.4-0.7 0.7-1.5 1.4-2.2 2.1-0.4 0.4-0.7 0.8-1.1 1.1-3.8 3.8-7.7 7.9-11.7 12.2-183.1 193.9-212.5 464-112.4 564.1 90.5 90.5 259.8 16.9 489.7-213 229.8-229.8 303.5-399.2 213-489.7C773.1 70.4 504.2 99.3 310.5 281z m349.1 7.6c3.5 3.1 5.5 7.4 5.6 12 0.2 4.7-1.6 9.1-4.9 12.4-6.3 6.3-16.3 6.6-23 0.7l-2.8-2.4c-37-32.7-69.3-70.4-95.9-112L524.3 177c1.2-0.5 2.5-0.9 3.7-1.4 8.8-3.4 17.6-6.6 26.3-9.4 0.4-0.1 0.7-0.2 1.1-0.4l3.4 5.3c28.1 43.6 61.9 83.2 100.8 117.5z m-225 154.5c3.5 3.1 5.5 7.4 5.6 12 0.2 4.7-1.6 9.1-4.9 12.4-6.3 6.3-16.3 6.6-23 0.7l-2.8-2.4c-37-32.7-69.3-70.4-95.9-112l-14.9-23.4c6.7-7.2 13.6-14.3 20.7-21.2 0.8-0.8 1.7-1.6 2.5-2.4l11.9 18.7c28.1 43.6 61.9 83.2 100.8 117.6z m-154.5 225c3.5 3.1 5.5 7.4 5.6 12 0.2 4.7-1.6 9.1-4.9 12.4-6.3 6.3-16.3 6.6-23 0.7l-2.8-2.4c-37-32.7-69.3-70.4-95.8-112l-0.4-0.6c3.7-13.1 7.9-26.5 12.8-39.9l7.8 12.2c28 43.6 61.9 83.2 100.7 117.6z m361-27c-124.2 124.2-348 317-452 213-47.2-47.2-60.4-139.1-38.7-241.5 25.2 35.9 54.2 69 87.2 98.1l2.8 2.4c17.1 15.1 43.2 14.3 59.4-1.8 8.4-8.4 13.1-20.1 12.7-32-0.4-11.9-5.7-23.3-14.6-31.2-37-32.7-69.3-70.4-95.9-112l-18.1-28.3c23-54 55.2-107.7 96.7-156.7l10.9 17c27.9 43.7 61.8 83.3 100.6 117.6l2.8 2.4c17.1 15.1 43.2 14.4 59.4-1.8 8.4-8.4 13.1-20.1 12.7-32-0.4-11.9-5.7-23.3-14.6-31.2-37-32.7-69.3-70.4-95.9-112L342 288.4c49-43.2 103.1-76.9 157.6-101.2l16.8 26.3c27.9 43.7 61.8 83.3 100.6 117.6l2.8 2.4c17.1 15.1 43.2 14.3 59.4-1.8 8.4-8.4 13.1-20.1 12.7-32-0.4-11.9-5.7-23.3-14.6-31.2-36.7-32.4-68.6-69.8-95.1-110.9 114.4-31.4 220.1-20.6 272 31.3 103.9 104.2-88.9 328-213.1 452.2z" fill="#004364"></path>
        <path d="M462 257.8m-15.4 0a15.4 15.4 0 1 0 30.8 0 15.4 15.4 0 1 0-30.8 0Z" fill="#004364"></path>
        <path d="M686.7 188.2m-15.4 0a15.4 15.4 0 1 0 30.8 0 15.4 15.4 0 1 0-30.8 0Z" fill="#004364"></path>
        <path d="M681 520.2m-15.4 0a15.4 15.4 0 1 0 30.8 0 15.4 15.4 0 1 0-30.8 0Z" fill="#004364"></path>
        <path d="M607 601.3m-15.4 0a15.4 15.4 0 1 0 30.8 0 15.4 15.4 0 1 0-30.8 0Z" fill="#004364"></path>
        <path d="M249.5 457.8m-15.4 0a15.4 15.4 0 1 0 30.8 0 15.4 15.4 0 1 0-30.8 0Z" fill="#004364"></path>
        <path d="M392.9 292.7m-15.4 0a15.4 15.4 0 1 0 30.8 0 15.4 15.4 0 1 0-30.8 0Z" fill="#004364"></path>
        <path d="M197 758.3m-15.4 0a15.4 15.4 0 1 0 30.8 0 15.4 15.4 0 1 0-30.8 0Z" fill="#004364"></path>
      </g>
    </svg>
  );

  // Butchers SVG component
  const ButchersIcon = () => (
    <svg 
      width="32px" 
      height="32px" 
      viewBox="0 0 14 14" 
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier"> 
        <rect width="14" height="14" x="0" y="0" id="canvas" style={{fill:"none",stroke:"none",visibility:"hidden"}}></rect> 
        <path d="M 6.3125,0.21875 C 6.0684895,0.21954826 5.8228285,0.22303136 5.5625,0.25 4.5211861,0.35787455 3.3962201,0.68691225 2.5625,1.5625 1.6621267,2.5080881 1.7785639,3.8072373 2,4.8125 2.1107181,5.3151314 2.2260816,5.7519998 2.3125,6.125 2.3989184,6.4980002 2.4143615,6.784875 2.40625,6.8125 2.3262842,7.084836 1.8254044,7.7963346 1.34375,8.53125 0.86209565,9.2661654 0.35314142,10.065975 0.375,11 c 0.0198236,0.847071 0.49484577,1.665615 1.3125,2.125 0.8176542,0.459385 1.9373485,0.633364 3.375,0.5 1.5744087,-0.146051 3.6988963,-1.104174 5.5,-2.46875 1.801104,-1.3645761 3.336707,-3.2030439 3.0625,-5.25 l -0.03125,-0.125 C 13.306907,3.9782765 12.22194,2.6915575 11.09375,1.84375 9.9369316,0.97442907 8.7420467,0.54860797 8.125,0.40625 7.6926592,0.30650528 7.0445314,0.21635523 6.3125,0.21875 z m 0.0625,1.25 c 0.6289292,-0.00915 1.1823408,0.05171 1.5,0.125 0.3829533,0.088351 1.4875069,0.5126196 2.46875,1.25 0.981243,0.7373804 1.834698,1.7827361 2.03125,3.25 0.173547,1.2955301 -0.92994,2.8256182 -2.5625,4.0625 C 8.17994,11.393132 6.0761905,12.269369 4.9375,12.375 3.6620523,12.493318 2.8089745,12.310186 2.3125,12.03125 1.8160255,11.752314 1.6355623,11.45133 1.625,11 1.6164727,10.635624 1.9537152,9.9092344 2.40625,9.21875 2.8587848,8.5282656 3.3800867,7.915164 3.59375,7.1875 3.7324531,6.715125 3.6316112,6.2769304 3.53125,5.84375 3.4308888,5.4105696 3.3161814,4.9735632 3.21875,4.53125 3.0238872,3.6466236 2.9663068,2.9323555 3.4375,2.4375 3.9753464,1.8726441 4.8529555,1.5896917 5.71875,1.5 5.9351986,1.477577 6.1653569,1.4717996 6.375,1.46875 z M 6.90625,2.5625 C 6.1376581,2.5382265 5.373069,2.6845234 4.8125,3.34375 c -0.7474254,0.8789688 0.2004217,3.0044908 0,3.6875 C 4.6120783,7.7142592 3.4480095,8.8631804 3.46875,9.75 3.4894904,10.63682 3.7731262,11.265651 5.625,11.09375 7.4768738,10.921848 11.399372,8.5954489 11.09375,6.3125 10.981405,5.4733011 10.619738,4.6822376 10.15625,4.21875 9.9458606,4.0083606 9.4804771,4.3605433 9.21875,4.75 L 7,8.0625 C 6.6242081,8.6216878 5.7804583,8.0904376 6.15625,7.53125 l 2.25,-3.34375 C 8.7730087,3.6417535 8.7443515,3.0521608 8.4375,2.875 8.1543353,2.7115148 7.8666372,2.6589604 7.65625,2.625 7.4122008,2.585606 7.1624473,2.5705912 6.90625,2.5625 z" id="butcher" style={{fill:"#af1212"}}></path> 
      </g>
    </svg>
  );

  // Public Markets SVG component
  const PublicMarketsIcon = () => (
    <svg 
      width="32px" 
      height="32px" 
      viewBox="0 0 484.909 484.909" 
      fill="#1f6506"
      stroke="#1f6506"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier"> 
        <g> 
          <path d="M204.993,438.478c-6.347,6.349-6.347,16.639,0,22.978c3.173,3.174,7.332,4.761,11.488,4.761 c4.158,0,8.316-1.587,11.489-4.761l49.747-49.754l-22.979-22.978L204.993,438.478z"></path> 
          <polygon points="317.642,325.807 300.695,342.761 323.671,365.738 363.597,325.807 "></polygon> 
          <path d="M260.77,325.807h-45.954l135.627,135.648c3.173,3.174,7.331,4.761,11.487,4.761c4.158,0,8.315-1.587,11.488-4.761 c6.349-6.339,6.349-16.629,0-22.978L260.77,325.807z"></path> 
          <path d="M102.294,107.658c21.471,0,38.878-19.915,38.878-44.478c0-24.564-17.407-44.487-38.878-44.487 c-21.486,0-38.877,19.923-38.877,44.487C63.417,87.743,80.808,107.658,102.294,107.658z"></path> 
          <path d="M87.124,123.517v32.269c0,3.396,2.761,6.157,6.157,6.157h18.026c3.396,0,6.156-2.761,6.156-6.157v-32.269 C107.784,123.454,96.804,123.454,87.124,123.517z"></path> 
          <path d="M77.762,296.157h-7.173c-6.87,0-12.44-5.57-12.44-12.442v-41.058H41.28l2.714-13.06h30.53V123.66 c-7.062,0.128-11.934,0.302-12.44,0.539c-5.554,1.365-10.505,4.951-12.885,10.656L1.421,250.377 c-3.937,9.521,0.586,20.439,10.107,24.382c2.332,0.958,4.76,1.42,7.14,1.42c7.315,0,14.266-4.34,17.249-11.537l1.635-3.966 l-11.251,54.167c-0.856,4.109,0.192,8.386,2.825,11.639c2.65,3.253,6.617,5.141,10.822,5.141h13.076v112.196 c0,12.369,10.028,22.398,22.389,22.398c12.361,0,22.39-10.029,22.39-22.398V331.622h8.982v112.196 c0,12.369,10.029,22.398,22.39,22.398c12.361,0,22.39-10.029,22.39-22.398V331.622h13.076c4.205,0,8.171-1.888,10.821-5.141 c0.159-0.198,0.19-0.468,0.334-0.674h-63.789C94.582,325.807,80.255,312.889,77.762,296.157z"></path> 
          <path d="M130.064,229.597h30.515l2.714,13.06h-16.819v13.662h57.838c-0.127-1.992-0.349-3.999-1.158-5.942l-47.778-115.521 c-2.365-5.705-7.316-9.291-12.869-10.663c-0.508-0.231-5.379-0.413-12.441-0.533V229.597z"></path> 
          <path d="M466.406,272.568h-14.13c4.088-4.887,6.552-11.18,6.552-18.05c0-15.549-12.604-28.154-28.153-28.154 c-15.549,0-28.154,12.605-28.154,28.154c0,6.87,2.464,13.163,6.553,18.05h-22.131c4.089-4.887,6.553-11.18,6.553-18.05 c0-15.549-12.604-28.154-28.154-28.154c-15.549,0-28.153,12.605-28.153,28.154c0,6.87,2.464,13.163,6.553,18.05h-22.491 c4.088-4.887,6.552-11.18,6.552-18.05c0-2.477-0.322-4.877-0.923-7.165c-1.349-5.322-4.256-10.023-8.209-13.587 c-5.01-4.595-11.688-7.402-19.022-7.402c-15.549,0-28.154,12.605-28.154,28.154c0,6.87,2.464,13.163,6.553,18.05H112.007 c-10.22,0-18.504,8.284-18.504,18.495c0,10.211,8.284,18.495,18.504,18.495h354.399c10.22,0,18.503-8.284,18.503-18.495 C484.909,280.852,476.626,272.568,466.406,272.568z"></path> 
          <path d="M370.467,205.351c0,15.115,12.25,27.373,27.374,27.373c15.121,0,27.371-12.258,27.371-27.373 c0-15.115-12.25-27.373-27.371-27.373C382.717,177.978,370.467,190.236,370.467,205.351z"></path> 
          <path d="M365.342,183.977c15.122,0,27.372-12.258,27.372-27.373c0-15.115-12.25-27.373-27.372-27.373 c-15.123,0-27.373,12.258-27.373,27.373C337.969,171.718,350.219,183.977,365.342,183.977z"></path> 
          <path d="M332.844,232.724c15.122,0,27.372-12.258,27.372-27.373c0-15.115-12.25-27.373-27.372-27.373 c-15.123,0-27.373,12.258-27.373,27.373C305.471,220.465,317.721,232.724,332.844,232.724z"></path> 
        </g> 
      </g>
    </svg>
  );

  // Super Market SVG component
  const SuperMarketIcon = () => (
    <svg 
      width="32px" 
      height="32px" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier"> 
        <path d="M14.5 21.9913V18.5C14.5 17.5654 14.5 17.0981 14.299 16.75C14.1674 16.522 13.978 16.3326 13.75 16.201C13.4019 16 12.9346 16 12 16C11.0654 16 10.5981 16 10.25 16.201C10.022 16.3326 9.83261 16.522 9.70096 16.75C9.5 17.0981 9.5 17.5654 9.5 18.5V21.9913H14.5Z" fill="#137000"></path> 
        <path opacity="0.5" fillRule="evenodd" clipRule="evenodd" d="M5.73204 12C4.84126 12 4.05323 11.6239 3.5 11.0329V14C3.5 17.7712 3.5 19.6568 4.67157 20.8284C5.61466 21.7715 7.02043 21.9554 9.5 21.9913H14.5C16.9796 21.9554 18.3853 21.7715 19.3284 20.8284C20.5 19.6568 20.5 17.7712 20.5 14V11.034C19.9468 11.6244 19.1592 12 18.269 12C16.6973 12 15.3814 10.8091 15.225 9.24523L15.152 8.51733C15.3385 10.382 13.8742 12 12.0003 12C10.139 12 8.6819 10.4038 8.84499 8.55511L8.77598 9.24523C8.6196 10.8091 7.30367 12 5.73204 12ZM14.5 18.5V21.9913H9.5V18.5C9.5 17.5654 9.5 17.0981 9.70096 16.75C9.83261 16.522 10.022 16.3326 10.25 16.201C10.5981 16 11.0654 16 12 16C12.9346 16 13.4019 16 13.75 16.201C13.978 16.3326 14.1674 16.522 14.299 16.75C14.5 17.0981 14.5 17.5654 14.5 18.5Z" fill="#137000"></path> 
        <path d="M9.4998 2H14.4998L15.1515 8.51737C15.338 10.382 13.8737 12 11.9998 12C10.1259 12 8.6616 10.382 8.84806 8.51737L9.4998 2Z" fill="#137000"></path> 
        <path opacity="0.7" d="M3.33024 5.35133C3.50832 4.46093 3.59736 4.01573 3.7784 3.65484C4.15987 2.89439 4.84628 2.33168 5.66677 2.10675C6.05616 2 6.51017 2 7.4182 2H9.50051L8.77598 9.24527C8.6196 10.8091 7.30367 12 5.73204 12C3.80159 12 2.35373 10.2339 2.73232 8.34093L3.33024 5.35133Z" fill="#137000"></path> 
        <path opacity="0.7" d="M20.6703 5.35133C20.4922 4.46093 20.4031 4.01573 20.2221 3.65484C19.8406 2.89439 19.1542 2.33168 18.3337 2.10675C17.9443 2 17.4903 2 16.5823 2H14.5L15.2245 9.24527C15.3809 10.8091 16.6968 12 18.2685 12C20.1989 12 21.6468 10.2339 21.2682 8.34093L20.6703 5.35133Z" fill="#137000"></path> 
      </g>
    </svg>
  );

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-2xl dark:bg-green-900">
      {category === "Restaurant" ? <RestaurantIcon /> : 
       category === "Specialty Foods" ? <SpecialtyFoodsIcon /> : 
       category === "Bakeries" ? <BakeriesIcon /> : 
       category === "Butchers" ? <ButchersIcon /> : 
       category === "Public Markets" ? <PublicMarketsIcon /> : 
       category === "Super Market" ? <SuperMarketIcon /> : 
       (icons[category] || "🏪")}
    </div>
  );
};

const MobileCategoryDropdown = ({
  categories,
  selectedCategory,
  onSelect,
  onClear,
}: {
  categories: any[];
  selectedCategory: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span>
          {selectedCategory
            ? categories.find((c) => c.id === selectedCategory)?.name
            : "Select Category"}
        </span>
        <svg
          className={`h-5 w-5 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {selectedCategory && (
            <button
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
              className="w-full border-b border-gray-200 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-gray-700"
            >
              Clear Selection
            </button>
          )}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onSelect(category.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center space-x-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedCategory === category.id
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              <CategoryIcon category={category.name} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper Functions
function getShopImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return "/images/shop-placeholder.jpg";

  // Handle relative paths (like "profile.png")
  if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
    return "/images/shop-placeholder.jpg";
  }

  // If it's a relative path starting with /, it's likely a valid local image
  if (imageUrl.startsWith("/")) {
    // Check if the image exists in the expected location
    // Handle common cases where images might be in different directories
    const commonImageMappings: { [key: string]: string } = {
      "publicMarket.jpg": "/assets/images/publicMarket.jpg",
      "backeryImage.jpg": "/assets/images/backeryImage.jpg",
      "Bakery.webp": "/assets/images/Bakery.webp",
      "Butcher.webp": "/assets/images/Butcher.webp",
      "delicatessen.jpeg": "/assets/images/delicatessen.jpeg",
      "OrganicShop.jpg": "/assets/images/OrganicShop.jpg",
      "shopping.jpg": "/assets/images/shopping.jpg",
      "shopsImage.jpg": "/assets/images/shopsImage.jpg",
      "superMarkets.jpg": "/assets/images/superMarkets.jpg",
    };

    // Check if this is a known image that might be in the assets directory
    for (const [filename, correctPath] of Object.entries(commonImageMappings)) {
      if (imageUrl.includes(filename)) {
        return correctPath;
      }
    }

    return imageUrl;
  }

  // For external URLs, check if they're valid
  if (imageUrl.startsWith("http")) {
    // Allow all external URLs except example.com
    if (imageUrl.includes("example.com")) {
      return "/images/shop-placeholder.jpg";
    }
    return imageUrl;
  }

  // Fallback to placeholder
  return "/images/shop-placeholder.jpg";
}

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Main Component
export default function UserDashboard({ initialData }: { initialData: Data }) {
  const { role, authReady } = useAuth();
  const [data, setData] = useState<Data>(
    initialData || {
      users: [],
      categories: [],
      shops: [],
      products: [],
      addresses: [],
      carts: [],
      cartItems: [],
      orders: [],
      orderItems: [],
      shopperAvailability: [],
      deliveryIssues: [],
      notifications: [],
      platformSettings: [],
      restaurants: [],
    }
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [shopDynamics, setShopDynamics] = useState<
    Record<
      string,
      { distance: string; time: string; fee: string; open: boolean }
    >
  >({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Fetch data if initialData is empty or missing
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we don't have shops data or if shops array is empty
      if ((!data.shops || data.shops.length === 0) && !isFetchingData) {
        setIsFetchingData(true);
        try {
          // Fetch shops and categories in parallel
          const [shopsResponse, categoriesResponse, restaurantsResponse] =
            await Promise.all([
              fetch("/api/queries/shops"),
              fetch("/api/queries/categories"),
              fetch("/api/queries/restaurants").catch(() => ({
                json: () => ({ restaurants: [] }),
              })), // Handle restaurants gracefully
            ]);

          const shopsData = await shopsResponse.json();
          const categoriesData = await categoriesResponse.json();
          const restaurantsData = await restaurantsResponse.json();

          setData((prevData) => ({
            ...prevData,
            shops: shopsData.shops || [],
            categories: categoriesData.categories || [],
            restaurants: restaurantsData.restaurants || [],
          }));
        } catch (error) {
          console.error("Error fetching data:", error);
          // Set empty arrays as fallback
          setData((prevData) => ({
            ...prevData,
            shops: prevData.shops || [],
            categories: prevData.categories || [],
            restaurants: prevData.restaurants || [],
          }));
        } finally {
          setIsFetchingData(false);
        }
      }
    };

    fetchData();
  }, [data.shops, data.categories, data.restaurants, isFetchingData]);

  useEffect(() => {
    if (authReady) {
      setDataLoaded(true);
    }
  }, [data, authReady]);

  const handleNearbyClick = async () => {
    if (isNearbyActive) {
      // Deactivate nearby filter
      setIsNearbyActive(false);
      setUserLocation(null);

      // Restore user's default address from database instead of clearing cookie
      try {
        const response = await fetch("/api/queries/addresses");
        const data = await response.json();
        const defaultAddress = (data.addresses || []).find(
          (a: any) => a.is_default
        );

        if (defaultAddress) {
          // Convert default address to the format expected by delivery calculations
          const locationData = {
            latitude: defaultAddress.latitude || "0",
            longitude: defaultAddress.longitude || "0",
            altitude: "0",
            street: defaultAddress.street,
            city: defaultAddress.city,
            postal_code: defaultAddress.postal_code,
          };
          Cookies.set("delivery_address", JSON.stringify(locationData));
        } else {
          // If no default address, remove the cookie to trigger fallback
          Cookies.remove("delivery_address");
        }

        // Trigger recomputation of shop dynamics
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("addressChanged"));
        }, 100);
      } catch (err) {
        console.error("Error restoring default address:", err);
        // Fallback: remove cookie if API call fails
        Cookies.remove("delivery_address");
      }

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // 1 minute cache
          });
        }
      );

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setIsNearbyActive(true);

      // Store location in cookie for delivery calculations
      const locationData = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        altitude: "0",
      };
      Cookies.set("delivery_address", JSON.stringify(locationData));

      // Trigger recomputation of shop dynamics
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("addressChanged"));
      }, 100);
    } catch (err) {
      console.error("Error getting location:", err);
      setError(
        "Unable to get your location. Please check location permissions."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    if (!authReady || role === "shopper" || !data) return [];

    let shops = data.shops || [];
    let restaurants = data.restaurants || [];

    // Convert restaurants to shop format for consistent rendering
    const restaurantsAsShops = restaurants.map((restaurant) => ({
      ...restaurant,
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.location || "Restaurant",
      image: restaurant.profile,
      category_id: "restaurant-category",
      latitude: restaurant.lat,
      longitude: restaurant.long,
      operating_hours: null,
      is_restaurant: true,
    }));

    if (selectedCategory) {
      // If "Restaurant" category is selected, show only restaurants
      if (selectedCategory === "restaurant-category") {
        return restaurantsAsShops;
      } else {
        // Filter shops by category
        shops = shops.filter((shop) => shop.category_id === selectedCategory);
        return shops;
      }
    }

    // When no category is selected, show both shops and restaurants
    let allShops = [...shops, ...restaurantsAsShops];

    // Filter by distance if nearby mode is active
    if (isNearbyActive && userLocation) {
      allShops = allShops.filter((shop) => {
        if (!shop.latitude || !shop.longitude) return false;

        const shopLat = parseFloat(shop.latitude);
        const shopLng = parseFloat(shop.longitude);
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          shopLat,
          shopLng
        );

        // Only show shops within 3 kilometers
        return distance <= 3;
      });
    }

    // Sort the shops based on selected criteria
    allShops.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "distance":
          const aDistance = parseFloat(
            shopDynamics[a.id]?.distance?.replace(" km", "") || "999"
          );
          const bDistance = parseFloat(
            shopDynamics[b.id]?.distance?.replace(" km", "") || "999"
          );
          return aDistance - bDistance;
        case "rating":
          // Mock rating for now - you can add real rating data later
          const aRating = 4.5; // Mock rating
          const bRating = 4.3; // Mock rating
          return bRating - aRating; // Higher rating first
        case "reviews":
          // Mock reviews count for now
          const aReviews = 1245; // Mock reviews
          const bReviews = 890; // Mock reviews
          return bReviews - aReviews; // More reviews first
        case "delivery_time":
          const aTime = shopDynamics[a.id]?.time || "N/A";
          const bTime = shopDynamics[b.id]?.time || "N/A";
          // Extract minutes from time string (e.g., "45 mins" -> 45)
          const aMinutes = parseInt(aTime.match(/(\d+)/)?.[1] || "999");
          const bMinutes = parseInt(bTime.match(/(\d+)/)?.[1] || "999");
          return aMinutes - bMinutes; // Lower time first
        default:
          return 0;
      }
    });

    return allShops;
  }, [
    authReady,
    role,
    selectedCategory,
    data.shops,
    data.restaurants,
    data.categories,
    sortBy,
    shopDynamics,
    isNearbyActive,
    userLocation,
  ]);

  // Separate useMemo for shops without dynamics to avoid circular dependency
  const shopsWithoutDynamics = useMemo(() => {
    if (!authReady || role === "shopper" || !data) return [];

    let shops = data.shops || [];
    let restaurants = data.restaurants || [];

    // Convert restaurants to shop format for consistent rendering
    const restaurantsAsShops = restaurants.map((restaurant) => ({
      ...restaurant,
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.location || "Restaurant",
      image: restaurant.profile,
      category_id: "restaurant-category",
      latitude: restaurant.lat,
      longitude: restaurant.long,
      operating_hours: null,
      is_restaurant: true,
    }));

    if (selectedCategory) {
      // If "Restaurant" category is selected, show only restaurants
      if (selectedCategory === "restaurant-category") {
        return restaurantsAsShops;
      } else {
        // Filter shops by category
        shops = shops.filter((shop) => shop.category_id === selectedCategory);
        return shops;
      }
    }

    // When no category is selected, show both shops and restaurants
    let allShops = [...shops, ...restaurantsAsShops];

    // Filter by distance if nearby mode is active
    if (isNearbyActive && userLocation) {
      allShops = allShops.filter((shop) => {
        if (!shop.latitude || !shop.longitude) return false;

        const shopLat = parseFloat(shop.latitude);
        const shopLng = parseFloat(shop.longitude);
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          shopLat,
          shopLng
        );

        // Only show shops within 3 kilometers
        return distance <= 3;
      });
    }

    return allShops;
  }, [
    authReady,
    role,
    selectedCategory,
    data.shops,
    data.restaurants,
    data.categories,
    isNearbyActive,
    userLocation,
  ]);

  useEffect(() => {
    if (!authReady || role === "shopper") return;

    const computeDynamics = () => {
      const cookie = Cookies.get("delivery_address");
      if (!cookie) {
        setShopDynamics({});
        return;
      }
      try {
        const userAddr = JSON.parse(cookie);
        const userLat = parseFloat(userAddr.latitude || "0");
        const userLng = parseFloat(userAddr.longitude || "0");
        const userAlt = parseFloat(userAddr.altitude || "0");
        const newDyn: Record<
          string,
          { distance: string; time: string; fee: string; open: boolean }
        > = {};

        shopsWithoutDynamics.forEach((shop) => {
          if (shop.latitude && shop.longitude) {
            const shopLat = parseFloat(shop.latitude);
            const shopLng = parseFloat(shop.longitude);
            const distKm = getDistanceFromLatLonInKm(
              userLat,
              userLng,
              shopLat,
              shopLng
            );
            const shopAlt = parseFloat((shop as any).altitude || "0");
            const altKm = (shopAlt - userAlt) / 1000;
            const dist3D = Math.sqrt(distKm * distKm + altKm * altKm);
            const distance = `${Math.round(dist3D * 10) / 10} km`;
            const travelTime = Math.ceil(dist3D);
            const totalTime = travelTime + 40;
            let time = `${totalTime} mins`;
            if (totalTime >= 60) {
              const hours = Math.floor(totalTime / 60);
              const mins = totalTime % 60;
              time = `${hours}h ${mins}m`;
            }
            const fee =
              distKm <= 3
                ? "1000 frw"
                : `${1000 + Math.round((distKm - 3) * 300)} frw`;

            let isOpen = false;
            const hoursObj = shop.operating_hours;
            if (hoursObj && typeof hoursObj === "object") {
              const now = new Date();
              const dayKey = now
                .toLocaleDateString("en-US", { weekday: "long" })
                .toLowerCase();
              const todaysHours = (hoursObj as any)[dayKey];

              if (todaysHours && todaysHours.toLowerCase() !== "closed") {
                const parts = todaysHours
                  .split("-")
                  .map((s: string) => s.trim());
                if (parts.length === 2) {
                  const parseTime = (tp: string): number | null => {
                    const m = tp.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
                    if (!m) return null;
                    let h = parseInt(m[1], 10);
                    const mm = m[2] ? parseInt(m[2], 10) : 0;
                    const ampm = m[3].toLowerCase();
                    if (h === 12) h = 0;
                    if (ampm === "pm") h += 12;
                    return h * 60 + mm;
                  };
                  const openMins = parseTime(parts[0]);
                  const closeMins = parseTime(parts[1]);
                  if (openMins !== null && closeMins !== null) {
                    const nowMins = now.getHours() * 60 + now.getMinutes();
                    if (openMins < closeMins) {
                      // Normal case: shop opens and closes on the same day
                      isOpen = nowMins >= openMins && nowMins <= closeMins;
                    } else {
                      // Special case: shop opens one day and closes the next (e.g., 8pm - 2am)
                      isOpen = nowMins >= openMins || nowMins <= closeMins;
                    }
                  }
                }
              } else if (
                todaysHours &&
                todaysHours.toLowerCase() === "closed"
              ) {
                isOpen = false;
              }
            }
            newDyn[shop.id] = { distance, time, fee, open: isOpen };
          }
        });
        setShopDynamics(newDyn);
      } catch (err) {
        console.error("Error computing shop dynamics:", err);
      }
    };

    computeDynamics();
    window.addEventListener("addressChanged", computeDynamics);
    return () => window.removeEventListener("addressChanged", computeDynamics);
  }, [shopsWithoutDynamics, authReady, role]);

  const handleCategoryClick = (categoryId: string) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        setSelectedCategory(categoryId);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to filter shops. Please try again.");
        setIsLoading(false);
      }
    }, 300);
  };

  const clearFilter = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        setSelectedCategory(null);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to clear filter. Please try again.");
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleRefreshData = async () => {
    setIsFetchingData(true);
    try {
      // Fetch shops and categories in parallel
      const [shopsResponse, categoriesResponse, restaurantsResponse] =
        await Promise.all([
          fetch("/api/queries/shops"),
          fetch("/api/queries/categories"),
          fetch("/api/queries/restaurants").catch(() => ({
            json: () => ({ restaurants: [] }),
          })),
        ]);

      const shopsData = await shopsResponse.json();
      const categoriesData = await categoriesResponse.json();
      const restaurantsData = await restaurantsResponse.json();

      setData((prevData) => ({
        ...prevData,
        shops: shopsData.shops || [],
        categories: categoriesData.categories || [],
        restaurants: restaurantsData.restaurants || [],
      }));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  // Helper function to display sort option names
  const getSortDisplayName = (key: string) => {
    switch (key) {
      case "name":
        return "Name";
      case "distance":
        return "Distance";
      case "rating":
        return "Rating";
      case "reviews":
        return "Reviews";
      case "delivery_time":
        return "Delivery Time";
      default:
        return key;
    }
  };

  if (!authReady || !dataLoaded) {
    return <LoadingScreen />;
  }

  // Show loading state only if we're fetching data and have no shops at all
  if (isFetchingData && (!data.shops || data.shops.length === 0)) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-0 md:ml-16 md:p-4">
      <div className="container mx-auto">
        {/* Shop Categories */}
        <div className="mt-0 md:mt-4">
          <div className="mb-2 flex items-center justify-between md:mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            {selectedCategory && (
              <button
                onClick={clearFilter}
                className="hidden rounded-full bg-green-600 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 md:block"
              >
                Clear Filter
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          {/* Mobile Dropdown */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ) : (
              <MobileCategoryDropdown
                categories={[
                  ...(data?.categories || []),
                  // Add Restaurant category if restaurants exist
                  ...(data?.restaurants && data.restaurants.length > 0
                    ? [
                        {
                          id: "restaurant-category",
                          name: "Restaurant",
                          description: "Restaurants and dining",
                          created_at: new Date().toISOString(),
                          image: "",
                          is_active: true,
                        },
                      ]
                    : []),
                ]}
                selectedCategory={selectedCategory}
                onSelect={handleCategoryClick}
                onClear={clearFilter}
              />
            )}
          </div>

          {/* Desktop Grid */}
          <div className="hidden grid-cols-3 gap-4 md:grid lg:grid-cols-8">
            {isLoading
              ? Array(7)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="mb-3 h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  ))
              : [
                  ...(data?.categories || []),
                  // Add Restaurant category if restaurants exist
                  ...(data?.restaurants && data.restaurants.length > 0
                    ? [
                        {
                          id: "restaurant-category",
                          name: "Restaurant",
                          description: "Restaurants and dining",
                          created_at: new Date().toISOString(),
                          image: "",
                          is_active: true,
                        },
                      ]
                    : []),
                ].map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`group relative flex cursor-pointer flex-col items-center rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      selectedCategory === category.id
                        ? "border-green-500 bg-green-50 shadow-md dark:border-green-400 dark:bg-green-900/20"
                        : "border-gray-200 hover:border-green-200 dark:border-gray-700 dark:hover:border-green-700"
                    }`}
                  >
                    <CategoryIcon category={category.name} />
                    <span className="mt-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                      {category.name}
                    </span>
                    {selectedCategory === category.id && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* Shops */}
        <div className="mt-4 md:mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedCategory
                ? data?.categories?.find((c) => c.id === selectedCategory)
                    ?.name || "Selected Category"
                : "All Mart"}
            </h4>
            <div className="flex items-center gap-2">
              {/* Refresh Button - Hidden on mobile */}
              <button
                onClick={handleRefreshData}
                disabled={isFetchingData}
                className="hidden items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 md:flex"
              >
                <svg
                  className={`h-4 w-4 ${isFetchingData ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isFetchingData ? "Refreshing..." : "Refresh"}
              </button>

              {/* Sort Dropdown */}
              <SortDropdown
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onNearbyClick={handleNearbyClick}
                isNearbyActive={isNearbyActive}
              />
            </div>
          </div>

          {isLoading || isFetchingData ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <ShopSkeleton key={index} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-6">
              {filteredShops?.length ? (
                filteredShops.map((shop) => {
                  const dyn = shopDynamics[shop.id] || {
                    distance: "N/A",
                    time: "N/A",
                    fee: "N/A",
                    open: false,
                  };
                  return (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      dynamics={dyn}
                      getShopImageUrl={getShopImageUrl}
                    />
                  );
                })
              ) : (
                <div className="col-span-full mt-8 text-center text-gray-500 dark:text-gray-400">
                  {isFetchingData
                    ? "Loading shops..."
                    : "No shops found in this category"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading screen component is now imported from @components/ui/LoadingScreen

function ShopSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border shadow-sm dark:border-gray-700">
      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800"></div>
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-100 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700"></div>
        <div className="mt-2 h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}
