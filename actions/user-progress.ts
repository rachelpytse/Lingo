"use server"

import db from "@/db/drizzle"
import { getCourseById, getUserProgress } from "@/db/queries"
import { challengeProgress, challenges, userProgress } from "@/db/schema"
import { auth, currentUser } from "@clerk/nextjs"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export const upsertUserProgress = async (courseId: number) => {
    const {userId} = auth()
    const user = await currentUser()

    if(!userId || !user) {
        throw new Error("Unauthorized")
    }

    const course = await getCourseById(courseId)

    if(!course) {
        throw new Error("Course not found")
    }

    //TODO: enable once units and lessons are added
    // if(!course.units.length || !course.units[0].lessons.length) {
    //     throw new Error("Course is empty")
    // }

    const existingUserProgress = await getUserProgress()

    if(existingUserProgress) {
        await db.update(userProgress).set({
            activeCourseId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "/mascot.svg",
        })

        revalidatePath("/courses")
        revalidatePath("/learn")
        redirect("/learn")
    }

    await db.insert(userProgress).values({
        userId,
        activeCourseId: courseId,
        userName: user.firstName || "User",
        userImageSrc: user.imageUrl || "/mascot.svg",
    })

    revalidatePath("/courses")
    revalidatePath("/learn")
    redirect("/learn")
}

export const reduceHearts = async(challengeId: number) => {
    const {userId} = await auth()

    if(!userId) {
        throw new Error("Unauthorized")
    }

    const currentUserProgress = await getUserProgress()
    //TODO: get user subscription

    const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId),
    })

    if(!challenge) {
        throw new Error("Challenge not found")
    }

    const lessonId = challenge.lessonId

    const existingChallengeProgress = await db.query.challengeProgress.findFirst({
        where: and(
            eq(challengeProgress.userId, userId),
            eq(challengeProgress.challengeId, challengeId),
        ),
    })

    //on fronend we use if initialprogress is 100% or not to determine if it is practice
    //but in backend we use existingChallengeProgress state
    const isPractice = !!existingChallengeProgress

    //it's not really an error but we return a response with a field of error
    //which we will read later to tell the user why didn't this method go through
    if(isPractice) {
        return{error: "Practice"}
    }

    //this is an error that we can't attempt to do something
    //it's a security issue at this point
    if(!currentUserProgress) {
        throw new Error("User progress not found")
    }

    //TODO: handle subscription

    if(currentUserProgress.hearts === 0) {
        return{error: "hearts"}
    }

    await db.update(userProgress).set({
        hearts: Math.max(currentUserProgress.hearts - 1, 0),
    }).where(eq(userProgress.userId, userId))

    revalidatePath("/shop")
    revalidatePath("/learn")
    revalidatePath("/quests")
    revalidatePath("/leaderboard")
    revalidatePath(`/lesson/${lessonId}`)
}