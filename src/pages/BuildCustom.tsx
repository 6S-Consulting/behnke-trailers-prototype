import { useRouter } from '@/lib/router';
import { Button } from '@/components/ui/button';

export function BuildCustom() {
    const { navigate } = useRouter();

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6">
                    Custom 3D Configurator
                </h1>
                <p className="text-lg text-slate-600 mb-8">
                    The 3D configuration tool is currently undergoing maintenance and upgrades to support our new product lines. Please check back later or contact our sales team for custom orders.
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => navigate('/catalog')} size="lg" className="bg-[#4567a4] hover:bg-[#3456a0] text-white">
                        Browse Catalog
                    </Button>
                    <Button onClick={() => navigate('/request-quote')} size="lg" variant="outline">
                        Request Custom Quote
                    </Button>
                </div>
            </div>
        </div>
    );
}
