import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { InfinityIcon } from "lucide-react";

type Props = {
    activeCourse: {imageSrc: string, title: string}; //TODO: replace with db types
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
}

export const UserProgress = ({
    activeCourse,
    hearts,
    points,
    hasActiveSubscription,
}: Props) => {
    return(
        <div className="flex items-center justify-between gap-x-2 w-full">
            <Link href="/courses">
                <Button variant="ghost">
                    <Image
                        alt={activeCourse.title}
                        src={activeCourse.imageSrc}
                        className="rounded-md border"
                        width={32}
                        height={32}
                    />
                </Button>
            </Link>
            <Link href="/shop">
                <Button variant="ghost" className="text-orange-500">
                    <Image
                        alt="Points"
                        src="/points.svg"
                        className="mr-2"
                        height={28}
                        width={28}
                    />
                    {points}
                </Button>
            </Link>
            <Link href="/shop">
                <Button variant="ghost" className="text-rose-500">
                    <Image
                        alt="Hearts"
                        src="/heart.svg"
                        className="mr-2"
                        height={22}
                        width={22}
                    />
                    {hasActiveSubscription
                    ? <InfinityIcon className="h-4 w-4 stroke-[3]"/>
                    : hearts}
                </Button>
            </Link>
        </div>
    )
}