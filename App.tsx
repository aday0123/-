import React, { useState, useCallback, useEffect } from 'react';
import { AppState, QuizType, type Quiz1Question, type Quiz2Question, type QuizQuestion, type ImageStyle, IMAGE_STYLES } from './types';
import { generateDefinitionQuiz, generateSentenceQuiz } from './services/geminiService';
import { useTTS } from './hooks/useTTS';
import { QuizScreen, ResultsScreen, SettingsModal, Spinner, SettingsIcon } from './components/QuizComponents';

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INPUT);
    const [vocabulary, setVocabulary] = useState<string>('');
    const [quiz1Data, setQuiz1Data] = useState<Quiz1Question[]>([]);
    const [quiz2Data, setQuiz2Data] = useState<Quiz2Question[]>([]);
    const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
    const [currentQuizType, setCurrentQuizType] = useState<QuizType | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { speak, voices, settings, setSettings } = useTTS();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [imageStyle, setImageStyle] = useState<ImageStyle>(IMAGE_STYLES[0]);
    
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('geminiApiKey') || '');
    const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
    const [apiKeySaved, setApiKeySaved] = useState(false);

    useEffect(() => {
        localStorage.setItem('geminiApiKey', apiKey);
    }, [apiKey]);
    
    const handleSaveApiKey = () => {
        setApiKey(tempApiKey);
        setApiKeySaved(true);
        setTimeout(() => setApiKeySaved(false), 2000);
    };

    const handleCreateQuiz = useCallback(async () => {
        if (!apiKey) {
            setError('請先輸入並儲存您的 Gemini API 金鑰。');
            return;
        }
        const words = vocabulary.split(/[,、\s]+/).filter(Boolean);
        if (words.length < 4) {
            setError('請至少輸入4個詞彙以產生測驗。');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const [defQuiz, sentQuiz] = await Promise.all([
                generateDefinitionQuiz(words, apiKey),
                generateSentenceQuiz(words, apiKey)
            ]);
            setQuiz1Data(defQuiz);
            setQuiz2Data(sentQuiz);
            setAppState(AppState.SELECT);
        } catch (err) {
            console.error(err);
            setError('無法產生測驗，請檢查您的 API 金鑰或網路連線，然後再試一次。');
        } finally {
            setIsLoading(false);
        }
    }, [vocabulary, apiKey]);

    const startQuiz = (type: QuizType) => {
        // FIX: Explicitly type `data` as `QuizQuestion[]` to resolve a type inference error when calling `shuffleArray`.
        const data: QuizQuestion[] = type === QuizType.DEFINITION ? quiz1Data : quiz2Data;
        setCurrentQuiz(shuffleArray(data));
        setCurrentQuizType(type);
        setAppState(AppState.QUIZ);
    };

    const handleQuizComplete = (incorrectQuestions: QuizQuestion[]) => {
        setCurrentQuiz(incorrectQuestions);
        setAppState(AppState.RESULTS);
    };

    const handleRetry = () => {
        setCurrentQuiz(shuffleArray(currentQuiz));
        setAppState(AppState.QUIZ);
    };

    const handleExit = () => {
        setAppState(AppState.SELECT);
    };
    
    const resetApp = () => {
        setAppState(AppState.INPUT);
        setVocabulary('');
        setQuiz1Data([]);
        setQuiz2Data([]);
        setCurrentQuiz([]);
        setCurrentQuizType(null);
        setError(null);
    }

    const renderContent = () => {
        if (isLoading) {
            return <Spinner message="正在為您產生個人化的測驗..." />;
        }

        switch (appState) {
            case AppState.INPUT:
                const isButtonDisabled = isLoading || !apiKey || !vocabulary.trim();
                return (
                    <div className="w-full max-w-2xl mx-auto p-6 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200">
                        <div className="text-center">
                            <div className="flex justify-center items-center gap-4 mb-4">
                                <span className="text-4xl">✏️</span>
                                <h1 className="text-3xl md:text-4xl font-bold text-sky-800">公館國小資源班<br/>中文詞彙互動測驗產生器</h1>
                                <span className="text-4xl">🌟</span>
                            </div>
                            <p className="text-md text-slate-600 mb-6">請輸入詞彙清單，我將立即為您產生相關詞彙測驗！</p>
                        </div>

                        <div className="space-y-6">
                            <textarea
                                className="w-full h-40 p-4 border-2 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors bg-white text-slate-900 text-lg"
                                placeholder="例如：蘋果、快樂、學習、電腦..."
                                value={vocabulary}
                                onChange={(e) => setVocabulary(e.target.value)}
                            />

                            <div>
                                 <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-600 mb-2">Gemini API 金鑰</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="api-key-input"
                                        type="password"
                                        className="flex-grow p-3 border-2 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors bg-white"
                                        placeholder="在此輸入您的 API 金鑰"
                                        value={tempApiKey}
                                        onChange={(e) => setTempApiKey(e.target.value)}
                                    />
                                    <button onClick={handleSaveApiKey} className="px-4 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">
                                       {apiKeySaved ? "已儲存!" : "儲存"}
                                    </button>
                                </div>
                                {!apiKey && <p className="text-xs text-amber-600 mt-1">必須先儲存 API 金鑰才能產生測驗。</p>}
                            </div>

                            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                            
                            <button
                                onClick={handleCreateQuiz}
                                disabled={isButtonDisabled}
                                className="w-full bg-sky-600 text-white font-bold py-4 px-6 rounded-xl text-xl hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {isLoading ? '產生中...' : '✨ 開始產生測驗 ✨'}
                            </button>
                        </div>
                    </div>
                );
            
            case AppState.SELECT:
                return (
                    <div className="w-full max-w-md mx-auto text-center">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">選擇測驗類型</h2>
                        <div className="space-y-4">
                            <button onClick={() => startQuiz(QuizType.DEFINITION)} className="w-full bg-white text-sky-700 font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-sky-50 transition-all border border-slate-200">
                                測驗一: 語詞解釋配對選擇
                            </button>
                            <button onClick={() => startQuiz(QuizType.SENTENCE)} className="w-full bg-white text-sky-700 font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-sky-50 transition-all border border-slate-200">
                                測驗二: 語詞例句漏空選擇
                            </button>
                        </div>
                         <button onClick={resetApp} className="mt-8 text-slate-500 hover:text-slate-700 transition-colors">
                            重新輸入詞彙
                        </button>
                    </div>
                );

            case AppState.QUIZ:
                if (!currentQuizType) return null;
                return (
                    <QuizScreen
                        questions={currentQuiz}
                        quizType={currentQuizType}
                        onQuizComplete={handleQuizComplete}
                        speak={speak}
                        onExitQuiz={handleExit}
                        imageStyle={imageStyle}
                        apiKey={apiKey}
                    />
                );
            
            case AppState.RESULTS:
                if (!currentQuizType) return null;
                return (
                    <ResultsScreen
                        incorrectQuestions={currentQuiz}
                        quizType={currentQuizType}
                        onRetry={handleRetry}
                        onExit={handleExit}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 right-4 text-slate-500 hover:text-sky-600 transition-colors z-20">
                <SettingsIcon className="w-8 h-8"/>
                <span className="sr-only">設定</span>
            </button>
            <main className="w-full transition-all duration-300 z-10">
                {renderContent()}
            </main>
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                voices={voices}
                ttsSettings={settings}
                onTtsSettingsChange={setSettings}
                imageStyle={imageStyle}
                onImageStyleChange={setImageStyle}
            />
             <footer className="absolute bottom-4 text-xs text-slate-400 z-10">
                由 Gemini API 驅動
            </footer>
        </div>
    );
};

export default App;