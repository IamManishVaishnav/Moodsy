// DOM Elements
const imageGrid = document.getElementById('imageGrid');
const folderFilter = document.getElementById('folderFilter');
const newFolderInput = document.getElementById('newFolderInput');
const createFolderBtn = document.getElementById('createFolderBtn');
const createMoodboardBtn = document.getElementById('createMoodboardBtn');

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
  loadImages();
  loadFolders();
  setupEventListeners();
});

// Load saved images from storage
function loadImages() {
  chrome.storage.local.get(['images', 'folders'], (result) => {
    const images = result.images || [];
    const currentFolder = folderFilter.value;
    
    // Clear existing images
    imageGrid.innerHTML = '';
    
    // Filter images by selected folder
    const filteredImages = currentFolder === 'all' 
      ? images 
      : images.filter(img => img.folder === currentFolder);
    
    // Create image cards
    filteredImages.forEach((image, index) => {
      createImageCard(image, index);
    });
  });
}

// Load folders into the filter dropdown
function loadFolders() {
  chrome.storage.local.get('folders', (result) => {
    const folders = result.folders || ['Unsorted'];
    folderFilter.innerHTML = '<option value="all">All Folders</option>';
    
    folders.forEach(folder => {
      const option = document.createElement('option');
      option.value = folder;
      option.textContent = folder;
      folderFilter.appendChild(option);
    });
  });
}

// Create an image card element
function createImageCard(image, index) {
  const card = document.createElement('div');
  card.className = 'image-card';
  
  card.innerHTML = `
    <img src="${image.url}" alt="Saved inspiration">
    <button class="delete-btn" ><i class="fas fa-trash"></i></button>
    <div class="image-actions">
      <select class="folder-select">
        <option value="Unsorted">Unsorted</option>
      </select>
      <input type="text" class="tags-input" placeholder="Add tags (comma-separated)" value="${image.tags.join(', ')}">
    </div>
  `;
  // Add event listeners
  const deleteBtn = card.querySelector('.delete-btn');
  const folderSelect = card.querySelector('.folder-select');
  const tagsInput = card.querySelector('.tags-input');
  
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event bubbling
    deleteImage(index);
  });
  
  folderSelect.addEventListener('change', (e) => updateImageFolder(index, e.target.value));
  tagsInput.addEventListener('change', (e) => updateImageTags(index, e.target.value));
  
  // Load folders into the select
  chrome.storage.local.get('folders', (result) => {
    const folders = result.folders || ['Unsorted'];
    folderSelect.innerHTML = folders.map(folder => 
      `<option value="${folder}" ${folder === image.folder ? 'selected' : ''}>${folder}</option>`
    ).join('');
  });
  
  imageGrid.appendChild(card);
}

// Delete an image
function deleteImage(index) {
  chrome.storage.local.get('images', (result) => {
    const images = result.images || [];
    images.splice(index, 1);
    chrome.storage.local.set({ images }, () => loadImages());
  });
}

// Update image folder
function updateImageFolder(index, folder) {
  chrome.storage.local.get('images', (result) => {
    const images = result.images || [];
    images[index].folder = folder;
    chrome.storage.local.set({ images });
  });
}

// Update image tags
function updateImageTags(index, tags) {
  chrome.storage.local.get('images', (result) => {
    const images = result.images || [];
    images[index].tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    chrome.storage.local.set({ images });
  });
}

// Create a new folder
function createNewFolder() {
  const folderName = newFolderInput.value.trim();
  if (!folderName) return;
  
  chrome.storage.local.get('folders', (result) => {
    const folders = result.folders || ['Unsorted'];
    if (!folders.includes(folderName)) {
      folders.push(folderName);
      chrome.storage.local.set({ folders }, () => {
        loadFolders();
        newFolderInput.value = '';
      });
    }
  });
}

// Create moodboard
function createMoodboard() {
  chrome.storage.local.get(['images', 'folders'], (result) => {
    const images = result.images || [];
    const folders = result.folders || ['Unsorted'];
    
    // Group images by folder
    const imagesByFolder = {};
    folders.forEach(folder => {
      imagesByFolder[folder] = images.filter(img => img.folder === folder);
    });
    
    const moodboardUrl = URL.createObjectURL(new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inspo Collector Moodboard</title>
        <style>
          /* =======================
             Base Styles
          ======================= */
          body {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px;
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #1a1a1a;
            color: #e0e0e0;
          }

          /* =======================
             Container
          ======================= */
          .moodboard-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
            background-color: #2d2d2d;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          /* =======================
             Header
          ======================= */
          .moodboard-header {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding-bottom: 20px;
            border-bottom: 1px solid #404040;
          }

          .moodboard-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .moodboard-header p {
            color: #999;
            font-size: 16px;
          }

          /* =======================
             Folder Sections
          ======================= */
          .folder-section {
            margin-bottom: 32px;
          }

          .folder-title {
            color: #4CAF50;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #4CAF50;
            text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
          }

          /* =======================
             Moodboard Grid
          ======================= */
          .moodboard {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          /* =======================
             Moodboard Item
          ======================= */
          .moodboard-item {
            position: relative;
            border: 1px solid #404040;
            border-radius: 10px;
            overflow: hidden;
            background-color: #333333;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .moodboard-item:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            border-color: #4CAF50;
          }

          .moodboard-item img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            display: block;
            transition: transform 0.5s ease;
          }

          .moodboard-item:hover img {
            transform: scale(1.1);
          }

          /* =======================
             Image Info
          ======================= */
          .image-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            padding: 20px;
            color: white;
            opacity: 0;
            transition: all 0.3s ease;
            transform: translateY(20px);
          }

          .moodboard-item:hover .image-info {
            opacity: 1;
            transform: translateY(0);
          }

          /* =======================
             Tags
          ======================= */
          .image-tags {
            font-size: 14px;
            margin-top: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .tag {
            background-color: rgba(76, 175, 80, 0.3);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
          }

          .tag:hover {
            background-color: rgba(76, 175, 80, 0.5);
            transform: translateY(-2px);
          }

          /* =======================
             Empty State
          ======================= */
          .empty-folder {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 30px;
            background-color: #333333;
            border-radius: 8px;
            border: 1px dashed #404040;
          }

          /* =======================
             Scrollbar
          ======================= */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #2d2d2d;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: #404040;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #4CAF50;
          }

          /* =======================
             Responsive Design
          ======================= */
          @media (max-width: 768px) {
            body {
              padding: 20px;
            }

            .moodboard {
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            }
          }

          @media (max-width: 480px) {
            .moodboard {
              grid-template-columns: 1fr;
            }
          }

          /* =======================
             Animations
          ======================= */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .moodboard-item {
            animation: fadeIn 0.5s ease forwards;
            opacity: 0;
          }

          .moodboard-item:nth-child(1) { animation-delay: 0.1s; }
          .moodboard-item:nth-child(2) { animation-delay: 0.2s; }
          .moodboard-item:nth-child(3) { animation-delay: 0.3s; }
          .moodboard-item:nth-child(4) { animation-delay: 0.4s; }
          .moodboard-item:nth-child(5) { animation-delay: 0.5s; }
          .moodboard-item:nth-child(6) { animation-delay: 0.6s; }
          .moodboard-item:nth-child(7) { animation-delay: 0.7s; }
          .moodboard-item:nth-child(8) { animation-delay: 0.8s; }
        </style>
      </head>
      <body>
        <div class="moodboard-container">
          <div class="moodboard-header">
            <h1>Inspiration Moodboard</h1>
            <p>Your collected visual inspiration organized by folders</p>
          </div>
          ${folders.map(folder => `
            <div class="folder-section">
              <h2 class="folder-title">${folder}</h2>
              ${imagesByFolder[folder].length > 0 ? `
                <div class="moodboard">
                  ${imagesByFolder[folder].map(img => `
                    <div class="moodboard-item">
                      <img src="${img.url}" alt="Inspiration">
                      <div class="image-info">
                        ${img.tags.length > 0 ? `
                          <div class="image-tags">
                            ${img.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="empty-folder">
                  No images in this folder yet
                </div>
              `}
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `], { type: 'text/html' }));
    
    chrome.tabs.create({ url: moodboardUrl });
  });
}

// Setup event listeners
function setupEventListeners() {
  createFolderBtn.addEventListener('click', createNewFolder);
  folderFilter.addEventListener('change', loadImages);
  createMoodboardBtn.addEventListener('click', createMoodboard);
} 