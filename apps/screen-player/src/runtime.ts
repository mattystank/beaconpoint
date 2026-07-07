export type PlayerRuntimeConfig = {
	deviceId: string;
	deviceCode?: string;
	pairingCode?: string;
	backendBaseUrl: string;
};

export type DeviceSession = {
	deviceId: string;
	screenId: string;
	status: string;
	syncIntervalSeconds: number;
	deviceToken: string;
};

export type DeviceHeartbeatPayload = {
	playbackState?: "idle" | "playing" | "error";
	lastContentHash?: string;
	errorCode?: string;
	playerVersion?: string;
	previousPlayerVersion?: string;
	updateStatus?: string;
};

const DEVICE_TOKEN_KEY_PREFIX = "bp-device-token:";
const DEVICE_ID_KEY = "bp-device-id";
const CODESPACES_HOST_RE = /^(.*)-(\d+)\.app\.github\.dev$/;

function parseCodesFromPath(pathname: string): { deviceCode?: string; pairingCode?: string } {
	const parts = pathname.split("/").filter(Boolean);
	if (parts.length >= 3 && parts[0] === "r") {
		const deviceCode = /^\d{6}$/.test(parts[1]) ? parts[1] : undefined;
		const pairingCode = /^\d{6}$/.test(parts[2]) ? parts[2] : undefined;
		return { deviceCode, pairingCode };
	}
	return {};
}

function generateFallbackDeviceId(): string {
	const rand = Math.random().toString(16).slice(2, 10);
	return `bp-device-${Date.now()}-${rand}`;
}

function getOrGenerateDeviceId(queryDeviceId: string | null, storedDeviceId: string | null): string {
	if (queryDeviceId) return queryDeviceId;
	if (storedDeviceId) return storedDeviceId;
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return generateFallbackDeviceId();
}

function getDeviceTokenStorageKey(deviceId: string): string {
	return `${DEVICE_TOKEN_KEY_PREFIX}${deviceId}`;
}

function getStoredDeviceToken(deviceId: string): string | null {
	return localStorage.getItem(getDeviceTokenStorageKey(deviceId));
}

function storeDeviceToken(deviceId: string, token: string): void {
	localStorage.setItem(getDeviceTokenStorageKey(deviceId), token);
}

async function safeJson(res: Response): Promise<any> {
	const text = await res.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

export function getPlayerRuntimeConfig(): PlayerRuntimeConfig {
	const resolveDefaultBackendBaseUrl = (): string => {
		const hostMatch = window.location.hostname.match(CODESPACES_HOST_RE);
		if (hostMatch) {
			const currentPort = Number(hostMatch[2]);
			const inferredPort = currentPort === 3000 || currentPort === 3001 ? 3002 : 8010;
			return `https://${hostMatch[1]}-${inferredPort}.app.github.dev`;
		}
		const currentPort = Number(window.location.port || "0");
		const inferredPort = currentPort === 3000 || currentPort === 3001 ? 3002 : 8010;
		return `${window.location.protocol}//${window.location.hostname}:${inferredPort}`;
	};

	const urlParams = new URLSearchParams(window.location.search);
	const pathCodes = parseCodesFromPath(window.location.pathname);
	const queryDeviceId = urlParams.get("deviceId") || urlParams.get("id");
	const deviceCode = pathCodes.deviceCode || urlParams.get("d") || urlParams.get("deviceCode") || undefined;
	const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
	const deviceId = getOrGenerateDeviceId(queryDeviceId, storedDeviceId);
	const pairingCode = pathCodes.pairingCode || urlParams.get("p") || urlParams.get("pairingCode") || undefined;
	const backendBaseUrl = urlParams.get("b") || urlParams.get("backendBaseUrl") || resolveDefaultBackendBaseUrl();

	if (!storedDeviceId || storedDeviceId !== deviceId) {
		localStorage.setItem(DEVICE_ID_KEY, deviceId);
	}

	return { deviceId, deviceCode, pairingCode, backendBaseUrl };
}

export async function bootstrapOrResumeDevice(config: PlayerRuntimeConfig): Promise<DeviceSession> {
	const storedToken = getStoredDeviceToken(config.deviceId);
	if (storedToken) {
		const sessionRes = await fetch(`${config.backendBaseUrl}/devices/session`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${storedToken}`,
			},
		});

		if (sessionRes.ok) {
			const sessionJson = await safeJson(sessionRes);
			return {
				deviceId: sessionJson.device_id,
				screenId: sessionJson.screen_id,
				status: sessionJson.status,
				syncIntervalSeconds: sessionJson.sync_interval_seconds || 30,
				deviceToken: storedToken,
			};
		}
	}

	if (!config.pairingCode) {
		throw new Error("Device is not paired yet. Provide ?p=123456 and optionally ?d=123456.");
	}

	const endpoint = config.deviceCode ? `${config.backendBaseUrl}/devices/bootstrap/simple` : `${config.backendBaseUrl}/devices/bootstrap`;
	const body = config.deviceCode
		? {
			device_code: config.deviceCode,
			pairing_code: config.pairingCode,
		}
		: {
			device_id: config.deviceId,
			pairing_code: config.pairingCode,
		};

	const bootstrapRes = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!bootstrapRes.ok) {
		const details = await safeJson(bootstrapRes);
		throw new Error(details?.detail || "Failed to bootstrap device");
	}

	const bootstrapJson = await safeJson(bootstrapRes);
	storeDeviceToken(bootstrapJson.device_id, bootstrapJson.device_token);
	localStorage.setItem(DEVICE_ID_KEY, bootstrapJson.device_id);

	return {
		deviceId: bootstrapJson.device_id,
		screenId: bootstrapJson.screen_id,
		status: "active",
		syncIntervalSeconds: bootstrapJson.sync_interval_seconds || 30,
		deviceToken: bootstrapJson.device_token,
	};
}

export async function sendDeviceHeartbeat(config: { backendBaseUrl: string; deviceToken: string }, payload: DeviceHeartbeatPayload): Promise<void> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	try {
		await fetch(`${config.backendBaseUrl}/devices/heartbeat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${config.deviceToken}`,
			},
			body: JSON.stringify({
				playback_state: payload.playbackState,
				last_content_hash: payload.lastContentHash,
				error_code: payload.errorCode,
				player_version: payload.playerVersion,
				previous_player_version: payload.previousPlayerVersion,
				update_status: payload.updateStatus,
			}),
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timeout);
	}
}
