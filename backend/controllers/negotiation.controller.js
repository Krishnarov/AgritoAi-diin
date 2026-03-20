import RenterInterest from "../models/RenterInterest.model.js";
import Negotiation from "../models/Negotiation.model.js";
import RentalAgreement from "../models/RentalAgreement.model.js";
import Plot from "../models/Plot.model.js";
import Notification from "../models/Notification.model.js";

// --- Interest & Initial Contact ---
export const raiseInterest = async (req, res) => {
  try {
    const { plotId, message, offered_price, crop_planned, start_date, duration } = req.body;
    const plot = await Plot.findById(plotId);
    if (!plot) return res.status(404).json({ success: false, message: "Plot not found" });
    if (plot.status !== "available")
      return res.status(400).json({ success: false, message: "Plot is not available" });

    // Prevent duplicate pending interest
    const existing = await RenterInterest.findOne({ renter: req.user._id, plot: plotId, status: "pending" });
    if (existing) return res.status(400).json({ success: false, message: "You already sent interest for this plot" });

    const interest = await RenterInterest.create({
      renter: req.user._id,
      plot: plotId,
      farmer: plot.farmer,
      message,
      offered_price: offered_price ? Number(offered_price) : null,
      crop_planned,
      start_date,
      duration,
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Increment views
    await Plot.findByIdAndUpdate(plotId, { $inc: { views_count: 1 } });

    // Notify farmer
    await Notification.create({
      user: plot.farmer,
      title: "New Interest in your Plot",
      message: `${req.user.name} ne Gata ${plot.gata_number || plot.gataNo} (${plot.village}) mein interest dikhaya hai`,
      type: "booking",
      link: `/farmer/requests`,
    });

    res.json({ success: true, interest });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- Get renter's own interests ---
export const getMyInterests = async (req, res) => {
  try {
    const interests = await RenterInterest.find({ renter: req.user._id })
      .populate("plot", "gata_number gataNo village district tehsil area_ha price_per_season pricePerSeason status soil_type irrigation")
      .populate("farmer", "name phone")
      .sort("-createdAt");
    res.json({ success: true, interests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- Negotiation Thread ---
export const startNegotiation = async (req, res) => {
  try {
    const { interestId } = req.body;
    const interest = await RenterInterest.findById(interestId).populate("plot");
    if (!interest) return res.status(404).json({ success: false, message: "Interest not found" });

    const negotiation = await Negotiation.create({
      interest: interestId,
      plot: interest.plot._id,
      renter: interest.renter,
      farmer: interest.farmer,
      offers: [{
        by: interest.renter,
        amount: interest.offered_price || interest.plot.pricePerSeason,
        message: interest.message,
      }],
    });

    res.json({ success: true, negotiation });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const submitOffer = async (req, res) => {
  try {
    const { negotiationId, amount, message } = req.body;
    const neg = await Negotiation.findById(negotiationId);
    if (!neg) return res.status(404).json({ success: false, message: "Negotiation not found" });

    neg.offers.push({ by: req.user._id, amount, message });
    await neg.save();

    const recipient = req.user._id.toString() === neg.farmer.toString() ? neg.renter : neg.farmer;
    await Notification.create({
      user: recipient,
      title: "New Price Offer",
      message: `${req.user.name} ne ₹${amount} ka counter-offer diya hai`,
      type: "booking",
      link: `/negotiations/${neg._id}`,
    });

    res.json({ success: true, negotiation: neg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- Agreement ---
export const finalizeAgreement = async (req, res) => {
  try {
    const { negotiationId, start_date, end_date, crop_to_grow, terms } = req.body;
    const neg = await Negotiation.findById(negotiationId);
    if (!neg) return res.status(404).json({ success: false, message: "Negotiation not found" });

    const finalOffer = neg.offers[neg.offers.length - 1];

    const agreement = await RentalAgreement.create({
      plot: neg.plot,
      farmer: neg.farmer,
      renter: neg.renter,
      start_date,
      end_date,
      total_amount: finalOffer.amount,
      amount_per_season: finalOffer.amount,
      crop_to_grow,
      terms,
      status: "active",
      signed_at: Date.now(),
    });

    await Plot.findByIdAndUpdate(neg.plot, { status: "booked", currentRenter: neg.renter });

    neg.status = "agreed";
    neg.final_agreed_price = finalOffer.amount;
    neg.agreed_at = Date.now();
    await neg.save();

    res.json({ success: true, agreement });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
