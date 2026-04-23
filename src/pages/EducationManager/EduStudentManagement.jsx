import { useState, useEffect, useMemo, useCallback } from 'react';
import educationManagerService from '../../services/educationManagerService';
import {
    Search, Users, BookOpen, UserPlus, RefreshCw, X, ChevronDown,
    ChevronLeft, ChevronRight, GraduationCap, Filter, UserCheck, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

const PAGE_SIZE = 15;

const EduStudentManagement = () => {
    // Core data
    const [allStudents, setAllStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Student-to-course mapping: { studentId: [courseName, ...] }
    const [studentEnrollments, setStudentEnrollments] = useState({});

    // Add-to-class panel
    const [showAssignPanel, setShowAssignPanel] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    const [classStudents, setClassStudents] = useState([]);
    const [assignSearch, setAssignSearch] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [loadingClassStudents, setLoadingClassStudents] = useState(false);

    // ── Data fetching ──────────────────────────────────────────

    useEffect(() => {
        let cancelled = false;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [studentsResp, coursesResp, classesResp] = await Promise.all([
                    educationManagerService.getAllStudents({ size: 100 }),
                    educationManagerService.getAllCourses(),
                    educationManagerService.getAllClasses(),
                ]);

                if (cancelled) return;

                const studentList = studentsResp?.students || studentsResp?.content || (Array.isArray(studentsResp) ? studentsResp : []);
                setAllStudents(studentList);
                setCourses(Array.isArray(coursesResp) ? coursesResp : []);
                const classList = Array.isArray(classesResp) ? classesResp : [];
                setClasses(classList);

                // Build enrollment map from class list data (no extra API calls)
                const courseMap = {};
                if (Array.isArray(coursesResp)) {
                    coursesResp.forEach(c => { courseMap[c.id] = c.courseName || c.name || `Course ${c.id}`; });
                }

                // Use class details to get student enrollment - batch by course
                const enrollments = {};
                const results = await Promise.allSettled(
                    classList.map(async (cls) => {
                        const data = await educationManagerService.getClassStudents(cls.id);
                        const students = Array.isArray(data) ? data : [];
                        return { classId: cls.id, courseId: cls.courseId, courseName: courseMap[cls.courseId] || cls.courseName || cls.className, students };
                    })
                );

                if (cancelled) return;

                results.forEach(r => {
                    if (r.status === 'fulfilled') {
                        const { courseName, students } = r.value;
                        students.forEach(s => {
                            const sid = s.id || s.studentId;
                            if (!enrollments[sid]) enrollments[sid] = new Set();
                            enrollments[sid].add(courseName);
                        });
                    }
                });

                const final = {};
                Object.keys(enrollments).forEach(k => { final[k] = Array.from(enrollments[k]); });
                setStudentEnrollments(final);
            } catch (e) {
                console.error('Error fetching initial data:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchInitialData();
        return () => { cancelled = true; };
    }, []);

    const fetchClassStudents = useCallback(async (classId) => {
        if (!classId) { setClassStudents([]); return; }
        try {
            setLoadingClassStudents(true);
            const data = await educationManagerService.getClassStudents(classId);
            setClassStudents(Array.isArray(data) ? data : []);
        } catch (e) {
            setClassStudents([]);
        } finally {
            setLoadingClassStudents(false);
        }
    }, []);

    useEffect(() => { fetchClassStudents(selectedClass); }, [selectedClass, fetchClassStudents]);

    // ── Derived data ───────────────────────────────────────────

    // Classes grouped by course
    const classesByCourse = useMemo(() => {
        const map = {};
        classes.forEach(cls => {
            const cid = cls.courseId || 'uncategorized';
            if (!map[cid]) map[cid] = [];
            map[cid].push(cls);
        });
        return map;
    }, [classes]);

    // Student IDs enrolled in classes that belong to the selected course
    const courseStudentIds = useMemo(() => {
        if (courseFilter === 'all') return null; // null means no filter
        const courseClasses = classesByCourse[courseFilter] || [];
        // We build a set of student IDs from classStudents we already fetched
        // But we need this synchronously, so use studentEnrollments instead
        const ids = new Set();
        const courseName = courses.find(c => c.id === Number(courseFilter) || c.id === courseFilter)?.courseName || courses.find(c => c.id === Number(courseFilter) || c.id === courseFilter)?.name;
        if (courseName) {
            Object.entries(studentEnrollments).forEach(([sid, courseNames]) => {
                if (courseNames.includes(courseName)) ids.add(Number(sid));
            });
        }
        // Also check by class membership
        courseClasses.forEach(cls => {
            const clsStudents = cls.students || [];
            clsStudents.forEach(s => ids.add(s.id || s.studentId));
        });
        return ids;
    }, [courseFilter, classesByCourse, courses, studentEnrollments]);

    // Filtered + searched students for main table
    const filteredStudents = useMemo(() => {
        let list = allStudents;

        // Filter by course
        if (courseStudentIds) {
            list = list.filter(s => courseStudentIds.has(s.id));
        }

        // Search by name / email / username
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.fullName?.toLowerCase().includes(term) ||
                s.email?.toLowerCase().includes(term) ||
                s.username?.toLowerCase().includes(term)
            );
        }

        return list;
    }, [allStudents, courseStudentIds, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
    const pagedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Search results for assign panel (searches ALL students, not just available)
    const assignResults = useMemo(() => {
        if (!assignSearch) return [];
        const term = assignSearch.toLowerCase();
        return allStudents.filter(s =>
            s.fullName?.toLowerCase().includes(term) ||
            s.email?.toLowerCase().includes(term) ||
            s.username?.toLowerCase().includes(term)
        ).slice(0, 20);
    }, [assignSearch, allStudents]);

    const isInClass = (studentId) => classStudents.some(s => (s.id || s.studentId) === studentId);

    // ── Actions ────────────────────────────────────────────────

    const handleAddToClass = async (studentId, studentName) => {
        if (!selectedClass) {
            Swal.fire('Chú ý', 'Vui lòng chọn lớp học trước', 'warning');
            return;
        }
        setAssigning(true);
        try {
            await educationManagerService.addStudentToClass(selectedClass, { studentId: Number(studentId) });
            await fetchClassStudents(selectedClass);
            // Refresh student list to reflect changes
            const studentsResp = await educationManagerService.getAllStudents({ size: 100 });
            const studentList = studentsResp?.students || studentsResp?.content || (Array.isArray(studentsResp) ? studentsResp : []);
            setAllStudents(studentList);
            Swal.fire({
                icon: 'success',
                title: `Đã thêm ${studentName} vào lớp!`,
                toast: true,
                timer: 1500,
                showConfirmButton: false,
                position: 'top-end',
            });
        } catch (e) {
            Swal.fire('Lỗi', e?.response?.data?.message || e?.message || 'Không thể thêm học viên vào lớp', 'error');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveFromClass = async (studentId, studentName) => {
        if (!selectedClass) return;
        const result = await Swal.fire({
            title: `Xóa ${studentName} khỏi lớp?`,
            text: 'Học viên sẽ bị xóa khỏi lớp này.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Xóa',
        });
        if (!result.isConfirmed) return;
        try {
            await educationManagerService.removeStudentFromClass(selectedClass, studentId);
            await fetchClassStudents(selectedClass);
            // Refresh student list
            const studentsResp = await educationManagerService.getAllStudents({ size: 100 });
            const studentList = studentsResp?.students || studentsResp?.content || (Array.isArray(studentsResp) ? studentsResp : []);
            setAllStudents(studentList);
            Swal.fire({
                icon: 'success',
                title: `Đã xóa ${studentName} khỏi lớp!`,
                toast: true,
                timer: 1500,
                showConfirmButton: false,
                position: 'top-end',
            });
        } catch (e) {
            Swal.fire('Lỗi', e?.response?.data?.message || e?.message || 'Không thể xóa học viên', 'error');
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setCourseFilter('all');
        setCurrentPage(1);
    };

    const selectedClassName = classes.find(c => c.id === Number(selectedClass))?.className || '';

    // ── Render ─────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-2xl p-6 lg:p-8 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-20 -translate-x-20" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Quản lý Học viên</h1>
                                <p className="text-purple-100 text-sm mt-0.5">
                                    {allStudents.length} học viên trong hệ thống
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAssignPanel(!showAssignPanel)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    showAssignPanel
                                        ? 'bg-white text-indigo-600 shadow-lg'
                                        : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                                }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                Thêm vào lớp
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/30 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" /> Làm mới
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add-to-class panel */}
                {showAssignPanel && (
                    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 mb-6 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-indigo-500" />
                                Thêm học viên vào lớp
                            </h3>
                            <button onClick={() => setShowAssignPanel(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Left: Class selector + class roster */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Chọn lớp học
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedClass}
                                        onChange={e => { setSelectedClass(e.target.value); setAssignSearch(''); }}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-10"
                                    >
                                        <option value="">-- Chọn lớp học --</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.className} ({cls.classCode})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>

                                {selectedClass && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Học viên trong lớp
                                            </span>
                                            <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                                                {classStudents.length}
                                            </span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                            {loadingClassStudents ? (
                                                <div className="py-4 text-center text-sm text-gray-400">Đang tải...</div>
                                            ) : classStudents.length === 0 ? (
                                                <div className="py-4 text-center text-sm text-gray-400">Chưa có học viên</div>
                                            ) : (
                                                classStudents.map(s => (
                                                    <div key={s.id || s.studentId}
                                                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                                {(s.fullName || s.studentName)?.charAt(0)}
                                                            </div>
                                                            <span className="text-sm text-gray-700">{s.fullName || s.studentName}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveFromClass(s.id || s.studentId, s.fullName || s.studentName)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Search all students and add */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Tìm học viên (tất cả)
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Nhập tên hoặc email để tìm..."
                                        value={assignSearch}
                                        onChange={e => setAssignSearch(e.target.value)}
                                        disabled={!selectedClass}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                </div>

                                {assignSearch && (
                                    <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
                                        {assignResults.length === 0 ? (
                                            <div className="py-4 text-center text-sm text-gray-400">
                                                <Search className="w-6 h-6 mx-auto mb-1 text-gray-200" />
                                                Không tìm thấy học viên
                                            </div>
                                        ) : assignResults.map(student => {
                                            const inClass = selectedClass && isInClass(student.id);
                                            return (
                                                <div key={student.id}
                                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                            {student.fullName?.charAt(0) || 'S'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-800">{student.fullName}</div>
                                                            <div className="text-xs text-gray-400">{student.email || student.username}</div>
                                                        </div>
                                                        {studentEnrollments[student.id]?.length > 0 && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full ml-1">
                                                                {studentEnrollments[student.id].length} khóa
                                                            </span>
                                                        )}
                                                    </div>
                                                    {selectedClass && (
                                                        inClass ? (
                                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-green-50 text-green-600 rounded-full font-medium">
                                                                <UserCheck className="w-3 h-3" /> Đã trong lớp
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAddToClass(student.id, student.fullName)}
                                                                disabled={assigning}
                                                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-md disabled:opacity-60 transition-all"
                                                            >
                                                                <UserPlus className="w-3.5 h-3.5" /> Thêm
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {!selectedClass && (
                                    <div className="mt-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-700">
                                        Vui lòng chọn lớp học trước khi tìm và thêm học viên.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-800">{allStudents.length}</div>
                            <div className="text-xs text-gray-400">Tổng học viên</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-800">{courses.length}</div>
                            <div className="text-xs text-gray-400">Khóa học</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-800">{classes.length}</div>
                            <div className="text-xs text-gray-400">Lớp học</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-800">
                                {Object.keys(studentEnrollments).length}
                            </div>
                            <div className="text-xs text-gray-400">Đã ghi danh</div>
                        </div>
                    </div>
                </div>

                {/* Search & filter bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm học viên theo tên, email..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                value={courseFilter}
                                onChange={e => { setCourseFilter(e.target.value); setCurrentPage(1); }}
                                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">Tất cả khóa học</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.courseName || c.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {(searchTerm || courseFilter !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4" /> Xóa lọc
                            </button>
                        )}
                        <div className="ml-auto text-xs text-gray-400">
                            {filteredStudents.length} kết quả
                        </div>
                    </div>
                </div>

                {/* Main student table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-sm">Đang tải danh sách học viên...</p>
                            </div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="py-16 text-center">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                            <h3 className="text-lg font-semibold text-gray-400 mb-1">Không tìm thấy học viên</h3>
                            <p className="text-sm text-gray-300">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase w-16">STT</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Học viên</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Email / Username</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-indigo-600 uppercase">Khóa học đã đăng ký</th>
                                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-indigo-600 uppercase">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pagedStudents.map((student, i) => {
                                            const enrollments = studentEnrollments[student.id] || [];
                                            const isActive = enrollments.length > 0;
                                            return (
                                                <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-5 py-3.5 text-sm text-gray-400 font-medium">
                                                        {(currentPage - 1) * PAGE_SIZE + i + 1}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            {student.avatar ? (
                                                                <img src={student.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                                    {student.fullName?.charAt(0) || 'S'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-800">{student.fullName}</div>
                                                                <div className="text-xs text-gray-400">{student.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-gray-600">
                                                        {student.email || student.username || '-'}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {enrollments.length === 0 ? (
                                                                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 font-medium">
                                                                    Chưa đăng ký
                                                                </span>
                                                            ) : (
                                                                enrollments.map((courseName, idx) => (
                                                                    <span key={idx}
                                                                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100"
                                                                    >
                                                                        <BookOpen className="w-3 h-3" />
                                                                        {courseName}
                                                                    </span>
                                                                ))
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        {isActive ? (
                                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                                                <UserCheck className="w-3 h-3" /> Đang học
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                                Chưa ghi danh
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                                    <span className="text-xs text-gray-400">
                                        Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} / {filteredStudents.length} học viên
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-gray-500" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .reduce((acc, p, idx, arr) => {
                                                if (idx > 0 && arr[idx - 1] < p - 1) acc.push('...');
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, idx) =>
                                                p === '...' ? (
                                                    <span key={`dot-${idx}`} className="px-2 text-xs text-gray-400">...</span>
                                                ) : (
                                                    <button key={p} onClick={() => setCurrentPage(p)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                            currentPage === p
                                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                                                                : 'hover:bg-white text-gray-600'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )
                                        }
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EduStudentManagement;
