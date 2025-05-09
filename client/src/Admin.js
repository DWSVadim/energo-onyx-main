import React, { useState, useEffect } from "react";
import {
    getAllUsers,
    deleteUser,
    resetSubmissionsAPI,
    setTodayAPI,
    updateUser,
} from "./utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: "", email: "" });

    const navigate = useNavigate();
    const { role, isAuthenticated } = useAuth();

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Токен не найден");
            navigate("/login");
            return;
        }

        if (role !== "1") {
            setError("У вас нет прав для доступа к этой странице.");
            navigate("/");
            return;
        }

        try {
            const data = await getAllUsers();
            const total = data.reduce((sum, user) => sum + user.count, 0);
            setUsers(data);
            setTotalSubmissions(total);
        } catch (error) {
            setError("Ошибка подключения к серверу.");
            console.error("Ошибка при загрузке пользователей:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        } else {
            setError("Пожалуйста, войдите в систему.");
            navigate("/login");
        }
    }, [role, isAuthenticated, navigate]);

    const handleDeleteUser = async (id) => {
        try {
            const data = await deleteUser(id);
            if (data.success) {
                fetchUsers();
            } else {
                setError(data.message || "Не удалось удалить пользователя.");
            }
        } catch (error) {
            setError("Ошибка удаления пользователя.");
            console.error("Ошибка при удалении пользователя:", error);
        }
    };

    const openModal = (user) => {
        setEditUserId(user.id);
        setEditFormData({ name: user.name, email: user.email });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditUserId(null);
        setEditFormData({ name: "", email: "" });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSave = async () => {
        try {
            const data = await updateUser(editUserId, editFormData);
            if (data.success) {
                closeModal();
                fetchUsers();
            } else {
                setError(data.message || "Не удалось обновить данные.");
            }
        } catch (error) {
            setError("Ошибка при сохранении изменений.");
            console.error("Ошибка обновления:", error);
        }
    };

    const handleResetSubmissions = async () => {
        try {
            const data = await resetSubmissionsAPI();
            if (data.success) {
                alert("Количество отправок успешно обнулено.");
                fetchUsers();
            } else {
                setError(data.message || "Не удалось обнулить отправки.");
            }
        } catch (error) {
            setError("Ошибка обнуления отправок.");
            console.error("Ошибка:", error);
        }
    };

    const handleSetToday = async () => {
        try {
            const data = await setTodayAPI();
            if (data.success) {
                alert("Текущая дата успешно установлена.");
                fetchUsers();
            } else {
                setError(data.message || "Не удалось установить дату.");
            }
        } catch (error) {
            setError("Ошибка установки даты.");
            console.error("Ошибка:", error);
        }
    };

    return (
        <div className="admin-panel">
            <h2>Панель администратора</h2>
            {error && <p className="error">{error}</p>}
            <h4>Добро пожаловать!</h4>
            <p>Общее количество отправок: <strong>{totalSubmissions}</strong></p>

            <div style={{ gap: "20px" }}>
                {users.length > 0 ? (
                    <ul className="Admins">
                        {users.map((user) => (
                            <li key={user.id}>
                                <img style={{ width: "40px" }} src="https://s6.ezgif.com/tmp/ezgif-6-0978c6aea3.gif" alt="Sticker" />
                                {user.name} ({user.email})
                                <p style={{ color: "green" }}>Отправок за сегодня: <strong>{user.count}</strong></p>
                                <p>Дата последней отправки: {user.data || "—"}</p>
                                <button className="bntAdm" onClick={() => openModal(user)}>Редактировать</button>
                                <button className="bntAdm" onClick={() => handleDeleteUser(user.id)}>Удалить</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !error && <p>Пользователи не найдены.</p>
                )}
            </div>

            <div className="admin-controls" style={{ marginTop: "20px" }}>
                <button className="bntAdm" onClick={handleResetSubmissions}>Обнулить количество отправок</button>
                <button className="bntAdm" onClick={handleSetToday}>Установить сегодняшнюю дату</button>
            </div>

            {/* Модальное окно */}
            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Редактировать пользователя</h3>
                        <label>
                            Имя:
                            <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditChange}
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditChange}
                            />
                        </label>
                        <div className="modal-buttons">
                            <button className="bntAdm" onClick={handleEditSave}>Сохранить</button>
                            <button className="bntAdm" onClick={closeModal}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
