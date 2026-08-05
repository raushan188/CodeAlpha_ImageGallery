# Modern Image Gallery

A polished, responsive image gallery built with plain HTML, CSS, and JavaScript. It includes a lightbox preview experience and works as a static site for easy deployment on Vercel.

## Features

- Responsive gallery layout
- Lightbox image preview
- Keyboard navigation for previous/next images
- Clean, modern UI
- Static hosting friendly

## Project Structure

- `index.html` – Main page structure
- `style.css` – Styling for the gallery and lightbox
- `script.js` – Gallery data, rendering, and lightbox behavior
- `assets/` – Image assets used by the gallery

## Run Locally

Open `index.html` in your browser, or use a simple local server such as:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Deployment

This project is configured for Vercel static hosting.

Live URL:
- https://code-alpha-image-gallery-lilac.vercel.app

## Notes

The gallery uses local image files from the `assets/` folder, so ensure those files are present when deploying.
