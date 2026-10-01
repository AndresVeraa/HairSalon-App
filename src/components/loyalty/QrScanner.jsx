import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('customer-qr-reader', { fps: 10, qrbox: { width: 220, height: 220 } }, false)
    scannerRef.current = scanner
    scanner.render(
      (decodedText) => {
        onScan(decodedText)
        scanner.clear().catch((error) => onError?.(error))
      },
      (errorMessage) => onError?.(new Error(errorMessage)),
    )
    return () => {
      scanner.clear().catch(() => {})
    }
  }, [onError, onScan])

  return <div id="customer-qr-reader" className="w-full" />
}
