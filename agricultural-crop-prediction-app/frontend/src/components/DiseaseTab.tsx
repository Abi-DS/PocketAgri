import { useState, useRef } from 'react';
import { useGetFieldsByUser, useGetDiseasesByUser, useUploadScan } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Camera, Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import type { Field } from '../backend';

export default function DiseaseTab() {
  const { identity } = useInternetIdentity();
  const userId = identity?.getPrincipal();
  const { data: fields, isLoading: fieldsLoading } = useGetFieldsByUser(userId);
  const { data: scans, isLoading: scansLoading } = useGetDiseasesByUser(userId);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  if (fieldsLoading || scansLoading) {
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
          <h2 className="text-2xl font-bold text-foreground">Disease Detection</h2>
          <p className="text-sm text-muted-foreground">Upload crop images to identify diseases</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!fields || fields.length === 0}>
              <Camera className="h-4 w-4" />
              Scan Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Crop Image</DialogTitle>
            </DialogHeader>
            <ScanForm fields={fields || []} onSuccess={() => setIsUploadDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Scans List */}
      {scans && scans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scans.map((scan) => {
            const field = fields?.find((f) => f.id === scan.fieldId);
            return (
              <Card key={scan.id.toString()}>
                <CardHeader>
                  <CardTitle className="text-base">{scan.plantType}</CardTitle>
                  <CardDescription>
                    {field?.name} • {new Date(Number(scan.timestamp) / 1000000).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <img
                    src={scan.image.getDirectURL()}
                    alt={scan.plantType}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  {scan.disease && (
                    <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-orange-600" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{scan.disease}</p>
                        {scan.severity && <p className="text-muted-foreground">Severity: {scan.severity}</p>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No scans yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload your first crop image to detect diseases</p>
        </div>
      )}
    </div>
  );
}

function ScanForm({ fields, onSuccess }: { fields: Field[]; onSuccess: () => void }) {
  const [fieldId, setFieldId] = useState('');
  const [plantType, setPlantType] = useState('');
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadScan = useUploadScan();

  const handleStartCamera = async () => {
    setUseCamera(true);
    setIsStartingCamera(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStartingCamera(false);
    } catch (error: any) {
      setUseCamera(false);
      setIsStartingCamera(false);
      let errorMessage = 'Failed to access camera';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found';
      }
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setUseCamera(false);
    setCameraError(null);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        setCapturedImage(file);
        handleStopCamera();
        toast.success('Photo captured!');
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setCapturedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId || !plantType.trim() || !capturedImage) {
      toast.error('Please fill in all fields and capture/upload an image');
      return;
    }

    try {
      const bytes = new Uint8Array(await capturedImage.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadScan.mutateAsync({
        fieldId: BigInt(fieldId),
        plantType: plantType.trim(),
        image: blob,
      });

      toast.success('Scan uploaded successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to upload scan');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scanField">Field *</Label>
        <Select value={fieldId} onValueChange={setFieldId}>
          <SelectTrigger id="scanField">
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
        <Label htmlFor="plantType">Plant Type *</Label>
        <Input
          id="plantType"
          value={plantType}
          onChange={(e) => setPlantType(e.target.value)}
          placeholder="e.g., Tomato, Wheat, Corn"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Image *</Label>
        {!capturedImage && !useCamera && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleStartCamera} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Use Camera
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {useCamera && (
          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-lg border">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-64 w-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            {cameraError && (
              <p className="text-sm text-destructive">Camera error: {cameraError}</p>
            )}
            <div className="flex gap-2">
              <Button type="button" onClick={handleCapture} disabled={!cameraStream || isStartingCamera} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
              <Button type="button" variant="outline" onClick={handleStopCamera}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {capturedImage && !useCamera && (
          <div className="space-y-2">
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="Captured"
              className="h-64 w-full rounded-lg border object-cover"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setCapturedImage(null)}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Remove Image
            </Button>
          </div>
        )}
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={uploadScan.isPending || !capturedImage}>
        {uploadScan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Upload Scan
      </Button>
    </form>
  );
}
