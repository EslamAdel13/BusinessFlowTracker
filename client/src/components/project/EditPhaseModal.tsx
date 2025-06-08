import React, { useState } from 'react';
import { Phase } from '@shared/schema';
import { useProjectStore } from "@/store/projectStore";
import { useUIStore } from '@store/uiStore';
// No external color picker needed

interface EditPhaseModalProps {
  phase: Phase | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditPhaseModal: React.FC<EditPhaseModalProps> = ({ phase, isOpen, onClose }) => {
  const { updatePhase } = useProjectStore();
  const [name, setName] = useState(phase?.name || '');
  const phaseColorOptions = [
    { color: '#2563eb' }, // Blue
    { color: '#7c3aed' }, // Purple
    { color: '#22c55e' }, // Green
    { color: '#ef4444' }, // Red
    { color: '#f59e42' }, // Orange
    { color: '#6366f1' }, // Indigo
    { color: '#ec4899' }, // Pink
    { color: '#14b8a6' }, // Teal
    { color: '#fbbf24' }, // Amber
    { color: '#06b6d4' }, // Cyan
  ];
  const [color, setColor] = useState(phase?.color || phaseColorOptions[0].color);
  const [startDate, setStartDate] = useState(phase?.start_date ? new Date(phase.start_date).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(phase?.end_date ? new Date(phase.end_date).toISOString().split('T')[0] : '');
  const [dateError, setDateError] = useState<string | null>(null);

  React.useEffect(() => {
    if (phase) {
      setName(phase.name || '');
      setColor(phase.color || '#007bff');
      setStartDate(phase.start_date ? new Date(phase.start_date).toISOString().split('T')[0] : '');
      setEndDate(phase.end_date ? new Date(phase.end_date).toISOString().split('T')[0] : '');
    }
  }, [phase]);

  const handleSave = () => {
    if (!phase) return;

    const payload = {
      ...phase,
      name,
      color,
      // Ensure dates are valid ISO strings or null if empty
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
    };

    console.log('[EditPhaseModal] handleSave - payload:', JSON.stringify(payload, null, 2));

    // Basic validation: ensure end date is not before start date if both are provided
    if (payload.start_date && payload.end_date && new Date(payload.end_date) < new Date(payload.start_date)) {
      setDateError('End date cannot be before start date.');
      return;
    } else {
      setDateError(null); // Clear error if validation passes
    }

    updatePhase(phase.id, payload);
    onClose();
  };

  // The original updatePhase call is removed from here and replaced by the lines above


  if (!isOpen || !phase) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Phase</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Color</label>
          <div className="flex gap-2 mt-2">
            {phaseColorOptions.map((option, idx) => (
              <button
                key={option.color}
                type="button"
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${color === option.color ? 'border-black' : 'border-gray-200'}`}
                style={{ backgroundColor: option.color }}
                onClick={() => setColor(option.color)}
                aria-label={`Select color ${option.color}`}
              >
                {color === option.color && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              setDateError(null); // Clear error on change
            }}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value);
              setDateError(null); // Clear error on change
            }}
            className="w-full border rounded px-2 py-1"
          />
          {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditPhaseModal;
