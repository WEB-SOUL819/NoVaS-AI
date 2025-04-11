
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, MessageSquare, Calendar } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { format } from "date-fns";
import { toast } from "sonner";

const History = () => {
  const { conversations, isLoading, fetchConversations, fetchMessages, setActiveConversation, deleteConversation } = useConversations();
  
  // Fetch conversations when the component mounts
  useEffect(() => {
    fetchConversations();
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nova-600"></div>
      </div>
    );
  }
  
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await deleteConversation(id);
      toast.success("Conversation deleted successfully");
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-4">
      <header className="container mx-auto py-4">
        <Link to="/dashboard" className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </header>
      
      <main className="container mx-auto max-w-4xl py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Conversation History</h1>
          <p className="text-muted-foreground">Browse and manage your past conversations</p>
        </div>
        
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">Start a conversation from the dashboard to see it here.</p>
                <Button className="mt-4 nova-gradient" asChild>
                  <Link to="/dashboard">Start Conversation</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conversation) => (
              <Card key={conversation.id} className="glass-panel hover:bg-card/60 transition-colors">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{conversation.title || "Untitled Conversation"}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(conversation.createdAt), "PPP")}
                        <span className="mx-2">•</span>
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {conversation.messages?.length || 0} messages
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-4 pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/dashboard?conversation=${conversation.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Continue Conversation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
