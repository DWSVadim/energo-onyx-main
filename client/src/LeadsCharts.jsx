import React, { useEffect, useState } from "react";
import api from "./utils/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
    "Взял": "#4CAF50",        // зелёный
    "Слив": "#F44336",        // красный
    "Перезвон": "#2196F3",    // синий
    "Недозвон": "#9E9E9E",    // серый
    "Без статуса": "#E0E0E0", // по умолчанию
};

const LeadsCharts = () => {
    const [users, setUsers] = useState([]);
    const [leads, setLeads] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await api.get("/admin/users");
                const leadsResponse = await api.get("/leads");

                const filteredUsers = usersResponse.data.filter(
                    (user) => user.isAdmin === 4
                );

                setUsers(filteredUsers);
                setLeads(leadsResponse.data);

                console.log("Filtered Users:", filteredUsers);
                console.log("Leads Data:", leadsResponse.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    // Группируем лидов по userId
    const getLeadsByUser = (userId) =>
        leads.filter((lead) => lead.assigned_to !== null && lead.assigned_to === userId);    

    // Группируем лидов по статусу
    const getLeadsByStatus = (userLeads) => {
        const stats = {
            "Взял": 0,
            "Слив": 0,
            "Перезвон": 0,
            "Недозвон": 0,
            "Без статуса": 0,
        };

        userLeads.forEach((lead) => {
            const status = lead.status || "Без статуса";
            if (stats[status] !== undefined) {
                stats[status]++;
            }
        });

        return Object.entries(stats).map(([name, value]) => ({
            name,
            value,
        }));
    };

    return (
        <div
            key={user.id}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center"
        >
            <h3 className="text-lg font-semibold mb-2 text-center">{user.name}</h3>
            <div style={{ width: 300, height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={leadStats}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            label
                        >
                            {leadStats.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[entry.name] || "#E0E0E0"}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="mt-4 text-sm text-gray-600">
                Общее количество назначенных лидов: <strong>{userLeads.length}</strong>
            </p>
        </div>
    );    
};

export default LeadsCharts;
