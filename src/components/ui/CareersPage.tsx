import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Rocket,
  Users,
  Heart,
  ArrowRight,
  Mail,
  X,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";
import AboutTopBar from "./landing/AboutTopBar";
import AboutHeader from "./landing/AboutHeader";
import AboutFooter from "./landing/AboutFooter";

const jobs = [
  {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Kigali, Rwanda / Remote",
    type: "Full-time",
    description:
      "We are looking for a Senior Full Stack Developer to lead the development of our core marketplace infrastructure. You will work with a world-class team to build scalable systems that serve millions of users across the continent.",
  },
  {
    title: "Product Marketing Manager",
    department: "Marketing",
    location: "Mombasa, Kenya",
    type: "Full-time",
    description:
      "Join our marketing team to drive growth and brand awareness. You will be responsible for developing and executing product marketing strategies that resonate with our diverse user base.",
  },
  {
    title: "Head of AI & Data Science",
    department: "Engineering",
    location: "Kigali, Rwanda",
    type: "Full-time",
    description:
      "Lead our AI initiatives and leverage data to personalize the shopping experience for every Plas user. You will build and manage a team of talented data scientists and engineers.",
  },
  {
    title: "Logistics Operations Lead",
    department: "Operations",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description:
      "Optimize our pan-African logistics network. You will be at the forefront of solving complex supply chain challenges in emerging markets.",
  },
  {
    title: "Regional Sales Manager",
    department: "Sales",
    location: "Kampala, Uganda",
    type: "Full-time",
    description:
      "Drive sales growth in East Africa. You will build and lead a high-performing sales team to expand our footprint in the region.",
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (job: typeof jobs[0]) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    document.body.style.overflow = "unset";
  };

  return (
    <div className="min-h-screen bg-white">
      <AboutTopBar />
      <AboutHeader activePage="careers" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#2D5016] pb-24 pt-32">
        {/* Background Pattern - Subtle line-art style icons */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-24 p-12">
            {/* SVG Icons Pattern - Food and delivery related */}
            {Array.from({ length: 30 }).map((_, index) => {
              const iconIndex = index % 5;
              const iconComponents = [
                // Burger
                <svg
                  key={`burger-${index}`}
                  className="h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>,
                // Shopping bag
                <svg
                  key={`bag-${index}`}
                  className="h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>,
                // Scooter
                <svg
                  key={`scooter-${index}`}
                  className="h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>,
                // Phone
                <svg
                  key={`phone-${index}`}
                  className="h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>,
                // Package
                <svg
                  key={`package-${index}`}
                  className="h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>,
              ];
              return (
                <div
                  key={`pattern-${index}`}
                  className="text-white"
                  style={{
                    transform: `rotate(${(index * 12) % 360}deg) translate(${
                      Math.sin(index) * 20
                    }px, ${Math.cos(index) * 20}px)`,
                  }}
                >
                  {iconComponents[iconIndex]}
                </div>
              );
            })}
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <span className="mb-6 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-white shadow-sm backdrop-blur-sm">
              Join the Revolution
            </span>
            <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
              Build the future of{" "}
              <span className="text-[#022C22]">African Commerce</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-white/90">
              We're on a mission to empower millions of businesses and
              individuals across Africa. Join our world-class team and solve
              meaningful problems at scale.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#positions"
                className="transform rounded-xl bg-[#022C22] px-8 py-4 font-black uppercase tracking-widest text-[#1A1A1A] shadow-lg shadow-[#022C22]/20 transition-all hover:-translate-y-1 hover:bg-white"
              >
                View Openings
              </a>
              <Link
                href="/about"
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                Our Vision
              </Link>
            </div>
          </div>
        </div>

        {/* Curved Transition to Gray Section */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-px">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Culture Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
              Our Culture
            </h2>
            <p className="text-lg text-gray-600">
              At Plas, we value innovation, diversity, and rapid ownership.
              We're building a culture where the best ideas win, regardless of
              hierarchy.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Rocket className="h-10 w-10 text-[#022C22]" />,
                title: "Extreme Ownership",
                desc: "Every team member is empowered to take full responsibility and drive impact from day one.",
              },
              {
                icon: <Users className="h-10 w-10 text-[#022C22]" />,
                title: "Radical Diversity",
                desc: "We believe our strength lies in our differences. Our team spans the globe with a focus on local expertise.",
              },
              {
                icon: <Heart className="h-10 w-10 text-[#022C22]" />,
                title: "User Obsessed",
                desc: "We don't just build products; we solve real problems for real people across the continent.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-[40px] border border-gray-100 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-xl"
              >
                <div className="mb-6 transform transition-transform duration-500 group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="mb-4 text-2xl font-black uppercase tracking-wide text-[#1A1A1A]">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="positions" className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <h2 className="mb-6 text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
                Open Positions
              </h2>
              <p className="text-lg text-gray-600">
                We are looking for passionate individuals to join our growing
                team. Find your next challenge here.
              </p>
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-black uppercase tracking-widest text-[#022C22]">
                {jobs.length} Opportunities Available
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="group flex cursor-pointer flex-col items-center justify-between gap-6 rounded-[30px] border-2 border-gray-50 bg-white p-8 transition-all duration-500 hover:border-[#022C22] md:flex-row"
                onClick={() => openDrawer(job)}
              >
                <div>
                  <div className="mb-2 flex items-center gap-4">
                    <h3 className="text-2xl font-black text-[#1A1A1A] transition-colors group-hover:text-[#022C22]">
                      {job.title}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-600">
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 font-medium text-gray-500">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> {job.department}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> {job.location}
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1A1A1A] px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all group-hover:bg-[#022C22] group-hover:text-black md:w-auto">
                    Apply Now <ArrowRight className="h-4 w-4" />
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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
            onClick={closeDrawer}
          ></div>
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-2xl transform bg-white shadow-2xl transition-transform duration-500 ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b bg-gray-50 p-8">
                <div>
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#022C22]">
                    Job Opportunity
                  </span>
                  <h2 className="text-3xl font-black leading-tight text-[#1A1A1A]">
                    {selectedJob?.title}
                  </h2>
                </div>
                <button
                  onClick={closeDrawer}
                  className="group rounded-2xl border border-transparent p-3 shadow-sm transition-all hover:border-gray-200 hover:bg-white"
                >
                  <X className="h-6 w-6 text-gray-400 group-hover:text-black" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="custom-scrollbar flex-1 space-y-10 overflow-y-auto p-8">
                {/* Job Meta */}
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                      Department
                    </span>
                    <span className="text-sm font-black text-black">
                      {selectedJob?.department}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                      Location
                    </span>
                    <span className="text-sm font-black text-black">
                      {selectedJob?.location}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                      Type
                    </span>
                    <span className="text-sm font-black text-black">
                      {selectedJob?.type}
                    </span>
                  </div>
                </div>

                {/* Closed Alert */}
                <div className="flex items-start gap-5 rounded-3xl border border-red-100 bg-red-50 p-6">
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-black uppercase tracking-widest text-red-600">
                      Applications Closed
                    </h4>
                    <p className="text-sm leading-relaxed text-red-600/70">
                      This position is currently not accepting new applications.
                      Please check back later or send a speculative application
                      to our careers email.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="mb-4 flex items-center gap-3 text-xl font-black uppercase tracking-tight text-black">
                    <FileText className="h-5 w-5 text-[#022C22]" /> About the
                    role
                  </h4>
                  <p className="text-lg leading-relaxed text-gray-500">
                    {selectedJob?.description}
                  </p>
                </div>

                {/* Form Section (Disabled) */}
                <div className="pointer-events-none opacity-50">
                  <h4 className="mb-8 text-xl font-black uppercase tracking-tight text-black">
                    Apply for this position
                  </h4>
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 focus:outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 focus:outline-none"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400">
                        Resume/CV
                      </label>
                      <div className="rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center transition-colors hover:border-[#022C22]">
                        <Upload className="mx-auto mb-4 h-8 w-8 text-gray-300" />
                        <p className="text-sm text-gray-400">
                          Drag and drop your file here, or click to browse
                        </p>
                      </div>
                    </div>
                    <button className="w-full cursor-not-allowed rounded-2xl bg-gray-200 py-5 font-black uppercase tracking-[0.2em] text-gray-400">
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
      <section className="bg-[#022C22]/5 py-24">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[60px] bg-[#1A1A1A] p-12 text-center md:p-20">
            <div className="absolute right-0 top-0 p-10 opacity-10">
              <Mail className="h-40 w-40 text-white" />
            </div>
            <h2 className="mb-8 text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
              Can't find your role?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-xl leading-relaxed text-gray-400">
              We're always looking for exceptional talent. If you believe you
              can make a difference at Plas, send us your resume.
            </p>
            <a
              href="mailto:business@plas-era.com"
              className="inline-flex transform items-center justify-center rounded-2xl bg-[#022C22] px-10 py-5 font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-white"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      <AboutFooter />
    </div>
  );
}
