// public/serviceWorkerRegistration.js
export function register() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("Service Worker registrado con éxito:", registration);
          })
          .catch((error) => {
            console.log("Error al registrar el Service Worker:", error);
          });
      });
    }
  }
  
  export function unregister() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error("Error al desregistrar el Service Worker:", error);
        });
    }
  }
  