import { submitFormToKommo } from './kommo-webhook';

// Registrar interceptores de formularios
export function setupFormIntegrations() {
  // Esperar a que el DOM cargue
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerForms);
  } else {
    registerForms();
  }
}

function registerForms() {
  // Formulario de contacto
  const contactForm = document.querySelector('form') as HTMLFormElement;
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      const isContactForm = contactForm.querySelector('[name="nombreCompleto"]') !== null;
      if (isContactForm) {
        // Obtenemos los campos del formulario, normalmente sin prevenir default si no es necesario,
        // pero podemos obtener la información. Asumimos formData regular.
        const formData = new FormData(contactForm);
        await submitFormToKommo({
          type: 'contact',
          data: Object.fromEntries(formData)
        });
      }
    });
  }
}
