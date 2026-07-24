import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get("/properties", { params: { limit: 6 } })
      .then((res) => setFeatured(res.data.properties));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 py-24 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            Find Your Next Home
          </h1>
          {/* <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Search verified rentals near you, or list your own property in
            minutes.
          </p> */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/search"
              className="bg-white text-emerald-700 px-7 py-3.5 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Start Searching
            </Link>
            <Link
              to="/owner/add-listing"
              className="bg-emerald-900/40 border border-white/30 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-emerald-900/60 transition"
            >
              List a Property
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Properties</h2>
          <Link
            to="/search"
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link
              to={`/property/${p.id}`}
              key={p.id}
              className="card-hover group bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden"
            >
              <div className="relative overflow-hidden h-48">
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
                <p className="text-xs text-gray-400 truncate mb-2">
                  {p.address}
                </p>
                <p className="text-lg font-bold text-emerald-400">
                  ₹{p.rent}
                  <span className="text-sm text-gray-400 font-normal">/mo</span>
                </p>
              </div>
            </Link>
          ))}
          {featured.length === 0 && (
            <p className="text-gray-500 col-span-3 text-center py-12">
              No properties listed yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
