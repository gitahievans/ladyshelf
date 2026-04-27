import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CreditCard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import {
  fetchAdminDashboardSummary,
  fetchAdminPermissions,
} from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { AdminDashboardSummary, AdminPermissionSet } from "@/lib/types";

interface MetricCard {
  description: string;
  icon: typeof ShoppingBag;
  label: string;
  tone: "dark" | "gold" | "light";
  value: number;
}

interface QuickLink {
  description: string;
  href: string;
  icon: typeof ShoppingBag;
  isVisible: (permissions: AdminPermissionSet) => boolean;
  title: string;
}

const quickLinks: QuickLink[] = [
  {
    description: "Move orders through payment and fulfillment queues.",
    href: "/admin/orders",
    icon: ShoppingBag,
    isVisible: (permissions) => permissions.orders.view,
    title: "Orders",
  },
  {
    description: "Investigate pending, failed, and paid SasaPay records.",
    href: "/admin/payments",
    icon: Wallet,
    isVisible: (permissions) => permissions.payments.view,
    title: "Payments",
  },
  {
    description: "Look up profiles, addresses, and order history.",
    href: "/admin/customers",
    icon: Users,
    isVisible: (permissions) => permissions.customers.view,
    title: "Customers",
  },
  {
    description: "Prepare product, category, and variant management.",
    href: "/admin/catalog",
    icon: Package,
    isVisible: (permissions) => permissions.catalog.view,
    title: "Catalog",
  },
  {
    description: "Review fast stock adjustments for variants.",
    href: "/admin/inventory",
    icon: Boxes,
    isVisible: (permissions) => permissions.inventory.view,
    title: "Inventory",
  },
  {
    description: "Manage dashboard access for owners and attendants.",
    href: "/admin/staff",
    icon: ShieldCheck,
    isVisible: (permissions) => permissions.staff.view,
    title: "Staff",
  },
  {
    description: "Configure distance-based delivery rules and pickup operations.",
    href: "/admin/settings",
    icon: Settings,
    isVisible: (permissions) => permissions.settings.view,
    title: "Settings",
  },
];

function statusLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildMetricCards(summary: AdminDashboardSummary): MetricCard[] {
  return [
    {
      description: "Prepaid orders waiting for payment completion.",
      icon: CreditCard,
      label: "Awaiting Payment",
      tone: "gold",
      value: summary.awaitingPaymentOrders,
    },
    {
      description: "Orders that need dispatch, pickup, or delivery action.",
      icon: Truck,
      label: "Fulfillment Queue",
      tone: "dark",
      value: summary.fulfillmentActionOrders,
    },
    {
      description: "Variants at three units or fewer.",
      icon: AlertTriangle,
      label: "Low Stock",
      tone: "light",
      value: summary.lowStockVariants,
    },
    {
      description: "Pending, initiated, or failed payment transactions.",
      icon: Wallet,
      label: "Payment Issues",
      tone: "light",
      value: summary.paymentIssueCount,
    },
  ];
}

export default async function AdminPage(): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/auth/login?next=/admin");
  }

  const [permissions, summary] = await Promise.all([
    fetchAdminPermissions(session.access_token),
    fetchAdminDashboardSummary(session.access_token),
  ]);
  const metrics = buildMetricCards(summary);

  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <p className="font-dm-sans text-label uppercase tracking-widest text-gold">
          Operations Overview
        </p>
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">
          Today&apos;s back-office pulse.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const toneClass =
            metric.tone === "dark"
              ? "bg-obsidian text-ivory"
              : metric.tone === "gold"
                ? "bg-gold text-obsidian"
                : "bg-ivory text-obsidian";

          return (
            <article
              key={metric.label}
              className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${toneClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 font-dm-sans text-label uppercase tracking-widest text-text-muted">
                {metric.label}
              </p>
              <p className="mt-2 font-cormorant text-h1 text-obsidian">
                {metric.value}
              </p>
              <p className="mt-2 font-dm-sans text-body-sm text-text-secondary">
                {metric.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-lg border border-border-warm bg-ivory shadow-card xl:col-span-2">
          <div className="border-b border-border-warm bg-cream px-5 py-4">
            <h3 className="font-cormorant text-h4 text-obsidian">
              Recent paid orders
            </h3>
          </div>
          {summary.recentPaidOrders.length === 0 ? (
            <p className="px-5 py-8 font-dm-sans text-body text-text-secondary">
              No paid orders are available yet.
            </p>
          ) : (
            <div className="divide-y divide-border-warm">
              {summary.recentPaidOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="grid gap-3 px-5 py-4 md:grid-cols-5 md:items-center"
                >
                  <div className="md:col-span-2">
                    <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                      {order.orderNumber}
                    </p>
                    <p className="font-dm-sans text-caption text-text-muted">
                      {order.customerLabel || "Guest customer"}
                    </p>
                  </div>
                  <p className="font-dm-sans text-body-sm text-text-secondary">
                    {statusLabel(order.orderStatus)}
                  </p>
                  <p className="font-dm-sans text-body-sm text-text-secondary">
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="font-dm-sans text-body-sm font-semibold text-obsidian md:text-right">
                    {formatPrice(order.total, order.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border-warm bg-ivory shadow-card">
          <div className="border-b border-border-warm bg-cream px-5 py-4">
            <h3 className="font-cormorant text-h4 text-obsidian">
              Payment attention
            </h3>
          </div>
          {summary.paymentIssues.length === 0 ? (
            <p className="px-5 py-8 font-dm-sans text-body text-text-secondary">
              No pending or failed payment transactions.
            </p>
          ) : (
            <div className="divide-y divide-border-warm">
              {summary.paymentIssues.map((payment) => (
                <div key={payment.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                      {payment.orderNumber}
                    </p>
                    <span className="rounded-full bg-warning px-3 py-1 font-dm-sans text-caption uppercase tracking-widest text-obsidian">
                      {statusLabel(payment.status)}
                    </span>
                  </div>
                  <p className="mt-2 font-dm-sans text-body-sm text-text-secondary">
                    {formatPrice(payment.amount, payment.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-lg border border-border-warm bg-ivory shadow-card xl:col-span-2">
          <div className="border-b border-border-warm bg-cream px-5 py-4">
            <h3 className="font-cormorant text-h4 text-obsidian">
              Low-stock watchlist
            </h3>
          </div>
          {summary.lowStockItems.length === 0 ? (
            <p className="px-5 py-8 font-dm-sans text-body text-text-secondary">
              Stock levels look healthy.
            </p>
          ) : (
            <div className="divide-y divide-border-warm">
              {summary.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-5 md:items-center"
                >
                  <div className="md:col-span-2">
                    <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                      {item.productName}
                    </p>
                    <p className="font-dm-sans text-caption text-text-muted">
                      {item.sku}
                    </p>
                  </div>
                  <p className="font-dm-sans text-body-sm text-text-secondary">
                    {item.color}
                  </p>
                  <p className="font-dm-sans text-body-sm text-text-secondary">
                    {item.size}
                  </p>
                  <p className="font-dm-sans text-body-sm font-semibold text-error md:text-right">
                    {item.stock} left
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border-warm bg-obsidian p-5 text-ivory shadow-card">
          <p className="font-dm-sans text-label uppercase tracking-widest text-gold">
            Quick Actions
          </p>
          <div className="mt-5 space-y-3">
            {quickLinks.filter((link) => link.isVisible(permissions)).map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group flex items-start gap-3 rounded-lg border border-ivory/10 p-3 transition-colors hover:border-gold"
                >
                  <Icon className="mt-1 h-4 w-4 text-gold" />
                  <span className="flex-1">
                    <span className="block font-dm-sans text-body-sm font-medium text-ivory">
                      {link.title}
                    </span>
                    <span className="mt-1 block font-dm-sans text-caption text-ivory/70">
                      {link.description}
                    </span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 text-ivory/40 transition-colors group-hover:text-gold" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
