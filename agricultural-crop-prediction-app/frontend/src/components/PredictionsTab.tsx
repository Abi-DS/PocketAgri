import { useState } from 'react';
import { useGetFieldsByUser, useGetPredictionsByField, useMakePrediction } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sprout, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Field } from '../backend';

export default function PredictionsTab() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal();
  const { data: fields, isLoading: fieldsLoading } = useGetFieldsByUser(userId);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const selectedField = fields?.find((f) => f.id.toString() === selectedFieldId);
  const { data: predictions, isLoading: predictionsLoading } = useGetPredictionsByField(
    selectedFieldId ? BigInt(selectedFieldId) : undefined
  );

  if (fieldsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="py-12 text-center">
        <Sprout className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No fields available</h3>
        <p className="mt-2 text-sm text-muted-foreground">Add a field first to make crop predictions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Crop Predictions</h2>
          <p className="text-sm text-muted-foreground">AI-powered crop recommendations for your fields</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!fields || fields.length === 0}>
              <Sprout className="h-4 w-4" />
              New Prediction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make Crop Prediction</DialogTitle>
            </DialogHeader>
            <PredictionForm fields={fields} onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Field Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Field</CardTitle>
          <CardDescription>Choose a field to view its crop predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedFieldId} onValueChange={setSelectedFieldId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id.toString()} value={field.id.toString()}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Predictions List */}
      {selectedFieldId && (
        <div className="space-y-4">
          {predictionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : predictions && predictions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {predictions.map((prediction) => (
                <Card key={prediction.id.toString()}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-primary" />
                      {prediction.crop}
                    </CardTitle>
                    <CardDescription>
                      {new Date(Number(prediction.timestamp) / 1000000).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Suitability Score: {prediction.suitabilityScore.toString()}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{prediction.recommendations}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Sprout className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No predictions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Make your first prediction for {selectedField?.name}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PredictionForm({ fields, onSuccess }: { fields: Field[]; onSuccess: () => void }) {
  const [fieldId, setFieldId] = useState('');
  const [crop, setCrop] = useState('');
  const makePrediction = useMakePrediction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId || !crop.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await makePrediction.mutateAsync({
        fieldId: BigInt(fieldId),
        crop: crop.trim(),
      });
      toast.success('Prediction created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create prediction');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="predictionField">Field *</Label>
        <Select value={fieldId} onValueChange={setFieldId}>
          <SelectTrigger id="predictionField">
            <SelectValue placeholder="Select a field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((field) => (
              <SelectItem key={field.id.toString()} value={field.id.toString()}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crop">Crop Type *</Label>
        <Input
          id="crop"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          placeholder="e.g., Wheat, Corn, Rice"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={makePrediction.isPending}>
        {makePrediction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Prediction
      </Button>
    </form>
  );
}
