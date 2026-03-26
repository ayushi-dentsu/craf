import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<div>Executive Dashboard</div>} />
      <Route path="/login" element={<div>Login</div>} />
    </Routes>
  );
}

export default App;
