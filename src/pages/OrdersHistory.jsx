import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCartItems } from "../store/cartSlice";
import {
  ShoppingBag,
  Calendar,
  Clock,
  CheckCircle2,
  // Package,
  Truck,
  X,
  ChevronRight,
  SearchX,
  Filter,
  Download,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  placed: {
    icon: ShoppingBag,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Placed",
  },
  accepted: {
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    label: "Accepted",
  },
  // ready: {
  //   icon: Package,
  //   color: "bg-amber-100 text-amber-700 border-amber-300",
  //   label: "Ready",
  // },
  out_for_delivery: {
    icon: Truck,
    color: "bg-purple-100 text-purple-700 border-purple-300",
    label: "Out for Delivery",
  },
  delivered: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Delivered",
  },
  canceled: {
    icon: X,
    color: "bg-red-100 text-red-600 border-red-300",
    label: "Canceled",
  },
  rejected: {
    icon: X,
    color: "bg-red-100 text-red-600 border-red-300",
    label: "Rejected",
  },
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function OrderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-orange-100 bg-white p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-5 w-20 bg-slate-200 rounded-full" />
      </div>
      <div className="h-3 w-32 bg-slate-100 rounded" />
      <div className="h-3 w-40 bg-slate-100 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 bg-slate-100 rounded" />
        <div className="h-8 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ─── Order Card Component ───────────────────────────────────────────────────
function OrderCard({ order, onViewClick }) {
  const id = order?._id || order?.orderId || "";
  const shortId = typeof id === "string" ? id.slice(-6).toUpperCase() : "ORDER";
  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const itemCount = items.reduce((t, i) => t + (i.quantity || 0), 0);
  const top2Items = items.slice(0, 2);
  const extra = Math.max(0, items.length - 2);

  const orderDate = new Date(order.createdAt);
  const dateStr = orderDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = orderDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusConfig =
    STATUS_CONFIG[getDisplayStatus(order.status)] || STATUS_CONFIG.placed;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500">
              Order #{shortId}
            </p>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <Calendar size={14} />
              {dateStr} • {timeStr}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusConfig.color}`}
          >
            <StatusIcon size={14} />
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
          {itemCount} Item{itemCount !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {top2Items.map((item) => (
            <span
              key={`${order._id}-${item.name}`}
              className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-1 text-[11px] text-slate-600"
            >
              {item.name}
              <span className="font-semibold text-orange-500">
                ×{item.quantity}
              </span>
            </span>
          ))}
          {extra > 0 && (
            <span className="inline-flex items-center rounded-full bg-white border border-dashed border-slate-200 px-2 py-1 text-[11px] text-slate-500">
              +{extra} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase">Total Amount</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            ₹{order.totalAmount}
          </p>
        </div>
        <button
          onClick={() => onViewClick(id)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
        >
          View <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Normalize status string to handle all variations ───────────────────────
const normalizeStatus = (status) => {
  if (!status) return "";
  return status.toLowerCase().replace(/[\s\-\/]/g, "_"); // Replace spaces, hyphens, and slashes with underscore
};

const getDisplayStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized === "ready" ? "accepted" : normalized;
};

// ─── Main Component ─────────────────────────────────────────────────────────
const OrdersHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loadingOrders } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch orders on mount
  useEffect(() => {
    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }
    if (orders.length === 0 && !loadingOrders) {
      dispatch(fetchCartItems());
    }
  }, [user, dispatch]);

  // Filter and sort orders
  useEffect(() => {
    let result = [...orders];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(
        (order) =>
          getDisplayStatus(order.status) === normalizeStatus(statusFilter),
      );
    }

    // Sort
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "amount-high") {
      result.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === "amount-low") {
      result.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, sortBy]);

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
                Order Management
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                My Orders
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-orange-100">
              <span className="text-2xl font-bold text-slate-900">
                {orders.length}
              </span>
              <span className="text-xs text-slate-500 uppercase">Total</span>
            </div>
          </div>
          <p className="text-slate-600 mt-3">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* ── Filters Section ── */}
        <div className="mb-6 bg-white rounded-xl border border-orange-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                <Filter size={14} className="inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="all">All Orders</option>
                <option value="placed">Placed</option>
                <option value="accepted">Accepted</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="canceled">Canceled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                <Clock size={14} className="inline mr-1" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Highest Amount</option>
                <option value="amount-low">Lowest Amount</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSortBy("recent");
                }}
                className="w-full sm:w-auto rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* ── Orders Grid ── */}
        <div>
          {loadingOrders ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                {statusFilter !== "all" ? (
                  <SearchX size={32} className="text-orange-500" />
                ) : (
                  <ShoppingBag size={32} className="text-orange-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {statusFilter !== "all" ? "No orders found" : "No orders yet"}
              </h3>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                {statusFilter !== "all"
                  ? "Try adjusting your filters to find what you're looking for"
                  : "Start ordering delicious food from your favorite restaurants"}
              </p>
              <button
                onClick={() => navigate("/menu")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 font-semibold text-white shadow-lg transition-all"
              >
                <ShoppingBag size={18} />
                Browse Menu
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Showing {filteredOrders.length} of {orders.length} order
                {orders.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id || order.orderId}
                    order={order}
                    onViewClick={handleViewOrder}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Back Button ── */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/account")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
            >
              ← Back to Account
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrdersHistory;
