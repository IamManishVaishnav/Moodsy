window.addEventListener('DOMContentLoaded', () => {
    // Manual fallback
    const btn = document.getElementById('manualPrintBtn');
    if (btn) {
      btn.addEventListener('click', () => window.print());
    }
  
    // Auto trigger print after short delay
    setTimeout(() => {
      window.print();
    }, 1000);
  });
  