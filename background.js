// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Create the context menu item
  chrome.contextMenus.create({
    id: "saveToInspoCollector",
    title: "Save to Inspo Collector",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveToInspoCollector") {
    // Get the image URL
    const imageUrl = info.srcUrl;
    
    // Get current storage data
    chrome.storage.local.get(['images', 'folders'], (result) => {
      const images = result.images || [];
      const folders = result.folders || ['Unsorted'];
      
      // Create new image object
      const newImage = {
        url: imageUrl,
        folder: 'Unsorted',
        tags: [],
        timestamp: new Date().toISOString()
      };
      
      // Add new image to storage
      chrome.storage.local.set({
        images: [...images, newImage],
        folders: folders
      });
    });
  }
}); 