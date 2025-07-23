# Live Chroma‑Key Overlay

A simple browser app that applies chroma‑key overlays from local video files onto your live camera feed. Click a colored button to toggle each overlay.

## Files

- **index.html** — main page  
- **style.css** — layout and button styles  
- **main.js** — camera capture, chroma‑key logic, button controls  
- **red.mp4**, **green.mp4**, **blue.mp4**, **yellow.mp4** — overlay videos  

## Usage

1. **Clone or download** this repository.  
2. **Ensure** `red.mp4`, `green.mp4`, `blue.mp4`, and `yellow.mp4` live next to `index.html`.  
3. **Serve** the folder (recommended) or open `index.html` directly in a modern browser:
   - For a quick local server:  
     ```bash
     cd path/to/project
     python -m http.server 8000
     ```
   - Then browse to `http://localhost:8000`.  
4. **Allow camera access** when prompted.  
5. **Click** the red/green/blue/yellow buttons at the top to enable or disable each overlay.

## Requirements

- A browser with **getUserMedia** support (Chrome, Firefox, Edge, Safari on macOS).  
- Must be served over **HTTPS** or **localhost** to access the camera.  

## Notes

- The camera feed is drawn to a full‑screen `<canvas>`.  
- Overlays are local MP4s keyed by color and composited in real time.  
- On some mobile browsers (iOS Safari), direct canvas rendering of the camera may be limited.
