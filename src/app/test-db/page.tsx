"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function TestDBPage() {
  const [status, setStatus] = useState<string>("Testing connection...");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = getSupabaseBrowserClient();

        // Test 1: Check if client is created
        setStatus("✓ Supabase client created");
        console.log("Supabase client:", supabase);

        // Test 2: Simple query to patients table
        setStatus("Testing query to patients table...");
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .limit(10);

        if (error) {
          console.error("Query error:", error);
          setError({
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          setStatus("❌ Query failed");
          return;
        }

        setStatus(`✓ Query successful! Found ${data?.length || 0} patients`);
        setResults(data);
        console.log("Query results:", data);
      } catch (err: any) {
        console.error("Test failed:", err);
        setError(err);
        setStatus("❌ Connection failed");
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>

      <div className="space-y-4">
        {/* Status */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Status:</h2>
          <p className="text-sm">{status}</p>
        </div>

        {/* Environment Variables */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold mb-2">Environment Variables:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(
              {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                keyPrefix:
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) +
                  "...",
              },
              null,
              2,
            )}
          </pre>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-red-700">Error:</h2>
            <pre className="text-xs overflow-auto text-red-600">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold mb-2 text-green-700">
              Results ({results.length} patients):
            </h2>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
