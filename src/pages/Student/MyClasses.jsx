import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Play,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import studentService from '../../services/studentService';

/**
 * MyClasses - List classes student enrolled in
 */
const MyClasses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [classExams, setClassExams] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyClasses();
      const classesData = Array.isArray(response) ? response : (response?.data || []);

      setClasses(classesData);

      console.log('📦 Classes data from API:', classesData);

      // Fetch exams count for each class
      const examCounts = {};
      for (const cls of classesData) {
        const classId = cls.classId || cls.classEntity?.id || cls.id;
        console.log(`🔍 Processing class: classId=${classId}, className=${cls.className}, fullData=`, cls);
        if (classId) {
          try {
            const examsResponse = await studentService.getClassExams(classId);
            const exams = Array.isArray(examsResponse) ? examsResponse : [];
            // Filter only PRACTICE exams
            const practiceExams = exams.filter(exam => exam.examCategory === 'PRACTICE');
            examCounts[classId] = practiceExams.length;
          } catch (error) {
            console.error(`Error fetching exams for class ${classId}:`, error);
            examCounts[classId] = 0;
          }
        }
      }
      setClassExams(examCounts);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': { text: 'Đang hoạt động', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'COMPLETED': { text: 'Đã kết thúc', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
      'CANCELLED': { text: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
      'PLANNED': { text: 'Sắp bắt đầu', color: 'bg-blue-100 text-blue-700', icon: Calendar },
    };
    const badge = badges[status?.toUpperCase()] || badges['ACTIVE'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}>
        {badge.icon && <badge.icon className="w-3 h-3" />}
        {badge.text}
      </span>
    );
  };

  const filteredClasses = classes.filter(cls =>
    (cls.className || cls.classEntity?.className || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Lớp học của tôi</h1>
          <p className="text-indigo-100">Xem và làm bài kiểm tra của các lớp học đã tham gia</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="relative">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {searchQuery ? 'Không tìm thấy lớp học nào' : 'Bạn chưa tham gia lớp học nào'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy đăng ký lớp học để được giao bài tập'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-gray-900">{filteredClasses.length}</span> lớp học
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => {
                const classId = cls.classId || cls.classEntity?.id || cls.id;
                const className = cls.className || cls.classEntity?.className;
                const classCode = cls.classCode || cls.classEntity?.classCode;
                const courseName = cls.courseName || cls.classEntity?.course?.name;
                const teacherName = cls.teacherName || cls.classEntity?.teacher?.fullName;
                const schedule = cls.schedule || cls.classEntity?.schedule;
                const room = cls.room || cls.classEntity?.room;
                const status = cls.status || 'ACTIVE';
                const examCount = classExams[classId] || 0;

                return (
                  <div
                    key={classId}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
                  >
                    {/* Class Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{className}</h3>
                          {classCode && (
                            <p className="text-sm text-indigo-100">{classCode}</p>
                          )}
                        </div>
                        {getStatusBadge(status)}
                      </div>
                    </div>

                    {/* Class Info */}
                    <div className="p-6">
                      <div className="space-y-3 mb-4">
                        {courseName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>{courseName}</span>
                          </div>
                        )}

                        {teacherName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{teacherName}</span>
                          </div>
                        )}

                        {schedule && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{schedule}</span>
                          </div>
                        )}

                        {room && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{room}</span>
                          </div>
                        )}
                      </div>

                      {/* Exam Stats */}
                      <div className="bg-purple-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">Bài luyện tập</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{examCount}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log('Navigating to class:', classId);
                            navigate(`/student/class/${classId}`);
                          }}
                          className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Xem bài thi
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyClasses;
