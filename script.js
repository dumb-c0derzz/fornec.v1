/**********************
 * Global Variables
 **********************/
let portraitImages = [];   // For index page: { original, display, orientation }
let landscapeImages = [];  // For index page: { original, display, orientation }
let allImages = [];        // Combined images for index (load order)
let renderedImages = [];   // Rendered images for index (display order)
let renderedFavImages = []; // Rendered images for favorites page (display order)
let imagesPerRow = 5;      // Computed dynamically
let currentImageIndex = -1; // Index in renderedImages for popup (index page)
let currentFavIndex = -1;   // Index in renderedFavImages for popup (favorites page)
const batchSize = 20;      // Number of images to load per batch
let slideshowInterval = null; // For slideshow auto-advance

// LocalStorage-based authentication & favorites.
let favoriteImages = [];   // Favorite image URLs (original)
let currentUser = null;    // Logged-in username

// Base image URLs.
const baseLinks = [
  "https://i.imx.to/i/2025/02/10/5x0999.jpg",
  "https://i.imx.to/i/2025/02/22/5y8s3x.jpg",
  "https://i004.imx.to/i/2023/11/28/4f8p5h.jpg",
  "https://i.imx.to/i/2025/02/25/5yi4uv.jpg",
  "https://i.imx.to/i/2025/02/25/5yjoua.jpg",
  "https://i.imx.to/i/2025/02/22/5y7zew.jpg",
  "https://i.imx.to/i/2025/02/22/5yaq3u.jpg",
  "https://i006.imx.to/i/2024/07/02/59v2iw.jpg",
  "https://i004.imx.to/i/2024/02/14/4ortlj.jpg",
  "https://i006.imx.to/i/2025/01/02/5t2x1g.jpg",
  "https://i.imx.to/i/2025/02/23/5ycbbi.jpg",
  "https://i004.imx.to/i/2024/03/18/4u0sjf.jpg",
  "https://i006.imx.to/i/2024/06/07/56s6xi.jpg",
  "https://i006.imx.to/i/2024/08/20/5f36v9.jpg",
  "https://i006.imx.to/i/2024/11/20/5o27t5.jpg",
  "https://i004.imx.to/i/2024/01/31/4mvi0a.jpg",
  "https://i004.imx.to/i/2024/02/02/4n2a7w.jpg",
  "https://i.imx.to/i/2025/02/24/5ygir6.jpg",
  "https://i004.imx.to/i/2024/04/02/4waca4.jpg",
  "https://i.imx.to/i/2025/02/23/5ycemp.jpg",
  "https://i003.imx.to/i/2022/07/22/39yo5m.jpg",
  "https://i006.imx.to/i/2024/11/01/5ljhe3.jpg",
  "https://i004.imx.to/i/2023/11/28/4f8p5h.jpg",
  "https://i.imx.to/i/2025/02/10/5x0999.jpg",
  "https://i.imx.to/i/2025/02/22/5y8s3x.jpg"
];

const allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";

/**********************
 * Utility Functions
 **********************/
function debounce(func, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), delay);
  };
}

function computeImagesPerRow() {
  let container = document.getElementById("imagesGrid") || document.getElementById("favoritesGrid");
  if (!container) {
    console.error("No gallery container found.");
    return 1;
  }
  const count = Math.floor(container.offsetWidth / 220);
  return count > 0 ? count : 1;
}

function generateRandomString(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allowedChars.length);
    result += allowedChars[randomIndex];
  }
  return result;
}

function modifyLink(link) {
  const jpgIndex = link.lastIndexOf(".jpg");
  if (jpgIndex === -1) return link;
  const basePart = link.substring(0, jpgIndex);
  const newBase = basePart.slice(0, -3);
  const randomSuffix = generateRandomString(3);
  return newBase + randomSuffix + ".jpg";
}

function isFavoritesPage() {
  return document.getElementById("favoritesGrid") !== null;
}

/**********************
 * Favorites Functions (Global Scope)
 **********************/
// Shared between grid and popup.
async function toggleFavorite(url, favBtn) {
  if (!currentUser) {
    alert("Please log in to save favorites.");
    return;
  }
  const idx = favoriteImages.indexOf(url);
  if (idx === -1) {
    favoriteImages.push(url);
    favBtn.classList.add("favorite");
  } else {
    favoriteImages.splice(idx, 1);
    favBtn.classList.remove("favorite");
  }
  const userKey = "user_" + currentUser;
  let userData = JSON.parse(localStorage.getItem(userKey)) || { favorites: [] };
  userData.favorites = favoriteImages;
  localStorage.setItem(userKey, JSON.stringify(userData));
  console.log("Favorite images updated:", favoriteImages);
  // No need to update any popup icon here now that we are removing it.
}

/**********************
 * DOMContentLoaded Initialization
 **********************/
document.addEventListener("DOMContentLoaded", function () {
  // --- Persistent Login ---
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = storedUser;
    const authArea = document.getElementById("authArea");
    if (authArea) authArea.style.display = "none";
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    const userDataStr = localStorage.getItem("user_" + currentUser);
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      favoriteImages = userData.favorites || [];
    }
  }

  // --- Theme Toggle (only on home page) ---
  const themeToggle = document.getElementById("themeSwitch");
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.checked = true;
  }
  if (themeToggle) {
    themeToggle.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // --- Hamburger Menu ---
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", function (e) {
      e.stopPropagation();
      const navMenu = document.getElementById("navMenu");
      if (navMenu) {
        navMenu.classList.toggle("open");
      }
    });
  }
  document.addEventListener("click", function (e) {
    const navMenu = document.getElementById("navMenu");
    const hamburger = document.getElementById("hamburgerMenu");
    if (navMenu && navMenu.classList.contains("open") &&
        !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove("open");
    }
  });

  // --- Modal Close on Outside Click ---
  const loginModal = document.getElementById("loginModal");
  if (loginModal) {
    loginModal.addEventListener("click", function (e) {
      if (e.target === loginModal) {
        loginModal.style.display = "none";
      }
    });
  }
  const signupModal = document.getElementById("signupModal");
  if (signupModal) {
    signupModal.addEventListener("click", function (e) {
      if (e.target === signupModal) {
        signupModal.style.display = "none";
      }
    });
  }

  // --- Mobile Header Adjustment ---
  function adjustHeaderForMobile() {
    const headerControls = document.querySelector(".header-controls");
    if (headerControls) {
      if (window.innerWidth < 768) {
        headerControls.classList.add("mobile-header");
      } else {
        headerControls.classList.remove("mobile-header");
      }
    }
  }
  adjustHeaderForMobile();
  window.addEventListener("resize", adjustHeaderForMobile);

  // Note: The popup heart icon is now removed.
  // --- Render Favorites Gallery on Favorites Page ---
  if (document.getElementById("favoritesGrid")) {
    renderFavoritesGallery();
  }
});

/**********************
 * Index Page Image Generation & Grouping
 **********************/
function loadNextBatch() {
  imagesPerRow = computeImagesPerRow();
  for (let i = 0; i < batchSize; i++) {
    const randomBase = baseLinks[Math.floor(Math.random() * baseLinks.length)];
    const original = modifyLink(randomBase);
    const display = original.replace("/i/", "/t/");
    
    const thumbImg = new Image();
    thumbImg.src = display;
    
    thumbImg.onload = function() {
      // Use a heuristic: if the thumbnail is small (e.g., less than 150px)
      // and perfectly square, then consider it an error placeholder.
      if (
        thumbImg.naturalWidth < 150 &&
        thumbImg.naturalHeight < 150 &&
        thumbImg.naturalWidth === thumbImg.naturalHeight
      ) {
        console.error("Discarding error placeholder image: " + display);
        return; // Skip adding this candidate.
      }
      
      // Determine orientation based on thumbnail dimensions.
      const orientation = (thumbImg.naturalWidth >= thumbImg.naturalHeight) ? "landscape" : "portrait";
      const candidate = { original, display, orientation };
      
      // Add candidate to global arrays.
      if (orientation === "landscape") {
        landscapeImages.push(candidate);
      } else {
        portraitImages.push(candidate);
      }
      allImages.push(candidate);
      
      // Render the gallery (you might call this once per batch instead)
      renderGallery();
    };
    
    thumbImg.onerror = function() {
      console.error("Thumbnail failed to load: " + display);
      // Skip candidate if thumbnail cannot be loaded.
    };
  }
}


function renderGallery() {
  const gallery = document.getElementById("imagesGrid");
  // Append complete rows for portrait images.
  while (portraitImages.length - renderedImages.filter(img => img.orientation === "portrait").length >= imagesPerRow) {
    const startIdx = renderedImages.filter(img => img.orientation === "portrait").length;
    const rowImages = portraitImages.slice(startIdx, startIdx + imagesPerRow);
    appendRow(rowImages);
  }
  // Append complete rows for landscape images.
  while (landscapeImages.length - renderedImages.filter(img => img.orientation === "landscape").length >= imagesPerRow) {
    const startIdx = renderedImages.filter(img => img.orientation === "landscape").length;
    const rowImages = landscapeImages.slice(startIdx, startIdx + imagesPerRow);
    appendRow(rowImages);
  }
}

function appendRow(imagesArray) {
  const rowDiv = document.createElement("div");
  rowDiv.className = "gallery-row";
  imagesArray.forEach((imgData) => {
    const index = renderedImages.length; // Global index in display order.
    const container = createImageContainer(imgData, index);
    rowDiv.appendChild(container);
    renderedImages.push(imgData);
  });
  document.getElementById("imagesGrid").appendChild(rowDiv);
}

function createImageContainer(imgData, globalIndex) {
  const container = document.createElement("div");
  container.className = "image-container";
  
  const img = document.createElement("img");
  img.src = imgData.display;
  img.alt = "Generated Image";
  img.dataset.display = imgData.display;
  img.dataset.original = imgData.original;
  img.dataset.orientation = imgData.orientation;
  img.dataset.index = globalIndex; // Save global index
  
  let hoverTimeout;
  img.addEventListener("mouseenter", () => {
    hoverTimeout = setTimeout(() => {
      img.src = img.dataset.original;
      // Mark that this image has permanently switched
      img.dataset.converted = "true";
    }, 5);
  });
  img.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    // If not yet converted, revert back to thumbnail version
    if (img.dataset.converted !== "true") {
      img.src = img.dataset.display;
    }
  });
  
  img.addEventListener("click", () => {
    currentImageIndex = parseInt(img.dataset.index);
    openPopup(currentImageIndex);
  });
  
  // Favorite button for index page remains unchanged.
  const favBtn = document.createElement("span");
  favBtn.className = "favorite-btn";
  favBtn.innerHTML = "&#9829;";
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(img.dataset.original, favBtn);
  });
  
  container.appendChild(img);
  container.appendChild(favBtn);
  return container;
}


/**********************
 * Favorites Page Gallery Functions
 **********************/
function renderFavoritesGallery() {
  const container = document.getElementById("favoritesGrid");
  if (!container) {
    console.error("Favorites grid container not found.");
    return;
  }
  container.innerHTML = "";
  console.log("Rendering favorites gallery. favoriteImages:", favoriteImages);
  
  if (favoriteImages.length === 0) {
    container.innerHTML = "<p>No favorites found.</p>";
    return;
  }
  
  let favData = [];
  let loadedCount = 0;
  favoriteImages.forEach((url) => {
    const img = new Image();
    img.src = url.replace("/i/", "/t/");
    img.onload = () => {
      const orient = (img.naturalWidth >= img.naturalHeight) ? "landscape" : "portrait";
      favData.push({ url, orientation: orient });
      loadedCount++;
      if (loadedCount === favoriteImages.length) {
        console.log("All favorites loaded:", favData);
        groupAndRenderFavorites(favData);
      }
    };
    img.onerror = () => {
      console.error("Error loading image:", url);
      loadedCount++;
      if (loadedCount === favoriteImages.length) {
        console.log("Favorites loaded with some errors:", favData);
        groupAndRenderFavorites(favData);
      }
    };
  });
}

function groupAndRenderFavorites(favData) {
  const container = document.getElementById("favoritesGrid");
  container.innerHTML = "";
  renderedFavImages = favData.slice();
  const imgsPerRow = computeImagesPerRow();
  let row = document.createElement("div");
  row.className = "gallery-row";
  
  favData.forEach((item, i) => {
    const imgContainer = document.createElement("div");
    imgContainer.className = "image-container";
    
    const imgElem = document.createElement("img");
    imgElem.src = item.url.replace("/i/", "/t/");
    imgElem.alt = "Favorite Image";
    
    let hoverTimeout;
    imgElem.addEventListener("mouseenter", () => {
      hoverTimeout = setTimeout(() => {
        imgElem.src = item.url;
        // Mark it as permanently converted
        imgElem.dataset.converted = "true";
      }, 5);
    });
    imgElem.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
      if (imgElem.dataset.converted !== "true") {
        imgElem.src = item.url.replace("/i/", "/t/");
      }
    });
    
    imgElem.addEventListener("click", () => {
      currentFavIndex = i;
      openFavPopup(i);
    });
    
    imgContainer.appendChild(imgElem);
    row.appendChild(imgContainer);
    
    if ((i + 1) % imgsPerRow === 0) {
      container.appendChild(row);
      row = document.createElement("div");
      row.className = "gallery-row";
    }
  });
  if (row.childElementCount > 0) {
    container.appendChild(row);
  }
  console.log("Favorites gallery rendered.");
}


/**********************
 * Popup & Carousel Functions
 **********************/
function openPopup(index) {
  const popupOverlay = document.getElementById("popupOverlay");
  const popupImage = document.getElementById("popupImage");
  popupImage.src = renderedImages[index].original;
  popupOverlay.style.display = "flex";
  // Note: Heart icon has been removed from popup.
  document.getElementById("slideshowBtn").innerHTML = "►";
  clearInterval(slideshowInterval);
  slideshowInterval = null;
}

function openFavPopup(index) {
  const popupOverlay = document.getElementById("popupOverlay");
  const popupImage = document.getElementById("popupImage");
  popupImage.src = renderedFavImages[index].url;
  popupOverlay.style.display = "flex";
  // Note: Heart icon has been removed from popup.
  document.getElementById("slideshowBtn").innerHTML = "►";
  clearInterval(slideshowInterval);
  slideshowInterval = null;
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
}

// Updated downloadCurrentImage: opens the image in a new tab.
function downloadCurrentImage() {
  let url;
  if (isFavoritesPage()) {
    url = renderedFavImages[currentFavIndex].url;
  } else {
    url = renderedImages[currentImageIndex].original;
  }
  window.open(url, "_blank");
}

function showPrevImage() {
  if (!isFavoritesPage()) {
    if (renderedImages.length === 0) return;
    currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : renderedImages.length - 1;
    document.getElementById("popupImage").src = renderedImages[currentImageIndex].original;
  } else {
    if (renderedFavImages.length === 0) return;
    currentFavIndex = (currentFavIndex > 0) ? currentFavIndex - 1 : renderedFavImages.length - 1;
    document.getElementById("popupImage").src = renderedFavImages[currentFavIndex].url;
  }
}

function showNextImage() {
  if (!isFavoritesPage()) {
    if (renderedImages.length === 0) return;
    currentImageIndex = (currentImageIndex < renderedImages.length - 1) ? currentImageIndex + 1 : 0;
    document.getElementById("popupImage").src = renderedImages[currentImageIndex].original;
  } else {
    if (renderedFavImages.length === 0) return;
    currentFavIndex = (currentFavIndex < renderedFavImages.length - 1) ? currentFavIndex + 1 : 0;
    document.getElementById("popupImage").src = renderedFavImages[currentFavIndex].url;
  }
}

function toggleSlideshow() {
  const btn = document.getElementById("slideshowBtn");
  if (!slideshowInterval) {
    slideshowInterval = setInterval(showNextImage, 3000);
    btn.innerHTML = "❚❚";
  } else {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
    btn.innerHTML = "►";
  }
}

/**********************
 * Authentication Functions (LocalStorage)
 **********************/
async function signupUser(username, password) {
  const userKey = "user_" + username;
  if (localStorage.getItem(userKey)) {
    alert("Username already exists.");
    return false;
  }
  const userData = { password: password, favorites: [] };
  localStorage.setItem(userKey, JSON.stringify(userData));
  alert("Signup successful! Please log in.");
  return true;
}

async function loginUser(username, password) {
  const userKey = "user_" + username;
  const userDataStr = localStorage.getItem(userKey);
  if (!userDataStr) {
    alert("User not found. Please sign up.");
    return false;
  }
  const userData = JSON.parse(userDataStr);
  if (userData.password !== password) {
    alert("Incorrect password.");
    return false;
  }
  currentUser = username;
  localStorage.setItem("currentUser", username);
  const authArea = document.getElementById("authArea");
  if (authArea) authArea.style.display = "none";
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = "inline-block";
  favoriteImages = userData.favorites || [];
  if (document.getElementById("favoritesGrid")) {
    renderFavoritesGallery();
  }
  return true;
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  const authArea = document.getElementById("authArea");
  if (authArea) authArea.style.display = "inline-block";
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = "none";
  favoriteImages = [];
}

/**********************
 * UI Event Listeners
 **********************/
if (document.getElementById("generateButton")) {
  document.getElementById("generateButton").addEventListener("click", () => {
    portraitImages = [];
    landscapeImages = [];
    allImages = [];
    renderedImages = [];
    document.getElementById("imagesGrid").innerHTML = "";
    loadNextBatch();
  });
}

window.addEventListener("scroll", debounce(() => {
  if (document.getElementById("imagesGrid") &&
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100) {
    loadNextBatch();
  }
}, 200));

if (document.getElementById("downloadBtn")) {
  document.getElementById("downloadBtn").addEventListener("click", downloadCurrentImage);
}
if (document.getElementById("prevBtn")) {
  document.getElementById("prevBtn").addEventListener("click", showPrevImage);
}
if (document.getElementById("nextBtn")) {
  document.getElementById("nextBtn").addEventListener("click", showNextImage);
}
if (document.getElementById("slideshowBtn")) {
  document.getElementById("slideshowBtn").addEventListener("click", toggleSlideshow);
}
if (document.getElementById("popupOverlay")) {
  document.getElementById("popupOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("popupOverlay")) {
      closePopup();
    }
  });
}

if (document.getElementById("loginBtn")) {
  document.getElementById("loginBtn").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "flex";
  });
}
if (document.getElementById("signupBtn")) {
  document.getElementById("signupBtn").addEventListener("click", () => {
    document.getElementById("signupModal").style.display = "flex";
  });
}
if (document.getElementById("closeLoginModal")) {
  document.getElementById("closeLoginModal").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
  });
}
if (document.getElementById("closeSignupModal")) {
  document.getElementById("closeSignupModal").addEventListener("click", () => {
    document.getElementById("signupModal").style.display = "none";
  });
}
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    if (await loginUser(username, password)) {
      document.getElementById("loginModal").style.display = "none";
    }
  });
}
if (document.getElementById("signupForm")) {
  document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;
    if (await signupUser(username, password)) {
      document.getElementById("signupModal").style.display = "none";
    }
  });
}
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
}

if (document.getElementById("favoritesGrid")) {
  renderFavoritesGallery();
}
