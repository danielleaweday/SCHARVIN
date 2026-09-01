import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import TopBar from "@/components/cynaiah/TopBar";
import { PlayCircle, GraduationCap, CheckCircle2 } from "lucide-react";

export default function Learn() {
    const [courses, setCourses] = useState([]);
    const [enrolled, setEnrolled] = useState([]);

    useEffect(() => {
        Promise.all([api.get("/courses"), api.get("/enrollments")]).then(
            ([c, e]) => {
                setCourses(c.data);
                setEnrolled(e.data);
            },
        );
    }, []);

    const isEnrolled = (id) => enrolled.some((e) => e.course?.id === id);
    const progressOf = (id) => enrolled.find((e) => e.course?.id === id)?.enrollment?.progress || 0;

    const enroll = async (id) => {
        await api.post("/enrollments", { course_id: id });
        toast.success("Enrolled.");
        const e = await api.get("/enrollments");
        setEnrolled(e.data);
    };

    return (
        <div>
            <TopBar
                subtitle="Learn"
                title="Curriculum & pathways"
            />

            {/* Enrolled */}
            {enrolled.length > 0 && (
                <section className="px-8 md:px-12 pt-6">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                        In progress
                    </div>
                    <h3 className="font-heading text-2xl mt-1 mb-5">Continue learning</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {enrolled.map(({ enrollment, course }) => {
                            if (!course) return null;
                            return (
                                <div
                                    key={course.id}
                                    className="glass rounded-xl overflow-hidden lift glass-hover"
                                >
                                    <div className="relative aspect-[16/9]">
                                        <img
                                            src={course.thumbnail_url}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover opacity-70"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] to-transparent" />
                                        <div className="absolute bottom-3 left-4 right-4">
                                            <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                                                {course.category} · {course.level}
                                            </div>
                                            <div className="font-heading text-xl text-white">
                                                {course.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between text-xs text-white/50">
                                            <span>{course.lessons_count} lessons</span>
                                            <span>{course.duration_hours}h</span>
                                        </div>
                                        <div className="mt-3 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                                            <div
                                                className="h-full cyn-bg-gradient"
                                                style={{ width: `${enrollment.progress}%` }}
                                            />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs text-white/50">
                                                {enrollment.progress}% complete
                                            </span>
                                            <button className="cyn-btn-ghost rounded-md px-3 py-1.5 text-xs flex items-center gap-2">
                                                <PlayCircle size={13} /> Resume
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Catalog */}
            <section className="px-8 md:px-12 py-10">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    Catalog
                </div>
                <h3 className="font-heading text-2xl mt-1 mb-5">All pathways</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {courses.map((c) => (
                        <div
                            key={c.id}
                            className="glass rounded-xl overflow-hidden lift glass-hover"
                        >
                            <div className="relative aspect-[16/10]">
                                <img
                                    src={c.thumbnail_url}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-75"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                                        {c.category}
                                    </div>
                                    <div className="font-heading text-xl text-white leading-tight">
                                        {c.title}
                                    </div>
                                </div>
                            </div>
                            <div className="p-5">
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {c.description}
                                </p>
                                <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                                    <span>{c.instructor}</span>
                                    <span>
                                        {c.lessons_count} lessons · {c.duration_hours}h
                                    </span>
                                </div>
                                <div className="mt-4">
                                    {isEnrolled(c.id) ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] uppercase tracking-[0.22em] text-emerald-300 flex items-center gap-1.5">
                                                <CheckCircle2 size={12} /> Enrolled ·{" "}
                                                {progressOf(c.id)}%
                                            </span>
                                            <button className="cyn-btn-ghost rounded-md px-3 py-1.5 text-xs">
                                                Open
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => enroll(c.id)}
                                            className="cyn-btn-primary rounded-md px-4 py-2 text-xs flex items-center gap-2"
                                        >
                                            <GraduationCap size={13} /> Enroll
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
