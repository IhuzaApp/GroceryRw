# 🎤 Voice Ordering System

A comprehensive voice ordering system integrated with your existing GraphQL queries and grocery app.

## 🚀 Features

### ✅ **Voice Commands Supported**
- **Order Products**: "Order 2 milk", "Buy bread", "Purchase eggs"
- **Search Shops**: "Find restaurants", "Search for bakeries", "Look for butchers"
- **Navigation**: "Go to profile", "Show my cart", "Open orders"
- **Cart Management**: "Show cart", "Checkout", "View basket"

### 🎯 **Smart Intent Recognition**
- **Product Detection**: Automatically identifies products from voice input
- **Quantity Extraction**: Parses numbers from voice commands
- **Shop Categorization**: Matches voice queries to shop categories
- **Navigation Mapping**: Routes voice commands to appropriate pages

### 🔄 **Real-time Processing**
- **Live Transcript**: See what you're saying in real-time
- **Instant Feedback**: Get immediate responses to voice commands
- **Order Confirmation**: Visual confirmation before adding to cart
- **Error Handling**: Graceful fallbacks for unrecognized commands

## 🛠️ Technical Implementation

### 📁 **API Endpoints**

#### `/api/voice/recognize`
- **Purpose**: Process voice commands and return structured responses
- **Input**: Text transcript from speech recognition
- **Output**: Parsed intent, entities, and suggested actions
- **Integration**: Connects to existing GraphQL queries

#### `/api/voice/confirm-order`
- **Purpose**: Confirm voice orders and add items to cart
- **Input**: Product ID, quantity, user ID, confirmation status
- **Output**: Cart update confirmation
- **Integration**: Uses existing cart mutation queries

#### `/api/voice/speak` (Future)
- **Purpose**: Text-to-speech response generation
- **Input**: Text to convert to speech
- **Output**: Audio file or stream
- **Integration**: Ready for Kokoro TTS integration

### 🎨 **UI Components**

#### `AIVoiceButton.tsx`
- **Draggable Results Panel**: Shows voice recognition results
- **Real-time Status**: Visual feedback for listening/processing states
- **Order Confirmation**: Interactive product confirmation interface
- **Command Suggestions**: Helpful voice command examples

### 🔗 **GraphQL Integration**

#### **Existing Queries Used**
```graphql
# Product Search
query GetProductsByName($name: String!) {
  Products(where: {name: {_ilike: $name}, is_active: {_eq: true}}) {
    id, name, description, price, final_price, image, shop_id, quantity, measurement_unit
  }
}

# Shop Search
query GetShopsByCategory($category: String!) {
  Shops(where: {description: {_ilike: $category}, is_active: {_eq: true}}) {
    id, name, description, address, image, latitude, longitude
  }
}

# Cart Operations
mutation AddToCart($product_id: String!, $quantity: Int!, $user_id: String!) {
  insert_Cart_Items_one(object: {product_id: $product_id, quantity: $quantity, user_id: $user_id}) {
    id, product_id, quantity, created_at
  }
}
```

## 🎯 **Voice Command Examples**

### 🛒 **Ordering Products**
```
"Order 2 milk"           → Finds milk, shows confirmation
"Buy bread"              → Finds bread, quantity defaults to 1
"Purchase 3 eggs"        → Finds eggs, sets quantity to 3
"Get some vegetables"    → Searches for vegetable products
```

### 🏪 **Finding Shops**
```
"Find restaurants"       → Shows nearby restaurants
"Search for bakeries"    → Displays bakery shops
"Look for butchers"      → Finds butcher shops
"Show me stores"         → Lists all active shops
```

### 🧭 **Navigation**
```
"Go to profile"          → Navigates to user profile
"Show my cart"           → Opens cart page
"Open orders"            → Goes to orders page
"Take me home"           → Returns to home page
```

## 🔧 **Setup Instructions**

### 1. **Install Dependencies**
```bash
# Install voice processing tools
npm run setup-voice

# Or manually install
npm install @stt/coqui-stt-node
npm install -g kokoro-tts
```

### 2. **Download STT Models** (Optional)
```bash
# Create models directory
mkdir -p models/coqui-stt

# Download Coqui STT model
# Visit: https://coqui.ai/models
# Download and place in models/coqui-stt/
```

### 3. **Environment Setup**
```bash
# Add to your .env file
VOICE_ENABLED=true
STT_MODEL_PATH=./models/coqui-stt/model.tflite
TTS_VOICE=en-US
```

### 4. **Start Development**
```bash
npm run dev
```

## 🎨 **UI Customization**

### **Voice Button States**
- **Idle**: Green border, AI icon
- **Listening**: Red pulsing, microphone icon
- **Processing**: Yellow spinning, loading icon

### **Results Panel Sections**
- **Live Transcript**: Real-time voice input display
- **Processing Status**: Current operation feedback
- **Assistant Response**: Parsed command results
- **Order Confirmation**: Product confirmation interface
- **Command Suggestions**: Helpful voice examples

## 🔮 **Future Enhancements**

### **Advanced STT Integration**
```typescript
// Replace simple text parser with Coqui STT
import { STT } from '@stt/coqui-stt-node';

const model = new STT(modelPath);
const audioBuffer = await getAudioFromMicrophone();
const text = model.stt(audioBuffer);
```

### **TTS Response Generation**
```typescript
// Add voice responses using Kokoro TTS
import { exec } from 'child_process';

const generateSpeech = (text: string) => {
  const cmd = `kokoro-tts "${text}" --output /tmp/response.wav`;
  exec(cmd, (err) => {
    if (!err) {
      // Play audio response
      playAudio('/tmp/response.wav');
    }
  });
};
```

### **Advanced NLP Features**
- **Context Awareness**: Remember previous commands
- **Product Synonyms**: "milk" = "dairy", "bread" = "loaf"
- **Smart Suggestions**: Learn from user preferences
- **Multi-language Support**: Spanish, French, etc.

## 🧪 **Testing Voice Commands**

### **Test Scenarios**
1. **Basic Navigation**: "Go to profile" → Should navigate to profile page
2. **Product Search**: "Order milk" → Should find milk products
3. **Quantity Parsing**: "Buy 3 eggs" → Should set quantity to 3
4. **Shop Search**: "Find restaurants" → Should show restaurant shops
5. **Cart Operations**: "Show my cart" → Should open cart page

### **Error Handling**
- **Unrecognized Commands**: Graceful fallback with suggestions
- **Network Errors**: Retry mechanisms and user feedback
- **Audio Issues**: Fallback to text input
- **Database Errors**: Proper error messages and recovery

## 📱 **Mobile Optimization**

### **Touch-Friendly Interface**
- **Large Buttons**: Easy to tap on mobile devices
- **Swipe Gestures**: Swipe to dismiss results panel
- **Voice Feedback**: Haptic feedback for interactions
- **Accessibility**: Screen reader support and ARIA labels

### **Performance Considerations**
- **Audio Streaming**: Efficient audio processing
- **Memory Management**: Proper cleanup of audio resources
- **Battery Optimization**: Minimize background processing
- **Network Efficiency**: Optimized API calls

## 🔒 **Security & Privacy**

### **Data Protection**
- **Local Processing**: Voice data processed locally when possible
- **Secure Transmission**: Encrypted API communications
- **User Consent**: Clear privacy policy and consent
- **Data Retention**: Minimal data storage and retention

### **Access Control**
- **User Authentication**: Session-based access control
- **Rate Limiting**: Prevent abuse of voice APIs
- **Input Validation**: Sanitize all voice inputs
- **Error Logging**: Secure error reporting

## 🎯 **Integration Points**

### **Existing App Features**
- **Cart System**: Seamless integration with existing cart
- **User Authentication**: Uses existing session management
- **Product Database**: Leverages existing product queries
- **Shop Directory**: Integrates with shop search functionality

### **Future Integrations**
- **Payment Processing**: Voice payment confirmation
- **Order Tracking**: Voice status updates
- **Delivery Updates**: Voice delivery notifications
- **Customer Support**: Voice-based help system

---

## 🚀 **Getting Started**

1. **Clone and Setup**: Follow the setup instructions above
2. **Test Basic Commands**: Try "Go to profile" and "Show my cart"
3. **Test Product Orders**: Try "Order milk" and "Buy bread"
4. **Customize Commands**: Add your own voice command patterns
5. **Deploy**: Deploy to your production environment

The voice ordering system is now fully integrated with your existing grocery app! 🎉 