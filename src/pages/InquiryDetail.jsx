import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { socket } from "../socket";
import {
  Mail,
  Clock,
  MessageCircle,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Archive,
  Loader,
  Copy,
  Share2,
} from "lucide-react";

// ─── Status Config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Pending",
  },
  read: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Responded",
  },
  responded: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Responded",
  },
  resolved: {
    icon: Archive,
    color: "bg-slate-100 text-slate-700 border-slate-300",
    label: "Resolved",
  },
  closed: {
    icon: Archive,
    color: "bg-slate-100 text-slate-700 border-slate-300",
    label: "Closed",
  },
};

const normalizeStatus = (status) => {
  if (!status) return "pending";
  return status.toLowerCase().replace(/[\s\-\/]/g, "_");
};

// ─── Main Component ────────────────────────────────────────────────────────
const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch inquiry details on mount
  useEffect(() => {
    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }
    fetchInquiryDetail();
  }, [id, user, navigate]);

  const fetchInquiryDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      // Fetch all user inquiries and find the one matching the ID
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
        console.log(data);
        const foundInquiry = data.inquiries?.find((inq) => inq._id === id);
        if (foundInquiry) {
          setInquiry(foundInquiry);
        } else {
          setError("Inquiry not found");
        }
      } else {
        setError("Failed to load inquiry details");
      }
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      setError("Error loading inquiry details");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Listen for admin response on this specific inquiry
    socket.on("inquiry-responded", (data) => {
      console.log("📬 Response received:", data);
      if (data.inquiryId === id) {
        setInquiry((prev) =>
          prev
            ? {
                ...prev,
                adminResponse: data.adminResponse,
                respondedAt: data.respondedAt,
                respondedBy: data.respondedBy,
                status: data.status,
              }
            : prev,
        );
      }
    });

    // Listen for status changes
    socket.on("inquiry-status-changed", (data) => {
      console.log("🔄 Status changed:", data);
      if (data.inquiryId === id) {
        setInquiry((prev) =>
          prev
            ? { ...prev, status: data.status, updatedAt: data.updatedAt }
            : prev,
        );
      }
    });

    // Listen for priority changes
    socket.on("inquiry-priority-changed", (data) => {
      console.log("⚡ Priority changed:", data);
      if (data.inquiryId === id) {
        setInquiry((prev) =>
          prev
            ? { ...prev, priority: data.priority, updatedAt: data.updatedAt }
            : prev,
        );
      }
    });

    // Listen for deletion
    socket.on("inquiry-deleted", (data) => {
      console.log("🗑️ Inquiry deleted:", data);
      if (data.inquiryId === id) {
        setError("This inquiry has been deleted");
        setTimeout(() => navigate("/account/inquiries"), 2000);
      }
    });

    return () => {
      socket.off("inquiry-responded");
      socket.off("inquiry-status-changed");
      socket.off("inquiry-priority-changed");
      socket.off("inquiry-deleted");
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl bg-white border border-slate-200 p-12 text-center">
            <Loader
              size={40}
              className="mx-auto mb-4 animate-spin text-orange-500"
            />
            <p className="text-slate-600">Loading inquiry details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !inquiry) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate("/account/inquiries")}
            className="mb-6 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Inquiries
          </button>
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-12 text-center">
            <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-red-900 mb-2">
              {error || "Inquiry not found"}
            </h2>
            <p className="text-red-700 mb-6">
              The inquiry you're looking for doesn't exist or has been removed
            </p>
            <button
              onClick={() => navigate("/account/inquiries")}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-all"
            >
              <ArrowLeft size={16} />
              Return to Inquiries
            </button>
          </div>
        </div>
      </section>
    );
  }

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

  const responseDate = inquiry.respondedAt
    ? new Date(inquiry.respondedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  console.log(inquiry);

  const hasResponse =
    inquiry.adminResponse && inquiry.adminResponse.trim().length > 0;

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50 p-4 sm:p-6 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/account/inquiries")}
          className="mb-6 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Inquiries
        </button>

        {/* Header */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">
                Inquiry #{inquiry._id?.slice(-6).toUpperCase()}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Your Inquiry
              </h1>
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap ${statusConfig.color}`}
            >
              <StatusIcon size={18} />
              {statusConfig.label}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Submitted
              </p>
              <p className="text-sm text-slate-900 flex items-center gap-2">
                <Clock size={14} className="text-orange-500" />
                {dateStr} • {timeStr}
              </p>
            </div>
            {inquiry.priority && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Priority
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold capitalize">
                  {inquiry.priority}
                </span>
              </div>
            )}
            {inquiry.category && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Category
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold capitalize">
                  {inquiry.category.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Inquiry Content */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail size={18} className="text-orange-500" />
              Your Message
            </h2>
            <button
              onClick={() => copyToClipboard(inquiry.inquiry)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
            >
              <Copy size={14} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-transparent rounded-lg p-6 border border-orange-100">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
              {inquiry.inquiry}
            </p>
          </div>
        </div>

        {/* Admin Response */}
        {hasResponse && (
          <div className="rounded-xl bg-white border border-green-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-green-100">
              <h2 className="text-base font-bold text-green-900 flex items-center gap-2">
                <MessageCircle size={18} className="text-green-600" />
                Admin Response
              </h2>
              {responseDate && (
                <p className="text-xs text-green-600 font-semibold">
                  {responseDate}
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-green-50 to-transparent rounded-lg p-6 border border-green-100">
              <p className="text-green-800 leading-relaxed whitespace-pre-wrap break-words">
                {inquiry.adminResponse}
              </p>
            </div>
            {inquiry.respondedBy && (
              <p className="mt-4 text-xs text-green-600">
                From:{" "}
                <span className="font-semibold">{inquiry.respondedBy}</span>
              </p>
            )}
          </div>
        )}

        {/* No Response Yet */}
        {!hasResponse && (
          <div className="rounded-xl bg-blue-50 border-2 border-dashed border-blue-200 p-8 mb-6 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-blue-500" />
            <h3 className="text-base font-semibold text-blue-900 mb-1">
              Awaiting Response
            </h3>
            <p className="text-sm text-blue-700">
              Our admin team will review your inquiry and respond as soon as
              possible
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/account/inquiries")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>
          <button
            onClick={() => fetchInquiryDetail()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all shadow-sm"
          >
            <Loader size={16} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all shadow-sm"
          >
            <Mail size={16} />
            New Inquiry
          </button>
        </div>
      </div>
    </section>
  );
};

export default InquiryDetail;
