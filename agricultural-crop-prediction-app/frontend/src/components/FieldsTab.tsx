import { useState } from 'react';
import { useGetFieldsByUser, useAddField } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FieldMap from './FieldMap';
import type { Field } from '../backend';

export default function FieldsTab() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal();
  const { data: fields, isLoading } = useGetFieldsByUser(userId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Fields</h2>
          <p className="text-sm text-muted-foreground">Manage your agricultural fields and locations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
            </DialogHeader>
            <AddFieldForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Map View */}
      <Card>
        <CardHeader>
          <CardTitle>Field Locations & Weather</CardTitle>
          <CardDescription>
            Interactive map showing your fields. Drag the blue marker to check weather at different locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldMap fields={fields || []} onFieldSelect={setSelectedField} />
        </CardContent>
      </Card>

      {/* Fields List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fields?.map((field) => (
          <Card
            key={field.id.toString()}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => setSelectedField(field)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {field.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{field.notes || 'No notes'}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Lat: {field.location.latitude.toFixed(4)}</span>
                <span>Lng: {field.location.longitude.toFixed(4)}</span>
              </div>
              {field.weatherData && (
                <p className="text-xs text-muted-foreground">Weather: {field.weatherData}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {fields?.length === 0 && (
        <div className="py-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No fields yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Add your first field to get started</p>
        </div>
      )}
    </div>
  );
}

function AddFieldForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const addField = useAddField();

  const handleGetLocation = () => {
    setUseCurrentLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setUseCurrentLocation(false);
          toast.success('Location retrieved successfully');
        },
        (error) => {
          setUseCurrentLocation(false);
          toast.error('Failed to get location: ' + error.message);
        }
      );
    } else {
      setUseCurrentLocation(false);
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !latitude || !longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Invalid coordinates');
      return;
    }

    try {
      await addField.mutateAsync({
        name: name.trim(),
        location: { latitude: lat, longitude: lng },
        notes: notes.trim(),
      });
      toast.success('Field added successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add field');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fieldName">Field Name *</Label>
        <Input
          id="fieldName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., North Field"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional information about this field"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Location *</Label>
        <Button type="button" variant="outline" onClick={handleGetLocation} disabled={useCurrentLocation} className="w-full">
          {useCurrentLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Use Current Location
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude *</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g., 20.5937"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude *</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g., 78.9629"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={addField.isPending}>
        {addField.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Field
      </Button>
    </form>
  );
}
