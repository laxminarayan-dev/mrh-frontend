import { memo } from "react";

const ConfirmOrderCancel = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-100">
                <h2 className="text-xl font-semibold mb-4">Confirm Cancellation</h2>
                <p className="mb-6">Are you sure you want to cancel this order?</p>
                <div className="flex justify-between gap-4">
                    <button

                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        No
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
}


export default ConfirmOrderCancel;