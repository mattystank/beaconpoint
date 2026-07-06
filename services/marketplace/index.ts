import express from "express";

type Listing = {
	id: string;
	screenId: string;
	name: string;
	city: string;
	state: string;
	venueType: string;
	hourlyRate: number;
	dailyTraffic: number;
	available: boolean;
};

type BookingRequest = {
	listingId: string;
	advertiserId: string;
	startDate: string;
	endDate: string;
	budget: number;
};

const app = express();
const port = Number(process.env.PORT || 8011);

app.use(express.json());

const listings: Listing[] = [
	{
		id: "listing-1",
		screenId: "demo-screen-001",
		name: "Union Station Lobby",
		city: "Baltimore",
		state: "MD",
		venueType: "Transit",
		hourlyRate: 18,
		dailyTraffic: 12000,
		available: true,
	},
	{
		id: "listing-2",
		screenId: "demo-screen-002",
		name: "Harborplace Outdoor",
		city: "Baltimore",
		state: "MD",
		venueType: "Outdoor",
		hourlyRate: 25,
		dailyTraffic: 22000,
		available: true,
	},
];

const bookings: BookingRequest[] = [];

app.get("/health", (_req, res) => {
	res.json({ service: "marketplace", status: "ok" });
});

app.get("/listings", (req, res) => {
	const query = (req.query.query as string | undefined)?.toLowerCase().trim();
	const city = (req.query.city as string | undefined)?.toLowerCase().trim();
	const venueType = (req.query.venueType as string | undefined)?.toLowerCase().trim();

	const filtered = listings.filter((item) => {
		if (query && !(item.name.toLowerCase().includes(query) || item.city.toLowerCase().includes(query))) {
			return false;
		}
		if (city && item.city.toLowerCase() !== city) {
			return false;
		}
		if (venueType && item.venueType.toLowerCase() !== venueType) {
			return false;
		}
		return true;
	});

	res.json(filtered);
});

app.get("/listings/:id", (req, res) => {
	const listing = listings.find((item) => item.id === req.params.id);
	if (!listing) {
		res.status(404).json({ detail: "Listing not found" });
		return;
	}
	res.json(listing);
});

app.post("/bookings", (req, res) => {
	const payload = req.body as Partial<BookingRequest>;
	if (!payload.listingId || !payload.advertiserId || !payload.startDate || !payload.endDate || !payload.budget) {
		res.status(400).json({ detail: "listingId, advertiserId, startDate, endDate, and budget are required" });
		return;
	}

	const listing = listings.find((item) => item.id === payload.listingId && item.available);
	if (!listing) {
		res.status(404).json({ detail: "Listing unavailable" });
		return;
	}

	const booking: BookingRequest = {
		listingId: payload.listingId,
		advertiserId: payload.advertiserId,
		startDate: payload.startDate,
		endDate: payload.endDate,
		budget: payload.budget,
	};
	bookings.push(booking);
	res.status(201).json({ id: `mkt-booking-${Date.now()}`, ...booking, status: "pending" });
});

app.get("/bookings", (_req, res) => {
	res.json(bookings);
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Marketplace service running on http://0.0.0.0:${port}`);
});
