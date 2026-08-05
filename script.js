// Build the gallery from the image files that are actually available in the assets folder.
// Fixed for Vercel deployment - using the exact filenames that exist on disk.
const availableFiles = [
  "1.JPG", "2.JPG", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg",
  "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg",
  "21.jpg", "22.jpg", "23.jpg", "24.jpg", "25.jpg", "26.jpg", "27.jpg", "28.jpg", "29.jpg", "30.jpg",
  "31.jpg", "32.jpg", "33.jpg", "34.jpg", "35.jpg", "36.jpg", "37.jpg", "38.jpg", "39.jpg", "40.jpg",
  "41.jpg", "42.jpg", "43.jpg", "44.jpg", "45.jpg", "46.jpg", "47.jpg", "48.jpg", "49.jpg", "50.jpg",
  "51.png", "52.jpg", "53.jpg", "54.jpg", "55.jpg", "56.jpg", "57.jpg", "58.jpg", "60.jpg", "61.jpg"
].sort((a, b) => {
  const numA = parseInt(a, 10);
  const numB = parseInt(b, 10);
  return numA - numB;
});

// Try multiple path variations for Vercel compatibility
function getImagePath(filename) {
  const paths = [
    `/assets/${filename}`,
    `./assets/${filename}`,
    `assets/${filename}`
  ];
  return paths[0];
}

const galleryItems = availableFiles.map((file, index) => ({
  id: index + 1,
  src: getImagePath(file),
  title: `Image ${index + 1}`,
  filename: file
}));

const galleryGrid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeLightboxButton = document.getElementById("closeLightbox");
const prevButton = document.getElementById("prevImage");
const nextButton = document.getElementById("nextImage");

let visibleItems = [...galleryItems];
let currentIndex = 0;
let isLoading = false;

// Check if image exists with better error handling
function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    // Timeout for slow loading
    setTimeout(() => resolve(false), 3000);
  });
}

// Filter out missing images for Vercel
async function filterExistingImages() {
  const results = await Promise.all(
    galleryItems.map(async (item) => {
      const exists = await imageExists(item.src);
      // If not found, try alternative path (without ./)
      if (!exists && item.src.startsWith('./')) {
        const altPath = item.src.replace('./', '');
        const altExists = await imageExists(altPath);
        if (altExists) {
          return { ...item, src: altPath };
        }
      }
      return exists ? item : null;
    })
  );
  return results.filter(item => item !== null);
}

function renderGallery() {
  galleryGrid.innerHTML = "";

  if (visibleItems.length === 0) {
    // Show fallback message if no images found
    galleryGrid.innerHTML = `
      <div class="error-message">
        <p>No images found. Please check the assets folder.</p>
        <p style="font-size: 0.9rem; color: #666;">Make sure images are in the /assets/ directory</p>
      </div>
    `;
    return;
  }

  visibleItems.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.innerHTML = `
      <img 
        src="${item.src}" 
        alt="${item.title}" 
        loading="lazy" 
        decoding="async"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div class="gallery-card__caption">
        <h2>${item.title}</h2>
      </div>
    `;

    card.addEventListener("click", () => openLightbox(index));
    galleryGrid.appendChild(card);
  });
}

function openLightbox(index) {
  if (isLoading) return;
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function updateLightbox() {
  const item = visibleItems[currentIndex];
  if (!item) return;

  // Show loading state
  isLoading = true;
  lightboxImage.style.opacity = '0.5';
  lightboxCaption.textContent = 'Loading...';

  // Preload image before showing
  const img = new Image();
  img.onload = () => {
    lightboxImage.src = item.src;
    lightboxImage.alt = item.title;
    lightboxImage.style.opacity = '1';
    lightboxCaption.textContent = `${item.title} (${currentIndex + 1}/${visibleItems.length})`;
    isLoading = false;
  };
  img.onerror = () => {
    // Try alternative path if main fails
    const altSrc = item.src.replace('./assets/', 'assets/');
    if (altSrc !== item.src) {
      img.src = altSrc;
    } else {
      lightboxCaption.textContent = 'Image not found';
      isLoading = false;
    }
  };
  img.src = item.src;
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  isLoading = false;
}

function showPreviousImage() {
  if (visibleItems.length === 0 || isLoading) return;
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  updateLightbox();
}

function showNextImage() {
  if (visibleItems.length === 0 || isLoading) return;
  currentIndex = (currentIndex + 1) % visibleItems.length;
  updateLightbox();
}

// Event Listeners
closeLightboxButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", showPreviousImage);
nextButton.addEventListener("click", showNextImage);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    showPreviousImage();
  } else if (event.key === "ArrowRight") {
    showNextImage();
  }
});

// Initialize with error handling
async function initGallery() {
  try {
    // Try to filter existing images
    const existingItems = await filterExistingImages();
    if (existingItems.length > 0) {
      visibleItems = existingItems;
    } else {
      // If no images found via async check, try synchronous approach
      console.warn('Async image check failed, using fallback');
    }
    renderGallery();
  } catch (error) {
    console.warn('Error initializing gallery:', error);
    // Fallback: render with all items
    renderGallery();
  }
}

// Start the gallery
initGallery();