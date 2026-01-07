import { useState } from "react";
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  Award, 
  Clock,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLastVisitedLearningPage, useLearningStats } from "@/lib/utils";

// ProfilePage：个人信息页，展示基础信息与学习数据
const Profile = () => {
  const navigate = useNavigate();
  
  // 从localStorage加载议题数据
  const getTopicsFromLocalStorage = (): any[] => {
    try {
      const savedTopics = localStorage.getItem('ControvLearn_topics');
      return savedTopics ? JSON.parse(savedTopics) : [];
    } catch (error) {
      console.error('Failed to get topics from localStorage:', error);
      return [];
    }
  };
  
  // useLearningStats(topics)：复用首页/我的学习的统计逻辑
  const localStorageTopics = getTopicsFromLocalStorage();
  const { 
    participatedTopics, 
    completedTopics, 
    inProgressTopics,
    goalTopics,
    progressPercent
  } = useLearningStats(localStorageTopics);
  
  // loadLastLearningPage：从 localStorage 读取最近一次学习的位置
  const lastVisited = getLastVisitedLearningPage();
  
  // 格式化日期函数
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  };
  
  const lastStudyTime = lastVisited ? formatDate(lastVisited.visitedAt) : "暂无记录";
  const lastStudyTopic = lastVisited?.topicTitle || "暂无记录";
  const lastStudyStep = lastVisited?.stepId || 0;
  
  // 偏好设置状态
  const [showContinueLastLearning, setShowContinueLastLearning] = useState(true);
  const [showGoalModule, setShowGoalModule] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showPassword, setShowPassword] = useState(false);
  
  // 模拟用户数据
  const userData = {
    name: "张同学",
    school: "上海市 XX 中学",
    class: "初二（3）班"
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 - 复用样式 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600 font-bold text-xl">ControvLearn</div>
            <div className="text-gray-500 text-sm hidden md:inline-block">科学争议素养微课</div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              <BookOpen className="w-4 h-4 mr-2" />
              议题广场
            </a>
            <a href="/my-learning" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" onClick={(e) => { e.preventDefault(); navigate('/my-learning'); }}>
              <User className="w-4 h-4 mr-2" />
              我的学习
            </a>
            <a href="/help" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" onClick={(e) => { e.preventDefault(); navigate('/help'); }}>
              <HelpCircle className="w-4 h-4 mr-2" />
              帮助
            </a>
          </nav>
          
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                张
              </div>
              <span className="text-gray-700">张同学</span>
            </div>
            <button className="md:hidden text-gray-600">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* 页面主标题区 */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              个人信息
            </h1>
            <p className="text-gray-600 text-lg">
              查看和管理你的学习信息与偏好设置
            </p>
          </div>
        </section>
        
        {/* 主体内容区域 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
               {/* 区块 A：基本信息 */}
              <div className="profile-section profile-basic">
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                   <div className="profile-basic-header flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                     <div className="profile-avatar-large">
                       <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl border-4 border-blue-200">
                         {userData.name.charAt(0)}
                       </div>
                     </div>
                     <div className="profile-basic-text flex-grow text-center md:text-left">
                       <h2 className="text-2xl font-bold text-gray-800 mb-4">{userData.name}</h2>
                       
                       <div className="profile-account-row mb-3 flex items-center justify-center md:justify-start">
                         <span className="label font-medium text-gray-600 mr-2">用户名：</span>
                         <span className="value text-gray-800">{userData.name}</span>
                       </div>
                       
                       <div className="profile-account-row flex items-center justify-center md:justify-start">
                         <span className="label font-medium text-gray-600 mr-2">密码：</span>
                         <span className="value text-gray-800 mr-2">
                           {showPassword ? 'example123' : '********'}
                         </span>
                         <button
                           type="button"
                           className="link-button text-blue-600 hover:text-blue-800 transition-colors"
                           onClick={() => setShowPassword(v => !v)}
                         >
                           {showPassword ? '隐藏' : '显示'}
                         </button>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
              
               {/* 区块 B：我的学习数据 */}
              <div className="profile-section profile-learning">
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">我的学习数据</h3>
                   
                   {/* 学习统计卡片 */}
                   <div className="profile-stats-row grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="profile-stat-card bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                       <div className="label text-sm text-gray-600 mb-1">已参与议题</div>
                       <div className="value text-3xl font-bold text-blue-800">{participatedTopics}</div>
                     </div>
                     
                     <div className="profile-stat-card bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                       <div className="label text-sm text-gray-600 mb-1">已完成议题</div>
                       <div className="value text-3xl font-bold text-green-800">{completedTopics}</div>
                     </div>
                     
                     <div className="profile-stat-card bg-cyan-50 border border-cyan-100 rounded-xl p-6 text-center">
                       <div className="label text-sm text-gray-600 mb-1">进行中议题</div>
                       <div className="value text-3xl font-bold text-cyan-800">{inProgressTopics}</div>
                     </div>
                   </div>
                   
                   {/* 学期目标和进度条 */}
                   <div className="profile-goal-block bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                     <p className="text-gray-700 mb-4">本学期目标：{goalTopics} 个议题</p>
                     <div className="profile-progress-bar">
                       <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                         <div 
                           className="bg-blue-600 h-2.5 rounded-full" 
                           style={{ width: `${progressPercent}%` }}
                         ></div>
                       </div>
                       <span className="percent-text font-medium text-blue-600">{progressPercent}%</span>
                     </div>
                   </div>
                   
                   {/* 最近学习记录 */}
                   {lastVisited ? (
                     <p className="profile-last-learning text-gray-700">
                       最近学习：{lastStudyTopic} · 步骤 {lastStudyStep} · {lastStudyTime}
                     </p>
                   ) : (
                     <p className="profile-last-learning empty text-gray-700">
                       暂无最近学习记录，你可以从首页或议题广场开始一个新议题。
                     </p>
                   )}
                </div>
              </div>
              
               {/* 区块 C：账号与偏好设置 */}
              <div className="profile-section profile-preferences">
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">账号与偏好设置（示例）</h3>
                   
                   <div className="space-y-6">
                     {/* 开关选项 */}
                     <div className="preference-item flex justify-between items-center py-4 border-b border-gray-100">
                       <div>
                         <label className="font-medium text-gray-800">
                           <input
                             type="checkbox"
                             checked={showContinueLastLearning}
                             onChange={(e) => setShowContinueLastLearning(e.target.checked)}
                             className="mr-2"
                           />
                           在首页显示「继续上次学习」提示
                         </label>
                       </div>
                     </div>
                     
                     <div className="preference-item flex justify-between items-center py-4 border-b border-gray-100">
                       <div>
                         <label className="font-medium text-gray-800">
                           <input
                             type="checkbox"
                             checked={showGoalModule}
                             onChange={(e) => setShowGoalModule(e.target.checked)}
                             className="mr-2"
                           />
                           在首页显示本学期目标完成度模块
                         </label>
                       </div>
                     </div>
                     
                     {/* 下拉选项 */}
                     <div className="preference-item py-4">
                       <label className="block font-medium text-gray-800 mb-2">界面主题：</label>
                       <select 
                         value={theme} 
                         onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                         className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                       >
                         <option value="light">浅色</option>
                         <option value="dark">深色</option>
                       </select>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;