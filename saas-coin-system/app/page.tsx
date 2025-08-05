"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasSuccess = searchParams.get("success") === "true";
    const hasCanceled = searchParams.get("canceled") === "true";

    if (hasSuccess) {
      setMessage("Payment successful! Coins will be added to you soon.");
    } else if (hasCanceled) {
      setMessage("Payment canceled.");
    }

    // clen up the url
    if (hasSuccess || hasCanceled) {
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user-data");
      const data = await response.json();

      setCoins(data.coins);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleBuyCoins = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { error, url } = await response.json();
      if (url) {
        window.location.href = url;
      } else if (error) {
        setMessage(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Error buying coins:", error);
      setMessage("Failed to initiate purchase");
    } finally {
      setLoading(false);
    }
  };

  const handleUseCoins = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/use-coins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setCoins(data.remainingCoins);
        setMessage("1 coin used successfully!");
      } else {
        setMessage(data.error || "Failed to use coins");
      }
    } catch (error) {
      console.error("Error using coins:", error);
      setMessage("Failed to use coins");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          SaaS Coin System
        </h1>

        <div className="mb-6 p-4 bg-blue-50 rounded-md text-center">
          <p className="text-xl font-medium">Your Coins: {coins}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <button
            onClick={handleBuyCoins}
            disabled={loading}
            className="py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 tran;sition"
          >
            {loading ? "Processing..." : "Buy 10 Coins for $5"}
          </button>
          <button
            onClick={handleUseCoins}
            disabled={loading || coins < 1}
            className="py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Processing..." : "Use 1 Coin"}
          </button>
        </div>

        {message && (
          <div className="p-3 bg-gray-100 rounded-md text-center">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}