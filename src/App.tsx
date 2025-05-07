import './global.css'
import './app.css'
import { useState } from 'react'

function App() {
  const [tracking, setTracking] = useState(false)
  const [logs, setLogs] = useState<{ lat: number, long: number, timestamp: number }[]>([])

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.')
      return
    }

    setTracking(true)

    navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const long = pos.coords.longitude
        const timestamp = pos.timestamp

        setLogs(prevLogs => [...prevLogs, { lat, long, timestamp }])
      },
      (err) => {
        console.error(err)
        alert('Erro ao acessar localização.')
        setTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    )
  }

  return (
    <div className="tracking-container">
      <h1>📍 Rastreamento</h1>

      {!tracking ? (
        <button className="start-button" onClick={startTracking}>
          Iniciar Rastreamento
        </button>
      ) : (
        <p className="status">✅ Rastreamento Ativado</p>
      )}

      <div className="logs">
        <h2>Logs de Localização</h2>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              Latitude: {log.lat.toFixed(6)}, Longitude: {log.long.toFixed(6)}, Horário: {new Date(log.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
