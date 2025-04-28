import React from "react";
import Link from "next/link";
import Image from "next/image";

import { useState } from "react";
import RootLayout from "@components/ui/layout";
import ItemsSection from "@components/items/itemsSection";
import FreshMarkPage from "@components/items/FreshMarkPage";

interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
  unit?: string;
  category: string;
  sale?: boolean;
  originalPrice?: string;
  description?: string;
}

interface FreshMarkPageProps {
  products?: Product[];
}

export default FreshMarkPage;
