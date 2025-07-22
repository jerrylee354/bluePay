
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, ShieldCheck, Users, Zap, Wallet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';


const features = [
    {
        icon: Zap,
        title: "即時交易",
        description: "轉帳和收款都在瞬間完成，無需等待。體驗前所未有的流暢支付。",
        details: {
            title: "快如閃電的即時交易",
            description: "忘記銀行轉帳的漫長等待。BluePay 的技術讓您的資金在幾秒鐘內從您的帳戶到達您朋友的帳戶。無論是白天還是半夜，週末還是假日，交易都能即時完成。",
            application: "和朋友聚餐後，用 BluePay 即時分攤帳單，無需等待任何人找零或隔天轉帳。"
        }
    },
    {
        icon: Users,
        title: "輕鬆社交支付",
        description: "透過使用者名稱輕鬆找到朋友並進行轉帳。無需再交換敏感且冗長的銀行詳細資訊。",
        details: {
            title: "為社交而生的支付方式",
            description: "您只需要知道朋友的 BluePay 使用者名稱，就可以安全地向他們付款或收款。這不僅保護了雙方的銀行帳戶隱私，也讓支付過程像傳送訊息一樣簡單自然。",
            application: "在辦公室團購下午茶時，同事們只需透過您的 BluePay 使用者名稱就能輕鬆付款給您，無需一個個加銀行好友。"
        }
    },
    {
        icon: ShieldCheck,
        title: "銀行級安全防護",
        description: "您的交易資料經過端對端加密，我們絕不會分享或出售您的資料。",
        details: {
            title: "堅若磐石的安全承諾",
            description: "我們採用業界領先的端對端加密技術，確保您的每一筆交易資料在傳輸過程中都受到嚴密保護。此外，您的個人資料和財務資訊絕不會被用於廣告或出售給第三方。您的安全是我們的最高準則。",
            application: "在網路上購買二手物品時，使用 BluePay进行交易，您無需向陌生人透露您的銀行卡號或個人敏感資訊，大大降低了詐騙風險。"
        }
    }
];

type Feature = typeof features[0];


const FeatureItem = ({ feature, onClick }: { feature: Feature, onClick: () => void }) => (
    <button onClick={onClick} className="text-left flex items-start gap-4 p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-primary hover:bg-primary/5 transition-all duration-300">
        <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <feature.icon className="w-6 h-6 text-primary" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="mt-1 text-gray-600">{feature.description}</p>
        </div>
    </button>
);

export default function LandingPage() {
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [showStickyButton, setShowStickyButton] = useState(false);
    const router = useRouter();

    const heroCtaRef = useRef<HTMLDivElement>(null);
    const footerCtaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if the app is running in standalone mode (PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            router.push('/home');
        }
    }, [router]);

    useEffect(() => {
        const handleScroll = () => {
            if (!heroCtaRef.current || !footerCtaRef.current) return;

            const heroCtaBottom = heroCtaRef.current.getBoundingClientRect().bottom;
            const footerCtaTop = footerCtaRef.current.getBoundingClientRect().top;
            const headerHeight = 80; // height of the header

            const shouldShow = heroCtaBottom < headerHeight && footerCtaTop > window.innerHeight;
            setShowStickyButton(shouldShow);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <div className="flex flex-col min-h-dvh bg-white text-gray-800 font-body">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-lg">
                <div className="container flex items-center justify-between h-20 max-w-7xl mx-auto px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-gray-900">BluePay</span>
                    </Link>
                    <nav className={cn(
                        "transition-opacity duration-300",
                        showStickyButton ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}>
                         <Button asChild size="lg" className="group transition-all duration-300">
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
                        <div className="mt-10" ref={heroCtaRef}>
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
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <FeatureItem key={index} feature={feature} onClick={() => setSelectedFeature(feature)} />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="privacy-focus" className="py-24 bg-white">
                    <div className="container max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative flex justify-center items-center p-8">
                             <div className="relative w-72 h-72">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-primary/10"></div>
                                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-primary" />
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
                                    <span className="text-gray-700">您的交易資料絕不會被用於廣告或出售給第三方。</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">我們使用最先進的加密技術保護您的每一次轉帳。</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">您可以完全控制您的資料，隨時查看或下載。</span>
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
                        <div className="mt-8" ref={footerCtaRef}>
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

            <Dialog open={!!selectedFeature} onOpenChange={(isOpen) => !isOpen && setSelectedFeature(null)}>
                <DialogContent className="sm:max-w-2xl">
                    {selectedFeature && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-2xl">
                                    <selectedFeature.icon className="w-8 h-8 text-primary" />
                                    {selectedFeature.details.title}
                                </DialogTitle>
                                <DialogDescription className="pt-4 text-base text-gray-700">
                                    {selectedFeature.details.description}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="pt-4">
                                <h4 className="font-semibold text-gray-800">日常生活應用：</h4>
                                <p className="mt-2 text-gray-600 bg-gray-100 p-4 rounded-lg border border-gray-200">
                                    {selectedFeature.details.application}
                                </p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
