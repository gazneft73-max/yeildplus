"use client";

export async function api<T = Record<string, unknown>>(path: string, body?: unknown, method = "POST"): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string } & T;
  if (!res.ok || json.ok === false) throw new Error(json.error || "Request failed (" + res.status + ")");
  return json;
}

/** Uploads a file to S3 through a presigned URL and returns the object key. */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const { url, key } = await api<{ url: string; key: string }>("/api/uploads/presign", {
    folder,
    contentType: file.type,
    size: file.size,
    filename: file.name,
  });
  const put = await fetch(url, { method: "PUT", body: file, headers: { "content-type": file.type } });
  if (!put.ok) throw new Error("Upload failed");
  return key;
}
