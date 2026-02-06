import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";

const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orders = [], reviews = [] } = user || {};
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [originalProfile, setOriginalProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [addressList, setAddressList] = useState([]);
  const [originalAddressList, setOriginalAddressList] = useState([]);

  useEffect(() => {
    const nextProfile = {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    };
    const nextAddresses = (user?.addresses || []).map((address) => ({
      street: address?.street || "",
      city: address?.city || "",
      state: address?.state || "",
      zip: address?.zip || "",
    }));
    setProfile(nextProfile);
    setOriginalProfile(nextProfile);
    setAddressList(nextAddresses);
    setOriginalAddressList(nextAddresses);
  }, [user]);

  const handleProfileChange = (field) => (event) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAddressChange = (index, field) => (event) => {
    const value = event.target.value;
    setAddressList((prev) =>
      prev.map((address, addrIndex) =>
        addrIndex === index ? { ...address, [field]: value } : address,
      ),
    );
  };

  const handleAddAddress = () => {
    setAddressList((prev) => [
      ...prev,
      { street: "", city: "", state: "", zip: "" },
    ]);
  };

  const areAddressesEqual = (left, right) => {
    if (left.length !== right.length) {
      return false;
    }
    return left.every((address, index) => {
      const other = right[index] || {};
      return (
        address.street === other.street &&
        address.city === other.city &&
        address.state === other.state &&
        address.zip === other.zip
      );
    });
  };

  const hasProfileChanges =
    profile.fullName !== originalProfile.fullName ||
    profile.email !== originalProfile.email ||
    profile.phone !== originalProfile.phone;
  const hasAddressChanges = !areAddressesEqual(
    addressList,
    originalAddressList,
  );
  const hasChanges = hasProfileChanges || hasAddressChanges;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFBE9] to-orange-200 min-h-screen">
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <header className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                Account Overview
              </p>
              <button
                className="rounded-full border border-rose-200 bg-white px-5 py-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
                onClick={() => {
                  dispatch(logout());
                  navigate("/auth/login", { replace: true });
                }}
              >
                Logout
              </button>
            </div>
            <div className="flex gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md flex items-center justify-center text-xl font-semibold">
                  MR
                </div>
                <div>
                  <p className="text-md font-serif font-light text-slate-900">
                    Welcome back
                  </p>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">
                    {profile.fullName || "Your account"}
                  </h1>
                  <p className="text-sm text-slate-600">
                    Member since 2023 • {orders.length} orders
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold text-slate-900">
                  Personal Information
                </h2>
                {hasChanges && (
                  <button className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    Save Changes
                  </button>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Full Name</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    value={profile.fullName}
                    onChange={handleProfileChange("fullName")}
                    placeholder="Your full name"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Email</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    value={profile.email}
                    onChange={handleProfileChange("email")}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Phone</span>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
                    <span className="text-sm font-semibold text-slate-500">
                      +91
                    </span>
                    <input
                      className="ml-2 w-full border-none bg-transparent px-2 py-1 text-sm outline-none"
                      value={profile.phone}
                      onChange={handleProfileChange("phone")}
                      placeholder="98765 43210"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">
                    Shipping Address
                  </h3>
                  <button
                    onClick={handleAddAddress}
                    className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-orange-400 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md"
                  >
                    Add Address
                  </button>
                </div>

                {addressList.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-700">
                    No shipping address on file yet. Add one to receive your
                    orders.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {addressList.map((address, index) => (
                      <div
                        key={`address-${index}`}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                            <span className="font-medium">Street</span>
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              value={address.street}
                              onChange={handleAddressChange(index, "street")}
                              placeholder="Street address"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-700">
                            <span className="font-medium">City</span>
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              value={address.city}
                              onChange={handleAddressChange(index, "city")}
                              placeholder="City"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-700">
                            <span className="font-medium">State</span>
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              value={address.state}
                              onChange={handleAddressChange(index, "state")}
                              placeholder="State"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-700">
                            <span className="font-medium">Zip Code</span>
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              value={address.zip}
                              onChange={handleAddressChange(index, "zip")}
                              placeholder="Zip"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-serif font-semibold text-slate-900">
                Orders Snapshot
              </h2>
              <div className="mt-4 space-y-4">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                      <UtensilsCrossed size={24} className="text-orange-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      No orders yet
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Your first order is just a few clicks away. Explore the
                      menu and discover today’s specials.
                    </p>
                    <button
                      className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => navigate("/menu")}
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-100 p-4 transition hover:border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {order.id}
                          </p>
                          <p className="text-xs text-slate-500">{order.date}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">
                        {order.items}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-900">
                          {order.total}
                        </span>
                        <button className="rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-serif font-semibold text-slate-900">
                  Recent Reviews
                </h2>
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {review.item}
                        </p>
                        <span className="text-xs text-slate-500">
                          {review.date}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span
                            key={`${review.id}-star-${idx}`}
                            className={`text-sm ${
                              idx < review.rating
                                ? "text-orange-500"
                                : "text-slate-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Account;
