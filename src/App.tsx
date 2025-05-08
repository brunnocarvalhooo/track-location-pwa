// src/App.tsx
import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

function App() {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [realTimeLocation, setRealTimeLocation] = useState<Location | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const requestLocationPermissionAndStartWatching = async () => {
      if (navigator.geolocation) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' } as PermissionDescriptor);
          if (permission.state === 'prompt' || permission.state === 'granted') {
            setLocationError(null);
            const id = navigator.geolocation.watchPosition(
              (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const timestamp = position.timestamp;
                const currentLocation: Location = { latitude, longitude, accuracy, timestamp };

                setRealTimeLocation(currentLocation);
                setLocationHistory((prevHistory) => [...prevHistory, currentLocation]);

                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'backgroundLocationUpdate',
                    payload: currentLocation,
                  });
                }
              },
              (error) => {
                console.error('Erro ao obter localização:', error);
                setLocationError(error.message);
                setPermissionGranted(false);
              },
              {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 60000,
              }
            );
            setWatchId(id);
            setPermissionGranted(true);
          } else if (permission.state === 'denied') {
            console.log('Permissão de geolocalização negada.');
            setPermissionGranted(false);
            setLocationError('Permissão de geolocalização negada.');
          }
        } catch (error) {
          console.error('Erro ao verificar/solicitar permissão de geolocalização:', error);
          setLocationError('Erro ao verificar a permissão de geolocalização.');
          setPermissionGranted(false);
        }
      } else {
        console.error('Geolocalização não é suportada neste navegador.');
        setLocationError('Geolocalização não é suportada neste navegador.');
        setPermissionGranted(false);
      }
    };

    requestLocationPermissionAndStartWatching();

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div>
      <h1>Rastreamento de Carga em Tempo Real</h1>
      {permissionGranted === null && <p>Solicitando permissão de geolocalização...</p>}
      {permissionGranted === true && (
        <div>
          <p>Permissão de geolocalização concedida!</p>
          {realTimeLocation && (
            <p>
              Localização atual: Latitude: {realTimeLocation.latitude.toFixed(6)}, Longitude: {realTimeLocation.longitude.toFixed(6)}, Precisão: {realTimeLocation.accuracy.toFixed(2)}m, Timestamp: {new Date(realTimeLocation.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}
      {permissionGranted === false && <p>Permissão de geolocalização negada.</p>}

      {locationError && <p style={{ color: 'red' }}>Erro de localização: {locationError}</p>}

      <h2>Histórico de Localizações</h2>
      {locationHistory.length > 0 ? (
        <ul>
          {locationHistory.map((loc, index) => (
            <li key={index}>
              Latitude: {loc.latitude.toFixed(6)}, Longitude: {loc.longitude.toFixed(6)}, Timestamp: {new Date(loc.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma localização no histórico ainda.</p>
      )}
    </div>
  );
}

export default App;