"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Result = {
  rate: string;
  issuerCut: string;
  networkFee: string;
  acquirerMarkup: string;
  explanation: string;
  tips: string[];
  regulatoryContext: string;
};

const NETWORKS = ["Visa", "Mastercard", "Amex", "Discover"];
const CARD_TYPES = [
  { value: "consumer-debit", label: "Consumer Debit" },
  { value: "consumer-credit-rewards", label: "Consumer Credit (Rewards)" },
  { value: "consumer-credit-non-rewards", label: "Consumer Credit (Non-Rewards)" },
  { value: "commercial", label: "Commercial / Corporate" },
];
const MERCHANT_CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "grocery", label: "Grocery" },
  { value: "gas-station", label: "Gas Station" },
  { value: "retail", label: "Retail" },
  { value: "hotel", label: "Hotel" },
  { value: "airline", label: "Airline" },
  { value: "healthcare", label: "Healthcare" },
  { value: "utilities", label: "Utilities" },
  { value: "e-commerce", label: "E-Commerce" },
];

export default function InterchangeDecoder() {
  const [network, setNetwork] = useState("Visa");
  const [cardType, setCardType] = useState("consumer-credit-rewards");
  const [merchantCategory, setMerchantCategory] = useState("retail");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function decode() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network, cardType, merchantCategory }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Interchange Decoder</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Interchange Decoder</h1>
          <p className="text-gray-500 mt-1">See exactly what every card payment costs a merchant — and where the money goes.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Card Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                >
                  {NETWORKS.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Card Type</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                >
                  {CARD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Merchant Category</label>
                <select
                  value={merchantCategory}
                  onChange={(e) => setMerchantCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                >
                  {MERCHANT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={decode} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Decoding fees..." : "Decode fees"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6 text-sm">{error}</div>
        )}

        {loading && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center text-gray-400 text-sm">
              Looking up interchange rates...
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500 mb-1">Total Interchange Rate</p>
                  <p className="text-4xl font-bold text-gray-900">{result.rate}</p>
                  <p className="text-sm text-gray-400 mt-1">{network} · {CARD_TYPES.find(t => t.value === cardType)?.label} · {MERCHANT_CATEGORIES.find(c => c.value === merchantCategory)?.label}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Issuer (Card Bank)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-gray-900">{result.issuerCut}</p>
                  <p className="text-xs text-gray-400 mt-1">Largest share — rewards your customer earns come from here</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Network Fee</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-gray-900">{result.networkFee}</p>
                  <p className="text-xs text-gray-400 mt-1">Goes to {network} for running the network</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Acquirer Markup</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-gray-900">{result.acquirerMarkup}</p>
                  <p className="text-xs text-gray-400 mt-1">Your payment processor&apos;s cut on top</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Why this rate?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>
                {result.regulatoryContext && (
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">{result.regulatoryContext}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Merchant tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-gray-400 shrink-0">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Select a card type and merchant category to see the fee breakdown
          </div>
        )}
      </div>
    </div>
  );
}
