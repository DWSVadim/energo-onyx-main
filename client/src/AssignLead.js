import React, { useEffect, useState } from "react";
import api from "./utils/api";

const AssignLeads = () => {
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedLead, setSelectedLead] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const leadsResponse = await api.get("/leads");
                const usersResponse = await api.get("/admin/users");

                const unassignedLeads = leadsResponse.data.filter(
                    (lead) => !lead.userId && !lead.assigned_to
                );
                const filteredUsers = usersResponse.data.filter(
                    (user) => user.isAdmin === 4
                );

                setLeads(unassignedLeads);
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
    
            // Удалить назначенного лида из списка
            setLeads((prevLeads) =>
                prevLeads.filter((lead) => lead.id !== Number(selectedLead))
            );
    
            // Очистить выбор
            setSelectedLead("");
            setSelectedUser("");
    
            // Очистить сообщение через 3 секунды
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error(err);
            setMessage("Ошибка назначения лида");
            setTimeout(() => setMessage(""), 3000);
        }
    };    

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
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
        </div>
    );
};

export default AssignLeads;
