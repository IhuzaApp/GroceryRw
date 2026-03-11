import Link from "next/link";
import { useState } from "react";
import { Briefcase, Rocket, Users, Heart, ArrowRight, Mail, X, AlertCircle, FileText, Upload } from "lucide-react";
import AboutTopBar from "./landing/AboutTopBar";
import AboutHeader from "./landing/AboutHeader";
import AboutFooter from "./landing/AboutFooter";

const jobs = [
    {
        title: "Senior Full Stack Developer",
        department: "Engineering",
        location: "Kigali, Rwanda / Remote",
        type: "Full-time",
        description: "We are looking for a Senior Full Stack Developer to lead the development of our core marketplace infrastructure. You will work with a world-class team to build scalable systems that serve millions of users across the continent."
    },
    {
        title: "Product Marketing Manager",
        department: "Marketing",
        location: "Mombasa, Kenya",
        type: "Full-time",
        description: "Join our marketing team to drive growth and brand awareness. You will be responsible for developing and executing product marketing strategies that resonate with our diverse user base."
    },
    {
        title: "Head of AI & Data Science",
        department: "Engineering",
        location: "Kigali, Rwanda",
        type: "Full-time",
        description: "Lead our AI initiatives and leverage data to personalize the shopping experience for every Plas user. You will build and manage a team of talented data scientists and engineers."
    },
    {
        title: "Logistics Operations Lead",
        department: "Operations",
        location: "Lagos, Nigeria",
        type: "Full-time",
        description: "Optimize our pan-African logistics network. You will be at the forefront of solving complex supply chain challenges in emerging markets."
    },
    {
        title: "Regional Sales Manager",
        department: "Sales",
        location: "Kampala, Uganda",
        type: "Full-time",
        description: "Drive sales growth in East Africa. You will build and lead a high-performing sales team to expand our footprint in the region."
    }
];

export default function CareersPage() {
    const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = (job: typeof jobs[0]) => {
        setSelectedJob(job);
        setIsDrawerOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <div className="min-h-screen bg-white">
            <AboutTopBar />
            <AboutHeader activePage="careers" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-[#1A1A1A] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#00D9A5] blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00D9A5] blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-block px-4 py-2 bg-[#00D9A5]/10 text-[#00D9A5] text-sm font-black uppercase tracking-widest rounded-full mb-6">
                            Join the Revolution
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
                            Build the future of <span className="text-[#00D9A5]">African Commerce</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">
                            We're on a mission to empower millions of businesses and individuals across Africa. Join our world-class team and solve meaningful problems at scale.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="#positions" className="px-8 py-4 bg-[#00D9A5] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all transform hover:-translate-y-1 shadow-lg shadow-[#00D9A5]/20">
                                View Openings
                            </a>
                            <Link href="/about" className="px-8 py-4 bg-white/5 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/10">
                                Our Vision
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Culture Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-black text-[#1A1A1A] mb-6 uppercase tracking-tight">Our Culture</h2>
                        <p className="text-lg text-gray-600">
                            At Plas, we value innovation, diversity, and rapid ownership. We're building a culture where the best ideas win, regardless of hierarchy.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Rocket className="w-10 h-10 text-[#00D9A5]" />,
                                title: "Extreme Ownership",
                                desc: "Every team member is empowered to take full responsibility and drive impact from day one."
                            },
                            {
                                icon: <Users className="w-10 h-10 text-[#00D9A5]" />,
                                title: "Radical Diversity",
                                desc: "We believe our strength lies in our differences. Our team spans the globe with a focus on local expertise."
                            },
                            {
                                icon: <Heart className="w-10 h-10 text-[#00D9A5]" />,
                                title: "User Obsessed",
                                desc: "We don't just build products; we solve real problems for real people across the continent."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group">
                                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 uppercase tracking-wide">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions Section */}
            <section id="positions" className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-black text-[#1A1A1A] mb-6 uppercase tracking-tight">Open Positions</h2>
                            <p className="text-lg text-gray-600">
                                We are looking for passionate individuals to join our growing team. Find your next challenge here.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-[#00D9A5] font-black uppercase tracking-widest text-sm">
                                {jobs.length} Opportunities Available
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {jobs.map((job, i) => (
                            <div key={i} className="group bg-white border-2 border-gray-50 p-8 rounded-[30px] hover:border-[#00D9A5] transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer" onClick={() => openDrawer(job)}>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-2xl font-black text-[#1A1A1A] group-hover:text-[#00D9A5] transition-colors">
                                            {job.title}
                                        </h3>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {job.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-gray-500 font-medium">
                                        <span className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" /> {job.department}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Users className="w-4 h-4" /> {job.location}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto">
                                    <button className="w-full md:w-auto px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 group-hover:bg-[#00D9A5] group-hover:text-black transition-all">
                                        Apply Now <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" onClick={closeDrawer}></div>
                    <div className={`absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-500 transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="h-full flex flex-col">
                            {/* Drawer Header */}
                            <div className="p-8 border-b flex items-center justify-between bg-gray-50">
                                <div>
                                    <span className="text-[#00D9A5] text-[10px] font-black uppercase tracking-[0.2em] block mb-2">Job Opportunity</span>
                                    <h2 className="text-3xl font-black text-[#1A1A1A] leading-tight">{selectedJob?.title}</h2>
                                </div>
                                <button onClick={closeDrawer} className="p-3 hover:bg-white rounded-2xl transition-all group shadow-sm border border-transparent hover:border-gray-200">
                                    <X className="w-6 h-6 text-gray-400 group-hover:text-black" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                {/* Job Meta */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Department</span>
                                        <span className="text-sm font-black text-black">{selectedJob?.department}</span>
                                    </div>
                                    <div className="px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Location</span>
                                        <span className="text-sm font-black text-black">{selectedJob?.location}</span>
                                    </div>
                                    <div className="px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Type</span>
                                        <span className="text-sm font-black text-black">{selectedJob?.type}</span>
                                    </div>
                                </div>

                                {/* Closed Alert */}
                                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-start gap-5">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-red-600 uppercase tracking-widest text-sm mb-1">Applications Closed</h4>
                                        <p className="text-red-600/70 text-sm leading-relaxed">
                                            This position is currently not accepting new applications. Please check back later or send a speculative application to our careers email.
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="text-xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-[#00D9A5]" /> About the role
                                    </h4>
                                    <p className="text-gray-500 leading-relaxed text-lg">
                                        {selectedJob?.description}
                                    </p>
                                </div>

                                {/* Form Section (Disabled) */}
                                <div className="opacity-50 pointer-events-none">
                                    <h4 className="text-xl font-black text-black uppercase tracking-tight mb-8">Apply for this position</h4>
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-gray-400">Full Name</label>
                                                <input type="text" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none" placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-gray-400">Email Address</label>
                                                <input type="email" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none" placeholder="john@example.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-gray-400">Resume/CV</label>
                                            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-[#00D9A5] transition-colors">
                                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                                                <p className="text-sm text-gray-400">Drag and drop your file here, or click to browse</p>
                                            </div>
                                        </div>
                                        <button className="w-full py-5 bg-gray-200 text-gray-400 font-black uppercase tracking-[0.2em] rounded-2xl cursor-not-allowed">
                                            Submit Application
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Speculative Application */}
            <section className="py-24 bg-[#00D9A5]/5">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-[#1A1A1A] p-12 md:p-20 rounded-[60px] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Mail className="w-40 h-40 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight uppercase">
                            Can't find your role?
                        </h2>
                        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
                            We're always looking for exceptional talent. If you believe you can make a difference at Plas, send us your resume.
                        </p>
                        <a href="mailto:business@plas-era.com" className="inline-flex items-center justify-center px-10 py-5 bg-[#00D9A5] text-black font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all transform hover:-translate-y-1">
                            Get in Touch
                        </a>
                    </div>
                </div>
            </section>

            <AboutFooter />
        </div>
    );
}
