/**
 * Modal to create a new accountability session.
 * Brutalist design — hard borders, orange CTA, Space Grotesk.
 * @module components/CreateSessionModal
 */
"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { useContractWrite, createSession as createSessionTx } from "@/hooks/useContract";
import { Coins, Calendar, Clock, Users, Plus, Trash2, X } from "lucide-react";

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Full session creation form.
 * Fields: amount (XLM), date, time, voting period, participant addresses.
 */
export function CreateSessionModal({
  open,
  onClose,
  onSuccess,
}: CreateSessionModalProps) {
  const { address } = useFreighter();
  const contractWrite = useContractWrite();

  const [amount, setAmount] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [votingMinutes, setVotingMinutes] = useState("60");
  const [friends, setFriends] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setAmount("");
      setEventDate("");
      setEventTime("");
      setVotingMinutes("60");
      setFriends([]);
      setError(null);
      contractWrite.reset();
    }
  }, [open]);

  // Close on success
  useEffect(() => {
    if (contractWrite.state === "success") {
      const t = setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [contractWrite.state]);

  const addFriend = () => {
    if (friends.length >= 4) return;
    setFriends([...friends, ""]);
  };

  const removeFriend = (i: number) => {
    setFriends(friends.filter((_, idx) => idx !== i));
  };

  const updateFriend = (i: number, value: string) => {
    const updated = [...friends];
    updated[i] = value;
    setFriends(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!address) {
      setError("Connect your wallet first");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (!eventDate || !eventTime) {
      setError("Set a date and time for the event");
      return;
    }

    const deadline = Math.floor(
      new Date(`${eventDate}T${eventTime}`).getTime() / 1000,
    );
    if (deadline <= Date.now() / 1000) {
      setError("The event must be in the future");
      return;
    }

    const allParticipants = [address, ...friends.filter(Boolean)];
    if (allParticipants.length < 3) {
      setError("You need at least 2 more friends (3 total)");
      return;
    }
    if (allParticipants.length > 5) {
      setError("Maximum 5 participants total");
      return;
    }

    try {
      await createSessionTx(
        contractWrite,
        address,
        amount,
        deadline,
        parseInt(votingMinutes) * 60,
        allParticipants,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message);
    }
  };

  if (!open) return null;

  const isPending = ["building", "signing", "submitting"].includes(contractWrite.state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in p-4">
      <div className="bg-white border-2 border-black shadow-hard max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b-2 border-black">
          <h2 className="text-xl font-black uppercase tracking-tight">
            New Session
          </h2>
          <button
            onClick={onClose}
            className="p-2 border-2 border-black hover:bg-[#d73b19] hover:text-white hover:border-[#d73b19] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Amount */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Coins className="w-4 h-4" strokeWidth={3} />
              Amount Per Person (XLM)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:border-[#d73b19] transition-colors"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-3">
                <Calendar className="w-4 h-4" strokeWidth={3} />
                Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:border-[#d73b19] transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-3">
                <Clock className="w-4 h-4" strokeWidth={3} />
                Time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:border-[#d73b19] transition-colors"
              />
            </div>
          </div>

          {/* Voting period */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Clock className="w-4 h-4" strokeWidth={3} />
              Voting Window (Minutes)
            </label>
            <input
              type="number"
              min="1"
              value={votingMinutes}
              onChange={(e) => setVotingMinutes(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:border-[#d73b19] transition-colors"
            />
          </div>

          {/* Participants */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              <Users className="w-4 h-4" strokeWidth={3} />
              Participants
            </label>

            {/* Host (you) */}
            <div className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-gray-50 mb-3">
              <span className="text-[10px] font-bold text-[#d73b19] uppercase tracking-widest">Host</span>
              <span className="text-xs font-mono truncate">{address}</span>
            </div>

            {/* Friends */}
            {friends.map((friend, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={friend}
                  onChange={(e) => updateFriend(i, e.target.value)}
                  placeholder={`Friend ${i + 1} (G...)`}
                  className="flex-1 px-4 py-3 border-2 border-black font-mono text-xs focus:outline-none focus:border-[#d73b19] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeFriend(i)}
                  className="p-3 border-2 border-black hover:bg-[#d73b19] hover:text-white hover:border-[#d73b19] transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            ))}

            {friends.length < 4 && (
              <button
                type="button"
                onClick={addFriend}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-400 text-xs font-bold uppercase tracking-[0.1em] hover:border-black hover:bg-gray-50 transition-colors w-full"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                Add Friend
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-5 border-2 border-[#d73b19] bg-red-50">
              <p className="text-xs font-bold text-[#d73b19]">{error}</p>
            </div>
          )}

          {/* Contract error from hook */}
          {contractWrite.error && (
            <div className="p-5 border-2 border-[#d73b19] bg-red-50">
              <p className="text-xs font-bold text-[#d73b19]">
                {contractWrite.error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 border-2 border-black bg-[#d73b19] text-white font-black text-sm uppercase tracking-[0.1em] hover:bg-black transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-hard-sm"
          >
            {contractWrite.state === "building" && "Building…"}
            {contractWrite.state === "signing" && "Sign in Wallet…"}
            {contractWrite.state === "submitting" && "On Chain…"}
            {contractWrite.state === "success" && "✓ Created!"}
            {contractWrite.state === "idle" && "Create Session"}
            {contractWrite.state === "error" && "Try Again"}
          </button>
        </form>
      </div>
    </div>
  );
}
