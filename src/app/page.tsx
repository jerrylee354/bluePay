
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, Lock, Users } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center p-6 text-center bg-card rounded-xl shadow-sm border">
        <div className="p-3 mb-4 rounded-full bg-primary/10">
            <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                 <div className="container flex items-center justify-between h-16 max-w-5xl mx-auto px-4">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">BluePay</span>
                    </div>
                     <nav className="flex items-center gap-4">
                        <Button asChild>
                            <Link href="/login">開始使用</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-20 text-center">
                    <div className="container max-w-3xl mx-auto px-4">
                        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                            簡單、快速、安全的點對點支付
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                            告別複雜的轉帳流程。使用 BluePay，只需輕點幾下即可向朋友和家人付款或收款。
                        </p>
                        <div className="mt-8">
                            <Button asChild size="lg" className="h-14 text-lg">
                                <Link href="/login">立即開始使用</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20 bg-muted/50">
                     <div className="container grid gap-8 md:grid-cols-3 max-w-5xl mx-auto px-4">
                        <FeatureCard 
                            icon={Lock}
                            title="銀行級安全"
                            description="您的資料經過端到端加密，確保您的資金和個人資訊安全。"
                        />
                        <FeatureCard 
                            icon={Users}
                            title="輕鬆社交支付"
                            description="透過使用者名稱輕鬆找到朋友。無需交換敏感的銀行詳細資訊。"
                        />
                        <FeatureCard 
                            icon={ShieldCheck}
                            title="隱私至上"
                            description="我們絕不會分享您的交易資料。您可以完全控制您的個人資訊。"
                        />
                    </div>
                </section>
                
                 <section id="privacy-focus" className="py-20">
                    <div className="container max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold tracking-tight">您的隱私，我們的承諾</h2>
                             <p className="mt-4 text-lg text-muted-foreground">
                                在 BluePay，我們相信您的財務資訊應該是私密的。我們設計的平台從一開始就考慮到隱私。您的交易資料絕不會被用於廣告或出售給第三方。您可以放心地進行交易，因為知道您的資料受到保護。
                            </p>
                            <Button asChild variant="outline" className="mt-6">
                                <Link href="/privacy">閱讀我們的隱私政策</Link>
                            </Button>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative p-8 bg-card border rounded-xl shadow-lg">
                                <ShieldCheck className="w-32 h-32 text-primary" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t bg-muted/50">
                <div className="container text-center text-muted-foreground text-sm max-w-5xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} BluePay. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
