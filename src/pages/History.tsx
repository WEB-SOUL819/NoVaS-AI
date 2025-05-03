import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getConversationHistory, getConversationMessages, deleteConversation } from "@/utils/historyUtils";
import { Conversation, Message } from "@/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { History as HistoryIcon, Search, Trash2, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MessageBubble from "@/components/MessageBubble";

const History: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const history = await getConversationHistory(user.id);
      setConversations(history);
      setIsLoading(false);
    };
    
    loadConversations();
  }, [user]);
  
  const handleSelectConversation = async (conversation: Conversation) => {
    // If messages are already loaded, just select the conversation
    if (conversation.messages && conversation.messages.length > 0) {
      setSelectedConversation(conversation);
      return;
    }
    
    // Otherwise load messages first
    setIsLoading(true);
    const messages = await getConversationMessages(conversation.id);
    
    // Update the conversation with messages
    const updatedConversation = { ...conversation, messages };
    
    // Update in the conversations list
    setConversations(prevConversations => 
      prevConversations.map(c => 
        c.id === conversation.id ? updatedConversation : c
      )
    );
    
    // Set as selected
    setSelectedConversation(updatedConversation);
    setIsLoading(false);
  };
  
  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }
    
    const success = await deleteConversation(conversationId);
    
    if (success) {
      // Remove from state
      setConversations(prevConversations => 
        prevConversations.filter(c => c.id !== conversationId)
      );
      
      // Clear selection if deleted conversation is selected
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      
      toast.success("Conversation deleted successfully");
    }
  };
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex items-center mb-6">
        <HistoryIcon className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Conversation History</h1>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
            <div className="h-4 w-32 bg-primary/20 rounded"></div>
          </div>
        </div>
      ) : (
        <div className={`grid gap-6 ${isMobile ? "" : "grid-cols-3"}`}>
          {isMobile ? (
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Conversations</TabsTrigger>
                <TabsTrigger value="detail" disabled={!selectedConversation}>Messages</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No conversations found</h3>
                    <p className="text-muted-foreground">
                      {conversations.length === 0 
                        ? "Start a conversation on the dashboard" 
                        : "No results matching your search"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map(conversation => (
                      <Card 
                        key={conversation.id} 
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selectedConversation?.id === conversation.id ? "border-primary" : ""
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{conversation.title}</CardTitle>
                          <CardDescription>
                            {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="detail">
                {selectedConversation && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">{selectedConversation.title}</h2>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedConversation(null)}
                      >
                        Back to List
                      </Button>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      {selectedConversation.messages.map((message: Message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <div className="col-span-1">
                <h2 className="text-xl font-semibold mb-4">Conversations</h2>
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No conversations found</h3>
                    <p className="text-muted-foreground">
                      {conversations.length === 0 
                        ? "Start a conversation on the dashboard" 
                        : "No results matching your search"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-2 max-h-[70vh] overflow-y-auto">
                    {filteredConversations.map(conversation => (
                      <Card 
                        key={conversation.id} 
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selectedConversation?.id === conversation.id ? "border-primary" : ""
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{conversation.title}</CardTitle>
                          <CardDescription>
                            {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="col-span-2 border rounded-lg p-6">
                {selectedConversation ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h2 className="text-xl font-semibold">{selectedConversation.title}</h2>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedConversation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-h-[65vh] overflow-y-auto px-2">
                      {selectedConversation.messages.map((message: Message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">Select a conversation</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                      Choose a conversation from the list to view the messages
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default History;
