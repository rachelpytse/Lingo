"use client"

import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startTransition, useTransition } from "react";
import { refillHearts } from "@/actions/user-progress";

const POINTS_TO_REFILL=10

type Props = {
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
}

export const Items = ({
    hearts,
    points,
    hasActiveSubscription,
}: Props) => {
    const [pending, transition] = useTransition()

    const onRefillHearts = () => {
        if(pending || hearts === 5 || points < POINTS_TO_REFILL) {
            return
        }

        startTransition(() => {
            refillHearts()
                .catch(() => toast.error("Something went wrong"))
        })
    }

    return(
        <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
                <Image
                    alt="Heart"
                    src="/heart.svg"
                    height={60}
                    width={60}
                />
                <div className="flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">
                        Refill hearts
                    </p>
                </div>
                <Button
                    onClick={onRefillHearts}
                    disabled={
                        pending
                        || hearts === 5
                        || points < POINTS_TO_REFILL
                    }
                >
                    {hearts === 5
                    ? "full"
                    : (
                        <div className="flex items-center">
                            <Image
                                alt="Point"
                                src="/points.svg"
                                height={20}
                                width={20}
                            />
                            <p>
                                {POINTS_TO_REFILL}
                            </p>
                        </div>
                    )
                    }
                </Button>
            </div>
        </ul>
    )
}