import Image from "next/image";

export default function TeamSection() {
    const team = [
        {
            name: "Xavier Jones",
            role: "CTO",
            image: "/assets/images/team/director-2.png",
            bio: "Xavier's passion for user-centric design and technical innovation drives the product strategy and feature development at Plas."
        },
        {
            name: "Mei Lin",
            role: "Managing Director",
            image: "/assets/images/team/ai-dev-1.png",
            bio: "Mei Lin leads our global operations with a focus on sustainable growth and strategic partnerships across the continent."
        },
        {
            name: "Amina Okoro",
            role: "Director of Operations",
            image: "/assets/images/team/amina-casual.png",
            bio: "Amina oversees our pan-African delivery network and operations, ensuring that every aspect of Plas runs with scale and efficiency."
        },
        {
            name: "Li Wei",
            role: "Senior Developer",
            image: "/assets/images/team/senior-dev-new.png",
            bio: "Li Wei is a full-stack expert with a passion for building scalable architectures and mentoring the next generation of engineers."
        },
        {
            name: "Jean-Luc Nkurunziza",
            role: "Full Stack Developer",
            image: "/assets/images/team/african-dev-1.png",
            bio: "Jean-Luc is a mobile specialist dedicated to bringing high-performance commerce experiences to users across Africa."
        },
        {
            name: "Zola Ndlovu",
            role: "Head of Marketing",
            image: "/assets/images/team/african-dev-2.png",
            bio: "Zola's expertise in technical systems ensures that Plas's marketing remains data-driven and responsive as we scale."
        },
        {
            name: "Kwame Boateng",
            role: "Head of Support",
            image: "/assets/images/team/support-head.png",
            bio: "Kwame leads our customer experience team with a focus on empathy, ensuring every user feels supported."
        },
        {
            name: "Fatima Diallo",
            role: "Legal Professional",
            image: "/assets/images/team/legal-pro.png",
            bio: "Fatima ensures our operations are globally compliant, protecting the interests of Plas and its partners."
        },
        {
            name: "Koffi Mensah",
            role: "AI Developer",
            image: "/assets/images/team/ai-dev-2.png",
            bio: "Koffi develops the intelligent recommendation engines that connect African consumers with the products they love."
        },
        {
            name: "Esther Uwase",
            role: "Communication Officer",
            image: "/assets/images/team/comm-officer.png",
            bio: "Esther leads our corporate storytelling and partner communications, ensuring the Plas message resonates across the continent."
        },
        {
            name: "Rajesh Varma",
            role: "Board Director",
            image: "/assets/images/team/supply-chain-new.png",
            bio: "Rajesh optimizes our cross-border supply chains, bringing global logistics best practices to the emerging African market."
        },
        {
            name: "Priya Singh",
            role: "Tax Professional",
            image: "/assets/images/team/tax-pro.png",
            bio: "Priya ensures global compliance and strategic financial planning, navigating complex tax landscapes across multiple jurisdictions."
        }
    ];

    return (
        <section id="team" className="py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tight">
                        The minds behind <span className="text-[#00D9A5]">Plas</span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Our leadership team combines global expertise with deep local roots to build the future of commerce in Africa.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                    {team.map((member, i) => (
                        <div key={i} className="group flex flex-col items-center text-center">
                            <div className="relative w-full aspect-square mb-8 overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500 group-hover:rounded-[60px] group-hover:scale-[1.02]">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-wide">
                                    {member.name}
                                </h3>
                                <p className="text-[#00D9A5] font-bold text-sm uppercase tracking-widest">
                                    {member.role}
                                </p>
                                <p className="text-gray-500 mt-4 leading-relaxed max-w-xs mx-auto">
                                    {member.bio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
