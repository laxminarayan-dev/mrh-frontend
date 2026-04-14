import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCartItems } from "../store/cartSlice";
import {
  ShoppingBag,
  Calendar,
  Clock,
  CheckCircle2,
  Package,
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
  assigned: {
    icon: Package,
    color: "bg-cyan-100 text-cyan-700 border-cyan-300",
    label: "Assigned",
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
  cancelled: {
    icon: X,
    color: "bg-red-100 text-red-600 border-red-300",
    label: "Cancelled",
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
    <div className="animate-pulse rounded-xl border border-orange-100 bg-white p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5 md:space-y-3">
      <div className="flex justify-between gap-2">
        <div className="h-3 sm:h-3.5 md:h-4 w-20 sm:w-24 bg-slate-200 rounded" />
        <div className="h-4 sm:h-4.5 md:h-5 w-16 sm:w-20 bg-slate-200 rounded-full" />
      </div>
      <div className="h-2.5 sm:h-2.75 md:h-3 w-28 sm:w-32 bg-slate-100 rounded" />
      <div className="h-2.5 sm:h-2.75 md:h-3 w-32 sm:w-40 bg-slate-100 rounded" />
      <div className="flex gap-1.5 sm:gap-2 pt-2 sm:pt-2.5">
        <div className="h-7 sm:h-8 w-16 sm:w-20 bg-slate-100 rounded" />
        <div className="h-7 sm:h-8 w-16 sm:w-20 bg-slate-100 rounded" />
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

  const displayStatus = getDisplayStatus(order.status);
  const statusConfig = STATUS_CONFIG[displayStatus] || {
    icon: Clock,
    color: "bg-slate-100 text-slate-700 border-slate-300",
    label: toStatusLabel(displayStatus),
  };
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="border-b border-slate-100 p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between mb-2.5 sm:mb-3 md:mb-3 gap-2 sm:gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-orange-500 truncate">
              Order #{shortId}
            </p>
            <p className="text-[9px] sm:text-xs md:text-sm text-slate-500 mt-0.75 sm:mt-1 flex items-center gap-0.5 sm:gap-1 line-clamp-2">
              <Calendar size={12} className="sm:w-3.5 md:w-4 flex-shrink-0" />
              <span>
                {dateStr} • {timeStr}
              </span>
            </p>
          </div>
          <div
            className={`flex items-center gap-1 sm:gap-1.5 rounded-full border px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] md:text-xs font-semibold flex-shrink-0 whitespace-nowrap ${statusConfig.color}`}
          >
            <StatusIcon size={11} className="sm:w-3.5 md:w-4" />
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-[9px] sm:text-xs md:text-xs font-semibold text-slate-400 uppercase mb-1.5 sm:mb-2">
          {itemCount} Item{itemCount !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {top2Items.map((item) => (
            <span
              key={`${order._id}-${item.name}`}
              className="inline-flex items-center gap-0.75 sm:gap-1 rounded-full bg-white border border-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[9px] md:text-[10px] text-slate-600 truncate"
            >
              <span className="truncate">{item.name}</span>
              <span className="font-semibold text-orange-500 flex-shrink-0">
                ×{item.quantity}
              </span>
            </span>
          ))}
          {extra > 0 && (
            <span className="inline-flex items-center rounded-full bg-white border border-dashed border-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 flex-shrink-0">
              +{extra} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3 sm:p-4 md:p-5 flex items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[8px] sm:text-[9px] md:text-xs text-slate-400 uppercase">
            Total Amount
          </p>
          <p className="text-base sm:text-lg md:text-lg font-bold text-slate-900 mt-0.5 sm:mt-1">
            ₹{order.totalAmount}
          </p>
        </div>
        <button
          onClick={() => onViewClick(id)}
          className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2 text-[9px] sm:text-xs md:text-sm font-semibold text-white shadow-sm transition-all opacity-100 md:opacity-0 group-hover:opacity-100 flex-shrink-0 whitespace-nowrap"
        >
          View <ChevronRight size={12} className="sm:w-3.5 md:w-4" />
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

const toStatusLabel = (status) => {
  if (!status) return "Processing";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50 pb-4 sm:pb-6 md:pb-8">
      <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-5 lg:px-6 py-5 sm:py-6 md:py-8 lg:py-10">
        {/* ── Header ── */}
        <div className="mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          <div className="flex flex-row items-center justify-between mb-2 gap-2 sm:gap-3">
            <div>
              <p className="text-[9px] sm:text-xs md:text-xs font-semibold uppercase tracking-widest text-orange-500">
                Order Management
              </p>
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mt-1 sm:mt-1.5 md:mt-2 leading-tight">
                My Orders
              </h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg bg-white border border-orange-100 flex-shrink-0 whitespace-nowrap">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                {orders.length}
              </span>
              <span className="text-[8px] sm:text-[9px] md:text-xs text-slate-500 uppercase">
                Total
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-xs md:text-sm text-slate-600 mt-1.5 sm:mt-2 md:mt-3">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* ── Filters Section ── */}
        <div className="mb-4 sm:mb-5 md:mb-6 bg-white rounded-lg sm:rounded-xl border border-orange-100 shadow-sm p-3 sm:p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className=" text-[9px] sm:text-xs font-semibold text-slate-600 uppercase mb-1.5 sm:mb-2 flex items-center gap-1">
                <Filter size={12} className="sm:w-3.5 md:w-4" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="all">All Orders</option>
                <option value="placed">Placed</option>
                <option value="accepted">Accepted</option>
                <option value="assigned">Assigned</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="canceled">Canceled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className=" text-[9px] sm:text-xs font-semibold text-slate-600 uppercase mb-1.5 sm:mb-2 flex items-center gap-1">
                <Clock size={12} className="sm:w-3.5 md:w-4" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
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
                className="w-full sm:w-auto rounded-lg bg-slate-100 hover:bg-slate-200 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* ── Orders Grid ── */}
        <div>
          {loadingOrders ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 md:gap-4 lg:gap-5">
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
                  <ShoppingBag
                    size={28}
                    className="sm:w-8 md:w-9 text-orange-500"
                  />
                )}
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mb-2 sm:mb-2.5">
                {statusFilter !== "all" ? "No orders found" : "No orders yet"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-5 md:mb-6 max-w-sm mx-auto">
                {statusFilter !== "all"
                  ? "Try adjusting your filters to find what you're looking for"
                  : "Start ordering delicious food from your favorite restaurants"}
              </p>
              <button
                onClick={() => navigate("/menu")}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 font-semibold text-white text-xs sm:text-sm shadow-lg transition-all"
              >
                <ShoppingBag size={16} className="sm:w-4.5 md:w-5" />
                Browse Menu
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[9px] sm:text-xs md:text-sm text-slate-600 mb-3 sm:mb-3.5 md:mb-4">
                Showing {filteredOrders.length} of {orders.length} order
                {orders.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 md:gap-4 lg:gap-5">
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
          <div className="mt-6 sm:mt-7 md:mt-8 text-center">
            <button
              onClick={() => navigate("/account")}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
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
