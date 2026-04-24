// 全屏加载动画：初始化 session 检查时显示
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-[#c41e3a] w-10 h-10 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            文
          </span>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-[#c41e3a] border-t-transparent animate-spin" />
      </div>
    </div>
  );
}
