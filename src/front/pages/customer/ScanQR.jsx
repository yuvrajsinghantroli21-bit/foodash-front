import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";

function ScanQR() {
  const navigate = useNavigate();

  let scanned = false; // ✅ prevent multiple scans

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
      <h1 className="mb-4 text-xl">Scan QR Code</h1>

      <div className="overflow-hidden border-4 w-80 border-emerald-500 rounded-xl">
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
        className="px-4 py-2 mt-5 bg-red-500 rounded"
      >
        Cancel
      </button>
    </div>
  );
}

export default ScanQR;
