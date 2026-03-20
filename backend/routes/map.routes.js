import express from "express";
const router = express.Router();

// Proxy for Nominatim Geocoding to avoid CORS issues
router.get("/geocoding/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Search query required" });

  try {
    // Switching to Photon (Komoot) as it has more relaxed limits than Nominatim for dev
    const targetUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`;
    
    const response = await fetch(targetUrl);

    if (!response.ok) {
        const errText = await response.text();
        console.error(`Photon Error (${response.status}):`, errText);
        return res.status(response.status).json({ message: "Geocoding service error" });
    }
    
    const data = await response.json();
    
    // Transform Photon GeoJSON to Nominatim-like format for frontend compatibility
    const results = (data.features || []).map(f => ({
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        osm_id: f.properties.osm_id,
        osm_type: f.properties.osm_type,
        display_name: [
            f.properties.name,
            f.properties.city || f.properties.district,
            f.properties.state,
            f.properties.country
        ].filter(Boolean).join(", ")
    }));

    res.json(results);
  } catch (error) {
    console.error("Geocoding Proxy Error:", error);
    res.status(500).json({ message: "Geocoding service unavailable" });
  }
});

// Proxy for Overpass API to get complex geometry (Polygon)
router.get("/geocoding/boundary", async (req, res) => {
  const { osm_id, osm_type } = req.query;
  if (!osm_id || !osm_type) return res.status(400).json({ message: "OSM ID and Type required" });

  try {
    // Overpass is much better for large geometry lookups and has higher limits
    const type = osm_type === 'R' ? 'relation' : osm_type === 'W' ? 'way' : 'node';
    const query = `[out:json];${type}(${osm_id});out geom;`;
    const targetUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    // Using native fetch
    const response = await fetch(targetUrl);

    if (!response.ok) {
        return res.status(response.status).json({ message: "Overpass lookup failed" });
    }
    
    const data = await response.json();
    const element = data.elements?.[0];
    
    if (!element || !element.geometry) {
        return res.status(404).json({ message: "No geometry found" });
    }

    // Convert Overpass geom to simple GeoJSON Polygon/MultiPolygon
    // Note: This is an approximation for relations, but works well for most city bboxes
    const coordinates = element.geometry.map(p => [p.lon, p.lat]);
    // Close the loop if needed
    if (coordinates[0][0] !== coordinates[coordinates.length-1][0]) {
        coordinates.push(coordinates[0]);
    }

    const geojson = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [coordinates]
        },
        properties: element.tags || {}
    };

    res.json({ geojson });
  } catch (error) {
    console.error("Overpass Lookup Error:", error);
    res.status(500).json({ message: "Geocoding service unavailable" });
  }
});

export default router;
