/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
