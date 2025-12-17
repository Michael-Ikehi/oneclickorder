import { setOrderNote } from '@/lib/store/orderNoteSlice';
import { RootState } from '@/lib/store/store';
import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

interface OrderNotePopProps {
  onClose: () => void;
}

const OrderNotePop: React.FC<OrderNotePopProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  
  // Get the note from the store
  const storedNote = useSelector((state: RootState) => state.orderNote.note);

  // Initialize local state with value from store
  const [note, setNote] = useState(storedNote);

  // Sync note with store value if it changes
  useEffect(() => {
    setNote(storedNote);
  }, [storedNote]);

  const handleSave = () => {
    dispatch(setOrderNote(note));
    onClose();
  };

  return (
    <div className="p-4 min-w-full max-w-md">
      <h1 className="text-md font-bold pb-2 border-b border-gray-200 mb-4">Add an order note</h1>

      <div className="mb-4">
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
          Note
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          placeholder="Add any extra instructions..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF4D4D]"
        />
      </div>

      <div className="flex items-start bg-[#A2FEFE] rounded-md p-3 mb-4">
        <FaExclamationTriangle className="text-yellow-600 mt-1 mr-2" />
        <p className="text-sm text-gray-800">
          You may be charged for extras
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#FF4D4D] text-white py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
      >
        Save
      </button>
    </div>
  );
};

export default OrderNotePop;
