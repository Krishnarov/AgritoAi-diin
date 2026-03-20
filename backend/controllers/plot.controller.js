import * as turf from "@turf/turf";
import Plot from "../models/Plot.model.js";

// ── Helper: server-side area calc ─────────────────────────────────────────
const calcAreaHa = (geometry) => {
  try {
    const areaSqM = turf.area(geometry);
    return parseFloat((areaSqM / 10000).toFixed(4));
  } catch {
    return 0;
  }
};

// @desc    Farmer submits a new plot
// @route   POST /api/plots
// @access  Private (farmer)
export const submitPlot = async (req, res) => {
  const {
    gataNo, gata_number, area_ha_claimed, district, state, village, tehsil, description,
    pricePerSeason, price_per_season, price_per_year, advance_amount,
    price_negotiable, available_from, minimum_lease_months,
    survey_number, khata_number, khatauni_number,
    land_type, ownership_type, soil_type, irrigation,
    last_crop_grown, crop_types_allowed, crops_not_allowed,
    geometry
  } = req.body;

  const resolvedGata = gata_number || gataNo;
  if (!resolvedGata || !geometry)
    return res.status(400).json({ success: false, message: "gata_number and geometry required" });

  let parsedGeo;
  try {
    parsedGeo = typeof geometry === "string" ? JSON.parse(geometry) : geometry;
    
    // Ensure Polygon is closed (MongoDB requirement)
    if (parsedGeo.type === "Polygon" && parsedGeo.coordinates && parsedGeo.coordinates.length > 0) {
      const ring = parsedGeo.coordinates[0];
      if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          ring.push([first[0], first[1]]);
        }
      }
    }
  } catch {
    return res.status(400).json({ success: false, message: "Invalid GeoJSON geometry" });
  }

  // Server-side area verification (anti-fraud)
  const serverArea = calcAreaHa(parsedGeo);
  const clientArea = parseFloat(area_ha_claimed) || 0;
  const areaMismatch = Math.abs(serverArea - clientArea) > 0.05;

  const khasaraDoc = req.file ? `/uploads/khasara/${req.file.filename}` : null;

  const plot = await Plot.create({
    farmer: req.user._id,
    gataNo: resolvedGata, gata_number: resolvedGata,
    survey_number, khata_number, khatauni_number,
    district, state, village, tehsil, description,
    land_type, ownership_type, soil_type, irrigation,
    last_crop_grown, crop_types_allowed, crops_not_allowed,
    pricePerSeason: parseFloat(price_per_season || pricePerSeason) || 0,
    price_per_season: parseFloat(price_per_season || pricePerSeason) || 0,
    price_per_year: parseFloat(price_per_year) || 0,
    advance_amount: parseFloat(advance_amount) || 0,
    price_negotiable: price_negotiable === "true" || price_negotiable === true,
    available_from: available_from || new Date(),
    minimum_lease_months: parseInt(minimum_lease_months) || 3,
    area_ha: serverArea,
    area_ha_claimed: clientArea,
    area_mismatch: areaMismatch,
    geometry: parsedGeo,
    khasaraDoc,
    status: "pending",
  });

  res.status(201).json({ success: true, plot });
};

// @desc    Get all available plots for map (public)
// @route   GET /api/plots/map
// @access  Public
export const getMapPlots = async (req, res) => {
  const { swLat, swLng, neLat, neLng, district, state } = req.query;

  const query = { status: { $in: ["available", "booked", "pending"] } };

  // Bounding box filter (only load visible area — performance optimization)
  if (swLat && swLng && neLat && neLng) {
    query.geometry = {
      $geoWithin: {
        $box: [
          [parseFloat(swLng), parseFloat(swLat)],
          [parseFloat(neLng), parseFloat(neLat)],
        ],
      },
    };
  }

  if (district) query.district = new RegExp(district, "i");
  if (state)    query.state    = new RegExp(state, "i");

  const plots = await Plot.find(query)
    .select("gataNo area_ha status geometry district state village pricePerSeason farmer")
    .populate("farmer", "name phone")
    .lean();

  res.json({ success: true, count: plots.length, plots });
};

// @desc    Get farmer's own plots
// @route   GET /api/plots/my
// @access  Private (farmer)
export const getMyPlots = async (req, res) => {
  const plots = await Plot.find({ farmer: req.user._id })
    .sort("-createdAt")
    .lean();
  res.json({ success: true, plots });
};

// @desc    Get single plot details
// @route   GET /api/plots/:id
// @access  Public
export const getPlotById = async (req, res) => {
  const plot = await Plot.findById(req.params.id)
    .populate("farmer", "name phone district state")
    .populate("currentRenter", "name phone")
    .lean();

  if (!plot) return res.status(404).json({ success: false, message: "Plot not found" });
  res.json({ success: true, plot });
};

// @desc    Renter sends a rental request
// @route   POST /api/plots/:id/request
// @access  Private (renter)
export const sendRentalRequest = async (req, res) => {
  const plot = await Plot.findById(req.params.id);
  if (!plot) return res.status(404).json({ success: false, message: "Plot not found" });
  if (plot.status !== "available")
    return res.status(400).json({ success: false, message: "Plot is not available for rent" });

  // Prevent duplicate requests
  const alreadyRequested = plot.rentalRequests.some(
    (r) => r.renter.toString() === req.user._id.toString() && r.status === "pending"
  );
  if (alreadyRequested)
    return res.status(400).json({ success: false, message: "You already sent a request for this plot" });

  plot.rentalRequests.push({ renter: req.user._id, message: req.body.message || "" });
  await plot.save();

  res.json({ success: true, message: "Rental request sent to farmer" });
};

// @desc    Farmer accepts/rejects a rental request
// @route   PATCH /api/plots/:id/request/:requestId
// @access  Private (farmer/owner)
export const handleRentalRequest = async (req, res) => {
  const { action } = req.body; // "accept" | "reject"
  const plot = await Plot.findById(req.params.id);

  if (!plot) return res.status(404).json({ success: false, message: "Plot not found" });
  if (plot.farmer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: "Not your plot" });

  const reqItem = plot.rentalRequests.id(req.params.requestId);
  if (!reqItem) return res.status(404).json({ success: false, message: "Request not found" });

  reqItem.status = action === "accept" ? "accepted" : "rejected";

  if (action === "accept") {
    plot.status = "booked";
    plot.currentRenter = reqItem.renter;
    plot.rentedFrom = new Date();
    // Reject all other pending requests
    plot.rentalRequests.forEach((r) => {
      if (r._id.toString() !== reqItem._id.toString() && r.status === "pending")
        r.status = "rejected";
    });
  }

  await plot.save();
  res.json({ success: true, plot });
};

// @desc    Get farmer-specific statistics
// @route   GET /api/plots/farmer/stats
// @access  Private (farmer)
export const getFarmerStats = async (req, res) => {
  const plots = await Plot.find({ farmer: req.user._id });

  const stats = {
    totalPlots: plots.length,
    pending: plots.filter(p => p.status === "pending").length,
    approved: plots.filter(p => p.status === "available" || p.status === "booked").length,
    booked: plots.filter(p => p.status === "booked").length,
    rejected: plots.filter(p => p.status === "rejected").length,
  };

  res.json({ success: true, stats });
};