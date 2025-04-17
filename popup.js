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
    <div class="image-wrapper">
      <img src="${image.url}" alt="Saved inspiration">
      <button class="delete-btn">Remove</button>
    </div>
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
  chrome.tabs.create({ url: chrome.runtime.getURL('moodboard.html') });
}

// Setup event listeners
function setupEventListeners() {
  const newFolderBtn = document.getElementById('newFolderBtn');
  const newFolderContainer = document.getElementById('newFolderContainer');
  
  newFolderBtn.addEventListener('click', () => {
    newFolderContainer.style.display = 'flex';
    newFolderInput.focus();
  });
  
  createFolderBtn.addEventListener('click', () => {
    createNewFolder();
    newFolderContainer.style.display = 'none';
  });
  
  folderFilter.addEventListener('change', loadImages);
  createMoodboardBtn.addEventListener('click', createMoodboard);
}
