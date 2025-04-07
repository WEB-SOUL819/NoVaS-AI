
import { useState, useEffect } from "react";
import { Conversation, Message } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    fetchConversations();
    
    // Subscribe to conversation updates
    const channel = supabase
      .channel('public:conversations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedConversations: Conversation[] = (data || []).map((convo: any) => ({
        id: convo.id,
        title: convo.title,
        messages: [],
        createdAt: new Date(convo.created_at),
        updatedAt: new Date(convo.updated_at)
      }));
      
      setConversations(formattedConversations);
      
      // Set active conversation to the most recent one if none is selected
      if (!activeConversation && formattedConversations.length > 0) {
        await fetchMessages(formattedConversations[0].id);
      }
    } catch (error: any) {
      toast.error("Error loading conversations: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;
    
    try {
      setIsLoadingMessages(true);
      
      // Find the conversation
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      // Get messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      
      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as Message['role'],
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));
      
      // Update the conversation with messages
      const updatedConversation = {
        ...conversation,
        messages: formattedMessages
      };
      
      setActiveConversation(updatedConversation);
    } catch (error: any) {
      toast.error("Error loading messages: " + error.message);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const createConversation = async (title: string = "New Conversation") => {
    if (!user) return;
    
    try {
      // Insert the new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: user.id, title }])
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newConversation: Conversation = {
          id: data.id,
          title: data.title,
          messages: [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        
        setConversations([newConversation, ...conversations]);
        setActiveConversation(newConversation);
        
        return newConversation;
      }
      return null;
    } catch (error: any) {
      toast.error("Error creating conversation: " + error.message);
      return null;
    }
  };

  const addMessage = async (content: string, role: Message['role'] = 'user') => {
    if (!user || !activeConversation) {
      // Create a new conversation if none exists
      const newConversation = await createConversation();
      if (!newConversation) return null;
    }
    
    const conversationId = activeConversation?.id;
    if (!conversationId) return null;
    
    try {
      // Generate a temporary ID for optimistic UI updates
      const tempId = uuidv4();
      const messageTime = new Date();
      
      // Create a temporary message for the UI
      const tempMessage: Message = {
        id: tempId,
        role,
        content,
        timestamp: messageTime,
        isProcessing: true
      };
      
      // Optimistically update the UI
      if (activeConversation) {
        const updatedConversation = {
          ...activeConversation,
          messages: [...activeConversation.messages, tempMessage]
        };
        setActiveConversation(updatedConversation);
      }
      
      // Save the message to the database
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          role,
          content,
          timestamp: messageTime.toISOString()
        }])
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Update the conversation with the real message
      if (activeConversation && data) {
        const realMessage: Message = {
          id: data.id,
          role: data.role,
          content: data.content,
          timestamp: new Date(data.timestamp)
        };
        
        const updatedMessages = activeConversation.messages.map(msg => 
          msg.id === tempId ? realMessage : msg
        );
        
        const updatedConversation = {
          ...activeConversation,
          messages: updatedMessages
        };
        
        setActiveConversation(updatedConversation);
      }
      
      // Update the conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      return data;
    } catch (error: any) {
      toast.error("Error sending message: " + error.message);
      
      // Remove the optimistic message on error
      if (activeConversation) {
        const updatedMessages = activeConversation.messages.filter(
          msg => !msg.isProcessing
        );
        
        const updatedConversation = {
          ...activeConversation,
          messages: updatedMessages
        };
        
        setActiveConversation(updatedConversation);
      }
      
      return null;
    }
  };

  const updateConversationTitle = async (id: string, newTitle: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setConversations(conversations.map(conversation => 
        conversation.id === id 
          ? { ...conversation, title: newTitle } 
          : conversation
      ));
      
      if (activeConversation?.id === id) {
        setActiveConversation({
          ...activeConversation,
          title: newTitle
        });
      }
      
      toast.success("Conversation renamed successfully.");
    } catch (error: any) {
      toast.error("Error renaming conversation: " + error.message);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const updatedConversations = conversations.filter(
        conversation => conversation.id !== id
      );
      
      setConversations(updatedConversations);
      
      // If the active conversation was deleted, set a new active conversation
      if (activeConversation?.id === id) {
        if (updatedConversations.length > 0) {
          await fetchMessages(updatedConversations[0].id);
        } else {
          setActiveConversation(null);
        }
      }
      
      toast.success("Conversation deleted successfully.");
    } catch (error: any) {
      toast.error("Error deleting conversation: " + error.message);
    }
  };

  return {
    conversations,
    activeConversation,
    isLoading,
    isLoadingMessages,
    fetchMessages,
    setActiveConversation,
    createConversation,
    addMessage,
    updateConversationTitle,
    deleteConversation
  };
};
