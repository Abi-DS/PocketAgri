import { useState, useRef, useEffect } from 'react';
import { useGetChatHistory, useSendMessage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatbotTab() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal();
  const { data: chatHistory, isLoading } = useGetChatHistory(userId);
  const sendMessage = useSendMessage();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');

    try {
      await sendMessage.mutateAsync(userMessage);
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const suggestedQuestions = [
    'What is the best time to plant wheat?',
    'How do I control aphids on my crops?',
    'What are the signs of nitrogen deficiency in soil?',
    'How often should I irrigate corn fields?',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">AI Farming Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Get expert advice on planting, pest control, and soil management
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat with AgriBot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollRef}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : chatHistory && chatHistory.length > 0 ? (
              <div className="space-y-4 pb-4">
                {chatHistory.map((msg) => (
                  <div key={msg.id.toString()} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">You</p>
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(msg.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Simulated bot response */}
                {chatHistory.length > 0 && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">AgriBot</p>
                      <p className="text-sm text-muted-foreground">
                        Thank you for your question! I'm here to help with agricultural advice. Based on your query,
                        I recommend consulting with local agricultural extension services for region-specific guidance.
                        Feel free to ask more questions!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 py-8">
                <div className="text-center">
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Start a conversation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ask me anything about farming, crops, or agriculture
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Suggested questions:</p>
                  <div className="grid gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(question)}
                        className="rounded-lg border bg-card p-3 text-left text-sm text-card-foreground transition-colors hover:bg-accent"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about planting, pest control, soil management..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={sendMessage.isPending || !message.trim()}>
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
