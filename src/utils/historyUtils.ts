
import { supabase } from "@/integrations/supabase/client";
import { Message, Conversation, MessageRole } from "@/types";
import { toast } from "sonner";

/**
 * Retrieve conversation history for a user
 */
export async function getConversationHistory(userId: string): Promise<Conversation[]> {
  try {
    if (!userId) return [];
    
    // Get all conversations for the user
    const { data: conversations, error: convoError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (convoError) throw convoError;
    
    if (!conversations || conversations.length === 0) {
      return [];
    }
    
    // Format the conversations
    const formattedConversations: Conversation[] = conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      messages: [], // We'll load messages only when needed
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at)
    }));
    
    return formattedConversations;
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    toast.error("Failed to load conversation history");
    return [];
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    if (!conversationId) return [];
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
      
    if (error) throw error;
    
    if (!messages || messages.length === 0) {
      return [];
    }
    
    // Format the messages
    const formattedMessages: Message[] = messages.map(msg => ({
      id: msg.id,
      role: msg.role as MessageRole, // Cast the role to MessageRole type
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
    
    return formattedMessages;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    toast.error("Failed to load conversation messages");
    return [];
  }
}

/**
 * Save a new conversation
 */
export async function saveConversation(userId: string, title: string): Promise<string | null> {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        { user_id: userId, title }
      ])
      .select('id')
      .single();
      
    if (error) throw error;
    
    return data?.id || null;
  } catch (error) {
    console.error("Error saving conversation:", error);
    toast.error("Failed to save conversation");
    return null;
  }
}

/**
 * Save a message to a conversation
 */
export async function saveMessage(
  conversationId: string, 
  role: string, 
  content: string
): Promise<string | null> {
  try {
    if (!conversationId) return null;
    
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          conversation_id: conversationId, 
          role, 
          content,
          timestamp: new Date().toISOString()
        }
      ])
      .select('id')
      .single();
      
    if (error) throw error;
    
    // Update the conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    return data?.id || null;
  } catch (error) {
    console.error("Error saving message:", error);
    return null;
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    if (!conversationId) return false;
    
    // Supabase will cascade delete messages due to foreign key constraint
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    toast.error("Failed to delete conversation");
    return false;
  }
}
