"use client"

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti"
import { useRouter } from "next/navigation";
import { useAudio, useWindowSize } from "react-use";
import { useState, useTransition } from "react";
import { reduceHearts } from "@/actions/user-progress";
import { challengeOptions, challenges } from "@/db/schema";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { QuestionBubble } from "./question-bubble";
import { ResultCard } from "./result-card";

type Props = {
    initialPercentage: number;
    initialHearts: number;
    initialLessonId: number;
    initialLessonChallenges: (typeof challenges.$inferSelect & {
        completed: boolean;
        challengeOptions: typeof challengeOptions.$inferSelect[];
    })[]
    userSubscription: any; //TODO: replace with subscription db type
}

export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    userSubscription,
}: Props) => {
    const {width, height} = useWindowSize()

    const router = useRouter()

    const [finishAudio] = useAudio({src: "/finish.mp3", autoPlay: true})
    const [
        correctAudio,
        _c,
        correctControls,
    ] = useAudio({src: "/correct.wav"})
    const [
        incorrectAudio,
        _i,
        incorrectControls,
    ] = useAudio({src: "/incorrect.wav"})
    const [pending, startTransition] = useTransition()

    //lessonId can only be changed from outside
    const [lessonId] = useState(initialLessonId)
    const [hearts, setHearts] = useState(initialHearts)
    const [percentage, setPercentage] = useState(initialPercentage)
    const [challenges] = useState(initialLessonChallenges)
    // navigate what user is currently on 
    const [activeIndex, setActiveIndex] = useState(() => {
        const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed)
        return uncompletedIndex === -1 ? 0 : uncompletedIndex
    })

    const [selectedOption, setSelectedOption] = useState<number>()
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none")

    const challenge = challenges[activeIndex]
    const options = challenge?.challengeOptions ?? [];

    const onNext = () => {
        setActiveIndex((current) => current + 1)
    }

    const onSelect = (id: number) => {
        //none means user has not submitted their choice
        if(status !== "none") return;

        setSelectedOption(id)
    }

    const onContinue = () => {
        if(!selectedOption) return

        if(status === "wrong") {
            setStatus("none")
            setSelectedOption(undefined)
            return
        }

        if(status === "correct") {
            onNext()
            setStatus("none")
            setSelectedOption(undefined)
            return
        }

        const correctOption = options.find((option) => option.correct)

        if(!correctOption) {
            return
        }

        if(correctOption && correctOption.id === selectedOption) {
            startTransition(() => {
                upsertChallengeProgress(challenge.id)
                    .then((response) => {
                        if(response?.error === "hearts") {
                            console.error("Missing hearts")
                            return
                        }

                        correctControls.play()
                        setStatus("correct")
                        setPercentage((prev) => prev + 100 / challenges.length)

                        //if we loaded a lesson and if the initial percentage is 100%
                        //it means all chanllenges have been completed
                        //So this is a practice
                        if(initialPercentage === 100) {
                            setHearts((prev) => Math.min(prev + 1, 5))
                        }
                    })
                    .catch(() => toast.error("Something went wrong. Please try again"))
            })
        } else {
            startTransition(() => {
                reduceHearts(challenge.id)
                    .then((response) => {
                        if(response?.error === "hearts") {
                            console.error("Missing hearts")
                            return
                        }

                        incorrectControls.play()
                        setStatus("wrong")

                        //if subscription error or practice error
                        //there is no point to reduce the heart in the frontend
                        //so need to ensure there is no error
                        if(!response?.error) {
                            setHearts((prev) => Math.max(prev - 1, 0))
                        }
                    })
                    .catch(() => toast.error("Something went wrong. Please try again"))
            })
        }
    }

    //TODO: remove true
    if(!challenge) {
        return(
            <>
                {finishAudio}
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    tweenDuration={10000}
                />
                <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
                    <Image
                        alt="Finish"
                        src="/finish.svg"
                        className="hidden lg:block"
                        height={100}
                        width={100}
                    />
                    <Image
                        alt="Finish"
                        src="/finish.svg"
                        className="block lg:hidden"
                        height={50}
                        width={50}
                    />
                    <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
                        Great job! <br/> You&apos;ve completed the lesson
                    </h1>
                    <div className="flex items-center gap-x-4 w-full">
                        <ResultCard
                            variant="points"
                            value={challenges.length * 10}
                        />
                        <ResultCard
                            variant="hearts"
                            value={hearts}
                        />
                    </div>
                </div>
                <Footer
                    lessonId={lessonId}
                    status="completed"
                    onCheck={() => router.push("/learn")}
                />
            </>
        )
    }

    const title = challenge.type === "ASSIST"
    ? "Select the correct meaning"
    : challenge.question

    return(
        <>
        {incorrectAudio}
        {correctAudio}
            <Header
                hearts={hearts}
                percentage={percentage}
                hasActiveSubscription={!!userSubscription?.isActive}
            />
            <div className="flex-1">
                <div className="h-full flex items-center justify-center">
                    <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
                        <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
                            {title}
                        </h1>
                        <div>
                            {challenge.type === "ASSIST" && (
                                <QuestionBubble question={challenge.question}/>
                            )}
                            <Challenge
                                options={options}
                                onSelect={onSelect}
                                status={status}
                                selectedOption={selectedOption}
                                disabled={pending}
                                type={challenge.type}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer
                disabled={pending || !selectedOption}
                status={status}
                onCheck={onContinue}
            />
        </>
    )
}