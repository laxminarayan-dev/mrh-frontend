import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
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
    <div className="animate-pulse rounded-xl border border-orange-100 bg-white p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-24 bg-slate-200 rounded-full" />
      </div>
      <div className="h-12 w-full bg-slate-100 rounded" />
      <div className="pt-2 flex gap-2">
        <div className="h-8 w-20 bg-slate-100 rounded" />
        <div className="h-8 w-20 bg-slate-100 rounded" />
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
    <div className="group rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} className="text-orange-500" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Inquiry #{inquiry._id?.slice(-6).toUpperCase()}
              </p>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Clock size={14} />
              {dateStr} • {timeStr}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${statusConfig.color}`}
          >
            <StatusIcon size={14} />
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Inquiry Text */}
      <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-transparent border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
          Your Message
        </p>
        <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
          {inquiry.inquiry}
        </p>
      </div>

      {/* Admin Response (if exists) */}
      {hasResponse && (
        <div className="px-5 py-4 bg-green-50 border-b border-green-100">
          <p className="text-xs font-semibold text-green-600 uppercase mb-2 flex items-center gap-1">
            <MessageCircle size={12} />
            Admin Response
          </p>
          <p className="text-sm text-green-700 leading-relaxed line-clamp-2">
            {inquiry.adminResponse}
          </p>
        </div>
      )}

      {/* Card Footer */}
      <div className="p-5 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {inquiry.priority && (
            <span className="inline-block px-2 py-1 rounded-full bg-slate-100 font-semibold capitalize">
              {inquiry.priority} Priority
            </span>
          )}
        </div>
        <button
          onClick={() => onViewClick(inquiry._id)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
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

  const fetchMyInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const token = Cookies.get("token");
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
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log("ok hai ji", data);
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

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Mail size={32} className="text-orange-500" />
            My Inquiries
          </h1>
          <p className="text-slate-600">
            Track all your inquiries and admin responses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="rounded-lg bg-white border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {inquiries.length}
            </p>
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Total
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{pendingCount}</p>
            <p className="text-xs text-blue-600 uppercase font-semibold">
              Pending
            </p>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-700">
              {respondedCount}
            </p>
            <p className="text-xs text-green-600 uppercase font-semibold">
              Responded
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 text-center">
            <button
              onClick={() => navigate("/contact")}
              className="w-full text-center text-orange-600 hover:text-orange-700 font-semibold text-sm"
            >
              New Inquiry
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={18} className="text-orange-500" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Filters & Sorting
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                <AlertCircle size={14} className="inline mr-1" />
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="all">All Inquiries</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
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
            <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                {statusFilter !== "all" ? (
                  <SearchX size={32} className="text-orange-500" />
                ) : (
                  <Mail size={32} className="text-orange-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {statusFilter !== "all"
                  ? "No inquiries found"
                  : "No inquiries yet"}
              </h3>
              <p className="text-slate-600 mb-6">
                {statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Send your first inquiry through the contact form"}
              </p>
              {statusFilter === "all" && (
                <button
                  onClick={() => navigate("/contact")}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-6 py-2 text-sm font-semibold text-white transition-all"
                >
                  <Mail size={16} />
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
