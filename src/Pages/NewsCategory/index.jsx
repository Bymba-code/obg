    import React, { useEffect, useState } from "react";
    import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";

    import { 
    Users as UsersIcon, 
    ChevronRight,
    Home,
    Phone,
    Calendar,
    Eye, 
    Edit2, 
    Trash2,
    FileText,
    Mail,
    MessageCircle,
    Loader,
    DollarSign,
    CreditCard,
    Settings,
    Settings2
    } from "lucide-react";
    import { useNavigate } from "react-router-dom";
    import UniversalTable from "../../Shared/UI/TableManagement";

    const NewsCategory = () => {
        const navigate = useNavigate();
        const [students, setStudents] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchStudents();
        }, []);

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/news-category`);

                console.log(response);
                if(response && response.status === 200) {
                    setStudents(response?.data?.data || []);
                }
            }
            catch(err) {
                console.error("Суралцагч татахад алдаа:", err);
                setStudents([]);
            }
            finally {
                setLoading(false);
            }
        };

        const handleEdit = async (editedData) => {
            try {
                await axiosInstance.put(`/news-category/${editedData.id}`, editedData);
                alert('Амжилттай шинэчиллээ!');
                fetchStudents();
            } catch (err) {
                console.error('Засахад алдаа:', err);
                alert('Засахад алдаа гарлаа!');
            }
        };

        const handleDelete = async (id) => {
            if (window.confirm('Та энэ суралцагчийг устгахдаа итгэлтэй байна уу?')) {
                try {
                    await axiosInstance.delete(`/news-category/${id}`);
                    alert('Амжилттай устгалаа!');
                    fetchStudents();
                } catch (err) {
                    console.error('Устгахад алдаа:', err);
                    alert('Устгахад алдаа гарлаа!');
                }
            }
        };

        const handleView = (item) => {
            navigate(`/student-stat/${item.id}`);
        };

        const handleAdd = async (newData) => {
            try {
                await axiosInstance.post('/autoschool/course-student', newData);
                alert('Амжилттай нэмлээ!');
                fetchStudents();
            } catch (err) {
                console.error('Нэмэхэд алдаа:', err);
                alert('Нэмэхэд алдаа гарлаа!');
            }
        };

        const customActions = (item) => (
        <>
            <button 
                onClick={() => handleView(item)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                    justifyContent:"center",
                    height:"42px",
                    paddingLeft:"11px",
                    paddingRight:"11px"
                }}
            >
                <Eye size={18} color="white"/>
            </button>
            <button 
                onClick={() => navigate(`/student-settings/${item.id}`)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                    justifyContent:"center",
                    height:"42px",
                        paddingLeft:"11px",
                    paddingRight:"11px"
                }}
            >
                <Settings size={18} color="white"/>
            </button>
        </>
        );

        const formatPrice = (price) => {
            if (!price && price !== 0) return '0₮';
            return new Intl.NumberFormat('mn-MN').format(price) + '₮';
        };

        const formatDate = (dateString) => {
            if (!dateString) return "—";
            const date = new Date(dateString);
            return date.toLocaleDateString('mn-MN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        };

        const calculateProgress = (paid, total) => {
            if (!total || total === 0) return 0;
            return Math.round((paid / total) * 100);
        };

        const columns = [
            {
                key:"id",
                label: '#',
                editable: false,
                render: (row, value) => (
                    <span >
                        {value}
                    </span>
                )
            },
            { 
                key: 'name', 
                label: 'Нэр',
                editable: true,
                render: (row, value) => (
                    <span>
                        {value}
                    </span>
                )
            },
        ];

        const totalStudents = students.length;
        const totalAmount = students.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const totalPaid = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
        const totalRemaining = totalAmount - totalPaid;

        return (
            <div className={css.container}>
                <div className={css.breadcrumb}>
                    <div className={css.breadcrumbItem}>
                        <Home size={16} />
                        <span>Нүүр</span>
                    </div>
                    <ChevronRight size={16} className={css.breadcrumbSeparator} />
                    <div className={`${css.breadcrumbItem} ${css.active}`}>
                        <UsersIcon size={16} />
                        <span>Мэдээллийн ангилал</span>
                    </div>
                </div>

                <div className={css.paymentStatBlock}>

                </div>
                
                <div className={css.pageHeader}>
                    <div className={css.headerContent}>
                        <div className={css.headerIcon}>
                            <UsersIcon size={28} />
                        </div>
                        <div className={css.headerText}>
                            <h1>Мэдээллийн ангилал</h1>
                            <p>Бүртгэлтэй мэдээллийн ангилалын жагсаалт</p>
                        </div>
                    </div>
                    <div className={css.headerStats}>
                        <div className={css.statItem}>
                            <span className={css.statValue}>{totalStudents}</span>
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
                            pageSize={5}
                            enableSearch={true}
                            enableSort={true}
                            enableEdit={true}
                            enableDelete={false}
                            enableView={false}
                            enableAdd={false}
                            enableExport={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            onAdd={handleAdd}
                            searchFields={[
                                'name'
                            ]}
                            enableFilter={true}
                                filterFields={[

                                ]}
                        />
                    )}
                </div>
            </div>
        );
    };

    export default NewsCategory;