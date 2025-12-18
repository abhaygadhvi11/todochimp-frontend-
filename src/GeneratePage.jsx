import React, { useState } from "react";
import { Package, AlertCircle } from "lucide-react";

const apiKey = import.meta.env.VITE_API_KEY_2;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GeneratePage = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    spendCategory: "",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/calls/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate item details");
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Package className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Item Generator</h1>
          <p className="text-purple-200">
            Generate detailed product descriptions and specifications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Item Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Keyboard"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Spend Category *
                </label>
                <input
                  type="text"
                  name="spendCategory"
                  value={formData.spendCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Office Supplies"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Additional details about the item..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-purple-600 cursor-pointer hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <span class="relative z-10 flex items-center space-x-2">
                  <svg
                    class="w-5 h-5 animate-pulse"
                    fill="white"
                    stroke="currentColor"
                    stroke-width="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                    />
                  </svg>

                  <span>{loading ? "Thinking..." : "Ask Generate"}</span>
                </span>
              </button>
            </div>
          </div>

          {/* Response Display */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Results</h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-200 font-semibold">Error</h3>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                {/* Description */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-purple-200 font-semibold mb-2">
                    Description
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {response.result.detailed_description}
                  </p>
                </div>

                {/* Specifications */}
                <div className="bg-white/5 rounded-lg p-4 overflow-x-auto">
                  <h3 className="text-purple-200 font-semibold mb-3">
                    Specifications
                  </h3>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left text-purple-300 text-sm font-semibold py-2 px-3">
                          Attribute
                        </th>
                        <th className="text-left text-purple-300 text-sm font-semibold py-2 px-3">
                          Potential Values
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {response.result.specifications.map((spec, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-white/10 hover:bg-white/5 transition"
                        >
                          <td className="py-2 px-3 text-sm text-gray-200 font-medium">
                            {spec.attribute}
                          </td>

                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-2">
                              {spec.potential_values.map((val, vidx) => (
                                <span
                                  key={vidx}
                                  className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded"
                                >
                                  {val}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!error && !response && (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Fill in the form and click generate to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratePage;