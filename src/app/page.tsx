
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Lock, Users, Zap, Link as LinkIcon, Search, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const StepItem = ({ icon: Icon, step, title, description }: { icon: React.ElementType, step: string, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <span className="text-2xl font-bold">{step}</span>
        </div>
        <Icon className="w-10 h-10 text-primary mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-500">{description}</p>
    </div>
);

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-dvh bg-gray-50 text-gray-800 font-body">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg">
                <div className="container flex items-center justify-between h-20 max-w-7xl mx-auto px-4">
                    <Link href="/" className="flex items-center gap-2">
                         <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="url(#paint0_linear_1_2)"/>
                            <path d="M20.8255 10.8988C20.2087 10.2783 19.1171 10.2783 18.5003 10.8988L13.8835 15.5456C13.5751 15.8561 13.5751 16.3662 13.8835 16.6767L18.5003 21.3235C19.1171 21.944 20.2087 21.944 20.8255 21.3235C21.4423 20.703 21.4423 19.6053 20.8255 18.9848L17.6908 16.1111L20.8255 13.2375C21.4423 12.617 21.4423 11.5193 20.8255 10.8988Z" fill="white"/>
                            <path d="M13.1118 10.8988C12.495 10.2783 11.4034 10.2783 10.7866 10.8988C10.1698 11.5193 10.1698 12.617 10.7866 13.2375L13.9213 16.1111L10.7866 18.9848C10.1698 19.6053 10.1698 20.703 10.7866 21.3235C11.4034 21.944 12.495 21.944 13.1118 21.3235L17.7286 16.6767C18.037 16.3662 18.037 15.8561 17.7286 15.5456L13.1118 10.8988Z" fill="white"/>
                            <defs>
                            <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#2563EB"/>
                            <stop offset="1" stopColor="#3B82F6"/>
                            </linearGradient>
                            </defs>
                        </svg>
                        <span className="text-2xl font-bold text-gray-900">BluePay</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                         <Button asChild size="lg" className="group">
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
                                <Link href="/login">
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
                                description="您的交易資料經過端到端加密，我們絕不會分享或出售您的資料。"
                            />
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="py-24 bg-white">
                    <div className="container max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">三步驟，輕鬆上手</h2>
                            <p className="mt-4 text-lg text-gray-600">體驗前所未有的流暢支付流程。</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                            <StepItem step="1" icon={LinkIcon} title="安全連結您的帳戶" description="只需幾分鐘即可完成註冊並連結您的金融卡或銀行帳戶。" />
                            <StepItem step="2" icon={Search} title="尋找您的朋友" description="使用他們的使用者名稱或電子郵件，快速找到您想付款或收款的對象。" />
                            <StepItem step="3" icon={Send} title="即時轉帳" description="輸入金額，點擊發送，資金即刻到帳。就是這麼簡單！" />
                        </div>
                    </div>
                </section>
                
                <section id="privacy-focus" className="py-24 bg-gray-50">
                    <div className="container max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative flex justify-center items-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
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
                            <Button asChild variant="link" className="mt-6 p-0 h-auto text-lg text-primary hover:text-primary/80 group">
                                <Link href="/privacy">
                                    閱讀我們的隱私政策
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
                
                <section id="cta" className="py-24 text-center bg-white">
                    <div className="container max-w-4xl mx-auto px-4">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">準備好體驗更簡單的支付方式了嗎？</h2>
                        <p className="mt-4 text-lg text-gray-600">立即加入數百萬用戶的行列，享受無縫、安全的交易。</p>
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

            <footer className="py-8 border-t border-gray-200 bg-white">
                <div className="container text-center text-gray-500 text-sm max-w-7xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} BluePay. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

    