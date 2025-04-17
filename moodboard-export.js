window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.print();
    }, 500); // delay ensures images load
  });
  

  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('manualPrintBtn');
    if (btn) {
      btn.addEventListener('click', () => window.print());
    }
  
    setTimeout(() => {
      window.print();
    }, 500);
  });
  