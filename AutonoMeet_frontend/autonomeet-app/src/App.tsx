import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { GoogleOAuthProvider } from '@react-oauth/google';



const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


const App = () => {
  return (
    <div className="app">
      <GoogleOAuthProvider clientId={clientId}>
          <AppRoutes />
      </GoogleOAuthProvider>
    </div>
  );
};

export default App;
