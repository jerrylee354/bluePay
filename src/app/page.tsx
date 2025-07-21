
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Lock, Users, Zap, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="mt-1 text-gray-600">{description}</p>
        </div>
    </div>
);

export default function LandingPage() {
    const [isHeaderButtonVisible, setIsHeaderButtonVisible] = useState(false);
    const heroButtonRef = useRef<HTMLAnchorElement>(null);
    const ctaButtonRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (heroButtonRef.current && ctaButtonRef.current) {
                const heroButtonRect = heroButtonRef.current.getBoundingClientRect();
                const ctaButtonRect = ctaButtonRef.current.getBoundingClientRect();
                const viewHeight = window.innerHeight;

                const heroButtonIsOutOfView = heroButtonRect.bottom < 0;
                const ctaButtonIsInView = ctaButtonRect.top < viewHeight && ctaButtonRect.bottom > 0;

                if (heroButtonIsOutOfView && !ctaButtonIsInView) {
                    setIsHeaderButtonVisible(true);
                } else {
                    setIsHeaderButtonVisible(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-dvh bg-gray-50 text-gray-800 font-body">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg">
                <div className="container flex items-center justify-between h-20 max-w-7xl mx-auto px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-gray-900">BluePay</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                         <Button asChild size="lg" className={cn(
                             "group transition-all duration-300",
                             isHeaderButtonVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                         )}>
                            <Link href="/login">
                                開始使用
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="relative py-28 md:py-40 text-center overflow-hidden bg-white">
                    <div className="absolute inset-0 -z-0 opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,rgba(255,255,255,0)_60%)]"></div>
                    <div className="container relative max-w-4xl mx-auto px-4 z-10">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-7xl">
                            為現代生活打造的
                            <span className="block text-primary">點對點支付</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 md:text-xl">
                            告別複雜的轉帳流程。使用 BluePay，只需輕點幾下即可向朋友和家人付款或收款。您的安全與隱私是我們的第一要務。
                        </p>
                        <div className="mt-10">
                             <Button asChild size="lg" className="h-14 text-lg group">
                                <Link href="/login" ref={heroButtonRef}>
                                    立即免費開始
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
                
                <section id="features" className="py-24 bg-gray-50">
                    <div className="container max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">一個更聰明、更簡單的支付方式</h2>
                            <p className="mt-4 text-lg text-gray-600">探索 BluePay 如何讓您的金融生活更輕鬆。</p>
                        </div>
                        <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
                            <FeatureItem
                                icon={Zap}
                                title="即時交易"
                                description="轉帳和收款都在瞬間完成，無需等待。體驗前所未有的流暢支付。"
                            />
                            <FeatureItem
                                icon={Users}
                                title="輕鬆社交支付"
                                description="透過使用者名稱輕鬆找到朋友並進行轉帳。無需再交換敏感且冗長的銀行詳細資訊。"
                            />
                            <FeatureItem
                                icon={Lock}
                                title="銀行級安全防護"
                                description="您的交易資料經過端對端加密，我們絕不會分享或出售您的資料。"
                            />
                        </div>
                    </div>
                </section>

                <section id="privacy-focus" className="py-24 bg-white">
                    <div className="container max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative flex justify-center items-center p-8">
                             <div className="relative w-72 h-72">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/10"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-primary/20"></div>
                                <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-primary" />
                            </div>
                        </div>
                        <div className="text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                您的隱私，我們的承諾
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                在 BluePay，我們相信您的財務資訊應該是私密的。我們設計的平台從一開始就考慮到隱私。
                            </p>
                            <ul className="mt-6 space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span>您的交易資料絕不會被用於廣告或出售給第三方。</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span>我們使用最先進的加密技術保護您的每一次轉帳。</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span>您可以完全控制您的資料，隨時查看或下載。</span>
                                </li>
                            </ul>
                            
                            <Button asChild variant="link" className="mt-8 p-0 h-auto text-lg text-primary hover:text-primary/80 group">
                                <Link href="/privacy">
                                    閱讀我們的隱私政策
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                             <div className="mt-8">
                                <p className="text-sm font-semibold text-gray-500">由劉氏敏集團開發</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="cta" className="py-24 text-center bg-gray-50">
                    <div className="container max-w-4xl mx-auto px-4">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">準備好體驗更簡單的支付方式了嗎？</h2>
                        <p className="mt-4 text-lg text-gray-600">立即加入數百萬用戶的行列，享受無縫、安全的交易。</p>
                        <div className="mt-8">
                             <Button asChild size="lg" className="h-14 text-lg group">
                                <Link href="/login" ref={ctaButtonRef}>
                                    免費註冊
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-gray-200 bg-white">
                <div className="container text-center text-gray-500 text-sm max-w-7xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} BluePay. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );

    