"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export type AdminOrderRow = {
  orderNumber: string;
  email: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  itemCount: number;
  latitude: number | null;
  longitude: number | null;
};

const statuses = ["PENDING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusList({ orders }: { orders: AdminOrderRow[] }) {
  const [rows, setRows] = useState(orders);
  const [busy, setBusy] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  async function updateStatus(orderNumber: string, status: string) {
    const previous = rows.find((row) => row.orderNumber === orderNumber)?.status;
    if (!previous || previous === status) return;
    setBusy(orderNumber);
    setMessages((current) => ({ ...current, [orderNumber]: "Saving…" }));
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      setRows((current) => current.map((row) => row.orderNumber === orderNumber ? { ...row, status: result.status ?? status } : row));
      if (!response.ok) throw new Error(result.error ?? "Could not save this status.");
      setMessages((current) => ({ ...current, [orderNumber]: result.emailSent ? "Saved · delivery email sent" : "Saved" }));
    } catch (error) {
      setMessages((current) => ({ ...current, [orderNumber]: error instanceof Error ? error.message : "Could not save this status." }));
    } finally {
      setBusy(null);
    }
  }

  function control(row: AdminOrderRow) {
    return <div className="min-w-36">
      <select aria-label={`Status for order ${row.orderNumber}`} value={row.status} disabled={busy === row.orderNumber} onChange={(event) => void updateStatus(row.orderNumber, event.target.value)} className="h-10 w-full rounded-md border bg-background px-2 text-sm disabled:opacity-60">
        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      {messages[row.orderNumber] ? <p role="status" className="mt-1 max-w-48 text-xs text-muted-foreground">{messages[row.orderNumber]}</p> : null}
    </div>;
  }

  return <>
    <div className="grid gap-3 md:hidden">
      {rows.map((row) => <article key={row.orderNumber} className="rounded-lg border p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><p className="font-semibold">{row.orderNumber}</p><p className="break-all text-xs text-muted-foreground">{row.email}</p></div>
          <p className="font-semibold">{formatPrice(row.total)}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <p><span className="block text-xs text-muted-foreground">Payment</span>{row.paymentStatus}</p>
          <p><span className="block text-xs text-muted-foreground">Items · date</span>{row.itemCount} · {new Date(row.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <div className="col-span-2">{control(row)}</div>
          {row.latitude !== null && row.longitude !== null ? <a className="col-span-2 text-primary underline" href={`https://www.openstreetmap.org/?mlat=${row.latitude}&mlon=${row.longitude}#map=18/${row.latitude}/${row.longitude}`} target="_blank" rel="noreferrer">Open delivery map</a> : null}
        </div>
      </article>)}
    </div>
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="text-muted-foreground"><tr><th className="py-3">Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Items</th><th>Total</th><th>Delivery</th><th>Date</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.orderNumber} className="border-t align-top">
          <td className="py-3 font-semibold">{row.orderNumber}</td><td className="max-w-44 break-all">{row.email}</td><td className="py-2">{control(row)}</td><td>{row.paymentStatus}</td><td>{row.itemCount}</td><td>{formatPrice(row.total)}</td>
          <td>{row.latitude !== null && row.longitude !== null ? <a href={`https://www.openstreetmap.org/?mlat=${row.latitude}&mlon=${row.longitude}#map=18/${row.latitude}/${row.longitude}`} target="_blank" rel="noreferrer" className="text-primary underline">Open map</a> : "—"}</td>
          <td>{new Date(row.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {!rows.length ? <p className="py-8 text-center text-sm text-muted-foreground">No orders yet. Orders will appear here after checkout.</p> : null}
  </>;
}
