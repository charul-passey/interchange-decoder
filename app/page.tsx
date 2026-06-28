"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MemeResult = { url: string; template: string; texts: string[]; explanation: string };

const EXAMPLES = [
  "mondays",
  "debugging at 2am",
  "AI taking my job",
  "eating salad when you wanted pizza",
  "git push to main",
  "when the tests pass on first try",
];

export default function MemeMaker() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MemeResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<MemeResult[]>([]);

  async function generate(t = topic) {
    if (!t.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 6));
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
          <span>😂</span>
          <span className="text-lg font-semibold text-gray-900">Meme Maker AI</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Meme Maker AI</h1>
          <p className="text-gray-500 mt-1">Type anything. Get a meme. It&apos;s that simple.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
              <input
                className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What should the meme be about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
              <Button onClick={() => generate()} disabled={loading || !topic.trim()}>
                {loading ? "Generating..." : "Make it"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setTopic(ex); generate(ex); }}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors border border-gray-200"
                >
                  {ex}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <Card className="mb-6">
            <CardContent className="pt-6 py-12 text-center">
              <p className="text-gray-400 text-sm">AI is picking a template and writing the text...</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mb-6 overflow-hidden">
            <img src={result.url} alt="Generated meme" className="w-full" />
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.template}</Badge>
              </div>
              <p className="text-gray-500 text-sm italic">&quot;{result.explanation}&quot;</p>
              <div className="flex gap-3 pt-1">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button variant="default" className="w-full text-sm">Open full size</Button>
                </a>
                <Button variant="outline" className="flex-1 text-sm" onClick={() => generate()}>
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {history.length > 1 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Recent</p>
            <div className="grid grid-cols-3 gap-3">
              {history.slice(1).map((h, i) => (
                <img
                  key={i}
                  src={h.url}
                  alt="meme"
                  className="rounded-md w-full cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                  onClick={() => setResult(h)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
