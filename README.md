# fornec.v1

Forbidden Nectar

Overview
Vibrant Image Generator is a responsive web application that dynamically renders erotic and sensual images. The website allows users to generate unique images on demand, save their favorites, and view them in a curated gallery. With a clean, minimalist design and features such as infinite scrolling, theme toggling (light/dark), and local storage–based user authentication, this project offers an immersive visual experience.

Note: This website displays erotic and sensual images. Viewer discretion is advised.

Features
Dynamic Image Generation:
Generate erotic and sensual images using a base URL modified with random suffixes to produce unique image links.

Responsive Gallery:
Images are arranged in a grid that adapts to different screen sizes. Infinite scrolling loads new images automatically.

User Authentication:
Users can sign up, log in, and log out. Authentication and favorite selections are managed via the browser's localStorage.

Favorites Gallery:
Save your favorite images and view them on a dedicated favorites page.

Theme Toggle:
Switch between light and dark themes for a customized viewing experience.

Popup Image View:
Click on any image to view it in a full-screen popup with carousel navigation and a download button that opens the image in a new tab.

Installation & Usage
Clone the Repository:

bash
Copy
Edit
git clone https://github.com/dumb-c0derzz/fornec.v1.git
cd vibrant-image-generator
Open the Website Locally:

Simply open the index.html file in your favorite web browser. For example, on macOS or Linux:

bash
Copy
Edit
open index.html
Or on Windows:

bash
Copy
Edit
start index.html
Usage:

Generate Images: Click the Generate Images button to populate the gallery.
View Full Image: Click on any image in the gallery to open it in a full-screen popup.
Favorites: Click the heart icon on an image to add it to your favorites. Visit the Favorites page to see your saved images.
Authentication: Use the Login and Sign Up buttons in the header to create an account or log in.
Theme Toggle: Use the toggle switch in the header to switch between light and dark modes.
Technology Stack
HTML5
CSS3 (Responsive design, custom animations)
JavaScript (ES6)
LocalStorage API (for user authentication and managing favorites)
Note: This version of the website does not use Bootstrap; all UI components are built with custom HTML, CSS, and JavaScript.

Project Structure
graphql
Copy
Edit
vibrant-image-generator/
├── index.html          # Main page with image generation and gallery
├── favorites.html      # Favorites page
├── styles.css          # Main stylesheet
├── script.js           # Main JavaScript file (all custom functionality)
└── README.md           # This file
License
This project is licensed under the MIT License.
