import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MyLearning from "@/pages/MyLearning";
import TopicIntroduction from "@/pages/TopicIntroduction";
import BackgroundReading from "@/pages/BackgroundReading";
import InitialIntuition from "@/pages/InitialIntuition";
import PerspectivePuzzle from "@/pages/PerspectivePuzzle";
import ArgumentAnalysis from "@/pages/ArgumentAnalysis";
import DialogueSimulation from "@/pages/DialogueSimulation";
import MetaCognition from "@/pages/MetaCognition";
import PositionReview from "@/pages/PositionReview";
import Profile from "@/pages/Profile";
import { useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // 默认已登录状态，方便演示

  const logout = () => {
    setIsAuthenticated(false);
    toast('已退出登录');
  };

  // 模拟用户认证状态
  useEffect(() => {
    if (isAuthenticated) {
      toast('欢迎来到 ControvLearn 科学争议素养微课平台！');
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics" element={<Home />} />
        <Route path="/my-learning" element={<MyLearning />} />
        <Route path="/help" element={<div className="min-h-screen flex items-center justify-center text-center text-xl text-gray-500">帮助页面 - 即将上线</div>} />
      {/* 添加议题学习流程页面路由 */}
      <Route path="/topic/:id" element={<TopicIntroduction />} />
      <Route path="/topic/:id/background-reading" element={<BackgroundReading />} />
      <Route path="/topic/:id/initial-intuition" element={<InitialIntuition />} />
      <Route path="/topic/:id/perspective-puzzle" element={<PerspectivePuzzle />} />
      <Route path="/topic/:id/argument-analysis" element={<ArgumentAnalysis />} />
      <Route path="/topic/:id/dialogue-simulation" element={<DialogueSimulation />} />
      <Route path="/topic/:id/meta-cognition" element={<MetaCognition />} />
      <Route path="/topic/:id/position-review" element={<PositionReview />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    </AuthContext.Provider>
  );
}
