import React, { useEffect, useState } from "react";
import api from "./utils/api";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#34D399", "#60A5FA", "#FBBF24", "#F87171"];

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
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    // Группируем лидов по userId
    const getLeadsByUser = (userId) =>
        leads.filter((lead) => lead.userId === userId);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Диаграммы по пользователям
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => {
                    const userLeads = getLeadsByUser(user.id);
                    const leadStats = [
                        { name: "Назначенные", value: userLeads.length },
                        { name: "Неназначенные", value: leads.filter(l => !l.userId && !l.assigned_to).length },
                    ];

                    return (
                        <div
                            key={user.id}
                            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center"
                        >
                            <h3 className="text-lg font-semibold mb-2 text-center">{user.name}</h3>
                            <div className="w-48 h-48">
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
                                            {leadStats.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeadsCharts;
