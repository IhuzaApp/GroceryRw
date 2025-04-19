import React from "react";
import Image from "next/image"
import { Input, InputGroup, Button, Panel, Steps, Rate, Modal } from "rsuite"
import Link from "next/link"
import { useState } from "react"

export default function UserPendingOrders(){
    const [feedbackModal, setFeedbackModal] = useState(false)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
  
    // Mock order data - in a real app, this would come from an API
    const order = {
      id: 1,
      status: "on_the_way", // shopping, packing, on_the_way, delivered
      placedAt: "April 19, 2025 at 2:45 PM",
      estimatedDelivery: "April 19, 2025 between 4:30 PM - 5:00 PM",
      total: "$78.35",
      items: [
        {
          name: "Avocado Persea Americana",
          quantity: 4,
          price: "$12.86",
          total: "$51.44",
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          name: "Deliciously Ella Fruit And Nut Muesli",
          quantity: 2,
          price: "$20.53",
          total: "$41.06",
          image: "/placeholder.svg?height=60&width=60",
        },
        {
          name: "Mixed Nuts Cashew Nuts",
          quantity: 1,
          price: "$33.45",
          total: "$33.45",
          image: "/placeholder.svg?height=60&width=60",
        },
      ],
      address: {
        name: "Home",
        street: "2464 Royal Ln.",
        city: "Mesa, AZ 85201",
        country: "United States",
      },
      assignedTo: {
        name: "Michael Rodriguez",
        rating: 4.8,
        orders: 1243,
        image: "/placeholder.svg?height=80&width=80",
        phone: "(555) 987-6543",
      },
    }
  
    const getStatusStep = (status: string) => {
      switch (status) {
        case "shopping":
          return 0
        case "packing":
          return 1
        case "on_the_way":
          return 2
        case "delivered":
          return 3
        default:
          return 0
      }
    }
  
    const handleFeedbackSubmit = () => {
      // In a real app, this would send the feedback to an API
      console.log("Feedback submitted:", { rating, comment })
      setFeedbackModal(false)
      // Show success message or update UI
    }
  
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 6.5a2 2 0 100-4 2 2 0 000 4zM8.5 8a2 2 0 100-4 2 2 0 000 4zM15.5 8a2 2 0 100-4 2 2 0 000 4zM18 9.5a2 2 0 100-4 2 2 0 000 4zM6 9.5a2 2 0 100-4 2 2 0 000 4zM18 14a2 2 0 100-4 2 2 0 000 4zM6 14a2 2 0 100-4 2 2 0 000 4zM15.5 16a2 2 0 100-4 2 2 0 000 4zM8.5 16a2 2 0 100-4 2 2 0 000 4zM12 17.5a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <div>
              <h2 className="font-medium text-gray-900">2464 Royal Ln. Mesa</h2>
              <p className="text-xs text-gray-500">Your address</p>
            </div>
          </div>
  
          <div className="relative flex-1 max-w-md mx-4">
            <InputGroup inside style={{ width: "100%" }}>
              <Input placeholder="Search" className="rounded-full" />
              <InputGroup.Addon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </InputGroup.Addon>
            </InputGroup>
          </div>
  
          <Link href="/cart" className="flex items-center gap-1">
            <div className="bg-green-500 text-white rounded-md p-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 01-8 0"></path>
              </svg>
            </div>
            <span className="text-green-500 font-bold text-xl">02</span>
          </Link>
        </header>
  
        {/* Main Content */}
        <main className="p-4 max-w-6xl mx-auto">
          {/* Sidebar */}
          <div className="fixed left-0 top-1/4 bg-white rounded-r-lg shadow-md">
            <div className="flex flex-col items-center gap-6 p-4">
              <Link href="/">
                <Button appearance="subtle" className="rounded-full w-10 h-10 flex items-center justify-center p-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </Button>
              </Link>
              <Button appearance="subtle" className="rounded-full w-10 h-10 flex items-center justify-center p-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                </svg>
              </Button>
              <Link href="/profile">
                <Button appearance="subtle" className="rounded-full w-10 h-10 flex items-center justify-center p-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  </svg>
                </Button>
              </Link>
              <Button
                appearance="subtle"
                className="rounded-full bg-green-50 text-green-600 w-10 h-10 flex items-center justify-center p-0"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </Button>
            </div>
          </div>
  
          {/* Order Tracking Header */}
          <div className="flex items-center mb-6">
            <Link href="/profile" className="flex items-center text-gray-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mr-2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <span className="text-gray-500 ml-2">Placed on {order.placedAt}</span>
          </div>
  
          {/* Order Status */}
          <Panel shaded bordered className="mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Order Status</h2>
              <Steps current={getStatusStep(order.status)} className="custom-steps">
                <Steps.Item title="Shopping" description="Picking your items" />
                <Steps.Item title="Packing" description="Preparing for delivery" />
                <Steps.Item title="On the way" description="Heading to your location" />
                <Steps.Item title="Delivered" description="Enjoy your groceries!" />
              </Steps>
            </div>
  
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
              <div>
                <p className="text-gray-600">Estimated delivery time:</p>
                <p className="font-bold">{order.estimatedDelivery}</p>
              </div>
              {order.status === "delivered" ? (
                <Button appearance="primary" className="bg-green-500 text-white" onClick={() => setFeedbackModal(true)}>
                  Provide Feedback
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button appearance="ghost">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1">
                      <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                    </svg>
                    Contact Support
                  </Button>
                  <Button appearance="primary" className="bg-green-500 text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                    </svg>
                    Track Live
                  </Button>
                </div>
              )}
            </div>
          </Panel>
  
          {/* Order Content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Order Details */}
            <div className="w-full md:w-2/3">
              <Panel shaded bordered className="mb-6">
                <h2 className="text-xl font-bold mb-4">Order Details</h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                      <div className="w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex justify-between mt-1 text-sm text-gray-600">
                          <span>
                            {item.quantity} × {item.price}
                          </span>
                          <span className="font-bold">{item.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
  
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{order.total}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4">
                    <span>Total</span>
                    <span>{order.total}</span>
                  </div>
                </div>
              </Panel>
  
              <Panel shaded bordered>
                <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold">{order.address.name}</h3>
                    <p className="text-gray-600">
                      {order.address.street}
                      <br />
                      {order.address.city}
                      <br />
                      {order.address.country}
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
  
            {/* Right Column - Assigned Person */}
            <div className="w-full md:w-1/3">
              <Panel shaded bordered>
                <h2 className="text-xl font-bold mb-4">
                  {order.status === "shopping" || order.status === "packing" ? "Your Shopper" : "Your Delivery Person"}
                </h2>
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                    <Image
                      src={order.assignedTo.image || "/placeholder.svg"}
                      alt={order.assignedTo.name}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{order.assignedTo.name}</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          viewBox="0 0 24 24"
                          fill={i < Math.floor(order.assignedTo.rating) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          className={`w-4 h-4 ${i < Math.floor(order.assignedTo.rating) ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-gray-600">{order.assignedTo.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{order.assignedTo.orders} orders completed</p>
  
                  <div className="w-full mt-6 space-y-3">
                    <Button appearance="primary" block className="bg-green-500 text-white">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                      </svg>
                      Call
                    </Button>
                    <Button appearance="ghost" block>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2">
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                      </svg>
                      Message
                    </Button>
                  </div>
                </div>
              </Panel>
  
              {order.status === "on_the_way" && (
                <Panel shaded bordered className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Live Tracking</h2>
                  <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map view would appear here</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Current location:</p>
                    <p className="font-medium">2.5 miles away • Arriving in ~15 minutes</p>
                  </div>
                </Panel>
              )}
            </div>
          </div>
  
          {/* Feedback Modal */}
          <Modal open={feedbackModal} onClose={() => setFeedbackModal(false)}>
            <Modal.Header>
              <Modal.Title>Rate Your Experience</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center mb-6">
                <p className="mb-4">How was your experience with this order?</p>
                <div className="flex justify-center">
                  <Rate size="lg" value={rating} onChange={setRating} />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Additional Comments</label>
                <Input
                  as="textarea"
                  rows={4}
                  placeholder="Tell us more about your experience..."
                  value={comment}
                  onChange={(value) => setComment(value as string)}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setFeedbackModal(false)} appearance="subtle">
                Cancel
              </Button>
              <Button onClick={handleFeedbackSubmit} appearance="primary" className="bg-green-500 text-white">
                Submit Feedback
              </Button>
            </Modal.Footer>
          </Modal>
        </main>
  
        <style jsx global>{`
          .custom-steps .rs-steps-item-status-process .rs-steps-item-icon-wrapper {
            background-color: #22c55e !important;
            border-color: #22c55e !important;
          }
          .custom-steps .rs-steps-item-status-finish .rs-steps-item-icon-wrapper {
            color: #22c55e !important;
            border-color: #22c55e !important;
          }
          .custom-steps .rs-steps-item-status-finish .rs-steps-item-tail {
            border-color: #22c55e !important;
          }
        `}</style>
      </div>
    )
}