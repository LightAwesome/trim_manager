// FILE: src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Unprocessed from './pages/Unprocessed';
import Processed from './pages/Processed';
import Trims from './pages/Trims';
import Aliases from './pages/Aliases';
import Toast from './components/ui/Toast';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="unprocessed" element={<Unprocessed />} />
          <Route path="processed" element={<Processed />} />
          <Route path="trims" element={<Trims />} />
          <Route path="aliases" element={<Aliases />} />
        </Route>
      </Routes>
      <Toast />
    </>
  );
}

export default App;
