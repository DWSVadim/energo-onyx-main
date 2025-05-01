import React, { useEffect, useState } from "react";
import api from "./utils/api";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const MyLeads = () => {
    const [leads, setLeads] = useState([]);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const { data } = await api.get("/leads/my");
                setLeads(data);
            } catch (err) {
                console.error(err);
                alert("Ошибка при загрузке данных");
            }
        };

        fetchLeads();
    }, []);

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            await api.put(`/leads/${leadId}/status`, { status: newStatus });
            setLeads((prevLeads) =>
                prevLeads.map((lead) =>
                    lead.id === leadId ? { ...lead, status: newStatus } : lead
                )
            );
        } catch (err) {
            console.error(err);
            alert("Ошибка при обновлении статуса");
        }
    };

    // Подсчёт количества по статусам
    const statusCounts = leads.reduce((acc, lead) => {
        const status = lead.status || "Без статуса";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count
    }));

    // Цвета по статусам
    const COLORS = {
        "Взял": "#4CAF50",        // зелёный
        "Слив": "#F44336",        // красный
        "Перезвон": "#2196F3",    // синий
        "Недозвон": "#9E9E9E",    // серый
        "Без статуса": "#E0E0E0"  // по умолчанию
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center", color: "#333" }}>Leads</h2>

            {/* Диаграмма */}
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.name] || "#CCCCCC"}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Таблица */}
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
            }}>
                <thead>
                    <tr style={{ backgroundColor: "#f4f4f4" }}>
                        {Object.keys(leads[0] || {}).map((key) => (
                            <th
                                key={key}
                                style={{
                                    padding: "10px",
                                    textAlign: "left",
                                    borderBottom: "2px solid #ddd",
                                    fontWeight: "bold",
                                    color: "#555",
                                }}
                            >
                                {key}
                            </th>
                        ))}
                        <th
                            style={{
                                padding: "10px",
                                textAlign: "left",
                                borderBottom: "2px solid #ddd",
                                fontWeight: "bold",
                                color: "#555",
                            }}
                        >
                            Статус
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead, index) => (
                        <tr
                            key={index}
                            style={{
                                backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                                transition: "background-color 0.3s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f1f1")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#f9f9f9")}
                        >
                            {Object.values(lead).map((value, idx) => (
                                <td
                                    key={idx}
                                    style={{
                                        padding: "10px",
                                        borderBottom: "1px solid #ddd",
                                        color: "#333",
                                    }}
                                >
                                    {value || "—"}
                                </td>
                            ))}
                            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                                <select
                                    value={lead.status || ""}
                                    onChange={(e) =>
                                        handleStatusChange(lead.id, e.target.value)
                                    }
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc",
                                        backgroundColor: "#fff",
                                        color: "#333",
                                    }}
                                >
                                    <option value="" disabled>
                                        Выберите статус
                                    </option>
                                    <option value="Недозвон">Недозвон</option>
                                    <option value="Слив">Слив</option>
                                    <option value="Перезвон">Перезвон</option>
                                    <option value="Взял">Взял</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyLeads;
