import React, { useEffect, useState } from "react";
import api from "./utils/api";

const AssignLeads = () => {
    const [leads, setLeads] = useState([]);
    const [assignedLeads, setAssignedLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedLead, setSelectedLead] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [message, setMessage] = useState("");
    const [sortBy, setSortBy] = useState("date"); // "date" | "status"

    useEffect(() => {
        const fetchData = async () => {
            try {
                const leadsResponse = await api.get("/leads");
                const usersResponse = await api.get("/admin/users");

                const unassignedLeads = leadsResponse.data.filter(
                    (lead) => !lead.userId && !lead.assigned_to
                );
                const assigned = leadsResponse.data.filter(
                    (lead) => lead.userId || lead.assigned_to
                );
                const filteredUsers = usersResponse.data.filter(
                    (user) => user.isAdmin === 4
                );

                setLeads(unassignedLeads);
                setAssignedLeads(assigned);
                setUsers(filteredUsers);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async () => {
        if (!selectedLead || !selectedUser) {
            alert("Выберите лида и пользователя");
            return;
        }

        try {
            const response = await api.post("/leads/assign", {
                leadId: Number(selectedLead),
                userId: Number(selectedUser),
            });
            setMessage(response.data.message);

            setLeads((prevLeads) =>
                prevLeads.filter((lead) => lead.id !== Number(selectedLead))
            );

            const assignedLead = leads.find(lead => lead.id === Number(selectedLead));
            if (assignedLead) {
                setAssignedLeads((prev) => [...prev, { ...assignedLead, userId: Number(selectedUser) }]);
            }

            setSelectedLead("");
            setSelectedUser("");

            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error(err);
            setMessage("Ошибка назначения лида");
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const sortedLeads = [...assignedLeads].sort((a, b) => {
        if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
        return 0;
    });

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md mb-10">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Назначение лидов
                </h2>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Лид:</label>
                    <select
                        onChange={(e) => setSelectedLead(e.target.value)}
                        value={selectedLead}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Выберите лида</option>
                        {leads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                                {lead.fio} ({lead.phone})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-1">Пользователь:</label>
                    <select
                        onChange={(e) => setSelectedUser(e.target.value)}
                        value={selectedUser}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Выберите пользователя</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleAssign}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                    Назначить
                </button>
                {message && (
                    <p className="mt-4 text-center text-sm text-green-600 font-medium">
                        {message}
                    </p>
                )}
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Назначенные лиды</h3>
                    <select
                        className="border p-1 rounded"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="date">Сортировать по дате</option>
                        <option value="status">Сортировать по статусу</option>
                    </select>
                </div>
                <ul className="space-y-4 max-h-[500px] overflow-y-auto">
                    {sortedLeads.map((lead) => (
                        <li key={lead.id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{lead.fio} ({lead.phone})</p>
                                    <p className="text-sm text-gray-500">Статус: {lead.status || "не указан"}</p>
                                    <p className="text-sm text-gray-500">
                                        Назначен: {users.find((u) => u.id === lead.userId)?.name || "неизвестно"}
                                    </p>
                                </div>
                                <select
                                    className="p-1 border rounded"
                                    defaultValue={lead.userId}
                                    onChange={async (e) => {
                                        const newUserId = Number(e.target.value);
                                        try {
                                            await api.post("/leads/assign", {
                                                leadId: lead.id,
                                                userId: newUserId,
                                            });
                                            setAssignedLeads((prev) =>
                                                prev.map((l) =>
                                                    l.id === lead.id
                                                        ? { ...l, userId: newUserId }
                                                        : l
                                                )
                                            );
                                            setMessage("Лид переназначен");
                                            setTimeout(() => setMessage(""), 3000);
                                        } catch (err) {
                                            console.error(err);
                                            setMessage("Ошибка переназначения");
                                            setTimeout(() => setMessage(""), 3000);
                                        }
                                    }}
                                >
                                    <option value="">Выбрать другого</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AssignLeads;
