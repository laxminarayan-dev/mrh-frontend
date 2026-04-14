import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import {
  Mail,
  Clock,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  XCircle,
  Archive,
  Filter,
  SearchX,
} from "lucide-react";

// ─── Status Config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Pending",
    badge: "Awaiting Response",
  },
  read: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Responded",
    badge: "Admin Replied",
  },
  responded: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Responded",
    badge: "Admin Replied",
  },
  resolved: {
    icon: Archive,
    color: "bg-slate-100 text-slate-700 border-slate-300",
    label: "Resolved",
    badge: "Resolved",
  },
  closed: {
    icon: Archive,
    color: "bg-slate-100 text-slate-700 border-slate-300",
    label: "Closed",
    badge: "Resolved",
  },
};

// ─── Normalize status string ───────────────────────────────────────────────
const normalizeStatus = (status) => {
  if (!status) return "pending";
  return status.toLowerCase().replace(/[\s\-\/]/g, "_");
};

// ─── Inquiry Card Skeleton ─────────────────────────────────────────────────
function InquiryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg sm:rounded-lg border border-orange-100 bg-white p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5 md:space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="h-2.5 sm:h-3 md:h-4 w-24 sm:w-32 md:w-32 bg-slate-200 rounded mb-1.5 sm:mb-2" />
          <div className="h-2 sm:h-2.5 md:h-3 w-32 sm:w-48 md:w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-5 sm:h-6 md:h-6 w-20 sm:w-24 md:w-24 bg-slate-200 rounded-full flex-shrink-0" />
      </div>
      <div className="h-9 sm:h-10 md:h-12 w-full bg-slate-100 rounded" />
      <div className="pt-1.5 sm:pt-2 flex gap-1.5 sm:gap-2">
        <div className="h-7 sm:h-7 md:h-8 w-16 sm:w-20 md:w-20 bg-slate-100 rounded" />
        <div className="h-7 sm:h-7 md:h-8 w-16 sm:w-20 md:w-20 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ─── Inquiry Card Component ────────────────────────────────────────────────
function InquiryCard({ inquiry, onViewClick }) {
  const inquiryStatus = normalizeStatus(inquiry.status) || "pending";
  const statusConfig = STATUS_CONFIG[inquiryStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const inquiryDate = new Date(inquiry.createdAt);
  const dateStr = inquiryDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = inquiryDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasResponse =
    inquiry.adminResponse && inquiry.adminResponse.trim().length > 0;

  return (
    <div className="group rounded-lg sm:rounded-lg border border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="border-b border-slate-100 p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Mail
                size={14}
                className="sm:w-4 md:w-5 sm:h-4 md:h-5 text-orange-500 flex-shrink-0"
              />
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-500 truncate">
                Inquiry #{inquiry._id?.slice(-6).toUpperCase()}
              </p>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 flex items-center gap-0.5 sm:gap-1 truncate">
              <Clock
                size={12}
                className="sm:w-3.5 md:w-4 sm:h-3.5 md:h-4 flex-shrink-0"
              />
              <span className="truncate">
                {dateStr} • {timeStr}
              </span>
            </p>
          </div>
          <div
            className={`flex items-center gap-0.5 sm:gap-1 rounded-full border px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[9px] md:text-xs font-semibold whitespace-nowrap flex-shrink-0 ${statusConfig.color}`}
          >
            <StatusIcon size={10} className="sm:w-3.5 md:w-4 sm:h-3.5 md:h-4" />
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Inquiry Text */}
      <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-orange-50 to-transparent border-b border-slate-100">
        <p className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-slate-400 uppercase mb-1.5 sm:mb-2">
          Your Message
        </p>
        <p className="text-xs sm:text-xs md:text-sm text-slate-700 leading-relaxed line-clamp-2">
          {inquiry.inquiry}
        </p>
      </div>

      {/* Admin Response (if exists) */}
      {hasResponse && (
        <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-green-50 border-b border-green-100">
          <p className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-green-600 uppercase mb-1.5 sm:mb-2 flex items-center gap-0.5 sm:gap-1">
            <MessageCircle size={10} className="sm:w-3 md:w-3 sm:h-3 md:h-3" />
            Admin Response
          </p>
          <p className="text-xs sm:text-xs md:text-sm text-green-700 leading-relaxed line-clamp-2">
            {inquiry.adminResponse}
          </p>
        </div>
      )}

      {/* Card Footer */}
      <div className="p-3 sm:p-4 md:p-5 flex items-center justify-between gap-2">
        <div className="text-[9px] sm:text-xs text-slate-500">
          {inquiry.priority && (
            <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 font-semibold text-[8px] sm:text-[9px] capitalize">
              {inquiry.priority} Priority
            </span>
          )}
        </div>
        <button
          onClick={() => onViewClick(inquiry._id)}
          className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 text-[8px] sm:text-xs md:text-sm font-semibold text-white shadow-sm transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
const Inquiries = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch inquiries on mount
  useEffect(() => {
    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }
    fetchMyInquiries();
  }, [user, navigate]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Listen for inquiry response
    socket.on("inquiry-responded", (data) => {
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === data.inquiryId
            ? {
                ...inq,
                adminResponse: data.adminResponse,
                respondedAt: data.respondedAt,
                respondedBy: data.respondedBy,
                status: data.status,
              }
            : inq,
        ),
      );
    });

    // Listen for status changes
    socket.on("inquiry-status-changed", (data) => {
      console.log("🔄 Status changed:", data);
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === data.inquiryId
            ? { ...inq, status: data.status, updatedAt: data.updatedAt }
            : inq,
        ),
      );
    });

    // Listen for priority changes
    socket.on("inquiry-priority-changed", (data) => {
      console.log("⚡ Priority changed:", data);
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === data.inquiryId
            ? { ...inq, priority: data.priority, updatedAt: data.updatedAt }
            : inq,
        ),
      );
    });

    // Listen for inquiry deletion
    socket.on("inquiry-deleted", (data) => {
      console.log("🗑️ Inquiry deleted:", data);
      setInquiries((prev) => prev.filter((inq) => inq._id !== data.inquiryId));
    });

    return () => {
      socket.off("inquiry-responded");
      socket.off("inquiry-status-changed");
      socket.off("inquiry-priority-changed");
      socket.off("inquiry-deleted");
    };
  }, []);

  const fetchMyInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/api/inquiry/my-inquiries`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries || []);
      } else {
        console.error("Failed to fetch inquiries");
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoadingInquiries(false);
    }
  };

  // Filter and sort inquiries
  useEffect(() => {
    let result = [...inquiries];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(
        (inquiry) =>
          normalizeStatus(inquiry.status) === normalizeStatus(statusFilter),
      );
    }

    // Sort
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredInquiries(result);
  }, [inquiries, statusFilter, sortBy]);

  const handleViewInquiry = (inquiryId) => {
    navigate(`/account/inquiries/${inquiryId}`);
  };

  const pendingCount = inquiries.filter(
    (i) => normalizeStatus(i.status) === "pending",
  ).length;
  const respondedCount = inquiries.filter(
    (i) => normalizeStatus(i.status) === "responded",
  ).length;
  const resolvedCount = inquiries.filter((i) => {
    const status = normalizeStatus(i.status);
    return status === "resolved" || status === "closed";
  }).length;

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50">
      <div className="mx-auto max-w-5xl px-2 sm:px-3 md:px-4 lg:px-6 py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-7 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1.5 sm:mb-2 flex items-center gap-2 leading-tight">
              <Mail
                size={24}
                className="sm:w-7 md:w-8 sm:h-7 md:h-8 text-orange-500 flex-shrink-0"
              />
              My Inquiries
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Track all your inquiries and admin responses
            </p>
          </div>
          <button
            onClick={() => navigate("/contact-us")}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-semibold text-white shadow-sm transition-all flex-shrink-0"
          >
            <Mail size={14} className="sm:w-4 md:w-4 sm:h-4 md:h-4" />
            New Inquiry
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          <div className="rounded-lg bg-white border border-slate-200 p-2 sm:p-3 md:p-4 text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
              {inquiries.length}
            </p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 uppercase font-semibold mt-0.5 sm:mt-1">
              Total
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2 sm:p-3 md:p-4 text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">
              {pendingCount}
            </p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-blue-600 uppercase font-semibold mt-0.5 sm:mt-1">
              Pending
            </p>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-200 p-2 sm:p-3 md:p-4 text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700">
              {respondedCount}
            </p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-green-600 uppercase font-semibold mt-0.5 sm:mt-1">
              Responded
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 sm:p-3 md:p-4 text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700">
              {resolvedCount}
            </p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-600 uppercase font-semibold mt-0.5 sm:mt-1">
              Resolved
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-lg sm:rounded-lg bg-white border border-slate-200 p-3 sm:p-4 md:p-5 lg:p-6 mb-6 sm:mb-7 md:mb-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
            <Filter
              size={16}
              className="sm:w-5 md:w-5 sm:h-5 md:h-5 text-orange-500"
            />
            <h2 className="text-xs sm:text-sm md:text-sm font-bold uppercase tracking-wide text-slate-700">
              Filters & Sorting
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-[9px] sm:text-xs md:text-xs font-semibold text-slate-600 uppercase mb-1.5 sm:mb-2">
                <AlertCircle
                  size={12}
                  className="sm:w-3.5 md:w-4 sm:h-3.5 md:h-4 inline mr-1"
                />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 md:px-3 py-1.5 sm:py-2 md:py-2 text-xs sm:text-xs md:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="all">All Inquiries</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className="block text-[9px] sm:text-xs md:text-xs font-semibold text-slate-600 uppercase mb-1.5 sm:mb-2">
                <Clock
                  size={12}
                  className="sm:w-3.5 md:w-4 sm:h-3.5 md:h-4 inline mr-1"
                />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 md:px-3 py-1.5 sm:py-2 md:py-2 text-xs sm:text-xs md:text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end pt-4 sm:pt-0">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSortBy("recent");
                }}
                className="w-full sm:w-auto rounded-lg bg-slate-100 hover:bg-slate-200 px-3 sm:px-4 md:px-4 py-1.5 sm:py-2 md:py-2 text-xs sm:text-xs md:text-sm font-medium text-slate-700 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* ── Inquiries Grid ── */}
        <div>
          {loadingInquiries ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InquiryCardSkeleton />
              <InquiryCardSkeleton />
              <InquiryCardSkeleton />
              <InquiryCardSkeleton />
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="rounded-lg sm:rounded-lg border-2 border-dashed border-orange-200 bg-orange-50 p-6 sm:p-8 md:p-12 text-center">
              <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                {statusFilter !== "all" ? (
                  <SearchX
                    size={24}
                    className="sm:w-8 md:w-8 sm:h-8 md:h-8 text-orange-500"
                  />
                ) : (
                  <Mail
                    size={24}
                    className="sm:w-8 md:w-8 sm:h-8 md:h-8 text-orange-500"
                  />
                )}
              </div>
              <h3 className="text-base sm:text-lg md:text-lg font-bold text-slate-900 mb-1">
                {statusFilter !== "all"
                  ? "No inquiries found"
                  : "No inquiries yet"}
              </h3>
              <p className="text-xs sm:text-sm md:text-sm text-slate-600 mb-4 sm:mb-6">
                {statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Send your first inquiry through the contact form"}
              </p>
              {statusFilter === "all" && (
                <button
                  onClick={() => navigate("/contact")}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-4 sm:px-6 md:px-6 py-1.5 sm:py-2 md:py-2 text-xs sm:text-sm md:text-sm font-semibold text-white transition-all"
                >
                  <Mail size={14} className="sm:w-4 md:w-4 sm:h-4 md:h-4" />
                  Submit Inquiry
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInquiries.map((inquiry) => (
                <InquiryCard
                  key={inquiry._id}
                  inquiry={inquiry}
                  onViewClick={handleViewInquiry}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Inquiries;
