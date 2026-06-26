'use client';

import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, ImageUp, Upload, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  studentId: string;
  onSuccess: (data: { success?: boolean; message?: string; error?: string }) => void;
  onError: (error: string) => void;
}

const CAMERA_SCANNER_ID = 'student-camera-scanner';
const IMAGE_SCANNER_ID = 'student-image-scanner';

export default function QRScanner({ studentId, onSuccess, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageName, setImageName] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const submitAttendance = useCallback(
    async (decodedText: string) => {
      try {
        const res = await fetch('/api/attendance/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCode: decodedText,
            studentId,
          }),
        });
        const result = await res.json();
        onSuccess(result);
      } catch {
        onError('Failed to process attendance');
      }
    },
    [onError, onSuccess, studentId]
  );

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      CAMERA_SCANNER_ID,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        await scanner.clear().catch(() => {});
        setScanning(false);
        await submitAttendance(decodedText);
      },
      () => {}
    );

    return () => {
      void scanner.clear().catch(() => {});
    };
  }, [scanning, submitAttendance]);

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        const message = 'Please choose an image file.';
        setImageError(message);
        onError(message);
        return;
      }

      setImageBusy(true);
      setImageError('');
      setImageName(file.name);

      let scanner: Html5Qrcode | null = null;

      try {
        scanner = new Html5Qrcode(IMAGE_SCANNER_ID, false);
        const decodedText = await scanner.scanFile(file, false);
        await submitAttendance(decodedText);
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : 'No QR code found in that image. Please try a clearer image.';
        setImageError(message);
        onError(message);
      } finally {
        if (scanner) {
          scanner.clear();
        }
        setImageBusy(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onError, submitAttendance]
  );

  const handleFileSelect = (file?: File) => {
    if (!file || imageBusy) return;
    void handleImageFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFileSelect(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="w-full max-w-none sm:max-w-md mx-auto space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {!scanning ? (
          <button
            onClick={() => setScanning(true)}
            className="btn-primary w-full justify-center py-4 sm:py-6 text-base sm:text-xl shadow-2xl"
          >
            <Camera className="h-5 w-5 sm:h-8 sm:w-8" />
            Open QR Scanner
          </button>
        ) : (
          <div className="glass-card w-full">
            <div id={CAMERA_SCANNER_ID} className="overflow-hidden rounded-xl" />
            <button onClick={() => setScanning(false)} className="w-full mt-4 py-2 text-gray-500 font-semibold">
              Cancel Camera Scan
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4 sm:p-5 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileSelect(event.target.files?.[0])}
        />

        <div
          className={`rounded-xl border-2 border-dashed p-4 sm:p-5 text-center transition ${
            dragActive ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50'
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImageUp className="h-6 w-6" />
          </div>

          <h3 className="text-sm font-bold text-text-primary">Scan from an image</h3>
          <p className="mt-1 text-xs text-text-secondary">
            Choose an image or drag and drop one here. The file picker below is separate from the camera scanner.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageBusy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            {imageBusy ? 'Scanning...' : 'Choose Image'}
          </button>

          <p className="mt-3 text-xs font-medium text-slate-500">
            {imageName || 'No image chosen'}
          </p>
        </div>

        {imageError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{imageError}</span>
          </div>
        )}
      </div>

      <div id={IMAGE_SCANNER_ID} className="sr-only" aria-hidden="true" />
    </div>
  );
}
