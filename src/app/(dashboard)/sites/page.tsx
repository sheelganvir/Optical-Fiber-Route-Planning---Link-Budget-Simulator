"use client";

import { useState, useEffect } from "react";
import { fetchSites, saveSite, deleteSite } from "@/lib/supabase/client";
import { Site, SiteType } from "@/lib/types/database";
import { Building2, Plus, Search, Trash2, Edit3, MapPin, CheckCircle, X } from "lucide-react";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Partial<Site> | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    const list = await fetchSites();
    setSites(list);
  };

  const handleOpenAdd = () => {
    setEditingSite({
      site_name: "",
      site_code: `BLR-SITE-${Math.floor(10 + Math.random() * 90)}`,
      site_type: "Customer Site",
      latitude: 12.9716,
      longitude: 77.5946,
      city: "Bengaluru",
      state: "Karnataka",
      description: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (site: Site) => {
    setEditingSite(site);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this telecom site?")) {
      await deleteSite(id);
      loadSites();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite || !editingSite.site_name || !editingSite.site_code) return;
    await saveSite(editingSite as any);
    setModalOpen(false);
    setEditingSite(null);
    loadSites();
  };

  const filteredSites = sites.filter((s) => {
    const matchesSearch =
      s.site_name.toLowerCase().includes(search.toLowerCase()) ||
      s.site_code.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || s.site_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> GIS Infrastructure Registry
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Telecom Sites & Node Location Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage Point of Presence (POP), Data Center, NOC & Base Station geographic node parameters.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add Telecom Site
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Site Name, Site Code, or City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Site Types</option>
          <option value="POP">POP</option>
          <option value="Data Center">Data Center</option>
          <option value="NOC">NOC</option>
          <option value="Base Station">Base Station</option>
          <option value="Customer Site">Customer Site</option>
          <option value="Aggregation Site">Aggregation Site</option>
        </select>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSites.map((site) => (
          <div key={site.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">{site.site_code}</span>
                <h3 className="font-bold text-slate-100 text-sm">{site.site_name}</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                {site.site_type}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1 font-mono">
              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> {site.city}, {site.state}
              </div>
              <div>Coords: {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E</div>
              <div className="text-slate-500 text-[11px] font-sans truncate">{site.description || "No description provided"}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleOpenEdit(site)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                title="Edit Site"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(site.id)}
                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded text-xs transition"
                title="Delete Site"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal Dialog */}
      {modalOpen && editingSite && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">
                {editingSite.id ? "Edit Telecom Site" : "Create New Telecom Site"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Site Name</label>
                  <input
                    type="text"
                    required
                    value={editingSite.site_name || ""}
                    onChange={(e) => setEditingSite({ ...editingSite, site_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Site Code</label>
                  <input
                    type="text"
                    required
                    value={editingSite.site_code || ""}
                    onChange={(e) => setEditingSite({ ...editingSite, site_code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Site Type</label>
                  <select
                    value={editingSite.site_type || "POP"}
                    onChange={(e) => setEditingSite({ ...editingSite, site_type: e.target.value as SiteType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
                  >
                    <option value="POP">POP</option>
                    <option value="Data Center">Data Center</option>
                    <option value="NOC">NOC</option>
                    <option value="Base Station">Base Station</option>
                    <option value="Customer Site">Customer Site</option>
                    <option value="Aggregation Site">Aggregation Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    required
                    value={editingSite.city || ""}
                    onChange={(e) => setEditingSite({ ...editingSite, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editingSite.latitude ?? 12.9716}
                    onChange={(e) => setEditingSite({ ...editingSite, latitude: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editingSite.longitude ?? 77.5946}
                    onChange={(e) => setEditingSite({ ...editingSite, longitude: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description / Notes</label>
                <textarea
                  value={editingSite.description || ""}
                  onChange={(e) => setEditingSite({ ...editingSite, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold shadow-md"
                >
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
