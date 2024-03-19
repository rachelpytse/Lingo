import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
    //serial means autoincrement on every new entity of 'course', we can also use uuid
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    //in javascript we should use camel case but in database we can use image_src
    imageSrc: text("image_src").notNull(),
})

export const coursesRelations = relations(courses, ({many}) => ({
    userProgress: many(userProgress),
}))

export const userProgress = pgTable("user_progress", {
    userId: text("user_id").primaryKey(),
    userName: text("user_name").notNull().default("User"),
    userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
    activeCourseId: integer("active_course_id").references(() => courses.id, {onDelete: "cascade"}),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
})

export const userProgressRelations = relations(userProgress, ({one}) => ({
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id]
    })
}))