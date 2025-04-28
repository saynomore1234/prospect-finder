// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // 📌 Correct router imports
import './App.css'; // 🎨 Optional for later custom styles
import ProspectFinder from './pages/ProspectFinder'; // 🧠 Import our main search page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🛤️ Route the homepage "/" to ProspectFinder page */}
        <Route path="/" element={<ProspectFinder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;