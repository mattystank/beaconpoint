import express from "express";

type AdSchedule = {
	id: string;
	adId: string;
	screenId: string;
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	frequencyPerHour: number;
};

type AdAsset = {
	id: string;
	title: string;
	mediaUrl: string;
	mediaType: string;
	durationSec: number;
	contentHash: string;
};

type PlayerHeartbeat = {
	screenId: string;
	lastSeenAt: string;
	status: "online" | "offline";
	playbackState: "idle" | "playing" | "error";
	lastContentHash?: string;
	errorCode?: string;
};

const app = express();
const port = Number(process.env.PORT || 8012);

app.use(express.json());

const schedules: AdSchedule[] = [
	{
		id: "sched-1",
		adId: "ad-1",
		screenId: "demo-screen-001",
		startDate: "2026-01-01",
		endDate: "2026-12-31",
		startTime: "08:00",
		endTime: "22:00",
		frequencyPerHour: 4,
	},
];

const ads: AdAsset[] = [
	{
		id: "ad-1",
		title: "Beacon Point Demo Ad",
		mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",
		mediaType: "image/jpeg",
		durationSec: 10,
		contentHash: "demo-ad-1-v1",
	},
];

const playerHeartbeats = new Map<string, PlayerHeartbeat>();

app.get("/health", (_req, res) => {
	res.json({ service: "ad-distribution", status: "ok" });
});

app.get("/screens/:screenId/schedule", (req, res) => {
	const data = schedules.filter((item) => item.screenId === req.params.screenId);
	res.json(data);
});

app.get("/ads", (req, res) => {
	const idsRaw = String(req.query.ids || "").trim();
	if (!idsRaw) {
		res.json(ads);
		return;
	}

	const ids = idsRaw.split(",").map((item) => item.trim()).filter(Boolean);
	res.json(ads.filter((ad) => ids.includes(ad.id)));
});

app.post("/screens/:screenId/schedule", (req, res) => {
	const payload = req.body as Partial<AdSchedule>;
	if (!payload.adId || !payload.startDate || !payload.endDate) {
		res.status(400).json({ detail: "adId, startDate, and endDate are required" });
		return;
	}

	const schedule: AdSchedule = {
		id: `sched-${Date.now()}`,
		adId: payload.adId,
		screenId: req.params.screenId,
		startDate: payload.startDate,
		endDate: payload.endDate,
		startTime: payload.startTime || "00:00",
		endTime: payload.endTime || "23:59",
		frequencyPerHour: payload.frequencyPerHour || 1,
	};
	schedules.push(schedule);
	res.status(201).json(schedule);
});

app.post("/players/:screenId/heartbeat", (req, res) => {
	const status = (req.body?.status || "online") as "online" | "offline";
	const playbackState = (req.body?.playbackState || "idle") as "idle" | "playing" | "error";
	const heartbeat: PlayerHeartbeat = {
		screenId: req.params.screenId,
		status,
		lastSeenAt: new Date().toISOString(),
		playbackState,
		lastContentHash: req.body?.lastContentHash,
		errorCode: req.body?.errorCode,
	};
	playerHeartbeats.set(req.params.screenId, heartbeat);
	res.json(heartbeat);
});

app.get("/players/status", (_req, res) => {
	res.json(Array.from(playerHeartbeats.values()));
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Ad distribution service running on http://0.0.0.0:${port}`);
});
