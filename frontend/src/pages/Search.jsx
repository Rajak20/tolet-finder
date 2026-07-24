import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Search() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    bhk: "",
    min_rent: "",
    max_rent: "",
    location: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResults = async () => {
    const params = { ...filters, page, limit: 12 };
    const res = await api.get("/properties", { params });
    setProperties(res.data.properties);
    setTotalPages(res.data.total_pages);
  };

  useEffect(() => {
    fetchResults();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-8 bg-gray-800 border border-gray-700 rounded-2xl p-4">
          <input
            placeholder="Search city or area"
            onChange={(e) =>
              setFilters((f) => ({ ...f, location: e.target.value }))
            }
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            onChange={(e) => setFilters((f) => ({ ...f, bhk: e.target.value }))}
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5"
          >
            <option value="">Any BHK</option>
            <option value="1BHK">1 BHK</option>
            <option value="2BHK">2 BHK</option>
            <option value="3BHK">3 BHK</option>
            <option value="4BHK+">4+ BHK</option>
          </select>
          <input
            type="number"
            placeholder="Min Rent"
            onChange={(e) =>
              setFilters((f) => ({ ...f, min_rent: e.target.value }))
            }
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 w-32"
          />
          <input
            type="number"
            placeholder="Max Rent"
            onChange={(e) =>
              setFilters((f) => ({ ...f, max_rent: e.target.value }))
            }
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 w-32"
          />
          <button
            onClick={() => {
              setPage(1);
              fetchResults();
            }}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((p) => (
            <Link
              to={`/property/${p.id}`}
              key={p.id}
              className="card-hover group bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden"
            >
              <div className="relative overflow-hidden h-44">
                <img
                  src={p.property_images?.[0]?.image_url || "/placeholder.jpg"}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {p.bhk}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white truncate mb-1">
                  {p.title}
                </h3>
                <p className="text-xs text-gray-400 truncate mb-1">
                  {p.address}
                </p>
                {p._distance !== undefined && (
                  <p className="text-xs text-emerald-400 mb-2">
                    {p._distance} km away
                  </p>
                )}
                <p className="text-lg font-bold text-emerald-400">
                  ₹{p.rent}
                  <span className="text-sm text-gray-400 font-normal">/mo</span>
                </p>
              </div>
            </Link>
          ))}
          {properties.length === 0 && (
            <p className="text-gray-500 col-span-3 text-center py-12">
              No properties found.
            </p>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-full font-medium transition ${
                page === i + 1
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
