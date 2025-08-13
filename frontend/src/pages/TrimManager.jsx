import { useState, useEffect } from "react";
import { api } from "../api";

export default function TrimManager() {
  const [trims, setTrims] = useState([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trimName, setTrimName] = useState("");

  useEffect(() => {
    loadTrims();
  }, []);

  const loadTrims = async () => {
    const res = await api.get("/trims");
    setTrims(res.data);
  };

  const addTrim = async (e) => {
    e.preventDefault();
    await api.post("/trims", {
      make,
      model,
      trim_name: trimName
    });
    setMake("");
    setModel("");
    setTrimName("");
    loadTrims();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-6">Trim Manager</h1>

      {/* Add Trim Form */}
      <form
        onSubmit={addTrim}
        className="flex gap-3 bg-[#1e1e3f] p-4 rounded-lg shadow-md mb-6"
      >
        <input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Make"
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Model"
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <input
          value={trimName}
          onChange={(e) => setTrimName(e.target.value)}
          placeholder="Trim Name"
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Trim
        </button>
      </form>

      {/* Trims Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-400 text-white">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Make</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Trim</th>
            </tr>
          </thead>
          <tbody>
            {trims.map((t, i) => (
              <tr
                key={t.id}
                className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
              >
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.make}</td>
                <td className="px-4 py-2">{t.model}</td>
                <td className="px-4 py-2">{t.trim_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
