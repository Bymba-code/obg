import React, { useEffect, useState } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance"
import { 
    Users as UsersIcon, 
    ChevronRight,
    Home,
    Eye, 
    Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UniversalTable from "../../Shared/UI/TableManagement";

const Users = () => {
    const navigate = useNavigate();
    const [students, setStudents]       = useState([]);
    const [loading, setLoading]         = useState(true);

    // ── Filter data ──
    const [firstUnits, setFirstUnits]   = useState([]);
    const [secondUnits, setSecondUnits] = useState([]);
    const [thirdUnits, setThirdUnits]   = useState([]);
    const [positions, setPositions]     = useState([]);
    const [ranks, setRanks]             = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [fu, su, tu, pos, rank] = await Promise.all([
                    axiosInstance.get(`/first-units`),
                    axiosInstance.get(`/second-units`),
                    axiosInstance.get(`/third-units`),
                    axiosInstance.get(`/positions`),
                    axiosInstance.get(`/rank`),
                ]);
                if (fu?.status === 200)   setFirstUnits(fu.data.data);
                if (su?.status === 200)   setSecondUnits(su.data.data);
                if (tu?.status === 200)   setThirdUnits(tu.data.data);
                if (pos?.status === 200)  setPositions(pos.data.data);
                if (rank?.status === 200) setRanks(rank.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/users`);
            if (response?.status === 200) {
                setStudents(response?.data?.data || []);
            }
        } catch (err) {
            console.error("Хэрэглэгч татахад алдаа:", err);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (item) => navigate(`/user/${item.id}`);

    const customActions = (item) => (
        <>
            <button
                onClick={() => handleView(item)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', height: '42px',
                    paddingLeft: '11px', paddingRight: '11px'
                }}
            >
                <Eye size={18} color="white" />
            </button>
            <button
                onClick={() => navigate(`/student-settings/${item.id}`)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', height: '42px',
                    paddingLeft: '11px', paddingRight: '11px'
                }}
            >
                <Settings size={18} color="white" />
            </button>
        </>
    );

    const columns = [
        {
            key: "firstname", label: 'ОВОГ',
            render: (row, value) => <span>{value || '—'}</span>
        },
        {
            key: 'lastname', label: 'НЭР',
            render: (row, value) => <span>{value || '—'}</span>
        },
        {
            key: 'phone', label: 'УТАС',
            render: (row, value) => <span>{value || '—'}</span>
        },
        {
            key: 'kode', label: 'КОД',
            render: (row, value) => <span>{value || '—'}</span>
        },
        {
            key: 'date', label: 'БҮРТГҮҮЛСЭН',
            render: (row, value) => <span>{value ? value.split("T")[0] : '—'}</span>
        },
        {
            key: 'user_first_unit', label: '1-р нэгж',
            render: (row) => (
                <span>
                    {row.user_first_unit?.[0]
                        ?.first_unit_user_first_unit_first_unitTofirst_unit
                        ?.name || '—'}
                </span>
            )
        },
        {
            key: 'user_second_unit', label: '2-р нэгж',
            render: (row) => (
                <span>
                    {row.user_second_unit?.[0]
                        ?.second_unit_user_second_unit_second_unitTosecond_unit
                        ?.name || '—'}
                </span>
            )
        },
        {
            key: 'user_third_unit', label: '3-р нэгж',
            render: (row) => (
                <span>
                    {row.user_third_unit?.[0]
                        ?.third_unit_user_third_unit_third_unitTothird_unit
                        ?.name || '—'}
                </span>
            )
        },
        {
            key: 'user_fourth_unit', label: '4-р нэгж',
            render: (row) => (
                <span>
                    {row.user_fourth_unit?.[0]
                        ?.fourth_unit_user_fourth_unit_fourth_unitTofourth_unit
                        ?.name || '—'}
                </span>
            )
        },
        {
            key: 'user_positions', label: 'АЛБАН ТУШААЛ',
            render: (row) => (
                <span>{row.user_positions?.[0]?.positions?.name || '—'}</span>
            )
        },
        {
            key: 'user_rank', label: 'ЦОЛ',
            render: (row) => (
                <span>
                    {row.user_rank?.[0]?.rank_user_rank_rankTorank?.name || '—'}
                </span>
            )
        },
    ];

    const filterFields = [
        {
            key: 'user_first_unit',
            label: '1-р нэгж',
            options: firstUnits.map((e) => ({ value: e.id, label: e.name })),
            filterFn: (item, val) =>
                item.user_first_unit?.some(
                    (u) => String(u.first_unit) === String(val)
                ),
        },
        {
            key: 'user_second_unit',
            label: '2-р нэгж',
            options: secondUnits.map((e) => ({ value: e.id, label: e.name })),
            filterFn: (item, val) =>
                item.user_second_unit?.some(
                    (u) => String(u.second_unit) === String(val)
                ),
        },
        {
            key: 'user_third_unit',
            label: '3-р нэгж',
            options: thirdUnits.map((e) => ({ value: e.id, label: e.name })),
            filterFn: (item, val) =>
                item.user_third_unit?.some(
                    (u) => String(u.third_unit) === String(val)
                ),
        },
        {
            key: 'user_positions',
            label: 'Албан тушаал',
            options: positions.map((e) => ({ value: e.id, label: e.name })),
            filterFn: (item, val) =>
                item.user_positions?.some(
                    (u) => String(u.position) === String(val)
                ),
        },
        {
            key: 'user_rank',
            label: 'Цол',
            options: ranks.map((e) => ({ value: e.id, label: e.name })),
            filterFn: (item, val) =>
                item.user_rank?.some(
                    (u) => String(u.rank) === String(val)
                ),
        },
    ];

    return (
        <div className={css.container}>
            <div className={css.breadcrumb}>
                <div className={css.breadcrumbItem}>
                    <Home size={16} /><span>Нүүр</span>
                </div>
                <ChevronRight size={16} className={css.breadcrumbSeparator} />
                <div className={`${css.breadcrumbItem} ${css.active}`}>
                    <UsersIcon size={16} /><span>Хэрэглэгчид</span>
                </div>
            </div>

            <div className={css.pageHeader}>
                <div className={css.headerContent}>
                    <div className={css.headerIcon}><UsersIcon size={28} /></div>
                    <div className={css.headerText}>
                        <h1>Хэрэглэгчид</h1>
                        <p>Хэрэглэгчийн мэдээлэл</p>
                    </div>
                </div>
                <div className={css.headerStats}>
                    <div className={css.statItem}>
                        <span className={css.statValue}>{students.length}</span>
                        <span className={css.statLabel}>Нийт</span>
                    </div>
                </div>
            </div>

            <div className={css.mainContent}>
                {loading ? (
                    <div className={css.loadingContainer}>
                        <div className={css.loader} />
                        <p>Мэдээлэл уншиж байна...</p>
                    </div>
                ) : (
                    <UniversalTable
                        data={students}
                        columns={columns}
                        customActions={customActions}
                        pageSize={10}
                        enableSearch={true}
                        enableSort={true}
                        enableEdit={false}
                        enableDelete={false}
                        enableView={false}
                        enableAdd={false}
                        enableExport={true}
                        enableFilter={true}
                        filterFields={filterFields}
                        searchFields={['firstname', 'lastname', 'phone', 'kode']}
                    />
                )}
            </div>
        </div>
    );
};

export default Users;