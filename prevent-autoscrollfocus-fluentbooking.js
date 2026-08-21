(function () {
  'use strict';

  let hasUserInteracted = false;

  // 1. Prüfen, ob der Nutzer bereits selbst agiert hat (Scrollen, Klick, Touch, Tastatur)
  function markInteraction() {
    if (hasUserInteracted) return;
    hasUserInteracted = true;
    removeInteractionListeners();
  }

  function removeInteractionListeners() {
    window.removeEventListener('scroll', markInteraction);
    window.removeEventListener('mousedown', markInteraction);
    window.removeEventListener('touchstart', markInteraction);
    window.removeEventListener('keydown', markInteraction);
  }

  window.addEventListener('scroll', markInteraction, { passive: true, once: true });
  window.addEventListener('mousedown', markInteraction, { passive: true, once: true });
  window.addEventListener('touchstart', markInteraction, { passive: true, once: true });
  window.addEventListener('keydown', markInteraction, { passive: true, once: true });

  // 2. Programmatische focus()-Aufrufe von FluentBooking abfangen & Scrollen verhindern
  const originalFocus = HTMLElement.prototype.focus;

  HTMLElement.prototype.focus = function (options) {
    const isBookingElement = this.closest && this.closest('.fcal_booking_form, .fluent-booking-app, .fluent_booking_wrapper');

    if (isBookingElement && !hasUserInteracted) {
      const updatedOptions = typeof options === 'object' && options !== null ? options : {};
      updatedOptions.preventScroll = true; // Verhindert das automatische Herunterscrollen des Browsers

      originalFocus.call(this, updatedOptions);
      this.blur(); // Entfernt den Fokus wieder vom Feld
      return;
    }

    return originalFocus.call(this, options);
  };

  // 3. Sicherheitsnetz für focusin-Events (z. B. bei nativem HTML autofocus)
  document.addEventListener('focusin', function (e) {
    if (hasUserInteracted) return;

    const isBookingField = e.target && e.target.closest && e.target.closest('.fcal_booking_form, .fluent-booking-app, .fluent_booking_wrapper');

    if (isBookingField) {
      e.target.blur();
    }
  }, true);
})();
