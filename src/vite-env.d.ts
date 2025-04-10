/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_JWT_TOKEN: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
} 