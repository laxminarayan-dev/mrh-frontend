import { memo } from "react";

const ConfirmOrderCancel = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50 p-2">
      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 w-full max-w-sm">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3">
          Confirm Cancellation
        </h2>
        <p className="text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 text-gray-700">
          Are you sure you want to cancel this order?
        </p>
        <div className="flex justify-between gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderCancel;
