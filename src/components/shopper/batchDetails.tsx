"use client"

import React, { useState } from "react"
import { useRouter } from "next/router"
import { Button, Steps, Panel, Modal, Uploader, Loader, Tag, Divider, Checkbox, toaster, Notification } from "rsuite"
import "rsuite/dist/rsuite.min.css"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "../../lib/formatCurrency"
import ProductImageModal from "./ProductImageModal"
import QuantityConfirmationModal from "./QuantityConfirmationModal"
import { useChat } from "../../context/ChatContext"
import { isMobileDevice } from "../../lib/formatters"
import ChatDrawer from "../chat/ChatDrawer"

// Define interfaces for the order data
interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
    price: number
    description?: string
    measurement_unit?: string
    category?: string
    quantity?: number
  }
  found?: boolean
  foundQuantity?: number
}

interface OrderDetailsType {
  id: string
  OrderID: string
  placedAt: string
  estimatedDelivery: string
  deliveryNotes: string
  total: number
  serviceFee: string
  deliveryFee: string
  status: string
  deliveryPhotoUrl: string
  discount: number
  user: {
    id: string
    name: string
    email: string
    profile_picture: string
  }
  shop: {
    id: string
    name: string
    address: string
    image: string
  }
  Order_Items: OrderItem[]
  address: {
    id: string
    street: string
    city: string
    postal_code: string
    latitude: string
    longitude: string
  }
  assignedTo: {
    id: string
    name: string
    profile_picture: string
    orders: {
      aggregate: {
        count: number
      }
    }
  }
}

interface BatchDetailsProps {
  orderData: OrderDetailsType | null;
  error: string | null;
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export default function BatchDetails({ orderData, error, onUpdateStatus }: BatchDetailsProps) {
  const router = useRouter()
  const { openChat, isDrawerOpen, closeChat, currentChatId } = useChat()
  
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderDetailsType | null>(orderData)
  const [errorState, setErrorState] = useState<string | null>(error)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null)
  const [currentOrderItem, setCurrentOrderItem] = useState<OrderItem | null>(null)
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null)
  const [foundQuantity, setFoundQuantity] = useState(1)
  
  const [currentStep, setCurrentStep] = useState(() => {
    if (!orderData) return 0;
    
    switch (orderData.status) {
      case 'accepted':
        return 0;
      case 'shopping':
        return 1;
      case 'on_the_way':
      case 'at_customer':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  })

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order?.id) return
    
    try {
      setLoading(true);
      await onUpdateStatus(order.id, newStatus);
      
      // Update local state
      if (order) {
        setOrder({
          ...order,
          status: newStatus
        });
      }
      
      // Update step
      switch (newStatus) {
        case 'accepted':
          setCurrentStep(0)
          break
        case 'shopping':
          setCurrentStep(1)
          break
        case 'on_the_way':
        case 'at_customer':
          setCurrentStep(2)
          break
        case 'delivered':
          setCurrentStep(3)
          // Close chat drawer if open when order is delivered
          if (isDrawerOpen && currentChatId === order.id) {
            closeChat();
          }
          // Show success notification when order is delivered
          toaster.push(
            <Notification type="success" header="Order Delivered" closable>
              Order was successfully marked as delivered. An invoice has been generated and chat history has been cleared.
            </Notification>,
            { placement: 'topEnd' }
          )
          break
      }
    } catch (err) {
      console.error("Error updating order status:", err)
      // Display toast notification for error
      toaster.push(
        <Notification type="error" header="Update Failed" closable>
          {err instanceof Error 
            ? `Failed to update status: ${err.message}`
            : 'Failed to update order status. Please try again.'}
        </Notification>,
        { placement: 'topEnd' }
      )
      
      // Also set the error state for display in the UI
      setErrorState(
        err instanceof Error 
          ? `Failed to update status: ${err.message}`
          : 'Failed to update order status. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Function to show product image in modal
  const showProductImage = (item: OrderItem) => {
    setSelectedImage(item.product.image);
    setSelectedProductName(item.product.name);
    setCurrentOrderItem(item);
    setShowImageModal(true);
  }

  // Function to mark an item as found/not found
  const toggleItemFound = (item: OrderItem, found: boolean) => {
    if (!order) return;
    
    if (found && item.quantity > 1) {
      // Open quantity modal for multi-quantity items
      setCurrentItem(item);
      setFoundQuantity(item.quantity); // Default to the full requested quantity
      setShowQuantityModal(true);
    } else {
      // For single quantity items or unmarking as found, update directly
      updateItemFoundStatus(item.id, found, found ? item.quantity : 0);
    }
  }

  // New function to update found status with a specific quantity
  const updateItemFoundStatus = (itemId: string, found: boolean, foundQty: number = 0) => {
    if (!order) return;
    
    const updatedItems = order.Order_Items.map(item => 
      item.id === itemId ? { 
        ...item, 
        found, 
        foundQuantity: found ? foundQty : 0 
      } : item
    );
    
    setOrder({
      ...order,
      Order_Items: updatedItems
    });
  }

  // Function to confirm found quantity
  const confirmFoundQuantity = () => {
    if (!currentItem) return;
    
    // Ensure found quantity never exceeds ordered quantity
    const validQuantity = Math.min(foundQuantity, currentItem.quantity);
    
    updateItemFoundStatus(currentItem.id, true, validQuantity);
    setShowQuantityModal(false);
    setCurrentItem(null);
  };

  // Calculate found items total
  const calculateFoundTotal = () => {
    if (!order) return 0;
    
    return order.Order_Items
      .filter(item => item.found)
      .reduce((total, item) => {
        // Use foundQuantity if available, otherwise use full quantity
        const quantity = item.foundQuantity !== undefined ? item.foundQuantity : item.quantity;
        return total + (item.price * quantity);
      }, 0);
  }

  // Function to get the right action button based on current status
  const getActionButton = () => {
    if (!order) return null
    
    switch (order.status) {
      case 'accepted':
        return (
          <Button 
            appearance="primary" 
            color="green" 
            block
            onClick={() => handleUpdateStatus('shopping')}
            loading={loading}
          >
            Start Shopping
          </Button>
        )
      case 'shopping':
        return (
          <Button 
            appearance="primary" 
            color="green" 
            block
            onClick={() => handleUpdateStatus('on_the_way')}
            loading={loading}
          >
            Make Payment
          </Button>
        )
      case 'on_the_way':
      case 'at_customer':
        return (
          <Button 
            appearance="primary" 
            color="green" 
            block
            onClick={() => handleUpdateStatus('delivered')}
            loading={loading}
          >
            Confirm Delivery
          </Button>
        )
      case 'delivered':
        // No button for delivered status
        return null;
      default:
        return null
    }
  }

  // Function to handle chat button click
  const handleChatClick = () => {
    if (!order?.user) return;
    
    openChat(
      order.id,
      order.user.id,
      order.user.name,
      order.user.profile_picture
    );
    
    // If on mobile, navigate to chat page
    if (isMobileDevice()) {
      router.push(`/Plasa/chat/${order.id}`);
    }
  };

  // Helper function to get status tag with appropriate color
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Tag color="blue">Accepted</Tag>
      case 'shopping':
        return <Tag color="orange">Shopping</Tag>
      case 'on_the_way':
      case 'at_customer':
        return <Tag color="violet">On The Way</Tag>
      case 'delivered':
        return <Tag color="green">Delivered</Tag>
      default:
        return <Tag color="cyan">{status}</Tag>
    }
  }

  if (loading && !order) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader size="lg" content="Processing..." />
      </div>
    )
  }

  if (errorState) {
    return (
      <div className="p-4">
        <Panel bordered header="Error" shaded>
          <p className="text-red-600">{errorState}</p>
          <Button appearance="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </Panel>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-4">
        <Panel bordered header="Order Not Found" shaded>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button appearance="primary" onClick={() => router.push('/Plasa')}>
            Go to Dashboard
          </Button>
        </Panel>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-1xl mx-auto">
      {/* Product Image Modal */}
      <ProductImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        selectedImage={selectedImage}
        selectedProductName={selectedProductName}
        currentOrderItem={currentOrderItem}
      />

      {/* Quantity Confirmation Modal */}
      <QuantityConfirmationModal
        open={showQuantityModal}
        onClose={() => setShowQuantityModal(false)}
        currentItem={currentItem}
        foundQuantity={foundQuantity}
        setFoundQuantity={setFoundQuantity}
        onConfirm={confirmFoundQuantity}
      />

      {/* Chat Drawer - will only show on desktop when chat is open */}
      {isDrawerOpen && currentChatId === order?.id && order.status !== 'delivered' && (
        <ChatDrawer
          isOpen={isDrawerOpen}
          onClose={closeChat}
          orderId={order.id}
          customerId={order.user.id}
          customerName={order.user.name}
          customerAvatar={order.user.profile_picture}
        />
      )}

    <div className="mb-4 flex items-center justify-between">
      <Button
        appearance="link"
        onClick={() => router.back()}
        className="flex items-center text-gray-600"
      >
        <span className="mr-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </span>
        Back
      </Button>
      <div>{getStatusTag(order.status)}</div>
    </div>

    <Panel bordered header={`Order #${order.OrderID || order.id.slice(0, 8)}`} shaded>
      <Steps current={currentStep} className="mb-8">
            <Steps.Item title="Accepted" />
        <Steps.Item title="Shopping" />
            <Steps.Item title="On The Way" />
        <Steps.Item title="Delivered" />
      </Steps>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shop Information */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-bold mb-2">Shop Details</h3>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full mr-3 overflow-hidden flex-shrink-0">
              {order.shop.image ? (
                <Image
                  src={order.shop.image}
                  alt={order.shop.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                    <path d="M3 3h18v18H3zM16 8h.01M8 16h.01M16 16h.01" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">{order.shop.name}</h4>
              <p className="text-sm text-gray-500">{order.shop.address}</p>
            </div>
          </div>
          <Link href={`https://maps.google.com?q=${order.shop.address}`} target="_blank">
            <Button appearance="ghost" className="mt-3">
              <span className="mr-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              Directions
            </Button>
          </Link>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-bold mb-2">Customer Details</h3>
          <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full mr-3 overflow-hidden flex-shrink-0">
              {order.user.profile_picture ? (
                <Image
                  src={order.user.profile_picture}
                  alt={order.user.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">{order.user.name}</h4>
              <p className="text-sm text-gray-500">{order.user.email}</p>
            </div>
            </div>
            
            {/* Message Button - disabled if order is delivered */}
            {order.status !== 'delivered' ? (
              <Button 
                appearance="ghost" 
                className="flex items-center text-blue-600" 
                onClick={handleChatClick}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Message
              </Button>
            ) : (
              <Button 
                appearance="ghost" 
                className="flex items-center text-gray-400 cursor-not-allowed" 
                disabled
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-1">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat Closed
              </Button>
            )}
          </div>

          <div className="mt-3">
            <h4 className="font-medium text-sm mb-1">Delivery Address:</h4>
            <p className="text-sm text-gray-600">
              {order.address.street}, {order.address.city}
              {order.address.postal_code ? `, ${order.address.postal_code}` : ''}
            </p>
            <Link href={`https://maps.google.com?q=${order.address.street},${order.address.city}`} target="_blank">
              <Button appearance="ghost" className="mt-2">
                <span className="mr-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                Directions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <h3 className="text-lg font-bold mb-3">Order Items</h3>
        <div className="space-y-4">
          {order.Order_Items.map((item) => (
            <div key={item.id} className="flex items-center border-b pb-3">
                  <div 
                    className="w-12 h-12 bg-gray-100 rounded-lg mr-3 overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => showProductImage(item)}
                  >
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                      <path d="M9 17h6M9 12h6M9 7h6" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
                  {item.found && item.foundQuantity && item.foundQuantity < item.quantity && (
                    <p className="text-xs text-orange-600">
                      Found: {item.foundQuantity} of {item.quantity}
                    </p>
                  )}
              </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-bold mb-2">
                {formatCurrency(item.price * item.quantity)}
                    </div>
                    {order.status === 'shopping' && (
                      <Checkbox 
                        checked={item.found || false} 
                        onChange={(_, checked) => toggleItemFound(item, checked)}
                      >
                        Found
                      </Checkbox>
                    )}
              </div>
            </div>
          ))}
        </div>
      </div>

          {/* Found Items Summary - only show when shopping */}
          {order.status === 'shopping' && (
            <div className="bg-white p-4 rounded-lg border mb-6">
              <h3 className="text-lg font-bold mb-3">Found Items Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span>{order.Order_Items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Found Items</span>
                  <span>{order.Order_Items.filter(item => item.found).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Partial Finds</span>
                  <span>{order.Order_Items.filter(item => item.found && item.foundQuantity && item.foundQuantity < item.quantity).length}</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold">
                  <span>Total for Found Items</span>
                  <span>{formatCurrency(calculateFoundTotal())}</span>
                </div>
              </div>
            </div>
          )}

      {/* Order Summary */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <h3 className="text-lg font-bold mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.total - parseFloat(order.serviceFee || '0') - parseFloat(order.deliveryFee || '0'))}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{formatCurrency(parseFloat(order.deliveryFee || '0'))}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>{formatCurrency(parseFloat(order.serviceFee || '0'))}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <Divider />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Notes if any */}
      {order.deliveryNotes && (
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h3 className="text-lg font-bold mb-2">Delivery Notes</h3>
          <p className="text-gray-700">{order.deliveryNotes}</p>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6">
        {getActionButton()}
      </div>
    </Panel>
  </div>
  )
}