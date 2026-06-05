export const printBill = ({
  tableOrders = [],
  tableKey = "N/A",
  orderNo = "ACTIVE",
  settings = null,
  sessionBill = null,
}) => {
  const safeTableOrders = tableOrders.filter(Boolean);
  if (safeTableOrders.length === 0) return;

  const billSettings = settings || {};

  const calcOrderSubtotal = (order) =>
    (order.items || []).reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
      0,
    );

  const calcOrdersSubtotal = safeTableOrders.reduce(
    (sum, order) => sum + calcOrderSubtotal(order),
    0,
  );

  const subtotal =
    sessionBill?.subtotal !== undefined && sessionBill?.subtotal !== null
      ? Number(sessionBill.subtotal)
      : calcOrdersSubtotal;

  const discount =
    sessionBill?.discountAmount !== undefined &&
    sessionBill?.discountAmount !== null
      ? Number(sessionBill.discountAmount)
      : 0;

  const charges = Array.isArray(sessionBill?.billChargesSnapshot)
    ? sessionBill.billChargesSnapshot
    : [];

  const chargesTotal = Number(sessionBill?.chargesTotal || 0);

  const chargesHtml = charges
    .map(
      (charge) => `
      <div class="price-row">
        <span>${charge.name}</span>
        <span>
          ${Number(charge.amount) >= 0 ? "+" : "-"}₹${Math.abs(
            Number(charge.amount),
          ).toFixed(2)}
        </span>
      </div>
    `,
    )
    .join("");

  const finalTotal =
    sessionBill?.finalTotal !== undefined && sessionBill?.finalTotal !== null
      ? Number(sessionBill.finalTotal)
      : Math.max(0, subtotal - discount);

  const receiptFont =
    billSettings.receiptFontStyle === "serif"
      ? "Georgia, serif"
      : billSettings.receiptFontStyle === "mono"
        ? "monospace"
        : "Inter, Arial, sans-serif";

  const showUpiQR = billSettings.showQR && billSettings.upiId;

  const upiQrUrl = showUpiQR
    ? `upi://pay?pa=${encodeURIComponent(
        billSettings.upiId,
      )}&pn=${encodeURIComponent(
        billSettings.cafeName || "The White House Café",
      )}&cu=INR&am=${Math.round(finalTotal)}`
    : "";

  const coupon = sessionBill?.coupon || null;

  const table =
    tableKey === "Unknown"
      ? "N/A"
      : tableKey || safeTableOrders[0]?.table || "N/A";

  const sessionId =
    safeTableOrders[0]?.sessionId ||
    safeTableOrders[0]?.token ||
    safeTableOrders[0]?._id?.slice(-6)?.toUpperCase() ||
    "—";

  const paymentMode =
    String(sessionBill?.paymentMode || "counter").toLowerCase() === "online"
      ? "Online"
      : "Counter";

  const paymentStatus =
    String(sessionBill?.paymentStatus || "due").toLowerCase() === "paid"
      ? "Paid"
      : "Due";
  const razorpayPaymentId = sessionBill?.razorpayPaymentId || "";
  const razorpayOrderId = sessionBill?.razorpayOrderId || "";

  const totalItems = safeTableOrders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qty || 1),
        0,
      ),
    0,
  );

  const billDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const feedbackUrl =
    billSettings.feedbackUrl ||
    `${window.location.origin}/feedback?table=${table}&session=${sessionId}`;

  const batchHtml = safeTableOrders
    .map((order, batchIndex) => {
      const batchSubtotal = calcOrderSubtotal(order);

      const itemsHtml = (order.items || [])
        .map(
          (item) => `
            <tr>
              <td>
                <div class="item-name">${item.name || "Item"}</div>
                ${
                  item.note && item.note.trim() !== ""
                    ? `<div class="item-note">📝 ${item.note}</div>`
                    : ""
                }
              </td>
              <td class="center">${item.qty || 1}</td>
              <td class="right">₹${Number(item.price || 0)}</td>
              <td class="right strong">₹${
                Number(item.price || 0) * Number(item.qty || 1)
              }</td>
            </tr>
          `,
        )
        .join("");

      return `
        <div class="batch">
          <div class="batch-head">
            <div>
              <h3>Batch #${batchIndex + 1}</h3>
              <p>Received: ${new Date(order.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
                <th class="right">Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div class="batch-total">
            <span>Batch Total</span>
            <strong>₹${Math.round(batchSubtotal)}</strong>
          </div>
        </div>
      `;
    })
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Bill #${orderNo}</title>
      <style>
        * { box-sizing: border-box; }

        body {
          margin: 0;
          padding: 24px;
          background: #f8f5ef;
          color: #111827;
          font-family: ${receiptFont};
        }

        .bill {
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid #eee7dc;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }

        .top-strip {
          height: 8px;
          background: linear-gradient(90deg, #0f172a, #d4a74f, #0f172a);
        }

        .header {
          padding: 26px 26px 18px;
          text-align: center;
          background: linear-gradient(180deg, #fffaf2, #ffffff);
          border-bottom: 1px solid #f1ede5;
        }

        .logo {
          height: 54px;
          width: auto;
          object-fit: contain;
          margin-bottom: 10px;
        }

        .brand {
          font-size: 30px;
          font-weight: 950;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
          color: #111827;
        }

        .sub {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          line-height: 1.5;
        }

        .badge {
          display: inline-block;
          margin-top: 14px;
          padding: 7px 12px;
          border-radius: 999px;
          background: #0f172a;
          color: white;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 18px 22px 10px;
        }

        .meta-card {
          background: #faf7f1;
          border: 1px solid #efe9de;
          border-radius: 14px;
          padding: 11px 12px;
        }

        .label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          color: #8a8f98;
          font-weight: 900;
          letter-spacing: 0.07em;
          margin-bottom: 4px;
        }

        .value {
          font-size: 13px;
          font-weight: 900;
          color: #111827;
          word-break: break-word;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 10px 22px 16px;
        }

        .summary-box {
          text-align: center;
          border-radius: 14px;
          padding: 11px 8px;
          border: 1px solid #edf0f3;
          background: #ffffff;
        }

        .summary-box.gold {
          background: #fff8eb;
          border-color: #f4e1b5;
        }

        .summary-box.green {
          background: #edfdf3;
          border-color: #bfe8cd;
        }

        .summary-title {
          font-size: 10px;
          font-weight: 900;
          color: #7b818a;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .summary-value {
          font-size: 15px;
          font-weight: 950;
          text-transform: capitalize;
        }

        .content {
          padding: 0 22px 18px;
        }

        .batch {
          border: 1px solid #ebeef2;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 14px;
          background: #fcfcfd;
        }

        .batch-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .batch h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
        }

        .batch p {
          margin: 3px 0 0;
          font-size: 11px;
          color: #6b7280;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        th {
          color: #7b818a;
          font-size: 10px;
          text-transform: uppercase;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        td {
          padding: 9px 0;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .item-name {
          font-weight: 900;
        }

        .item-note {
          font-size: 10px;
          color: #b45309;
          margin-top: 3px;
          font-style: italic;
        }

        .center { text-align: center; }
        .right { text-align: right; }
        .strong { font-weight: 950; }

        .batch-total {
          display: flex;
          justify-content: space-between;
          padding-top: 10px;
          margin-top: 10px;
          border-top: 1px dashed #d1d5db;
          font-size: 13px;
          font-weight: 900;
        }

        .price-box {
          margin: 6px 22px 20px;
        }

        .price-inner {
          border: 1px solid #efe9de;
          border-radius: 18px;
          background: #fffaf2;
          padding: 14px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
          font-weight: 900;
          color: #6b7280;
          margin-bottom: 10px;
        }

        .discount {
          color: #059669;
          font-weight: 950;
        }

        .coupon-note {
          margin: 0 22px 16px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px dashed #16a34a;
          background: #ecfdf5;
          color: #047857;
          font-size: 12px;
          font-weight: 900;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .final-row {
          border-top: 1px dashed #d1d5db;
          margin-top: 12px;
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .grand-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          color: #111827;
        }

        .grand-value {
          font-size: 32px;
          font-weight: 950;
          color: #0f172a;
          letter-spacing: -0.05em;
        }

        .payment-small {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 800;
          color: #6b7280;
          text-transform: capitalize;
        }

        .payment-note {
          margin: 0 22px 20px;
          padding: 14px;
          border-radius: 14px;
          background: #fff8eb;
          border: 1px solid #f4dfb0;
          font-size: 12px;
          font-weight: 800;
          color: #b45309;
          line-height: 1.6;
          text-align: center;
        }

        .feedback-qr {
          margin: 0 22px 20px;
          padding: 16px;
          border-radius: 18px;
          background: #fffaf2;
          border: 1px solid #f4dfb0;
          text-align: center;
        }

        .feedback-qr-title {
          font-size: 13px;
          font-weight: 950;
          color: #111827;
          margin-bottom: 6px;
        }

        .feedback-qr-sub {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .feedback-qr img {
          width: 120px;
          height: 120px;
        }

        .footer {
          padding: 0 24px 24px;
          text-align: center;
        }

        .footer-inner {
          border-top: 1px dashed #d1d5db;
          padding-top: 16px;
        }

        .thanks {
          font-size: 17px;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .footer-sub {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.5;
        }

        .payment-id-box {
  margin: 0 22px 18px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  font-size: 11px;
  font-weight: 800;
  color: #047857;
  line-height: 1.5;
  word-break: break-all;
}

.payment-id-box span {
  display: block;
  color: #6b7280;
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 3px;
}

        .qr-row {
  margin: 0 22px 20px;
  display: grid;
  gap: 12px;
}

.qr-row.two {
  grid-template-columns: 1fr 1fr;
}

.qr-row.one {
  grid-template-columns: 1fr;
}

.qr-row .feedback-qr {
  margin: 0;
}

.qr-row .feedback-qr img {
  width: 105px;
  height: 105px;
}

@media print {
  .qr-row.two {
    grid-template-columns: 1fr 1fr;
  }
}

        @media print {
          body {
            background: white;
            padding: 0;
          }

          .bill {
            border: none;
            box-shadow: none;
            max-width: 100%;
            border-radius: 0;
          }
        }
      </style>
    </head>

    <body>
      <div class="bill">
        <div class="top-strip"></div>

        <div class="header">
          ${
            billSettings.logo
              ? `<img src="${billSettings.logo}" class="logo" />`
              : ""
          }

          <div class="brand">${
            billSettings.cafeName || "The White House Café"
          }</div>

          <div class="sub">
            ${billSettings.address || "Qzora Smart Ordering Receipt"}
          </div>

          ${
            billSettings.phone || billSettings.email
              ? `<div class="sub" style="margin-top:6px;">
                  ${billSettings.phone || ""} ${
                    billSettings.phone && billSettings.email ? " • " : ""
                  } ${billSettings.email || ""}
                </div>`
              : ""
          }

          ${
            billSettings.gstNumber
              ? `<div class="sub" style="margin-top:6px;">GST: ${billSettings.gstNumber}</div>`
              : ""
          }

          <div class="badge">Table Bill</div>
        </div>

        <div class="meta">
          <div class="meta-card">
            <span class="label">Bill No</span>
            <span class="value">#${orderNo}</span>
          </div>

          <div class="meta-card">
            <span class="label">Table</span>
            <span class="value">${table}</span>
          </div>

          <div class="meta-card">
            <span class="label">Session</span>
            <span class="value">${sessionId}</span>
          </div>

          <div class="meta-card">
            <span class="label">Printed At</span>
            <span class="value">${billDate}</span>
          </div>
        </div>

        <div class="summary">
          <div class="summary-box gold">
            <div class="summary-title">Batches</div>
            <div class="summary-value">${safeTableOrders.length}</div>
          </div>

          <div class="summary-box">
            <div class="summary-title">Items</div>
            <div class="summary-value">${totalItems}</div>
          </div>

          <div class="summary-box green">
            <div class="summary-title">Payment</div>
            <div class="summary-value">${paymentStatus}</div>
          </div>
        </div>

        <div class="content">
          ${batchHtml}
        </div>

        ${
          coupon && discount > 0
            ? `
              <div class="coupon-note">
                <span>Coupon Applied: ${coupon.code}</span>
                <strong>-₹${Math.round(discount)}</strong>
              </div>
            `
            : ""
        }

        <div class="price-box">
          <div class="price-inner">
            <div class="price-row">
              <span>Subtotal</span>
              <span>₹${Math.round(subtotal)}</span>
            </div>

            ${chargesHtml}

            ${
              charges.length > 0
                ? `
      <div class="price-row">
        <span><strong>Total Charges</strong></span>
        <span><strong>₹${Math.round(chargesTotal)}</strong></span>
      </div>
    `
                : ""
            }

            ${
              coupon && discount > 0
                ? `
                  <div class="price-row discount">
                    <span>Coupon Discount</span>
                    <span>-₹${Math.round(discount)}</span>
                  </div>
                `
                : ""
            }

            <div class="final-row">
              <div>
                <div class="grand-label">Final Payable</div>
                <div class="payment-small">
                  ${paymentMode} • ${paymentStatus}
                </div>
              </div>

              <div class="grand-value">₹${Math.round(finalTotal)}</div>
            </div>
          </div>
        </div>


        ${
          billSettings.paymentNote
            ? `<div class="payment-note">${billSettings.paymentNote}</div>`
            : ""
        }
       
    <div class="qr-row ${showUpiQR ? "two" : "one"}">
  ${
    showUpiQR
      ? `
        <div class="feedback-qr">
          <div class="feedback-qr-title">Scan to Pay</div>
          <div class="feedback-qr-sub">
            UPI ID: ${billSettings.upiId}
          </div>

          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
              upiQrUrl,
            )}" 
            alt="UPI Payment QR" 
          />
        </div>
      `
      : ""
  }

  <div class="feedback-qr">
    <div class="feedback-qr-title">Share Your Feedback</div>
    <div class="feedback-qr-sub">
      Scan this QR and tell us about your experience
    </div>

    <img 
      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        feedbackUrl,
      )}" 
      alt="Feedback QR" 
    />
  </div>
</div>

        <div class="footer">
          <div class="footer-inner">
            <div class="thanks">
              ${billSettings.receiptFooter || "Thank you for dining with us"}
            </div>

            <div class="footer-sub">
              Please keep this bill for your reference.<br/>
              Powered by Qzora
            </div>
          </div>
        </div>
      </div>

      <script>
        setTimeout(function () {
          window.focus();
          window.print();
        }, 400);
      </script>
    </body>
  </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    alert("Popup blocked. Please allow popups and try again.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
