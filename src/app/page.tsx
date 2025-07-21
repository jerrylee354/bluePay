
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, Lock, Users, ArrowRight, Link2, Search, Send, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon: Icon, title, description, className }: { icon: React.ElementType, title: string, description: string, className?: string }) => (
    <div className={cn("flex flex-col items-start p-6 text-left bg-white/5 border border-white/10 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20", className)}>
        <div className="p-3 mb-4 rounded-full bg-primary/20">
            <Icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const HowItWorksStep = ({ icon: Icon, title, description, step, className }: { icon: React.ElementType, title: string, description: string, step: number, className?: string }) => (
     <div className={cn("relative flex flex-col items-center text-center p-6 animate-fade-in-up", className)}>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl border-4 border-gray-900">
            {step}
        </div>
        <div className="p-4 mb-4 mt-8 rounded-full bg-primary/10 border border-primary/30">
            <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
)

const AnimatedGradientText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn(
        "bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent",
        className
    )}>
        {children}
    </span>
);

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-dvh bg-gray-900 text-white font-body">
            <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur-sm">
                 <div className="container flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-white">BluePay</span>
                    </Link>
                     <nav className="flex items-center gap-4">
                        <Button asChild className="group bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 transition-all duration-300">
                            <Link href="/login">
                                開始使用
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="relative py-24 md:py-32 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,128,255,0.3),rgba(255,255,255,0))]"></div>
                    <div className="container relative max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl animate-fade-in-down">
                            為現代生活打造的
                            <AnimatedGradientText> 點對點支付 </AnimatedGradientText>
                        </h1>
                        <p className="mt-6 text-lg text-gray-300 md:text-xl animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                            告別複雜的轉帳流程。使用 BluePay，只需輕點幾下即可向朋友和家人付款或收款。您的安全與隱私是我們的第一要務。
                        </p>
                        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <Button asChild size="lg" className="h-14 text-lg group bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 transition-all duration-300">
                                <Link href="/login">
                                    立即開始使用
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20 bg-gray-900 border-y border-white/10">
                     <div className="container max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight animate-fade-in-up">為您量身打造的功能</h2>
                            <p className="text-gray-400 mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>探索 BluePay 如何讓您的金融生活更輕鬆。</p>
                        </div>
                         <div className="grid gap-8 md:grid-cols-3">
                            <FeatureCard 
                                icon={Zap}
                                title="即時交易"
                                description="轉帳和收款都在瞬間完成，無需等待。體驗前所未有的流暢支付。"
                                className="[animation-delay:0.3s]"
                            />
                            <FeatureCard 
                                icon={Users}
                                title="輕鬆社交支付"
                                description="透過使用者名稱輕鬆找到朋友並進行轉帳。無需再交換敏感且冗長的銀行詳細資訊。"
                                 className="[animation-delay:0.5s]"
                            />
                            <FeatureCard 
                                icon={ShieldCheck}
                                title="隱私至上"
                                description="您的交易資料經過端到端加密，我們絕不會分享或出售您的資料。"
                                 className="[animation-delay:0.7s]"
                            />
                        </div>
                    </div>
                </section>

                 <section id="how-it-works" className="py-24 bg-black/20">
                    <div className="container max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight animate-fade-in-up">三步驟，輕鬆上手</h2>
                            <p className="text-gray-400 mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>體驗前所未有的流暢支付流程。</p>
                        </div>
                        <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/20 hidden md:block"></div>
                           <HowItWorksStep
                                step={1}
                                icon={Link2}
                                title="安全連結您的帳戶"
                                description="只需幾分鐘即可完成註冊並連結您的金融卡或銀行帳戶。"
                                className="[animation-delay:0.3s]"
                           />
                           <HowItWorksStep
                                step={2}
                                icon={Search}
                                title="尋找您的朋友"
                                description="使用他們的使用者名稱或電子郵件，快速找到您想付款或收款的對象。"
                                className="[animation-delay:0.5s]"
                           />
                           <HowItWorksStep
                                step={3}
                                icon={Send}
                                title="即時轉帳"
                                description="輸入金額，點擊發送，資金即刻到帳。就是這麼簡單！"
                                className="[animation-delay:0.7s]"
                           />
                        </div>
                    </div>
                </section>
                
                 <section id="privacy-focus" className="py-20 bg-gray-900 border-y border-white/10">
                    <div className="container max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left animate-fade-in-right">
                             <h2 className="text-3xl font-bold tracking-tight">
                                <AnimatedGradientText>您的隱私</AnimatedGradientText>，我們的承諾
                            </h2>
                             <p className="mt-4 text-lg text-gray-300">
                                在 BluePay，我們相信您的財務資訊應該是私密的。我們設計的平台從一開始就考慮到隱私。您的交易資料絕不會被用於廣告或出售給第三方。您可以放心地進行交易，因為知道您的資料受到最高標準的保護。
                            </p>
                            <Button asChild variant="link" className="mt-6 p-0 h-auto text-lg text-blue-400 hover:text-blue-300 group">
                                <Link href="/privacy">
                                    閱讀我們的隱私政策
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                        <div className="flex justify-center animate-fade-in-left">
                            <div className="relative p-8 bg-gradient-to-br from-blue-500/20 to-primary/20 border border-white/10 rounded-xl shadow-2xl shadow-primary/10">
                                <Lock className="w-32 h-32 text-primary" />
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="cta" className="py-24 text-center bg-black/20">
                    <div className="container max-w-4xl mx-auto px-4 animate-fade-in-up">
                         <h2 className="text-3xl font-bold tracking-tight">準備好體驗更簡單的支付方式了嗎？</h2>
                         <p className="mt-4 text-lg text-gray-400">立即加入數百萬用戶的行列，享受無縫、安全的交易。</p>
                         <div className="mt-8">
                            <Button asChild size="lg" className="h-14 text-lg group bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 transition-all duration-300">
                                <Link href="/login">
                                    免費註冊
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-white/10 bg-gray-900">
                <div className="container text-center text-gray-500 text-sm max-w-7xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} BluePay. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
