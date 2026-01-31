import { useEffect, useRef, useState } from 'react';
import type { Field } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface FieldMapProps {
  fields: Field[];
  onFieldSelect?: (field: Field) => void;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location: {
    lat: number;
    lng: number;
  };
}

export default function FieldMap({ fields, onFieldSelect }: FieldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const userMarkerRef = useRef<any>(null);

  // Calculate map bounds
  const bounds = fields.length > 0 ? {
    minLat: Math.min(...fields.map(f => f.location.latitude)),
    maxLat: Math.max(...fields.map(f => f.location.latitude)),
    minLng: Math.min(...fields.map(f => f.location.longitude)),
    maxLng: Math.max(...fields.map(f => f.location.longitude)),
  } : null;

  const center = bounds ? {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  } : { lat: 20.5937, lng: 78.9629 }; // Center of India

  const fetchWeatherData = async (lat: number, lng: number) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    
    try {
      // WeatherAPI.com free tier API key (you should replace this with your own)
      const apiKey = 'f8c0c1e3b8f44d9a8d5155431242901';
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lng}&aqi=no`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      setWeatherData({
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        condition: data.current.condition.text,
        location: { lat, lng },
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherError('Unable to fetch weather data');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Add Leaflet CSS if not already added
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Add Leaflet script if not already added
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Leaflet'));
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Remove existing map if any
      const existingMap = (mapRef.current as any)._leaflet_map;
      if (existingMap) {
        existingMap.remove();
      }

      // Create map
      const map = L.map(mapRef.current).setView([center.lat, center.lng], fields.length > 0 ? 12 : 5);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Get user's current location and add draggable marker
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Create custom icon for user marker
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            // Add draggable user marker
            userMarkerRef.current = L.marker([userLat, userLng], {
              icon: userIcon,
              draggable: true,
              title: 'Your Location (Drag to move)',
            }).addTo(map);

            // Fetch weather for initial position
            fetchWeatherData(userLat, userLng);

            // Update weather when marker is dragged
            userMarkerRef.current.on('dragend', function(e: any) {
              const position = e.target.getLatLng();
              fetchWeatherData(position.lat, position.lng);
            });

            // Center map on user location if no fields
            if (fields.length === 0) {
              map.setView([userLat, userLng], 10);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            // Fallback to India center with default marker
            const defaultLat = 20.5937;
            const defaultLng = 78.9629;

            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            userMarkerRef.current = L.marker([defaultLat, defaultLng], {
              icon: userIcon,
              draggable: true,
              title: 'Your Location (Drag to move)',
            }).addTo(map);

            fetchWeatherData(defaultLat, defaultLng);

            userMarkerRef.current.on('dragend', function(e: any) {
              const position = e.target.getLatLng();
              fetchWeatherData(position.lat, position.lng);
            });
          }
        );
      }

      // Add field markers
      fields.forEach((field: Field) => {
        const fieldIcon = L.divIcon({
          className: 'custom-field-marker',
          html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([field.location.latitude, field.location.longitude], {
          icon: fieldIcon,
        })
          .addTo(map)
          .bindPopup(`<strong>${field.name}</strong><br/>${field.notes || 'No notes'}`);

        marker.on('click', () => {
          setSelectedField(field);
          if (onFieldSelect) {
            onFieldSelect(field);
          }
        });
      });

      // Fit bounds if multiple fields
      if (fields.length > 1 && bounds) {
        map.fitBounds([
          [bounds.minLat, bounds.minLng],
          [bounds.maxLat, bounds.maxLng]
        ], { padding: [50, 50] });
      }
    };

    loadLeaflet().catch(error => {
      console.error('Failed to load map:', error);
    });
  }, [fields, onFieldSelect, center.lat, center.lng, bounds]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div ref={mapRef} className="h-96 w-full rounded-lg border" />
        {fields.length === 0 && !weatherData && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/50 pointer-events-none">
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}
      </div>

      {/* Weather Info Panel */}
      {weatherData && (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Current Weather
                </h3>
                {isLoadingWeather && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">Location</p>
                  <p className="text-blue-900 dark:text-blue-100 font-mono text-xs">
                    {weatherData.location.lat.toFixed(4)}, {weatherData.location.lng.toFixed(4)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">Condition</p>
                  <p className="text-blue-900 dark:text-blue-100">{weatherData.condition}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">Temperature</p>
                  <p className="text-blue-900 dark:text-blue-100 text-2xl font-bold">
                    {weatherData.temperature}°C
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">Humidity</p>
                  <p className="text-blue-900 dark:text-blue-100 text-2xl font-bold">
                    {weatherData.humidity}%
                  </p>
                </div>
              </div>

              <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                Drag the blue marker to update weather for a different location
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {weatherError && (
        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700 dark:text-red-300">{weatherError}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
