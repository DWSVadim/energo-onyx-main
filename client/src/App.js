import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import Register from "./Register";
import Login from "./Login";
import AdminPanel from "./Admin";
import AdminPanelminus from "./Adminminus";
import { getAccountData } from './utils/api'; // Подключение правильного импорта
import { AuthProvider, useAuth } from "./AuthContext"; // Подключаем контекст
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from "axios";  // Добавить эту строку
import myImage from './onyx.png';
import api from './utils/api'; // Проверь путь к файлу api.js
import RKN from './RKN.svg';
import login1 from './login1.jpg'
import login2 from './login2.jpg'
import infoForm from './Info.jpg'
import formgood from './formgood.jpg'
import UploadLeads from "./UploadLeads";
import AssignLeads from "./AssignLead";
import MyLeads from "./MyLeads";
import exitAccount from './exitAccount.jpg'
import LeadsTable from "./LeadsTable";
import LeadsCharts from "./LeadsCharts";
import "./Marquee.css";

// Основной компонент приложения
function App() {
  const { role, isAuthenticated, userName } = useAuth();
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />  {/* Хедер теперь использует данные из контекста */}
          <Routes>
            <Route path="/leadscharts" element={<LeadsCharts />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={isAuthenticated && role === "1" ? <AdminPanel setTotalSubmissions={setTotalSubmissions} /> : <Navigate to="/" />} />
            <Route path="/adminminus" element={isAuthenticated && role === "2" ? <AdminPanelminus /> : <Navigate to="/" />} />
            <Route path="/services" element={<Services />} />
            <Route path="/apps" element={isAuthenticated && role === "5" ? <Apps /> : <Navigate to="/" />} />
            <Route path="/instruction" element={<Instruction />} />
            <Route path="/account" element={<Account totalSubmissions={totalSubmissions} />} />
            <Route path="/dopinfo" element={isAuthenticated && role === "5" ? <DopInfo /> : <Navigate to="/" />} />
            <Route path="/upload" element={<UploadLeads />} />
            <Route path="/assign" element={<AssignLeads />} />
            <Route path="/my-leads" element={<MyLeads />} />
            <Route path="/leadstable" element={<LeadsTable />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

// Компонент Header
const Header = () => {

  const { role, isAuthenticated } = useAuth();  // Получаем данные из контекста
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getAccountData = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при запросе аккаунта:", error.response?.data || error.message);
      throw error;
    }
  };



  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);  // Логируем полученный токен

    if (!token) {
      return;  // Если нет токена, не продолжаем выполнение
    }

    // Функция для получения данных пользователя
    const fetchAccountData = async () => {
      try {
        const data = await getAccountData(token);
        console.log("Account data:", data);  // Логируем данные аккаунта
        setAccount(data);  // Устанавливаем данные аккаунта в состояние
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        setError("Ошибка при загрузке данных.");
      }
    };

    fetchAccountData();  // Вызов функции для получения данных
  }, [navigate]);  // useEffect зависит от navigate (редиректа)

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/");  // Перенаправляем на страницу входа
    window.location.reload(); // Перезагружаем страницу
  };

  return (
    <header className="header">
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}>
        {isAuthenticated && (role === "1" || role === "3") ? (
          <h3>Admin CRM</h3>
        ) : (
          <h3>CRM</h3>
        )}
        {isAuthenticated && (role === "1" || role === "3") ? (
          <img src={RKN} style={{ width: "40px" }} alt="Описание" />
        ) : (
          <img src={myImage} style={{ width: "60px" }} alt="Описание" />
        )}
      </div>
      <nav>
        <Link to="/">Главная</Link>
        <Link to="/services">Сервисы</Link>
        <Link to="/instruction">Инструкция</Link>
        <Link to="/account">Мой Аккаунт</Link>

        {isAuthenticated && (role === "1" || role === "2") && (
          <Link to="/assign">Назначение</Link>
        )}

        {isAuthenticated && role === "4" && <Link to="/my-leads">Панель Госа</Link>}
        {isAuthenticated && role === "5" && <Link to="/apps">Панель Пользователя</Link>}
        {isAuthenticated && role === "2" && <Link to="/adminminus">Проверка передач</Link>}  {/* Проверка передач */}
        {isAuthenticated && role === "1" && <Link to="/admin">Админ Панель</Link>}  {/* Панель администратора */}
        {isAuthenticated && role === "5" && <Link to="/dopinfo">Адреса</Link>}

        {isAuthenticated && (role === "1" || role === "2") && (
          <Link to="/leadscharts">Статистика Госов</Link>
        )}

        <button className="btn logout" style={{ color: "red" }} onClick={handleLogout}>Выйти</button>
      </nav>
    </header>
  );
};


// Защищённый маршрут для администраторов
const ProtectedRoute = ({ children, isAdmin }) => {
  return isAdmin ? children : <Navigate to="/" />;
};

// Главная страница
function Home() {
  const { role, isAuthenticated } = useAuth();  // Получаем данные из контекста

  return (
    <div className="home">
      {isAuthenticated && role === "1" ? (
        <h1>Привет в Admin CRM</h1>
      ) : (
        <h1>Привет в CRM</h1>
      )}
      <br></br>
      <h2>Хочешь, что бы их деньги были твоими?)</h2>
      <h2>Тогда ебашь, а не еблань!</h2>
      <br></br>
      <p>Your trusted partner in energy management and sustainable solutions.</p>
      <Link to="/services" className="btn">Explore Our Services</Link>
      <br></br>
      <br></br>
      <br></br>
      <p>Фарту молодые, вы знаете что всё зависит только от вас!</p>
    </div>
  );
}

// Страница с услугами
function Services() {
  const services = [
    { title: "Billing and Payments", description: "Manage and pay your bills effortlessly." },
    { title: "Energy Efficiency Solutions", description: "Optimize your energy consumption." },
    { title: "Sustainable Energy Options", description: "Switch to renewable energy sources." },
  ];
  return (
    <div className="services">
      <h2>Our Services</h2>
      <div className="service-cards">
        {services.map((service, index) => (
          <div key={index} className="card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Instruction() {
  const { role, isAuthenticated } = useAuth();  // Получаем данные из контекста

  const instruction = [
    {
      title: "Как правильно входить",
      description: "В поле Login вводите почту mamita@gmail.com. В поле Password - вводите пароль который вам дали или который вы поменяли на свой!",
      image1: login1,
      image2: login2
    },
    {
      title: "Что делать если выдаёт ошибку Аккаунта",
      description: "У вас сверху есть Красная кнопка 'Выйти', нажимаете на неё, выходите и заного входите после этого должно быть всё нормально, если выдаёт ошибку или что-то другое пишете в ТГ группу!",
      image1: exitAccount,
    }
  ];

  const instructHol = [
    {
      title: "Как правильно входить",
      description: "В поле Login вводите почту holodka*@gmail.com. Вместо * вводите цыфру которую вам дали за вашим номером как на примере 2-го фото, вместо '45' должен быть ваш номер, в поле Password - вводите пароль который вам дали или который вы поменяли на свой!",
      image1: login1,
      image2: login2
    },
    {
      title: "Что делать если выдаёт ошибку Аккаунта",
      description: "У вас сверху есть Красная кнопка 'Выйти', нажимаете на неё, выходите и заного входите после этого должно быть всё нормально, если выдаёт ошибку или что-то другое пишете в ТГ группу!",
      image1: exitAccount,
    },
    {
      title: "Как правильно делать передачи",
      description: "У вас есть ваша Панель Пользователя. Нажимаете на 'Информация о клиенте' заполняете, НОМЕР ОБЕЗАТЕЛЬНО ВВОДИТЕ БЕЗ +, нажимаете отправить, если у вас вылазить окошко с текстом который ниже показан, всё нормально работаете дальше, если выдаёт ошибку или что-то другое пишете в ТГ группу!",
      image1: infoForm,
      image2: formgood
    },
  ];

  return (
    <div className="services">
      <h2>Инструкции!</h2>
      <br></br>
      <br></br>
      <div className="service-cards">

        {isAuthenticated && (role === "5" || role === "1" || role === "2" || role === "3" || role === "4") ? (
          instructHol.map((instructio, index) => (
            <div key={index} className="card">
              <h3>{instructio.title}</h3>
              <img src={instructio.image1} alt={instructio.title} className="card-image" />
              <h5>{instructio.description}</h5>
              {instructio.image2 && (
                <img src={instructio.image2} alt={instructio.title} className="card-image" />
              )}
            </div>
          ))
        ) : (
          instruction.map((instructio, index) => (
            <div key={index} className="card">
              <h3>{instructio.title}</h3>
              <img src={instructio.image1} alt={instructio.title} className="card-image" />
              <h5>{instructio.description}</h5>
            </div>
          ))
        )}

      </div>
      <br></br>
      <br></br>
    </div>
  );
}

function Account() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmissionDate, setLastSubmissionDate] = useState("—");
  const [totalSubmissions, setTotalSubmissions] = useState(0); // Новое состояние для общего количества
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth(); // Получаем статус аутентификации

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const fetchAccountData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setAccount(data);

        // Обновляем общее количество отправок
        setTotalSubmissions(data.total_count || 0); // Устанавливаем значение total_count

        // Обновление данных счётчика
        const userId = data.id || "defaultUserId";
        updateSubmissionData(userId);
      } catch (err) {
        console.error("Ошибка при получении данных аккаунта:", err);
        setError("Ошибка при загрузке данных.");
      }
    };

    fetchAccountData();
  }, []);

  // Логика сброса счётчика и обновления состояния
  const updateSubmissionData = (userId) => {
    const submissionCountKey = `${userId}_submissionCount`;
    const submissionDateKey = `${userId}_submissionDate`;
    const currentDate = new Date().toISOString().split("T")[0];
    const storedDate = localStorage.getItem(submissionDateKey) || "";

    if (storedDate !== currentDate) {
      localStorage.setItem(submissionDateKey, currentDate);
      localStorage.setItem(submissionCountKey, "0");
    }

    const updatedSubmissionCount = parseInt(localStorage.getItem(submissionCountKey), 10) || 0;
    setSubmissionCount(updatedSubmissionCount);
    setLastSubmissionDate(currentDate);
  };

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/");
    window.location.reload();
  };

  const getRoleName = (isAdmin) => {
    switch (isAdmin) {
      case 5:
        return "Холодка";
      case 1:
        return "Админ";
      case 2:
        return "Модератор";
      case 4:
        return "Госы";
      default:
        return "Пользователь";
    }
  };

  // Рендеринг
  if (!isAuthenticated) {
    return (
      <div className="account">
        <h2>Для доступа к аккаунту, пожалуйста, войдите или зарегистрируйтесь.</h2>
        <button className="btn" onClick={() => navigate("/login")}>Войти</button>
        <button className="btn" onClick={() => navigate("/register")}>Зарегистрироваться</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account">
        <p>{error}</p>
        <button className="btn logout" style={{ color: "red" }} onClick={handleLogout}>Выйти</button>
      </div>
    );
  }

  if (!account) {
    return <div className="account"><p>Загрузка...</p></div>;
  }

  const roleName = getRoleName(account.isAdmin);

  return (
    <div className="account">
      <p>Общее количество отправок: <strong>{totalSubmissions}</strong> из <strong>130</strong></p>
      <h2>Мой аккаунт</h2>
      <p>Имя: {account.name}</p>
      <p>Email: {account.email}</p>
      <p>Роль: {roleName}</p>
      <p>Отправок за сегодня: {account.count} / 6</p>
      <p>Дата последней отправки: {account.data}</p>
      <button style={{ fontSize: "28px", color: "red" }} className="btn logout" onClick={handleLogout}>Выйти</button>
      <br></br>
      <span>Хочешь зарабатывать? Не читай текст, а ебашь!</span>
    </div>
  );
}


// Компонент Footer
function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2024 EnergoSales. All rights reserved.</p>
      <nav>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </nav>
      <p>by from Kolomoisky</p>
    </footer>
  );
}

// Общий компонент для модальных окон
const Modal = ({ id, title, content }) => {
  return (
    <div
      className="modal fade bd-example-modal-lg"
      id={id}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="myLargeModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ backgroundColor: '#F0FFFF', }}>
          <div className="modal-header" style={{ backgroundColor: '#F0FFFF', }}>
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ backgroundColor: '#F0FFFF', }}>
            <h5>{content}</h5>
          </div>
          <div className="modal-footer" style={{ backgroundColor: '#F0FFFF', }}>
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Главный компонент
function Apps() {

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { role, isAuthenticated, name } = useAuth();  // Получаем роль и имя пользователя

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Токен не найден");
        navigate("/login");
        return;
      }

      if (role !== "5") { // Если роль не "5", то доступ закрыт
        setError("У вас нет прав для доступа к этой странице.");
        navigate("/");
        return;
      }
    };

    if (isAuthenticated) { // Проверяем, авторизован ли пользователь
      fetchUsers();
    } else {
      setError("Пожалуйста, войдите в систему.");
      navigate("/login");
    }
  }, [role, isAuthenticated, navigate]);

  // Массив для модальных окон "ДАНЯ"
  const leftModalContent = [
    {
      id: "modal0",
      title: "ПОЧЕМУ ЗВОНИТЕ ПО СКРЫТОМУ НОМЕРУ,ВОТСАП,СКАЙП,ДРУГОЙ РЕГИОН?",
      content: (
        <>
          Да, все верно, но на данный момент линия сотового оператора домофон сервиса перегружена, по этому мы с вами связываемся по бесплатной линии которую определяет уже приложение.
        </>
      )
    },
    {
      id: "modal3",
      title: "Я сейчас позвоню родным! / У МЕНЯ МУЖ / ЖЕНА ЭТИМ ЗАНИМАЕТСЯ,ПОСОВЕТУЮСЬ С НИМИ. ",
      content: (
        <>
          Ответ: У меня в договоре указаны ваши данные(СВЕРЯЕМ ФИО)Верно? Вот, по этому давайте составим заявку я передам ее инспектору и к вам уже приедет мастер для установки домофона.
          <br></br>
          БЕЗ ПАУЗ,ГОВОРИМ ДАЛЬШЕ СВОЕ!!!
        </>
      )
    },
    {
      id: "modal5",
      title: "У меня нет возможности записать, может запомню?",
      content: (
        <>
          Ответ: Давайте тогда я вам в вотсапе отправлю, вы потом запишете.
        </>
      )
    },
    {
      id: "modal7",
      title: "Я по телефону ничего не буду решать!",
      content: (
        <>
          Ответ: Так мы с вами ничего и не решаем, мы только проводим запись на бесплатную замену домофона.
          <br />
          БЕЗ ПАУЗ,ГОВОРИМ ДАЛЬШЕ СВОЕ!!!
        </>
      )
    },
  ];
  // Массив для модальных окон "ПОСЛЕ МУСОРОВ ДЕБЕТ"
  const rightModalContent = [
    {
      id: "modal16",
      title: "Почему я должен называть документы по телефону!?",
      content: (
        <>
          Ответ: Чтобы я смог(смогла) составить договор для вашего дальнейшего обслуживания и мастер уже приедет к вам с этим договором и будет устанавливать вам домофон.
          <br />
          По этому подскажите пожалуйста, как вам будет более удобнее пройти регистрацию, по паспорту либо по СНИЛС?( страховое свидтельство, регистрационный номер)
          <br />
          (БЕЗ ПАУЗ,СРАЗУ СПРАШИВАЙТЕ!!!)
        </>
      )
    },
    {
      id: "modal17",
      title: "У вас есть мои данные я не могу вам ничего давать",
      content: (
        <>
          Ответ: Да верно, общая информация про вас у меня имеется, но мне необходимо с ваших слов заполнить заявку.
          <br />
          ИЛИ
          <br />
          У меня ваших данных нет, поскольку ранее договор у вас был в одном экземпляре, сейчас же договор будет в двух экземплярах, один останется у вас, а один вы передадите мастеру.
        </>
      )
    },
    {
      id: "modal19",
      title: "Я НЕ БУДУ НАЗЫВАТЬ СВОИ ЛИЧНЫЕ ДАННЫЕ",
      content: (
        <>
          Ответ: А я у вас и не запрашиваю личных данных,  мне необходимо только зарегестрировать вас и составить договор, который в дальнейшем получит мастер для установки счетчика. Поэтому укажите ваш страховой номер
          <br></br>
          (Если спросят -ЧТО ЭТО ТАКОЕ?)
          <br></br>
          Ответ- : Это зеленая карта которая выдается отдельно от паспорта, - страховое свидетельство, просмотрите и укажите, ожидаю.
          <br></br>
          ЕСЛИ ГОВОРИТ ЧТО НЕТ РЯДОМ СНИЛСа(страхового номера), но есть ПАССПОРТ
          <br></br>
          Отвечаете: Давайте тогда по номеру ПАССПОРТА, но указываете только номер,без лишних данных таких как: кем выдан паспорт, код подразделения, место выдачи, мне в договоре необходимо указать только номер паспорта. Говорите, слушаю: ....
        </>
      )
    },
    {
      id: "modal21",
      title: "Я САМА МАСТЕРУ ПЕРЕДАМ ДАННЫЕ КОГДА ОН ПРИЕДЕТ",
      content: (
        <>
          Мастер к вам не сможет приехать пока я не составлю договор и не передам его инспектору. От руки в договор вам никакую информацию писать не будут, мастер уже приезжает с готовым договором и вам нужно его только подписать.
          <br></br>
          По этому укажите ваш страховой номер
          <br></br>
          ЧТО ЭТО ТАКОЕ?
          <br></br>
          Ответ- : Это зеленая карта которая выдается отдельно от паспорта, - страховое свидетельство, просмотрите и укажите
        </>
      )
    },
    {
      id: "modal23",
      title: "Как посмотреть в гос.услугах паспорт",
      content: (
        <>
          -В низу есть панель: главная, услуги, платежи, документы. Выбираете раздел документы в правом нижнем углу
          далее первый пункт личные документы
          И там сразу будет паспорт, ниже снилс , ниже инн
        </>
      )
    },
  ];

  const { userName } = useAuth(); // Получаем userName из контекста

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false); // Для индикатора загрузки

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (!token) {
      return;
    }

    const fetchAccountData = async () => {
      try {
        const data = await getAccountData(token);
        console.log("Account data:", data);
        setAccount(data);
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        setError("Ошибка при загрузке данных.");
      }
    };

    fetchAccountData();
  }, []); // Поскольку navigate не используется, зависимость можно удалить

  const [formData, setFormData] = useState({
    accountName: "",
    fio: "",
    phone: "",
    message: "",
    dataroz: "",
    region: "",
    document: "",
    nameBaza: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isDisabled, setIsDisabled] = useState(false)

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();

    const { fio, phone, dataroz, region, document, message, nameBaza } = formData;

    if (!fio || !phone || !dataroz || !region || !message || !nameBaza || !document) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    if (!account || !account.name) {
      alert("Ошибка: Данные пользователя не загружены.");
      return;
    }

    // Уникальный ID пользователя (например, account.id или другой уникальный идентификатор)
    const userId = account.id || "defaultUserId";  // Замените на ваш уникальный идентификатор
    const submissionCountKey = `${userId}_submissionCount`;
    const submissionDateKey = `${userId}_submissionDate`;

    // Работа со счётчиком
    const currentDate = new Date().toISOString().split("T")[0]; // Только дата (YYYY-MM-DD)
    const storedDate = localStorage.getItem(submissionDateKey) || ""; // Дата последней отправки
    let submissionCount = parseInt(localStorage.getItem(submissionCountKey), 10) || 0; // Счётчик отправок

    // Сброс счётчика, если день изменился
    if (storedDate !== currentDate) {
      localStorage.setItem(submissionDateKey, currentDate); // Обновляем дату
      submissionCount = 1; // Сбрасываем счётчик на 1
      localStorage.setItem(submissionCountKey, submissionCount.toString());
    } else {
      // Увеличиваем счётчик, если дата не изменилась
      submissionCount += 1;
      localStorage.setItem(submissionCountKey, submissionCount.toString());
    }

    console.log(`Счётчик отправок: ${submissionCount}, Дата: ${currentDate}`);

    setIsDisabled(true);
    setLoading(true);

    const data = {
      fio,
      phone,
      dataroz,
      region,
      document,
      message,
      nameBaza,
      accountName: account.name,
    };

    setLoading(true);

    // Сначала отправляем данные в БД
    fetch("https://energo-onyx-main.onrender.com/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка при логировании данных на сервере");
        }
        return response.json();
      })
      .then(() => {
        // После успешной отправки в БД, отправляем в Google Script
        return fetch("https://script.google.com/macros/s/AKfycbx4-RaunRNfjMU0J3T_y3xHGiXRwqzA7t7esw8ahPSujVzPAfKDv5S34LhtdSwnhXeP/exec", {
          method: "POST",
          body: new URLSearchParams(data),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
      })
      .then(() => {
        alert(`Спасибо! Ваша информация успешно отправлена.`);
        // Очищаем форму только после успешной отправки
        setFormData({
          fio: "",
          phone: "",
          message: "",
          dataroz: "",
          region: "",
          document: "",
          nameBaza: "",
        });
      })
      .catch((error) => {
        console.error("Ошибка при отправке:", error);
        alert("Произошла ошибка при отправке данных.");
      })
      .finally(() => {
        setLoading(false);
        setIsDisabled(false);
        setLoading(false);
      });
  };

  const [totalSubmissions, setTotalSubmissions] = useState(0); // Новое состояние для общего количества

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const fetchAccountData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setAccount(data);

        // Обновляем общее количество отправок
        setTotalSubmissions(data.total_count || 0); // Устанавливаем значение total_count
      } catch (err) {
        console.error("Ошибка при получении данных аккаунта:", err);
        setError("Ошибка при загрузке данных.");
      }
    };

    fetchAccountData();
  }, []);

  return (
    <main>

      <div className="marquee-container">
        <div className="marquee" >
          🌟 Общее количество передач команды: {totalSubmissions} из 130 🌟
        </div>
      </div>

      <section className="py-5 text-center" style={{ backgroundColor: '#282828', }}>
        <div className="row">
          {/* Левая часть (4 колонки) с модальными окнами "ДАНЯ" */}
          <div className="col-4">
            <h3 style={{ color: 'red' }}>Заборы Домофон</h3>
            <br></br>
            {/* Кнопки и модальные окна для левой части */}
            {leftModalContent.map((modal) => (
              <div key={modal.id}>
                <button
                  type="button"
                  className="w-75 btn btn-lg btn-primary mb-2"
                  data-bs-toggle="modal"
                  data-bs-target={`#${modal.id}`}
                >
                  {modal.title}
                </button>
                <Modal
                  id={modal.id}
                  title={modal.title}
                  content={modal.content}
                />
              </div>
            ))}
          </div>

          {/* Центральная часть с формой */}
          <div className="col-4">
            <div className="d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-lg btn-warning mb-2"
                data-bs-toggle="modal"
                data-bs-target="#info"
              >
                Информация о клиенте (нужно заполнять)
              </button>

              {/* Модальное окно с формой */}
              <Modal
                id="info"
                title="Информация о клиенте"
                content={
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', padding: '20px', backgroundColor: '#F0FFFF', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', maxWidth: '400px', margin: '0 auto' }}>
                    <input
                      type="text"
                      name="fio"
                      value={formData.fio}
                      onChange={handleChange}
                      placeholder="Его ФИО"
                      required
                      style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Телефон Клиента"
                      required
                      style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                    <input
                      type="text"
                      name="dataroz"
                      value={formData.dataroz}
                      onChange={handleChange}
                      placeholder="Дата Рождения"
                      required
                      style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="Регион"
                      required
                      style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                    <input
                      type="text"
                      name="document"
                      value={formData.document}
                      onChange={handleChange}
                      placeholder="Документ Клиента"
                      required
                      style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Коментарии"
                      required
                      style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', height: '100px' }}
                    />
                    <input
                      type="text"
                      name="nameBaza"
                      value={formData.nameBaza}
                      onChange={handleChange}
                      placeholder="Имя Базы"
                      required
                      style={{ padding: '10px', marginBottom: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
                    />

                    <button
                      type="submit"
                      style={{
                        padding: '10px 20px',
                        backgroundColor: isDisabled ? '#cccccc' : '#007bff',
                        color: '#fff',
                        fontSize: '16px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s'
                      }}
                      disabled={isDisabled}
                    >
                      {isDisabled ? "ПОДОЖДИ НЕ ДРОЧИ ТЫ ЭТУ КНОПКУ" : "Отправить"}
                    </button>

                  </form>
                }
              />
            </div>

            {/* Форма для ввода текста */}
            <div className="d-flex justify-content-center mb-3">
              <textarea
                className="col-12"
                id="comment2"
                name="comment"
                cols="100"
                rows="5"
                style={{ fontSize: "18px", backgroundColor: '#3a3a3a', color: "azure" }}
              />
            </div>
            <div className="d-flex justify-content-center">
            </div>
            {/* Прокрутка и текст справа */}
            <div
              className="prokrutka"
              role="document"
            >
              <h3 className="fw-bold mb-0" style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}></h3>
              <br />
              <h5 style={{ textAlign: 'left', fontSize: '18px', lineHeight: '1.6', color: '#333' }}>

                <p>Это домофон сервис вас беспокоит меня зовут Светлана/Виталий (Аносова Светлана Андреевна) (Аносов Виталий Андреевич), 
                  я звоню по поводу замены домофона в подъезде, скажите сколько вам ключей необходимо?</p>

                <p>-ответ</p>
                <p>1 ключ.</p>

                <p>Хорошо, по стандарту на каждую квартиру идёт бесплатно 2 ключа, либо же по одному бесплатному ключу на каждого проживающего. 
                  (Доп ключ при желании 120 руб)</p>

                <p>Замена будет сегодня ближе к (время). 
                  Мы сделаем заказ ключей на ваш подъезд и завтра уже вместе с соседями спуститесь заберете свои ключи. 
                  Раздавать их будем по фамильно. </p>

                <p>Найдите сейчас листок и ручку запишите фио мастера который будет менять домофон он же вам завтра ключи и будет раздавать. </p>

                <p>Сорокин Анатолий Вячеславович
                919 439 71 98 (контактный номер телефона) </p>

                <p>Я вам через мастера так же передам договор на обслуживание нашим домофон. 
                  Договор будет в 2 экземплярах, один экземпляр останется у вас, второй мастер передаст инспектору в Домофон сервис. </p>

                <p>Договор я составляю на: </p>
                <p>ФИО ЛОХА </p>

                <p>В договоре будет указано что вы как раньше уже не будете оплачивать ключи и обслуживание домофоном
                  Договор я зарегистрирую за вами по одному из двух регистрационных номеров, вносится либо страховое свидетельство - снилс, либо же если вам удобно по паспорту то тогда вносится только номер и серия, подскажите как вам будет удобнее пройти регистрацию?  </p>
                
                <p> НЕ ДАЁТ: </p>
                <p>Ответ: А я у вас и не запрашиваю личных данных, мне необходимо только зарегестрировать вас и составить договор, который в дальнейшем получит мастер для выдачи ключей и подтверждения личности. Укажите тогда ваш страховой номер. </p>

                <p>Хорошо, ёщё такой вопрос, Вы своим индивидуальным номером от домофона пользовались? </p>
                <p>нет </p>
                <p>Найдите тогда сейчас листок и ручку запишите этот номер.
                  набираете на панели 4 цифры и вконце решетку чтобы открылась дверь. 
                  Пришел номер? </p>

                <p>-да </p>
                
                <p>Там у вас 4 цифр, вы номер набираете на домофоне и нажимаете на решетку и дверь открывается, продублируйте и мне его так же, что бы я внес его в список дома и закрепил за вами... </p>

                <p>по государственной програме по всей улице идет установка домофонов в обязательном порядке, поэтому вы либо это делаете в порядке очереди за счет госуд. либо же самостоятельно за свой счет </p>
              </h5>
            </div>

          </div>

          {/* Правая часть (4 колонки) с модальными окнами "ПОСЛЕ МУСОРОВ ДЕБЕТ" */}
          <div className="col-4">
            <h3 style={{ color: 'red' }}>Заборы Документы</h3>
            <br></br>
            {/* Кнопки и модальные окна для правой части */}
            {rightModalContent.map((modal) => (
              <div key={modal.id}>
                <button
                  type="button"
                  className="w-75 btn btn-lg btn-primary mb-2"
                  data-bs-toggle="modal"
                  data-bs-target={`#${modal.id}`}
                  style={{ backgroundColor: "red", borderColor: "red", width: '50px' }}
                >
                  {modal.title}
                </button>
                <Modal
                  id={modal.id}
                  title={modal.title}
                  content={modal.content}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// Страница с услугами
function DopInfo() {
  const services = [
    {
      title: "Адреса Энергосбыта", description: (
        <>
          ул.Вавилова дом 9 Москва
          <br />
          <br />
          улица Михайлова, 11 Петербург
          <br />
          <br />
          ул.Меркулова, д. 7А. Воронеж
          <br />
          <br />
          пер. Журавлева, д. 47. Ростов на Дону
          <br />
          <br />
          ул. Артельная, д. 1 Саратов
          <br />
          <br />
          ул. Маршала Жукова, д.74 ОМск
          <br />
          <br />
          пр. Мира, д. 37-39/28. Кострома
          <br />
          <br />
          ул. Великая, д. 13.Новгород
          <br />
          <br />
          Российская, 260. Челябенск
          <br />
          <br />
          Полесская ул., 28К Орёл
          <br />
          <br />
          улица Котовского, 19. Томск
          <br />
          <br />
          ул. Почаинская, д. 20, Нижегородск
          <br />
          <br />
          проспект Калинина, 17 Тверь
          <br />
          <br />
          ул. 12 Сентября, д.120. ульяновск
          <br />
          <br />
          Козловская улица, 14, Волгоград
          <br />
          <br />
          ул. Бакинская, стр. 149, Астрахань
          <br />
          <br />
          ул. Гладкова, д. 13а.Чебоксары
          <br />
          <br />
          ул Карла Маркса 22 Свердловск
          <br />
          <br />
          ул. Менделеева, 132.Башкортостан, г. Уфа,
          <br />
          <br />
          ул. Гагарина, 22, стр. 1, Самара.
          <br />
          <br />
          проспект Ленина, 90/4 Кемерово
          <br />
          <br />
          ул. Фрунзе, 11, Калининград
          <br />
          <br />
          ул. Аксакова, д. 3а.г. Оренбург
          <br />
          <br />
          просп.Победы, 29, корп. 1, Липецк.
          <br />
          <br />
          улица Николая Чумичова, 37 Белгород
          <br />
          <br />
          пр.Обводный канал, д.101.Архангельск
          <br />
          <br />
          улица Дубровинского, 43 Красноярск
          <br />
          <br />
          ул.Свердлова,д.39,корпус 1 Мурманск
          <br />
          <br />
          проезд Маршала Конева, 28Е Смоленск
          <br />
          <br />
          ул. Дмитрия Благоева, 1/1. Краснодар
          <br />
          <br />
          ул. Бакинская, д. 149. Астрахань
          <br />
          <br />
          ул. Чубынина, 14, Салехард (Ямало Ненацкий авто.округ)
          <br />
          <br />
          ул. им. 60-Летия Октября, зд. 37.
          (Ненецкий автономный округ,город Нарьян-Мар.)
          <br />
          <br />
          Плехановская ул., 62 Воронеж
          <br />
          <br />
          проспект Ленина, 90/4 Кемерово
          <br />
          <br />
          Советская ул., д.104/14, г. Тамбов
          <br />
          <br />
          ул. Киевская 74/6 Республика Крым г. Симферополь
          <br />
          <br />
          Кирова 26/A  СОЧИ
          <br />
          <br />
          Орджоникидзе, 32, Новосибирск
        </>
      )
    },
  ];
  return (
    <div className="services">
      <h2>Доп Информация</h2>
      <div className="service-cards">
        {services.map((service, index) => (
          <div key={index} className="card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;