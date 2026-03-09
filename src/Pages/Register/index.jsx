import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import css from "./style.module.css";
import { RegisterPayLoad } from "../../Modules/Authenticate/Model";
import { RegisterService } from "../../Modules/Authenticate/Services";
import { useToast } from "../../App/Providers/ToastProvider";

const Register = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [waiting, setWaiting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState(RegisterPayLoad);

    const [allFirstUnits, setAllFirstUnits] = useState([]);
    const [allSecondUnits, setAllSecondUnits] = useState([]);
    const [allThirdUnits, setAllThirdUnits] = useState([]);
    const [allFourthUnits, setAllFourthUnits] = useState([]);
    const [positions, setPositions] = useState([]);
    const [ranks, setRanks] = useState([]);
    
    const [filteredSecondUnits, setFilteredSecondUnits] = useState([]);
    const [filteredThirdUnits, setFilteredThirdUnits] = useState([]);
    const [filteredFourthUnits, setFilteredFourthUnits] = useState([]);

    const [showThirdUnit, setShowThirdUnit] = useState(false);
    const [showFourthUnit, setShowFourthUnit] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalData, setModalData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFirstUnits();
        fetchSecondUnits();
        fetchThirdUnits();
        fetchFourthUnits();
        fetchPositions();
        fetchRanks();
    }, []);

    const fetchFirstUnits = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/first-units');
            const data = await response.json();
            if (data.success) setAllFirstUnits(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchSecondUnits = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/second-units');
            const data = await response.json();
            if (data.success) setAllSecondUnits(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchThirdUnits = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/third-units');
            const data = await response.json();
            if (data.success) setAllThirdUnits(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchFourthUnits = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/fourth-units');
            const data = await response.json();
            if (data.success) setAllFourthUnits(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/positions');
            const data = await response.json();
            if (data.success) setPositions(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchRanks = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/rank');
            const data = await response.json();
            if (data.success) setRanks(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const openModal = (type) => {
        if (waiting) return;
        
        setModalType(type);
        setSearchTerm('');
        
        let data = [];
        switch(type) {
            case 'first_unit':
                data = allFirstUnits;
                break;
            case 'second_unit':
                data = filteredSecondUnits;
                break;
            case 'third_unit':
                data = filteredThirdUnits;
                break;
            case 'fourth_unit':
                data = filteredFourthUnits;
                break;
            case 'position':
                data = positions;
                break;
            case 'rank':
                data = ranks;
                break;
        }
        
        setModalData(data);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSearchTerm('');
    };

    const handleSelect = (id, name) => {
        if (modalType === 'first_unit') {
            setFormData({
                ...formData,
                first_unit: id,
                second_unit: '',
                third_unit: '',
                fourth_unit: ''
            });
            
            const filtered = allSecondUnits.filter(unit => unit.first_unit === id);
            setFilteredSecondUnits(filtered);
            setFilteredThirdUnits([]);
            setFilteredFourthUnits([]);
            setShowThirdUnit(false);
            setShowFourthUnit(false);
            
        } else if (modalType === 'second_unit') {
            setFormData({
                ...formData,
                second_unit: id,
                third_unit: '',
                fourth_unit: ''
            });
            
            const filtered = allThirdUnits.filter(unit => unit.second_unit === id);
            setFilteredThirdUnits(filtered);
            setFilteredFourthUnits([]);
            
            if (filtered.length > 0) {
                setShowThirdUnit(true);
            } else {
                setShowThirdUnit(false);
            }
            setShowFourthUnit(false);
            
        } else if (modalType === 'third_unit') {
            setFormData({
                ...formData,
                third_unit: id,
                fourth_unit: ''
            });
            
            const filtered = allFourthUnits.filter(unit => unit.third_unit === id);
            setFilteredFourthUnits(filtered);
            
            if (filtered.length > 0) {
                setShowFourthUnit(true);
            } else {
                setShowFourthUnit(false);
            }
            
        } else {
            setFormData({
                ...formData,
                [modalType]: id
            });
        }
        
        closeModal();
    };

    const filteredModalData = modalData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSelectedName = (type, id) => {
        if (!id) return '';
        
        let data = [];
        switch(type) {
            case 'first_unit':
                data = allFirstUnits;
                break;
            case 'second_unit':
                data = allSecondUnits;
                break;
            case 'third_unit':
                data = allThirdUnits;
                break;
            case 'fourth_unit':
                data = allFourthUnits;
                break;
            case 'position':
                data = positions;
                break;
            case 'rank':
                data = ranks;
                break;
        }
        
        const item = data.find(d => d.id === id);
        return item ? item.name : '';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const getModalTitle = () => {
        const titles = {
            first_unit: 'Үндсэн нэгж сонгох',
            second_unit: '2 дахь нэгж сонгох',
            third_unit: '3 дахь нэгж сонгох',
            fourth_unit: '4 дэх нэгж сонгох',
            position: 'Ажлын алба сонгох',
            rank: 'Цол сонгох'
        };
        return titles[modalType] || '';
    };

    return (
        <div className={css.wrapper}>
            {/* Particles decoration */}
            <div className={css.particles}>
                <div className={css.particle}></div>
                <div className={css.particle}></div>
                <div className={css.particle}></div>
                <div className={css.particle}></div>
                <div className={css.particle}></div>
            </div>

            <div className={css.container}>
                {/* LEFT: Info Section */}
                <div className={css.imageSection}>
                    <div className={css.overlay}></div>
                    <div className={css.pattern}></div>
                    <div className={css.imageContent}>
                        <div className={css.logoBadge}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                        <h1 className={css.welcomeTitle}>ОБЕГ</h1>
                        <p className={css.welcomeText}>
                            Онцгой байдлын ерөнхий газрын бүртгэлийн систем.
                            Таны мэдээлэл найдвартай хадгалагдана.
                        </p>
                        <div className={css.features}>
                            <div className={css.featureItem}>
                                <div className={css.checkIcon}>✓</div>
                                <span>Аюулгүй бүртгэл</span>
                            </div>
                            <div className={css.featureItem}>
                                <div className={css.checkIcon}>✓</div>
                                <span>Хурдан баталгаажуулалт</span>
                            </div>
                            <div className={css.featureItem}>
                                <div className={css.checkIcon}>✓</div>
                                <span>24/7 Дэмжлэг</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Form Section */}
                <div className={css.formSection}>
                    <div className={css.formWrapper}>
                        <div className={css.formHeader}>
                            <h2 className={css.formTitle}>Бүртгүүлэх</h2>
                            <p className={css.formSubtitle}>
                                Бүх талбарыг үнэн зөв бөглөнө үү
                            </p>
                        </div>

                        <form onSubmit={(e) => RegisterService(e, formData, setWaiting, navigate, toast)} className={css.form}>
                            {/* Error Message */}
                            {error && (
                                <div className={css.errorBox}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Name Fields */}
                            <div className={css.inputRow}>
                                <div className={css.inputGroup}>
                                    <label className={css.label}>Овог</label>
                                    <div className={css.inputWrapper}>
                                        <svg className={css.inputIcon} viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input
                                            type="text"
                                            name="firstname"
                                            className={css.input}
                                            placeholder="Овог"
                                            value={formData.firstname}
                                            onChange={handleChange}
                                            disabled={waiting}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={css.inputGroup}>
                                    <label className={css.label}>Нэр</label>
                                    <div className={css.inputWrapper}>
                                        <svg className={css.inputIcon} viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input
                                            type="text"
                                            name="lastname"
                                            className={css.input}
                                            placeholder="Нэр"
                                            value={formData.lastname}
                                            onChange={handleChange}
                                            disabled={waiting}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className={css.inputGroup}>
                                <label className={css.label}>Утасны дугаар</label>
                                <div className={css.inputWrapper}>
                                    <svg className={css.inputIcon} viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={css.input}
                                        placeholder="99001122"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={waiting}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className={css.divider}>
                                <span>Байгууллагын мэдээлэл</span>
                            </div>

                            {/* Organization Units */}
                            <div className={css.inputRow}>
                                <div className={css.inputGroup}>
                                    <label className={css.label}>Үндсэн нэгж</label>
                                    <div 
                                        className={`${css.selectBox} ${waiting ? css.disabled : ''}`}
                                        onClick={() => !waiting && openModal('first_unit')}
                                    >
                                        <span className={formData.first_unit ? css.selected : ''}>
                                            {formData.first_unit 
                                                ? getSelectedName('first_unit', formData.first_unit)
                                                : 'Сонгох'}
                                        </span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </div>
                                </div>

                                <div className={css.inputGroup}>
                                    <label className={css.label}>2 дахь нэгж</label>
                                    <div 
                                        className={`${css.selectBox} ${(!formData.first_unit || waiting) ? css.disabled : ''}`}
                                        onClick={() => !waiting && formData.first_unit && openModal('second_unit')}
                                    >
                                        <span className={formData.second_unit ? css.selected : ''}>
                                            {formData.second_unit 
                                                ? getSelectedName('second_unit', formData.second_unit)
                                                : formData.first_unit ? 'Сонгох' : 'Эхлээд үндсэн нэгж'}
                                        </span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Optional Units */}
                            {showThirdUnit && (
                                <div className={`${css.inputRow} ${css.fadeIn}`}>
                                    <div className={css.inputGroup}>
                                        <label className={css.label}>3 дахь нэгж</label>
                                        <div 
                                            className={`${css.selectBox} ${waiting ? css.disabled : ''}`}
                                            onClick={() => !waiting && openModal('third_unit')}
                                        >
                                            <span className={formData.third_unit ? css.selected : ''}>
                                                {formData.third_unit 
                                                    ? getSelectedName('third_unit', formData.third_unit)
                                                    : 'Сонгох'}
                                            </span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 9l6 6 6-6"/>
                                            </svg>
                                        </div>
                                    </div>

                                    {showFourthUnit && (
                                        <div className={css.inputGroup}>
                                            <label className={css.label}>4 дэх нэгж</label>
                                            <div 
                                                className={`${css.selectBox} ${waiting ? css.disabled : ''}`}
                                                onClick={() => !waiting && openModal('fourth_unit')}
                                            >
                                                <span className={formData.fourth_unit ? css.selected : ''}>
                                                    {formData.fourth_unit 
                                                        ? getSelectedName('fourth_unit', formData.fourth_unit)
                                                        : 'Сонгох'}
                                                </span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M6 9l6 6 6-6"/>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Position & Rank */}
                            <div className={css.inputRow}>
                                <div className={css.inputGroup}>
                                    <label className={css.label}>Ажлын алба</label>
                                    <div 
                                        className={`${css.selectBox} ${waiting ? css.disabled : ''}`}
                                        onClick={() => !waiting && openModal('position')}
                                    >
                                        <span className={formData.position ? css.selected : ''}>
                                            {formData.position 
                                                ? getSelectedName('position', formData.position)
                                                : 'Сонгох'}
                                        </span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </div>
                                </div>

                                <div className={css.inputGroup}>
                                    <label className={css.label}>Цол</label>
                                    <div 
                                        className={`${css.selectBox} ${waiting ? css.disabled : ''}`}
                                        onClick={() => !waiting && openModal('rank')}
                                    >
                                        <span className={formData.rank ? css.selected : ''}>
                                            {formData.rank 
                                                ? getSelectedName('rank', formData.rank)
                                                : 'Сонгох'}
                                        </span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {
                                Number(formData.position) === 4 || Number(formData.position) === 5 || Number(formData.position) === 25 ||  Number(formData.position) === 26 ?
                                <div className={`${css.inputGroup} ${css.fadeIn}`}>
                                    <label className={css.label}>Албан тушаал </label>
                                    <div className={css.inputWrapper}>
                                        <svg className={css.inputIcon} viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2">
                                        </svg>
                                        <input
                                            type="tel"
                                            name="extra_phone"
                                            className={css.input}
                                            placeholder="Албан тушаал"
                                            value={formData.extra_phone || ''}
                                            onChange={handleChange}
                                            disabled={waiting}
                                        />
                                    </div>
                                </div>
                                :
                                ""
                            }

                          

                            {/* Submit Button */}
                            <button type="submit" className={css.submitBtn} disabled={waiting}>
                                {waiting ? (
                                    <>
                                        <svg className={css.spinner} viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                        </svg>
                                        <span>Бүртгэж байна...</span>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ color: "white" }}>Бүртгүүлэх</span>
                                        <svg viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className={css.divider}>
                            <span>эсвэл</span>
                        </div>

                        {/* Back to Login */}
                        <div className={css.altActions}>
                            <Link
                                to="/login"
                                className={`${css.altBtn} ${waiting ? css.disabled : ""}`}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Нэвтрэх хуудас руу
                            </Link>
                            <button className={css.altBtn} disabled={waiting}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                </svg>
                                Тусламж
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className={css.modalOverlay} onClick={closeModal}>
                    <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={css.modalHeader}>
                            <h3>{getModalTitle()}</h3>
                            <button className={css.closeBtn} onClick={closeModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <div className={css.searchBox}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Хайх..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className={css.modalList}>
                            {filteredModalData.length > 0 ? (
                                filteredModalData.map((item) => (
                                    <div
                                        key={item.id}
                                        className={css.modalItem}
                                        onClick={() => handleSelect(item.id, item.name)}
                                    >
                                        <span>{item.name}</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    </div>
                                ))
                            ) : (
                                <div className={css.noData}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    <p>Мэдээлэл олдсонгүй</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;