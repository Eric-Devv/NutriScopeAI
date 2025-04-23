import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Send } from 'lucide-react-native';
import { getChatResponse } from '@/services/openai';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Nutrition Assistant. I can help you with nutrition information, diet advice, recipe ideas, and more. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Format messages for the OpenAI API
      const formattedMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));
      
      // Add system message for context
      formattedMessages.unshift({
        role: 'system',
        content: 'You are a knowledgeable nutrition assistant designed to provide accurate, helpful nutrition and dietary advice. You can explain nutritional concepts, provide information about foods, suggest recipes, and give wellness tips. Always provide evidence-based information and clarify when there are multiple perspectives or ongoing research on a topic. Be conversational, friendly, and engaging. If asked about specific medical conditions, remind the user that you are not a medical professional and they should consult with their healthcare provider.'
      });
      
      // Add the new user message
      formattedMessages.push({
        role: 'user',
        content: input.trim(),
      });
      
      const response = await getChatResponse(formattedMessages);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>AI Nutritionist</Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <Animated.View
            key={message.id}
            entering={FadeInDown.delay(index * 100).duration(300)}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? 
                [styles.userBubble, { backgroundColor: theme.primary }] : 
                [styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.divider }]
            ]}
          >
            {message.sender === 'ai' && (
              <View style={styles.aiAvatarContainer}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/8851097/pexels-photo-8851097.jpeg' }} 
                  style={styles.aiAvatar} 
                />
              </View>
            )}
            <View style={[
              styles.messageContent,
              message.sender === 'user' ? styles.userMessageContent : styles.aiMessageContent
            ]}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? 
                  styles.userMessageText : 
                  [styles.aiMessageText, { color: theme.textPrimary }]
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.timestamp,
                message.sender === 'user' ? 
                  [styles.userTimestamp, { color: 'rgba(255,255,255,0.7)' }] : 
                  { color: theme.textSecondary }
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </Animated.View>
        ))}
        
        {isLoading && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.divider }]}
          >
            <View style={styles.aiAvatarContainer}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/8851097/pexels-photo-8851097.jpeg' }} 
                style={styles.aiAvatar} 
              />
            </View>
            <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
              <View style={styles.loadingDots}>
                <LoadingDot delay={0} theme={theme} />
                <LoadingDot delay={300} theme={theme} />
                <LoadingDot delay={600} theme={theme} />
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
      
      <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.divider }]}
          placeholder="Ask anything about nutrition..."
          placeholderTextColor={theme.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: theme.primary }]}
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function LoadingDot({ delay, theme }: { delay: number; theme: any }) {
  return (
    <Animated.View 
      style={[styles.loadingDot, { backgroundColor: theme.primary }]}
    />
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    marginBottom: 16,
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  aiAvatarContainer: {
    marginRight: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageContent: {
    flex: 1,
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  aiMessageContent: {
    alignItems: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  userTimestamp: {
    textAlign: 'right',
  },
  loadingContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 120,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});