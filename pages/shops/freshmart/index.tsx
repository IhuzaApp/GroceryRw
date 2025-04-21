import React from "react";
import Link from "next/link"
import Image from "next/image"
import { Input, InputGroup, Button, Badge, Nav } from "rsuite"
import { useState } from "react"
import RootLayout from "@components/ui/layout";

export default function FreshMarkPage(){
    const [activeCategory, setActiveCategory] = useState("all")

    // Mock shop data
    const shop = {
      id: "freshmart",
      name: "FreshMart",
      image: "/placeholder.svg?height=200&width=200",
      banner: "/placeholder.svg?height=200&width=800",
      rating: 4.8,
      reviews: 1245,
      deliveryTime: "15-25 min",
      deliveryFee: "Free",
      distance: "1.2 mi",
      description: "Your one-stop shop for fresh groceries, household essentials, and more.",
      categories: [
        { id: "all", name: "All" },
        { id: "fruits", name: "Fruits & Vegetables" },
        { id: "dairy", name: "Dairy & Eggs" },
        { id: "bakery", name: "Bakery" },
        { id: "meat", name: "Meat & Seafood" },
        { id: "snacks", name: "Snacks" },
        { id: "beverages", name: "Beverages" },
        { id: "household", name: "Household" },
      ],
      products: [
        {
          id: "1",
          name: "Organic Avocado",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$2.99",
          unit: "each",
          category: "fruits",
          sale: false,
        },
        {
          id: "2",
          name: "Fresh Strawberries",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$4.99",
          unit: "16 oz",
          category: "fruits",
          sale: true,
          originalPrice: "$6.99",
        },
        {
          id: "3",
          name: "Whole Milk",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$3.49",
          unit: "1 gallon",
          category: "dairy",
          sale: false,
        },
        {
          id: "4",
          name: "Large Brown Eggs",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$4.29",
          unit: "dozen",
          category: "dairy",
          sale: false,
        },
        {
          id: "5",
          name: "Sourdough Bread",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$5.49",
          unit: "loaf",
          category: "bakery",
          sale: false,
        },
        {
          id: "6",
          name: "Chocolate Chip Cookies",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$3.99",
          unit: "12 pack",
          category: "bakery",
          sale: true,
          originalPrice: "$4.99",
        },
        {
          id: "7",
          name: "Boneless Chicken Breast",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$8.99",
          unit: "lb",
          category: "meat",
          sale: false,
        },
        {
          id: "8",
          name: "Atlantic Salmon Fillet",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$12.99",
          unit: "lb",
          category: "meat",
          sale: false,
        },
        {
          id: "9",
          name: "Potato Chips",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$3.29",
          unit: "8 oz bag",
          category: "snacks",
          sale: false,
        },
        {
          id: "10",
          name: "Mixed Nuts",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$7.99",
          unit: "16 oz",
          category: "snacks",
          sale: false,
        },
        {
          id: "11",
          name: "Sparkling Water",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$5.99",
          unit: "12 pack",
          category: "beverages",
          sale: true,
          originalPrice: "$7.99",
        },
        {
          id: "12",
          name: "Orange Juice",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$4.49",
          unit: "64 oz",
          category: "beverages",
          sale: false,
        },
        {
          id: "13",
          name: "Paper Towels",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$8.99",
          unit: "6 rolls",
          category: "household",
          sale: false,
        },
        {
          id: "14",
          name: "Dish Soap",
          image:"https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8=",
          price: "$3.49",
          unit: "16 oz",
          category: "household",
          sale: false,
        },
      ],
    }
  
    // Filter products by category
    const filteredProducts =
      activeCategory === "all" ? shop.products : shop.products.filter((product) => product.category === activeCategory)
  
    return (
 <RootLayout>
        <div className="p-4 md:ml-16">
        {" "}
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">

  
          {/* Shop Banner */}
          <div className="relative h-48 bg-gray-200">
            <Image src={"/assets/images/shopsImage.jpg" || "/placeholder.svg"} alt={shop.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold">{shop.name}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="ml-1 font-medium">{shop.rating}</span>
                    <span className="ml-1 text-sm">({shop.reviews} reviews)</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{shop.deliveryTime}</span>
                  <span className="mx-2">•</span>
                  <span>{shop.deliveryFee} delivery</span>
                </div>
              </div>
            </div>
            <Link href="/" className="absolute top-4 left-4 bg-white rounded-full p-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
  
          {/* Shop Description */}
          <div className="px-4 py-3 bg-white border-b">
            <p className="text-gray-600">{shop.description}</p>
          </div>
  
          {/* Categories Navigation */}
          <div className="sticky top-[73px] z-10 bg-white border-b shadow-sm">
            <div className="px-4 overflow-x-auto">
              <Nav appearance="subtle" activeKey={activeCategory} onSelect={setActiveCategory}>
                {shop.categories.map((category) => (
                  <Nav.Item key={category.id} className="px-4">
                    {category.name}
                  </Nav.Item>
                ))}
              </Nav>
            </div>
          </div>
  
          {/* Products Grid */}
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">
              {activeCategory === "all" ? "All Products" : shop.categories.find((c) => c.id === activeCategory)?.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  unit={product.unit}
                  sale={product.sale}
                  originalPrice={product.originalPrice}
                />
              ))}
            </div>
          </div>
 </div>
 </div>
      </RootLayout>
    )
  }
  
  interface ProductCardProps {
    name: string
    image: string
    price: string
    unit: string
    sale?: boolean
    originalPrice?: string
  }
  
  function ProductCard({ name, image, price, unit, sale, originalPrice }: ProductCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative">
          <Image src={image || "/placeholder.svg"} alt={name} width={150} height={150} className="w-full object-cover" />
          {sale && (
            <Badge
              content="SALE"
              className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
            />
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-500 mb-2">{unit}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">{price}</span>
              {sale && originalPrice && <span className="ml-2 text-sm text-gray-500 line-through">{originalPrice}</span>}
            </div>
            <Button
              appearance="primary"
              size="sm"
              className="bg-green-500 text-white h-8 w-8 p-0 flex items-center justify-center rounded-full"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    )
}