"use client";
import React, { useState } from "react";
import { Container, Typography, Box, Button, TextField, MenuItem, Snackbar, Alert, LinearProgress, Chip, Stack } from "@mui/material";
import { apiRequest } from "../lib/apiClient";

const mediaTypes = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" }
];

export default function AdsPage() {
  const [uploadStep, setUploadStep] = useState<"idle" | "requesting" | "uploading" | "finalizing" | "creating">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  type MediaStagingRequestResponse = {
    upload_id: string;
    upload_url: string;
    method: "PUT" | "POST";
    headers: Record<string, string>;
    upload_token: string;
    expires_at: string;
    final_media_url: string;
  };

  function uploadFileWithProgress(
    uploadUrl: string,
    method: "PUT" | "POST",
    headers: Record<string, string>,
    file: File,
    onProgress: (value: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, uploadUrl, true);

      Object.entries(headers || {}).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve();
          return;
        }
        reject(new Error(`Direct upload failed with status ${xhr.status}.`));
      };

      xhr.onerror = () => reject(new Error("Network error during direct upload."));
      xhr.send(file);
    });
  }

  const stepLabelMap: Record<typeof uploadStep, string> = {
    idle: "Idle",
    requesting: "Requesting upload slot",
    uploading: "Uploading file",
    finalizing: "Finalizing upload",
    creating: "Creating ad record",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaFile || !duration) {
      setError("All fields are required.");
      return;
    }
    if (typeof duration !== "number" || duration <= 0) {
      setError("Duration must be a positive number.");
      return;
    }

    const fileExtension = mediaFile.name.toLowerCase();
    const imageAllowed = [".jpg", ".jpeg", ".png", ".webp"];
    const videoAllowed = [".mp4", ".webm", ".mov"];
    const allowed = mediaType === "video" ? videoAllowed : imageAllowed;
    if (!allowed.some((ext) => fileExtension.endsWith(ext))) {
      setError(`Selected file extension is not allowed for ${mediaType}.`);
      return;
    }

    setSubmitting(true);
    setError("");
    setUploadProgress(0);

    try {
      setUploadStep("requesting");
      const staging = await apiRequest<MediaStagingRequestResponse>("/media/staging/request", {
        method: "POST",
        body: {
          filename: mediaFile.name,
          media_type: mediaType,
          media_size_bytes: mediaFile.size,
          duration_seconds: duration,
        }
      });

      setUploadStep("uploading");
      await uploadFileWithProgress(staging.upload_url, staging.method, staging.headers, mediaFile, setUploadProgress);

      setUploadStep("finalizing");
      const completed = await apiRequest<{ media_url: string }>("/media/staging/complete", {
        method: "POST",
        body: {
          upload_id: staging.upload_id,
          upload_token: staging.upload_token,
          final_media_url: staging.final_media_url,
        }
      });

      setUploadStep("creating");
      await apiRequest<{ id: string }>("/ads", {
        method: "POST",
        body: {
          title,
          description,
          media_type: mediaType,
          media_url: completed.media_url,
          duration_seconds: duration,
          media_size_bytes: mediaFile.size,
          status: "active"
        }
      });

      setSuccess(true);
      setTitle("");
      setDescription("");
      setMediaFile(null);
      setDuration(15);
      setUploadStep("idle");
      setUploadProgress(0);
    } catch (err: any) {
      setError(err?.message || "Failed to upload ad.");
      setUploadStep("idle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Upload New Ad
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} />
        <TextField select label="Media Type" value={mediaType} onChange={e => setMediaType(e.target.value)}>
          {mediaTypes.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <Button component="label" variant="outlined">
          {mediaFile ? `Selected: ${mediaFile.name}` : "Choose Media File"}
          <input
            hidden
            type="file"
            accept={mediaType === "video" ? ".mp4,.webm,.mov" : ".jpg,.jpeg,.png,.webp"}
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setMediaFile(file);
            }}
          />
        </Button>
        <TextField label="Duration (seconds)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
        <Button type="submit" variant="contained" color="primary" disabled={submitting}>
          {submitting ? "Uploading..." : "Upload Ad"}
        </Button>
        {submitting && (
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip size="small" color="info" label={stepLabelMap[uploadStep]} />
              {uploadStep === "uploading" && <Chip size="small" label={`${uploadProgress}%`} />}
            </Stack>
            {uploadStep === "uploading" && <LinearProgress variant="determinate" value={uploadProgress} />}
          </Box>
        )}
      </Box>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">Ad uploaded successfully!</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}> 
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
