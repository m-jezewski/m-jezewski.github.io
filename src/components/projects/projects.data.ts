export type ProjectMedia = {
    src: string;
    alt: string;
};

export type Project = {
    slug: string;
    title: string;
    year: string;
    description: string;
    note?: string;
    tags: string[];
    links?: {
        demo?: string;
        source?: string;
    };
    media: ProjectMedia[];
    index: string;
};

export const projects: Project[] = [
    {
        slug: "e2e_encrypted_chats",
        title: "E2E encrypted chats",
        year: "2026",
        description:
            "End-to-end encrypted chat rooms. The room password never reaches the server: it is stretched and split in " +
            "the browser into an AES-256-GCM key that stays there and a proof of knowledge kept as a bcrypt hash. " +
            "Messages arrive live over a WebSocket, and older ones are fetched as the user scrolls up. " +
            "Every room carries a TTL, and an hourly cron job deletes the ones that have run out. Accounts are optional and exist only to carry the user's room list to another device.",
        note: "The live demo runs on Render's free tier, so it may take a moment to load.",
        tags: ["React", "NestJS", "Prisma ORM", "PostgreSQL", "WebSockets / Socket.io"],
        links: {
            demo: "https://mjezewski-chatrooms.onrender.com/",
            source: "https://github.com/m-jezewski/chatrooms-app",
        },
        media: [
            { src: "/projects/chatrooms_3.webp", alt: "A chat room with messages from two users" },
            { src: "/projects/chatrooms_2.webp", alt: "Create room dialog with name, password and expiry fields" },
            { src: "/projects/chatrooms_1.webp", alt: "Landing page: create a room or join one with an invitation code" },
        ],
        index: 'I'
    },
    {
        slug: "notes",
        title: "Notes app",
        year: "2023",
        description:
            "A fairly simple notes app built with Next.js and Prisma. Notes are rearranged by dragging: the surrounding notes animate out of the way as you move one, and the " +
            "resulting order is written to the database, so it is still there after a reload. Authentication through NextAuth, data fetching with React Query, styling with Tailwind. Deployed " +
            "on Vercel.",
        tags: ["TypeScript", "Next.js", "PostgreSQL", "Tailwind", "Prisma ORM", "TanStack React Query"],
        links: {
            demo: "https://memo-pro.vercel.app/",
            source: "https://github.com/m-jezewski/notes-app",
        },
        media: [
            { src: "/projects/notes_2.webp", alt: "Board of notes in a grid" },
            { src: "/projects/notes_3.webp", alt: "A note opened for reading" },
            { src: "/projects/notes_1.webp", alt: "MemoPro landing page" },
        ],
        index: 'II'
    },
    {
        slug: "task_manager",
        title: "Task Manager",
        year: "2022",
        description: "The application keeps tasks in user-defined spaces and statuses, and displays them as lists, a kanban board, or a calendar with day, week and month views. Separately from tasks, a goals feature records larger objectives and progress toward them. A dashboard collects the most important items in one place, and every page has a help button with a short walkthrough of what it does.",
        tags: ["TypeScript", "React","Firebase", "SCSS"],
        links: {
            demo: "https://mjezewski-taskmanager.netlify.app/",
            source: "https://github.com/m-jezewski/task-manager",
        },
        media: [
            { src: "/projects/tm_1.webp", alt: "Task list view" },
            { src: "/projects/tm_2.webp", alt: "Kanban board" },
            { src: "/projects/tm_3.webp", alt: "Dashboard" },
            { src: "/projects/tm_4.webp", alt: "Calendar" },
        ],
        index: 'III'
    },
];
