<script>
  import { onMount } from 'svelte';

  const { city, postcode, latitude, longitude } = $props();

  let mapContainer;
  let map;
  let marker;

  // Geocode function using Nominatim (free OpenStreetMap geocoding)
  async function geocodeLocation(city, postcode) {
    try {
      const query = postcode 
        ? `${postcode}, ${city}, UK`
        : `${city}, UK`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Marketto P2P Marketplace' // Required by Nominatim
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  }

  onMount(async () => {
    // Load Leaflet CSS and JS from CDN
    if (typeof window !== 'undefined') {
      const initMap = async () => {
        const L = window.L;
        
        if (!L || !mapContainer) return;
        
        // Determine coordinates
        let lat, lon;
        
        if (latitude && longitude) {
          // Use provided coordinates
          lat = parseFloat(latitude);
          lon = parseFloat(longitude);
        } else if (city || postcode) {
          // Geocode the location
          const coords = await geocodeLocation(city, postcode);
          if (coords) {
            lat = coords.lat;
            lon = coords.lon;
          } else {
            // Fallback to a default location (UK center)
            lat = 54.9783;
            lon = -1.6178;
          }
        } else {
          // Default to UK center
          lat = 54.9783;
          lon = -1.6178;
        }

        // Initialize map
        map = L.map(mapContainer).setView([lat, lon], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Add marker
        marker = L.marker([lat, lon]).addTo(map);
        
        // Add popup with location info
        const locationText = postcode 
          ? `${city || 'Location'}, ${postcode}`
          : city || 'Location';
        marker.bindPopup(locationText).openPopup();
      };

      // Check if Leaflet is already loaded
      if (window.L) {
        await initMap();
      }

      // Check if CSS is already loaded
      const cssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      if (!document.querySelector(`link[href="${cssHref}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Check if script is already loaded
      const scriptSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
      
      if (existingScript) {
        // Script is loading or loaded, wait for it
        if (window.L) {
          await initMap();
        } else {
          existingScript.addEventListener('load', initMap);
        }
      } else {
        // Load JS
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  });
</script>

<div class="map-container">
  <div bind:this={mapContainer} class="map"></div>
  {#if !city && !postcode && !latitude && !longitude}
    <div class="map-placeholder">
      <p>Location information not available</p>
    </div>
  {/if}
</div>

<style>
  .map-container {
    width: 100%;
    height: 400px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
    background: var(--color-gray-100);
  }

  .map {
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .map-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    text-align: center;
    color: var(--color-gray-500);
  }

  :global(.leaflet-container) {
    font-family: inherit;
  }
</style>

