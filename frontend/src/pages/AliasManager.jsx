import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { api } from "../api";


export default function AliasManager() {
  const [aliases, setAliases] = useState([]);
  const [trims, setTrims] = useState([]);
  const [aliasText, setAliasText] = useState("");
  const [trimId, setTrimId] = useState("");

  useEffect(() => {
    loadAliases();
    loadTrims();
  }, []);

  const loadAliases = async () => {
    const res = await api.get("/aliases");
    setAliases(res.data);
  };

  const loadTrims = async () => {
    const res = await api.get("/trims");
    setTrims(res.data);
  };

  const addAlias = async (e) => {
    e.preventDefault();
    await api.post("/aliases", { trim_master_id: Number(trimId), alias: aliasText });
    setAliasText("");
    setTrimId("");
    loadAliases();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This alias will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/aliases/${id}`).then(() => {
          loadAliases();
          Swal.fire("Deleted!", "Alias has been removed.", "success");
        });
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Alias Manager</h1>

      {/* Add Alias Form */}
      <form
        onSubmit={addAlias}
        className="flex gap-3 bg-[#1e1e3f] p-4 rounded-lg shadow-md mb-6"
      >
        <select
          value={trimId}
          onChange={(e) => setTrimId(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
          required
        >
          <option value="">Select Trim</option>
          {trims.map((t) => (
            <option key={t.id} value={t.id}>
              {t.make} {t.model} - {t.trim_name}
            </option>
          ))}
        </select>
        <input
          value={aliasText}
          onChange={(e) => setAliasText(e.target.value)}
          placeholder="Alias"
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Alias
        </button>
      </form>

      {/* Aliases Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-400 text-white">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Make</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Trim</th>
              <th className="px-4 py-2 text-left">Alias</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {aliases.map((a, i) => (
              <tr
                key={a.id}
                className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
              >
                <td className="px-4 py-2">{a.id}</td>
                <td className="px-4 py-2">{a.make}</td>
                <td className="px-4 py-2">{a.model}</td>
                <td className="px-4 py-2">{a.trim_name}</td>
                <td className="px-4 py-2">{a.alias}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
