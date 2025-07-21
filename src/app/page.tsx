
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, Lock, Users, ArrowRight, Link2, Search, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon: Icon, title, description, className }: { icon: React.ElementType, title: string, description: string, className?: string }) => (
    <div className={cn("flex flex-col items-center p-6 text-center bg-card rounded-xl shadow-sm border animate-fade-in-up", className)}>
        <div className="p-3 mb-4 rounded-full bg-primary/10">
            <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const HowItWorksStep = ({ icon: Icon, title, description, step, className }: { icon: React.ElementType, title: string, description: string, step: number, className?: string }) => (
     <div className={cn("relative flex flex-col items-center text-center p-6 animate-fade-in-up", className)}>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl border-4 border-background">
            {step}
        </div>
        <div className="p-4 mb-4 mt-8 rounded-full bg-secondary">
            <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
)


export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-dvh bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                 <div className="container flex items-center justify-between h-16 max-w-6xl mx-auto px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">BluePay</span>
                    </Link>
                     <nav className="flex items-center gap-4">
                        <Button asChild>
                            <Link href="/login">開始使用</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-24 text-center">
                    <div className="container max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl animate-fade-in-down">
                            簡單、快速、安全的點對點支付
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                            告別複雜的轉帳流程。使用 BluePay，只需輕點幾下即可向朋友和家人付款或收款。您的安全與隱私是我們的第一要務。
                        </p>
                        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <Button asChild size="lg" className="h-14 text-lg group">
                                <Link href="/login">
                                    立即開始使用
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20 bg-muted/50">
                     <div className="container max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight animate-fade-in-up">為您量身打造的功能</h2>
                            <p className="text-muted-foreground mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>探索 BluePay 如何讓您的金融生活更輕鬆。</p>
                        </div>
                         <div className="grid gap-8 md:grid-cols-3">
                            <FeatureCard 
                                icon={Lock}
                                title="銀行級安全"
                                description="您的資料經過端到端加密，確保您的資金和個人資訊在每次交易中都安全無虞。"
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
                                description="我們絕不會分享或出售您的交易資料。您可以完全控制您的個人資訊與隱私設定。"
                                 className="[animation-delay:0.7s]"
                            />
                        </div>
                    </div>
                </section>

                 <section id="how-it-works" className="py-24">
                    <div className="container max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight animate-fade-in-up">三步驟，輕鬆上手</h2>
                            <p className="text-muted-foreground mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>體驗前所未有的流暢支付流程。</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
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
                
                 <section id="privacy-focus" className="py-20 bg-muted/50">
                    <div className="container max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left animate-fade-in-right">
                            <h2 className="text-3xl font-bold tracking-tight">您的隱私，我們的承諾</h2>
                             <p className="mt-4 text-lg text-muted-foreground">
                                在 BluePay，我們相信您的財務資訊應該是私密的。我們設計的平台從一開始就考慮到隱私。您的交易資料絕不會被用於廣告或出售給第三方。您可以放心地進行交易，因為知道您的資料受到保護。
                            </p>
                            <Button asChild variant="outline" className="mt-6">
                                <Link href="/privacy">閱讀我們的隱私政策</Link>
                            </Button>
                        </div>
                        <div className="flex justify-center animate-fade-in-left">
                            <div className="relative p-8 bg-card border rounded-xl shadow-lg">
                                <ShieldCheck className="w-32 h-32 text-primary" />
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="cta" className="py-24 text-center">
                    <div className="container max-w-4xl mx-auto px-4 animate-fade-in-up">
                         <h2 className="text-3xl font-bold tracking-tight">準備好體驗更簡單的支付方式了嗎？</h2>
                         <p className="mt-4 text-lg text-muted-foreground">立即加入數百萬用戶的行列，享受無縫、安全的交易。</p>
                         <div className="mt-8">
                            <Button asChild size="lg" className="h-14 text-lg group">
                                <Link href="/login">
                                    免費註冊
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t bg-muted/50">
                <div className="container text-center text-muted-foreground text-sm max-w-6xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} BluePay. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
