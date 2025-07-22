
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
import { type Dictionary } from '@/dictionaries';


export default function LandingPage({ dictionary }: { dictionary: Dictionary['landing'] }) {
    const features = [
        {
            icon: Zap,
            title: dictionary.features[0].title,
            description: dictionary.features[0].description,
            details: {
                title: dictionary.features[0].details.title,
                description: dictionary.features[0].details.description,
                application: dictionary.features[0].details.application
            }
        },
        {
            icon: Users,
            title: dictionary.features[1].title,
            description: dictionary.features[1].description,
            details: {
                title: dictionary.features[1].details.title,
                description: dictionary.features[1].details.description,
                application: dictionary.features[1].details.application
            }
        },
        {
            icon: ShieldCheck,
            title: dictionary.features[2].title,
            description: dictionary.features[2].description,
            details: {
                title: dictionary.features[2].details.title,
                description: dictionary.features[2].details.description,
                application: dictionary.features[2].details.application
            }
        }
    ];

    type Feature = typeof features[0];

    const FeatureItem = ({ feature, onClick, delay }: { feature: Feature, onClick: () => void, delay: string }) => (
        <button 
            onClick={onClick} 
            className="text-left flex items-start gap-4 p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-primary hover:bg-primary/5 transition-all duration-300 h-full opacity-0 animate-fade-in-up"
            style={{ animationDelay: delay }}
        >
            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-gray-600">{feature.description}</p>
            </div>
        </button>
    );

    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [showStickyButton, setShowStickyButton] = useState(false);
    const router = useRouter();

    const heroCtaRef = useRef<HTMLDivElement>(null);
    const footerCtaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            router.push('/home');
        }
    }, [router]);

    useEffect(() => {
        const handleScroll = () => {
            if (!heroCtaRef.current || !footerCtaRef.current) return;

            const heroCtaBottom = heroCtaRef.current.getBoundingClientRect().bottom;
            const footerCtaTop = footerCtaRef.current.getBoundingClientRect().top;
            const headerHeight = 80;

            const shouldShow = heroCtaBottom < headerHeight && footerCtaTop > window.innerHeight;
            setShowStickyButton(shouldShow);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <div className="flex flex-col min-h-dvh bg-white text-gray-800 font-body">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-lg animate-fade-in-down">
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
                                {dictionary.getStarted}
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
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-7xl opacity-0 animate-fade-in-down"
                            dangerouslySetInnerHTML={{ __html: dictionary.heroTitle }}
                            style={{ animationDelay: '0.2s' }}
                        ></h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 md:text-xl opacity-0 animate-fade-in-down"
                           style={{ animationDelay: '0.4s' }}>
                            {dictionary.heroSubtitle}
                        </p>
                        <div className="mt-10 opacity-0 animate-fade-in-up" ref={heroCtaRef} style={{ animationDelay: '0.6s' }}>
                             <Button asChild size="lg" className="h-14 text-lg group">
                                <Link href="/login">
                                    {dictionary.heroCta}
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
                
                 <section id="features" className="py-24 bg-gray-50">
                    <div className="container max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{dictionary.featuresTitle}</h2>
                            <p className="mt-4 text-lg text-gray-600">{dictionary.featuresSubtitle}</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <FeatureItem key={index} feature={feature} onClick={() => setSelectedFeature(feature)} delay={`${0.4 + index * 0.2}s`} />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="privacy-focus" className="py-24 bg-white">
                    <div className="container max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative flex justify-center items-center p-8 opacity-0 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
                             <div className="relative w-72 h-72">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-primary/10"></div>
                                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-primary" />
                            </div>
                        </div>
                        <div className="text-left opacity-0 animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                                {dictionary.privacy.title}
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                {dictionary.privacy.description}
                            </p>
                            <ul className="mt-6 space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">{dictionary.privacy.points[0]}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">{dictionary.privacy.points[1]}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">{dictionary.privacy.points[2]}</span>
                                </li>
                            </ul>
                            
                            <Button asChild variant="link" className="mt-8 p-0 h-auto text-lg text-primary hover:text-primary/80 group">
                                <Link href="/privacy">
                                    {dictionary.privacy.cta}
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                             <div className="mt-8">
                                <p className="text-sm font-semibold text-gray-500">{dictionary.privacy.developer}</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="cta" className="py-24 text-center bg-gray-50">
                    <div className="container max-w-4xl mx-auto px-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{dictionary.bottomCta.title}</h2>
                        <p className="mt-4 text-lg text-gray-600">{dictionary.bottomCta.subtitle}</p>
                        <div className="mt-8" ref={footerCtaRef}>
                             <Button asChild size="lg" className="h-14 text-lg group">
                                <Link href="/login">
                                    {dictionary.bottomCta.cta}
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-gray-200 bg-white">
                <div className="container text-center text-gray-500 text-sm max-w-7xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} BluePay. {dictionary.footer}</p>
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
                                <h4 className="font-semibold text-gray-800">{dictionary.featureModal.application}</h4>
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
