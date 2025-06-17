/**
 * Moodboard Export Script
 * Handles the automatic and manual printing functionality for the moodboard
 */

window.addEventListener('DOMContentLoaded', () => {
    // Manual print button handler
    const printButton = document.getElementById('manualPrintBtn');
    if (printButton) {
      printButton.addEventListener('click', () => window.print());
    }
  
    // Auto-trigger print after a short delay
    setTimeout(() => {
      window.print();
    }, 1000);
  });
  