declare global {
  interface Window {
    CONNECTION : WebSocket
  }
}

// Adding this exports the declaration file which Typescript/CRA can now pickup:
export {}