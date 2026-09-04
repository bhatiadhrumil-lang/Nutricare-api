import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Login from './Login';
import Signup from './Signup';
import VerifyEmail from './VerifyEmail';
import Dashboard from './Dashboard';
import Processing from './Processing';
import Results from './Results';
import HealthTips from './HealthTips';
import Assistant from './Assistant';
import Account from './Account';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/upload" element={<Dashboard />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/recovery" element={<Results />} />
          <Route path="/health-tips" element={<HealthTips />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
