/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GITHUB_CLIENT_ID: string;
    // Agrega aquí otras variables de entorno que uses
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }