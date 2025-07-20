import Link from 'next/link';
import { Users, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GroupPayPage() {
    return (
        <div className="space-y-6">
            <header className="relative flex items-center justify-center h-14">
                <Link href="/pay" className="absolute left-0">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-6 w-6" />
                         <span className="sr-only">Back to Pay</span>
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">Group Payment</h1>
            </header>
            <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                <Users className="w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground">Group payment feature is under construction.</p>
            </div>
            <Button className="w-full">
                Create New Group
            </Button>
        </div>
    );
}
