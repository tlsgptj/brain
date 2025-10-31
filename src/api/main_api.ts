const BASE = "https://api.nnunet.store";

export type Plane = "axial" | "coronal" | "sagittal";

async function asError(res: Response) {
  const text = await res.text().catch(() => "");
  return new Error(`NNUNet API ${res.status}: ${text || res.statusText}`);
}

/** 업로드 */
export async function uploadNifti(file: File): Promise<{ session_id: string; input_url?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/upload-nifti`, { method: "POST", body: fd });
  if (!res.ok) throw await asError(res);
  const data = await res.json();
  return {
    session_id: data.session_id,
    input_url: data.input_url,
  };
}

/** 슬라이스 PNG → blob URL 반환 */
export async function getSlice(
  sessionId: string,
  plane: Plane,
  index: number,
  channel?: number
): Promise<string> {
  const url = new URL(`${BASE}/slices/${encodeURIComponent(sessionId)}/${plane}/${index}`);
  if (typeof channel === "number") url.searchParams.set("channel", String(channel));
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw await asError(res);
  const blob = await res.blob(); // ← image/png
  return URL.createObjectURL(blob); // 호출자가 revoke 해야 함
}

/** 예측 (서버 구현상 객체가 반환됨) */
export async function predict(sessionId: string, folds = "0"): Promise<any> {
  const url = new URL(`${BASE}/predict`);
  url.searchParams.set("session_id", sessionId);
  if (folds) url.searchParams.set("folds", folds);
  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) throw await asError(res);
  return res.json();
}

/** 마스크 예측 (객체) */
export async function predictMask(sessionId: string, folds = "0"): Promise<any> {
  const url = new URL(`${BASE}/predict-mask`);
  url.searchParams.set("session_id", sessionId);
  if (folds) url.searchParams.set("folds", folds);
  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) throw await asError(res);
  return res.json();
}

/** 마스크 다운로드 (Blob) */
export async function downloadMask(sessionId: string): Promise<Blob> {
  // 1) presigned URL JSON 받기
  const res = await fetch(`${BASE}/download-mask/${encodeURIComponent(sessionId)}`, { method: "GET" });
  if (!res.ok) throw await asError(res);
  const data = await res.json() as { url: string };
  if (!data?.url) throw new Error("No presigned URL");

  // 2) presigned URL을 실제 다운로드
  const fileRes = await fetch(data.url);
  if (!fileRes.ok) throw new Error(`Presigned download failed: ${fileRes.status}`);
  return fileRes.blob();
}
