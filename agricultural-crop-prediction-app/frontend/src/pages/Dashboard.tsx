import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Sprout, Camera, MessageSquare } from 'lucide-react';
import FieldsTab from '../components/FieldsTab';
import PredictionsTab from '../components/PredictionsTab';
import DiseaseTab from '../components/DiseaseTab';
import ChatbotTab from '../components/ChatbotTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('fields');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Manage your fields, predictions, and get AI-powered insights</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fields" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Fields</span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Sprout className="h-4 w-4" />
            <span className="hidden sm:inline">Predictions</span>
          </TabsTrigger>
          <TabsTrigger value="disease" className="gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Disease Scan</span>
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="mt-6">
          <FieldsTab />
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          <PredictionsTab />
        </TabsContent>

        <TabsContent value="disease" className="mt-6">
          <DiseaseTab />
        </TabsContent>

        <TabsContent value="chatbot" className="mt-6">
          <ChatbotTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
