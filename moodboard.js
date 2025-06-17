/**
 * Moodsy Moodboard Main Script
 * Handles the display and organization of moodboard images and folders
 */

document.addEventListener('DOMContentLoaded', () => {
    // Fetch stored images and folders from Chrome storage
    chrome.storage.local.get(['images', 'folders'], (result) => {
      const images = result.images || [];
      const folders = result.folders || ['Unsorted'];
      const content = document.getElementById('moodboardContent');
      const exportAllBtn = document.getElementById('exportAll');
  
      // Export all folders when clicked
      // exportAllBtn.addEventListener('click', () => exportMoodboard('all', images, folders));
  
      // Render each folder section
      folders.forEach(folder => {
        const folderImages = images.filter(img => img.folder === folder);
        const section = document.createElement('div');
        section.className = 'folder-section';
        section.innerHTML = `
          <h2 class="folder-title">${folder}</h2>
          
          ${folderImages.length > 0
            ? `<div class="moodboard">${folderImages.map(img => `
                <div class="moodboard-item">
                  <img src="${img.url}" alt="Inspiration">
                  ${img.tags.length > 0 ? `
                    <div class="image-tags">
                      ${img.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>` : ''}
                </div>`).join('')}
              </div>`
            : `<div class="empty-folder">No images in this folder yet</div>`
          }
        `;
        content.appendChild(section);
      });
    });
  });
  
  /**
   * Export moodboard functionality (currently commented out)
   * This section contains the code for exporting moodboards to PDF
   * Uncomment and implement when needed
   */
  
  /*
  function exportMoodboard(type, images, folders) {
    let exportImages = [];
  
    if (type === 'all') {
      exportImages = images;
    } else if (type === 'folder') {
      const folder = event.target.closest('.folder-section').querySelector('h2').textContent;
      exportImages = images.filter(img => img.folder === folder);
    }
  
    if (exportImages.length === 0) {
      alert('No images to export');
      return;
    }
  
    const exportHtmlContent = generateExportHtml(
      exportImages, 
      folders, 
      type === 'all' ? null : event.target.closest('.folder-section').querySelector('h2').textContent
    );
  
    const blob = new Blob([exportHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
  }
  
  function generateExportHtml(images, folders, currentFolder = null) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Moodsy Moodboard Export</title>
        <link rel="stylesheet" href="${chrome.runtime.getURL('moodboard.css')}">
        <style>
          @media print {
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button id="manualPrintBtn">Print / Save as PDF</button>
          </div>
          ${currentFolder
            ? generateFolderSection(currentFolder, images)
            : folders.map(folder => 
                generateFolderSection(folder, images.filter(img => img.folder === folder))
              ).join('')
          }
        </div>
        <script src="${chrome.runtime.getURL('moodboard-export.js')}"></script>
      </body>
      </html>
    `;
  }
  
  function generateFolderSection(folder, images) {
    return `
      <div class="folder-section">
        <h2 class="folder-title">${folder}</h2>
        <div class="image-grid">
          ${images.map(img => `
            <div class="image-item">
              <img src="${img.url}" alt="Inspiration">
              ${img.tags.length > 0 
                ? `<div class="image-tags">
                    ${img.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                  </div>`
                : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  */
  
  