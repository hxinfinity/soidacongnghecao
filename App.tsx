
import React, { useState, useRef, useEffect } from 'react';
import { analyzeSkinImage } from './services/geminiService';
import { SkinAnalysisResult } from './types';
import { MetricCard } from './components/MetricCard';
import { LayerDisplay } from './components/LayerDisplay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const quotes = [
  "Hãy sống như một nữ hoàng, không sợ thất bại. Vì thất bại là nấc thang bước đến thành công.",
  "Trước khi tìm thấy một nửa của mình, hãy sống như một nữ hoàng.",
  "Phụ nữ có 3 việc không thể ngừng: Học hành, xinh đẹp và kiếm tiền.",
  "Bạn muốn sở hữu AI riêng hãy liên hệ mình: 0988.727.678 - 0786.145.311",
  "Bạn không cần phải hoàn hảo, bạn chỉ cần phải chân thật.",
  "Vẻ đẹp thực sự toát ra khi bạn là chính mình."
];

const TypewriterQuotes: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    const currentQuote = quotes[quoteIndex];
    let timeout: NodeJS.Timeout;

    if (text.length < currentQuote.length) {
      timeout = setTimeout(() => {
        setText(currentQuote.slice(0, text.length + 1));
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setText('');
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
      }, 2500);
    }

    return () => clearTimeout(timeout);
  }, [text, quoteIndex]);

  return (
    <div className="h-24 flex items-center justify-center px-4 max-w-3xl">
      <p className="text-[#E6C65C]/90 text-2xl italic font-medium text-center">
        "{text}<span className="animate-pulse">|</span>"
      </p>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('hx_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        startAnalysis(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (base64: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeSkinImage(base64);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra trong quá trình phân tích. Vui lòng thử lại với ảnh rõ nét hơn.");
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const resetAnalysis = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64String = canvas.toDataURL('image/jpeg');
        setImage(base64String);
        closeCamera();
        startAnalysis(base64String);
      }
    }
  };

  const downloadReport = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      const date = new Date();
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      pdf.save(`HX Infinity ${dateString}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Có lỗi xảy ra khi xuất báo cáo.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'HXINFINITY' && password === 'HXIF@2026') {
      setIsAuthenticated(true);
      localStorage.setItem('hx_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Tên người dùng hoặc mật khẩu không đúng.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#E6C65C] flex flex-col items-center justify-center p-6 text-[#0F3B2E]">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-[#0F3B2E]/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter text-[#0F3B2E] mb-2">HX INFINITY</h1>
            <p className="text-sm font-medium tracking-[0.1em] text-[#0F3B2E]/80">ĐĂNG NHẬP HỆ THỐNG</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#0F3B2E]/80 mb-2">Tên người dùng</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#0F3B2E]/20 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0F3B2E]/50 text-[#0F3B2E]"
                placeholder="Nhập tên người dùng"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F3B2E]/80 mb-2">Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#0F3B2E]/20 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0F3B2E]/50 text-[#0F3B2E]"
                placeholder="Nhập mật khẩu"
              />
            </div>
            
            {loginError && (
              <p className="text-red-500 text-sm font-semibold text-center">{loginError}</p>
            )}
            
            <button 
              type="submit"
              className="w-full bg-[#0F3B2E] text-[#E6C65C] py-4 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
            >
              ĐĂNG NHẬP
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6C65C] pb-24 text-[#0F3B2E]">
      {/* Header */}
      <header className="bg-[#E6C65C] text-[#0F3B2E] py-8 px-6 sticky top-0 z-50 shadow-md border-b border-[#0F3B2E]/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-2">
          <h1 className="text-[31px] font-bold tracking-tighter text-[#0F3B2E]">
            HX INFINITY SOI DA CÔNG NGHỆ CAO
          </h1>
          <p className="text-sm font-medium tracking-[0.1em] text-[#0F3B2E]/80 mt-1">
            Bạn muốn sở hữu AI riêng hãy liên hệ mình: 0988.727.678 - 0786.145.311
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {!image ? (
          /* Initial Upload Section */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
            {!isCameraOpen ? (
              <div className="w-full max-w-md p-10 border-4 border-dashed border-[#0F3B2E]/20 rounded-[3rem] bg-white/50 flex flex-col items-center gap-8 hover:border-[#0F3B2E]/50 transition-colors">
                <div className="w-24 h-24 rounded-full bg-[#0F3B2E]/10 flex items-center justify-center">
                  <i className="fas fa-expand text-4xl text-[#0F3B2E]"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#0F3B2E]">Bắt Đầu Phân Tích</h3>
                  <p className="text-sm text-[#0F3B2E]/70">Chọn phương thức đầu vào</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    onClick={triggerUpload}
                    className="flex-1 bg-[#0F3B2E] text-[#E6C65C] py-4 rounded-full font-bold shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-upload"></i> Tải Ảnh
                  </button>
                  <button 
                    onClick={openCamera}
                    className="flex-1 bg-[#0F3B2E] text-[#E6C65C] py-4 rounded-full font-bold shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-camera"></i> Camera
                  </button>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="w-full max-w-2xl flex flex-col items-center gap-6 bg-white p-6 rounded-[3rem] shadow-xl border border-[#0F3B2E]/10">
                <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover"
                    playsInline
                    autoPlay
                    muted
                  ></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={closeCamera}
                    className="flex-1 py-4 rounded-full text-[#0F3B2E]/80 font-bold bg-[#0F3B2E]/5 hover:bg-[#0F3B2E]/10 transition-colors"
                  >
                    HỦY
                  </button>
                  <button 
                    onClick={captureImage}
                    className="flex-[2] gold-gradient py-4 rounded-full text-black font-black text-lg shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-camera"></i> CHỤP ẢNH
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Analysis View */
          <div className="space-y-12 animate-fade-in" ref={reportRef}>
            {/* Loading / Error States */}
            {analyzing && (
              <div className="fixed inset-0 bg-[#0F3B2E]/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-[#E6C65C] p-10 text-center">
                <div className="w-24 h-24 border-8 border-[#E6C65C]/20 border-t-[#E6C65C] rounded-full animate-spin mb-8"></div>
                <h2 className="text-4xl font-bold mb-8 tracking-widest">HX INFINITY</h2>
                <TypewriterQuotes />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-700 flex items-center gap-4">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
                <p className="font-semibold">{error}</p>
                <button onClick={resetAnalysis} className="ml-auto underline font-bold">Thử lại</button>
              </div>
            )}

            {result && (
              <>
                {/* 1. Dashboard Overview */}
                <section className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-5 relative group">
                    <img 
                      src={image} 
                      alt="Uploaded face" 
                      className="w-full aspect-[3/4] object-cover rounded-[3rem] shadow-2xl border-8 border-white"
                    />
                    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                       <span className="text-[#E6C65C] font-bold text-xs uppercase tracking-widest mb-1">AI Scan ID: #8892-PRO</span>
                       <h3 className="text-2xl font-bold uppercase">Bản Đồ Da Chuyên Sâu</h3>
                    </div>
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-4 right-4 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                      title="Xóa ảnh"
                    >
                      <i className="fas fa-trash-alt text-xl"></i>
                    </button>
                  </div>

                  <div className="md:col-span-7 flex flex-col justify-center space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#0F3B2E]/10">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-4xl font-bold text-[#0F3B2E]">Skin Score PRO</h2>
                          <p className="text-[#0F3B2E] font-semibold uppercase tracking-widest text-sm">Chỉ số sức khỏe da</p>
                        </div>
                        <div className="w-24 h-24 rounded-full border-8 border-[#0F3B2E]/5 flex items-center justify-center relative">
                          <svg className="w-24 h-24 absolute -rotate-90">
                            <circle 
                              cx="48" cy="48" r="40" 
                              stroke="currentColor" 
                              strokeWidth="8" 
                              fill="transparent" 
                              className="text-[#0F3B2E]/10"
                            />
                            <circle 
                              cx="48" cy="48" r="40" 
                              stroke="currentColor" 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 40}
                              strokeDashoffset={2 * Math.PI * 40 * (1 - result.overview.skin_score / 100)}
                              className="text-[#0F3B2E]"
                            />
                          </svg>
                          <span className="text-2xl font-black text-[#0F3B2E]">{result.overview.skin_score}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <p className="text-[10px] text-[#0F3B2E]/60 font-bold uppercase tracking-widest mb-1">Loại da</p>
                          <p className="text-lg font-bold text-[#0F3B2E]">{result.overview.skin_type}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <p className="text-[10px] text-[#0F3B2E]/60 font-bold uppercase tracking-widest mb-1">Vùng yếu nhất</p>
                          <p className="text-lg font-bold text-red-600">{result.overview.weakest_area}</p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <p className="text-xs font-bold text-[#0F3B2E]/60 uppercase tracking-widest mb-3">Vấn đề nổi bật</p>
                        <div className="flex flex-wrap gap-2">
                          {result.overview.top_3_issues.map((issue, i) => (
                            <span key={i} className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold border border-red-100">
                              <i className="fas fa-exclamation-circle mr-2"></i>{issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Multi-Layer Results */}
                {result.layers && (
                  <section>
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-[#0F3B2E]">Phân Tích Đa Lớp (4 Tầng)</h2>
                      <div className="w-24 h-1 bg-[#0F3B2E] mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {result.layers.surface && <LayerDisplay layer={result.layers.surface} icon="fa-layer-group" color="border-blue-200" />}
                      {result.layers.pigmentation && <LayerDisplay layer={result.layers.pigmentation} icon="fa-palette" color="border-amber-200" />}
                      {result.layers.dermis && <LayerDisplay layer={result.layers.dermis} icon="fa-dna" color="border-purple-200" />}
                      {result.layers.vascular && <LayerDisplay layer={result.layers.vascular} icon="fa-tint" color="border-red-200" />}
                    </div>
                  </section>
                )}

                {/* 3. Detailed 12 Metrics Grid */}
                {result.detailed_metrics && result.detailed_metrics.length > 0 && (
                  <section>
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-[#0F3B2E]">Chi Tiết 12 Hạng Mục Chuyên Sâu</h2>
                      <div className="w-24 h-1 bg-[#0F3B2E] mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {result.detailed_metrics.map((metric, i) => (
                        <MetricCard key={i} metric={metric} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. PRO Features: Aging & Symmetry */}
                <section className="grid md:grid-cols-2 gap-8">
                  {/* Aging Prediction */}
                  {result.aging && (
                    <div className="bg-[#0F3B2E] p-8 rounded-[3rem] text-[#E6C65C] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <i className="fas fa-hourglass-half text-9xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold mb-8 text-[#E6C65C]">Dự Đoán Lão Hóa 3–5 Năm</h3>
                      
                      <div className="space-y-8 relative z-10">
                        <div className="border-l-4 border-red-500 pl-4">
                          <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Nếu giữ thói quen hiện tại</p>
                          <p className="text-[#E6C65C]/80 text-sm italic">{result.aging.without_care}</p>
                        </div>
                        
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Nếu chăm sóc chuẩn Hoàng Gia Spa</p>
                          <p className="text-[#E6C65C]/80 text-sm italic">{result.aging.with_care}</p>
                        </div>

                        <div className="pt-6 border-t border-[#E6C65C]/10">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#E6C65C]/60">Tỷ lệ cải thiện dự kiến:</span>
                            <span className="text-4xl font-black text-[#E6C65C]">+{result.aging.improvement_percent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Symmetry Analysis */}
                  {result.symmetry && (
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-[#0F3B2E]/10 flex flex-col">
                      <h3 className="text-2xl font-bold text-[#0F3B2E] mb-6 flex items-center gap-3">
                        <i className="fas fa-arrows-alt-h text-[#0F3B2E]"></i> Đối Xứng & Phân Vùng
                      </h3>
                      
                      <div className="space-y-6 flex-grow">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <div>
                            <p className="text-xs font-bold text-[#0F3B2E]/60 uppercase tracking-widest">Balance Score</p>
                            <p className="text-2xl font-bold text-[#0F3B2E]">{result.symmetry.balance_score}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#0F3B2E]/60 uppercase tracking-widest">Bên yếu hơn</p>
                            <p className="text-lg font-bold text-red-500 uppercase">{result.symmetry.weak_side}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold text-[#0F3B2E] uppercase tracking-widest mb-1">So sánh Trái - Phải</p>
                            <p className="text-[#0F3B2E]/80 text-sm leading-relaxed">{result.symmetry.comparison}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0F3B2E] uppercase tracking-widest mb-1">T-Zone vs U-Zone</p>
                            <p className="text-[#0F3B2E]/80 text-sm leading-relaxed">{result.symmetry.t_zone_vs_u_zone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* 5. Treatment Plan */}
                {result.treatment && (
                  <section className="bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-[#0F3B2E]/20 relative">
                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-[#0F3B2E] text-[#E6C65C] px-12 py-3 rounded-full font-black tracking-widest shadow-xl uppercase">
                      Phác Đồ Chuyên Sâu Tối Ưu
                    </div>
                    
                    <div className="grid lg:grid-cols-3 gap-12 mt-8">
                      <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-3xl font-bold text-[#0F3B2E]">{result.treatment.plan_name}</h3>
                        <p className="text-[#0F3B2E]/80 leading-relaxed italic">
                          "{result.treatment.description}"
                        </p>
                        <div className="space-y-3">
                           <p className="text-xs font-bold text-[#0F3B2E]/60 uppercase tracking-widest">Dịch vụ đề xuất</p>
                           <div className="flex flex-wrap gap-2">
                             {result.treatment.suggested_services?.map((s, i) => (
                               <span key={i} className="px-3 py-1 bg-[#0F3B2E]/10 text-[#0F3B2E] rounded-lg text-xs font-bold border border-[#0F3B2E]/20">
                                 {s}
                               </span>
                             ))}
                           </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-[#0F3B2E]/10 flex flex-col">
                          <span className="text-4xl font-black text-[#0F3B2E]/40 mb-2">30D</span>
                          <p className="text-xs font-bold text-[#0F3B2E] uppercase tracking-widest mb-2">Giai đoạn phục hồi</p>
                          <p className="text-[#0F3B2E]/90 text-sm leading-relaxed flex-grow">{result.treatment.duration_30_days}</p>
                        </div>
                        
                        <div className="p-6 bg-slate-50 rounded-3xl border border-[#0F3B2E]/30 flex flex-col scale-105 shadow-xl ring-2 ring-[#0F3B2E]/20 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-[#0F3B2E] text-[#E6C65C] text-[10px] font-bold px-3 py-1 rounded-bl-xl">HOT</div>
                          <span className="text-4xl font-black text-[#0F3B2E]/40 mb-2">60D</span>
                          <p className="text-xs font-bold text-[#0F3B2E] uppercase tracking-widest mb-2">Giai đoạn chuyên sâu</p>
                          <p className="text-[#0F3B2E]/90 text-sm leading-relaxed flex-grow">{result.treatment.duration_60_days}</p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-[#0F3B2E]/10 flex flex-col">
                          <span className="text-4xl font-black text-[#0F3B2E]/40 mb-2">90D</span>
                          <p className="text-xs font-bold text-[#0F3B2E] uppercase tracking-widest mb-2">Duy trì kết quả</p>
                          <p className="text-[#0F3B2E]/90 text-sm leading-relaxed flex-grow">{result.treatment.duration_90_days}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Disclaimer */}
                <div className="text-center text-[10px] text-[#0F3B2E]/60 font-medium uppercase tracking-[0.2em] mt-12 pb-6">
                   * Kết quả phân tích bởi AI chỉ mang tính chất tham khảo chuyên môn trong Spa. Không thay thế chẩn đoán y khoa của bác sĩ da liễu.
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 pb-12">
                  <button 
                    onClick={resetAnalysis}
                    className="bg-white border-2 border-[#0F3B2E] text-[#0F3B2E] px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-[#0F3B2E]/5 transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-redo"></i> Phân Tích Mới
                  </button>
                  <button 
                    onClick={downloadReport} 
                    className="bg-[#0F3B2E] text-[#E6C65C] px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-file-pdf"></i> Xuất Báo Cáo
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0F3B2E] text-[#E6C65C] py-4 px-6 z-50 text-center shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <a 
          href="https://zalo.me/g/bxhgyl255" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-[#E6C65C] text-[#0F3B2E] px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg"
        >
          VÀO ĐÂY HỌC CHUYÊN SÂU VỀ AI
        </a>
      </footer>
    </div>
  );
};

export default App;
