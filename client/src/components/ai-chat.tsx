import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIChatProps {
  propertyId: string;
}

export default function AIChat({ propertyId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. I can help answer questions about this property. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(newMessage),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("price") || message.includes("cost")) {
      return "The property is listed at $729,000. This price reflects the recent renovations and prime location. Would you like to know about financing options or comparable properties in the area?";
    }
    
    if (message.includes("school") || message.includes("education")) {
      return "The property is in an excellent school district! Lincoln Elementary (9/10), Jefferson Middle (8/10), and Washington High (9/10) all serve this area. The schools are highly rated for both academics and extracurriculars.";
    }
    
    if (message.includes("neighborhood") || message.includes("area")) {
      return "This is a highly desirable neighborhood known for its tree-lined streets, family-friendly atmosphere, and convenient location. You'll find parks, shopping centers, and excellent restaurants within walking distance.";
    }
    
    if (message.includes("tour") || message.includes("visit")) {
      return "I'd be happy to help you schedule a tour! You can book a virtual tour, in-person showing, or 3D walkthrough. Would you prefer to speak with the listing agent Sarah Johnson directly, or would you like me to connect you?";
    }
    
    if (message.includes("kitchen") || message.includes("appliances")) {
      return "The kitchen was completely renovated in 2023 with high-end finishes including quartz countertops, stainless steel appliances, and custom cabinetry. It features a large island perfect for entertaining and opens to the family room.";
    }
    
    return "Thank you for your question! For detailed information about this property, I recommend speaking with listing agent Sarah Johnson. She can provide comprehensive answers and schedule a showing. Would you like me to connect you with her?";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
          <Bot className="h-4 w-4 mr-2" />
          Ask AI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-500" />
            AI Property Assistant
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-ladybug text-white"
                      : "bg-gray-100 text-dark-gray"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "ai" && (
                      <Bot className="h-4 w-4 mt-0.5 text-blue-500" />
                    )}
                    {message.sender === "user" && (
                      <User className="h-4 w-4 mt-0.5" />
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex space-x-2 pt-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask about this property..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" className="ladybug-primary">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
