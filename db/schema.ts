import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
    //serial means autoincrement on every new entity of 'course', we can also use uuid
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    //in javascript we should use camel case but in database we can use image_src
    imageSrc: text("image_src").notNull(),
})