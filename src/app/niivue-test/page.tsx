// src/app/niivue-test/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import BrainSliceViewer from "@/components/main/BrainSliceViewer";
import { uploadNifti } from "@/api/main_api";

type ViewType = "axial" | "coronal" | "sagittal" | "render";

// URL에서 파일명만 안전하게 뽑고(?와 # 제거)
function basenameNoQuery(u: string): string {
  try {
    const url = new URL(u);
    const path = url.pathname;
    return path.substring(path.lastIndexOf("/") + 1);
  } catch {
    const noHash = u.split("#")[0];
    const noQuery = noHash.split("?")[0];
    return noQuery.substring(noQuery.lastIndexOf("/") + 1);
  }
}

// .nii 또는 .nii.gz 확장자 여부 검사(쿼리 무시)
function looksLikeNifti(u: string): boolean {
  const base = basenameNoQuery(u).toLowerCase();
  return base.endsWith(".nii") || base.endsWith(".nii.gz");
}

export default function NiivueTestPage() {
  const [urlInput, setUrlInput] = useState<string>("");
  const [testUrl, setTestUrl] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [viewType, setViewType] = useState<ViewType>("axial");
  const [message, setMessage] = useState<string>("");

  // 입력 문자열 정리(앞뒤 따옴표 제거)
  const trimmedInput = useMemo(
    () => urlInput.trim().replace(/^["']|["']$/g, ""),
    [urlInput]
  );

  const loadTyped = () => {
    setMessage("");
    if (!trimmedInput) {
      setMessage("[INFO] URL이 비어 있습니다.");
      setTestUrl("");
      return;
    }
    // 확장자 사전검사(쿼리 무시)
    if (!looksLikeNifti(trimmedInput)) {
      setMessage(
        `[WARN] 확장자 확인: "${basenameNoQuery(
          trimmedInput
        )}" → .nii 또는 .nii.gz가 아닐 수 있습니다. (쿼리 포함 URL은 로딩은 가능하나, 파일명이 명확해야 Niivue가 압축 여부를 올바르게 판단합니다.)`
      );
    }
    setTestUrl(trimmedInput);
  };

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMessage("");
    try {
      const { session_id, input_url } = await uploadNifti(f);
      setSessionId(session_id);
      if (input_url) {
        // presigned URL 바로 사용
        setTestUrl(input_url);
        setMessage(
          `[OK] Uploaded. session_id=${session_id.slice(
            0,
            8
          )}…, using presigned URL. (파일명: ${basenameNoQuery(input_url)})`
        );
      } else {
        setMessage("[WARN] input_url not returned from API.");
        alert("input_url not returned");
      }
    } catch (err: any) {
      const msg = err?.message ?? "upload failed";
      setMessage(`[ERR] ${msg}`);
      alert(msg);
    } finally {
      // 같은 파일 재업로드 허용 위해 초기화
      e.currentTarget.value = "";
    }
  };

  // 간단 403 사전 점검(만료/CORS 확인)
  const headCheck = async () => {
    if (!trimmedInput) {
      setMessage("[INFO] URL이 비어 있습니다.");
      return;
    }
    try {
      setMessage("[…] HEAD 요청 중…");
      const res = await fetch(trimmedInput, { method: "HEAD", mode: "cors" });
      if (res.ok)
        setMessage(
          `[OK] HEAD ${res.status} ${res.statusText} (파일명: ${basenameNoQuery(
            trimmedInput
          )})`
        );
      else
        setMessage(
          `[WARN] HEAD ${res.status} ${res.statusText} (만료/CORS 확인, 파일명: ${basenameNoQuery(
            trimmedInput
          )})`
        );
    } catch (e: any) {
      setMessage(`[ERR] HEAD 실패: ${e?.message ?? String(e)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 상단 컨트롤 바 */}
      <div className="p-4 flex flex-wrap items-center gap-2 bg-neutral-900 sticky top-0">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="붙여넣을 presigned NIfTI URL"
          className="flex-1 min-w-[260px] px-3 py-2 rounded bg-neutral-800 text-sm outline-none"
        />
        <button
          onClick={loadTyped}
          className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 text-sm"
        >
          Load URL
        </button>
        <button
          onClick={headCheck}
          className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
        >
          HEAD 체크
        </button>
        <label className="px-3 py-2 rounded bg-neutral-700 text-sm cursor-pointer">
          Upload NIfTI
          <input
            type="file"
            accept=".nii,.nii.gz"
            onChange={onPickFile}
            className="hidden"
          />
        </label>
        <select
          value={viewType}
          onChange={(e) => setViewType(e.target.value as ViewType)}
          className="px-2 py-2 rounded bg-neutral-800 text-sm outline-none"
          title="View Type"
        >
          <option value="axial">axial</option>
          <option value="coronal">coronal</option>
          <option value="sagittal">sagittal</option>
          <option value="render">render</option>
        </select>
        <button
          onClick={() => {
            setUrlInput("");
            setTestUrl("");
            setSessionId("");
            setMessage("");
          }}
          className="px-3 py-2 rounded bg-neutral-700 text-sm"
        >
          Clear
        </button>
      </div>

      {/* 상태 표시 바 */}
      {(sessionId || message) && (
        <div className="px-4 py-2 bg-neutral-800 text-xs text-neutral-300">
          {sessionId && <div>session: {sessionId.slice(0, 12)}…</div>}
          {message && <div>{message}</div>}
        </div>
      )}

      {/* 뷰어 영역 */}
      <div className="h-[calc(100vh-56px-36px)]">
        {testUrl ? (
          <BrainSliceViewer
            imageUrl={testUrl}
            viewType={viewType}
            sessionId={sessionId}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            presigned NIfTI URL을 입력하거나 파일을 업로드 해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
