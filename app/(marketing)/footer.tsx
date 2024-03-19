import { Button } from "@/components/ui/button"
import Image from "next/image"

export const Footer = () => {
    return(
        <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
            Footer
            <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
                <Button size="lg" variant="ghost" className="w-full">
                    <Image
                        alt="Croatian"
                        src="/hr.svg"
                        height={32}
                        width={40}
                        className="mr-4 rounded-md"
                    />
                    Croatian
                </Button>
                <Button size="lg" variant="ghost" className="w-full">
                    <Image
                        alt="Spanish"
                        src="/es.svg"
                        height={32}
                        width={40}
                        className="mr-4 rounded-md"
                    />
                    Spanish
                </Button>
                <Button size="lg" variant="ghost" className="w-full">
                    <Image
                        alt="French"
                        src="/fr.svg"
                        height={32}
                        width={40}
                        className="mr-4 rounded-md"
                    />
                    French
                </Button>
                <Button size="lg" variant="ghost" className="w-full">
                    <Image
                        alt="Italian"
                        src="/it.svg"
                        height={32}
                        width={40}
                        className="mr-4 rounded-md"
                    />
                    Italian
                </Button>
                <Button size="lg" variant="ghost" className="w-full">
                    <Image
                        alt="Japan"
                        src="/jp.svg"
                        height={32}
                        width={40}
                        className="mr-4 rounded-md"
                    />
                    Japan
                </Button>
            </div>
        </footer>
    )
}