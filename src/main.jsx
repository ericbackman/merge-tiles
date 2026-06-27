import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// NOTE: We intentionally do NOT wrap <App /> in <React.StrictMode> here.
// StrictMode double-invokes reducers in development to surface impure logic.
// Our game's spawnTile() is *deliberately* impure (it places a random tile),
// so the double-invoke would make new tiles appear unpredictably in dev only.
// Keeping it out avoids that confusion. (Everything stays pure except spawn.)
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
