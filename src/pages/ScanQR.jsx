import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";

function ScanQR() {
  const navigate = useNavigate();

  let scanned = false; // ✅ prevent multiple scans

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-xl mb-4">Scan QR Code</h1>

      <div className="w-80 border-4 border-emerald-500 rounded-xl overflow-hidden">
        <Scanner
          constraints={{ facingMode: "environment" }}
          onScan={(result) => {
            if (result && !scanned) {
              scanned = true;

              // result[0].rawValue contains QR text
              const url = result[0]?.rawValue;

              if (url) {
                window.location.href = url;
              }
            }
          }}
          onError={(error) => {
            console.log("QR Error:", error);
          }}
        />
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-5 px-4 py-2 bg-red-500 rounded"
      >
        Cancel
      </button>
    </div>
  );
}

export default ScanQR;
