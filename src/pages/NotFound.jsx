import React from "react";
import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-[100vh] w-full flex items-center justify-center px-6 py-12 bg-gradient-to-br from-[#FFFBE9] via-orange-100 to-amber-100\">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
          <TriangleAlert size={30} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
          404 Error
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600">
          The page you are looking for doesn’t exist or was moved. Let’s get you
          back to something tasty.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700"
          >
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
