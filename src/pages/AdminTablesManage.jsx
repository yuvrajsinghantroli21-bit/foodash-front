import { useEffect, useRef, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

import {
  Copy,
  Download,
  Plus,
  QrCode,
  Trash2,
  Printer,
  RefreshCw,
  Table2,
  Utensils,
  Bell,
  BellOff,
  Flame,
  Activity,
  History,
  Link as LinkIcon,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

const BACKEND_URL = "https://fooadash.onrender.com";

const getTableQrUrl = (tableNumber) =>
  `${BACKEND_URL}/api/session/create/${tableNumber}`;

function TableQrCard({ table, onDelete }) {
  const qrRef = useRef(null);
  const qrUrl = getTableQrUrl(table.tableNumber);

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success(`Table ${table.tableNumber} QR link copied`);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) {
      toast.error("QR not ready");
      return;
    }

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `table-${table.tableNumber}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success(`Table ${table.tableNumber} QR downloaded`);
  };

  const printQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) {
      toast.error("QR not ready");
      return;
    }

    const img = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${table.tableNumber} QR</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
            }
            .card {
              border: 2px solid #111827;
              padding: 30px;
              display: inline-block;
              border-radius: 18px;
            }
            h1 {
              margin-bottom: 8px;
              font-size: 32px;
            }
            p {
              color: #555;
              margin-bottom: 22px;
            }
            img {
              width: 260px;
              height: 260px;
            }
            .footer {
              margin-top: 18px;
              font-size: 14px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Table ${table.tableNumber}</h1>
            <p>Scan to open FoodDash menu</p>
            <img src="${img}" />
            <div class="footer">The White House Café</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.08)] rounded-2xl">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 text-amber-600">
            <Table2 size={22} />
          </div>

          <div>
            <h3
              className="text-xl font-black text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Table {table.tableNumber}
            </h3>
            <p className="text-xs font-semibold text-slate-400">
              Permanent QR Link
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(table._id)}
          className="flex items-center justify-center text-red-500 transition rounded-lg w-9 h-9 hover:bg-red-50"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="p-5">
        <div
          ref={qrRef}
          className="flex items-center justify-center p-4 mb-4 bg-[#fbfaf8] border border-gray-100 rounded-2xl"
        >
          <QRCodeCanvas
            value={qrUrl}
            size={190}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-xs font-extrabold text-slate-500">
            QR URL
          </label>

          <div className="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-xl bg-gray-50">
            <LinkIcon size={16} className="text-slate-400 shrink-0" />

            <input
              value={qrUrl}
              readOnly
              className="w-full text-xs font-semibold bg-transparent outline-none text-slate-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-extrabold text-slate-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <Copy size={15} />
            Copy
          </button>

          <button
            onClick={downloadQR}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-extrabold text-white bg-[#071832] rounded-xl"
          >
            <Download size={15} />
            Download
          </button>

          <button
            onClick={printQR}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl"
          >
            <Printer size={15} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTablesManage() {
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchTables = () => {
    setLoading(true);

    api
      .get("/tables")
      .then((res) => {
        setTables(res.data || []);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch tables");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const addTable = () => {
    const cleanTable = tableNumber.trim();

    if (!cleanTable) {
      toast.error("Enter table number");
      return;
    }

    setAdding(true);

    api
      .post("/tables", {
        tableNumber: cleanTable,
      })
      .then(() => {
        toast.success(`Table ${cleanTable} added`);
        setTableNumber("");
        fetchTables();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to add table");
      })
      .finally(() => setAdding(false));
  };

  const deleteTable = (id) => {
    if (!window.confirm("Delete this table?")) return;

    api
      .delete(`/tables/${id}`)
      .then(() => {
        toast.success("Table deleted");
        fetchTables();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to delete table");
      });
  };

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] text-[#111827]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <main className="px-4 py-7 mx-auto max-w-[1800px] sm:px-6">
        {/* TITLE */}
        <div className="flex flex-col gap-5 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-extrabold rounded-full text-amber-700 bg-amber-50">
              <QrCode size={14} />
              Permanent Table QR
            </div>

            <h1
              className="text-4xl font-black tracking-tight text-[#111936]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Table QR Management
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
              Create permanent QR links for each restaurant table.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              onClick={fetchTables}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-extrabold bg-white border border-gray-200 shadow-sm rounded-xl text-slate-600 hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>

        {/* ADD TABLE */}
        <div className="p-5 mb-6 bg-white border border-gray-100 shadow-[0_8px_26px_rgba(15,23,42,0.07)] rounded-2xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="block mb-2 text-sm font-bold text-slate-500">
                Add Table Number
              </label>

              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Example: 1, 2, 3, A1"
                className="w-full px-4 py-3 text-sm font-semibold bg-white border border-gray-200 outline-none rounded-xl text-slate-700 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <button
              onClick={addTable}
              disabled={adding}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-extrabold text-white bg-[#071832] rounded-xl disabled:opacity-60"
            >
              <Plus size={18} />
              {adding ? "Adding..." : "Add Table"}
            </button>
          </div>
        </div>

        {/* TABLES */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            Loading tables...
          </div>
        ) : tables.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {tables.map((table) => (
              <TableQrCard
                key={table._id}
                table={table}
                onDelete={deleteTable}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <QrCode size={54} className="mb-4 opacity-30" />
            <p className="text-lg font-bold text-slate-500">
              No tables added yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Add your first table to generate its permanent QR.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
