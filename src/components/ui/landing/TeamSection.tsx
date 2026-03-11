import Image from "next/image";

export default function TeamSection() {
  const team = [
    {
      name: "Arthur Vance",
      role: "Board Director",
      image: "/assets/images/team/supply-chain-new.png",
      bio: "Arthur brings decades of global executive experience to the board, steering Plas toward international excellence.",
    },
    {
      name: "Mei Lin",
      role: "Managing Director",
      image: "/assets/images/team/ai-dev-1.png",
      bio: "Mei Lin leads our global operations with a focus on sustainable growth and strategic partnerships across the continent.",
    },
    {
      name: "Xavier Jones",
      role: "Head of Finance",
      image: "/assets/images/team/director-2.png",
      bio: "Xavier leads our financial strategy, ensuring the long-term sustainability and fiscal health of the Plas ecosystem.",
    },
    {
      name: "Amina Okoro",
      role: "Director of Operations",
      image: "/assets/images/team/amina-casual.png",
      bio: "Amina oversees our pan-African delivery network and operations, ensuring that every aspect of Plas runs with scale and efficiency.",
    },
    {
      name: "Fatima Diallo",
      role: "Legal Professional",
      image: "/assets/images/team/legal-pro.png",
      bio: "Fatima ensures our operations are globally compliant, protecting the interests of Plas and its partners with a focus on Rwanda.",
    },
    {
      name: "Zola Ndlovu",
      role: "Head of Marketing",
      image: "/assets/images/team/african-dev-2.png",
      bio: "Zola's expertise in technical systems ensures that Plas's marketing remains data-driven and responsive as we scale.",
    },
    {
      name: "Priya Singh",
      role: "Region Manager",
      image: "/assets/images/team/tax-pro.png",
      bio: "Priya manages our regional growth strategies, navigating complex local markets to expand the Plas footprint.",
    },
    {
      name: "Kenji Sato",
      role: "Senior Developer",
      image: "/assets/images/team/senior-dev-new.png",
      bio: "Kenji is a full-stack expert with a passion for building scalable architectures and mentoring the next generation of engineers.",
    },
    {
      name: "Jean-Luc Nkurunziza",
      role: "Full Stack Developer",
      image: "/assets/images/team/african-dev-1.png",
      bio: "Jean-Luc is a mobile and web specialist dedicated to bringing high-performance full-stack commerce experiences to users across Africa.",
    },
    {
      name: "Koffi Mensah",
      role: "AI Developer",
      image: "/assets/images/team/ai-dev-2.png",
      bio: "Koffi develops the intelligent recommendation engines that connect African consumers with the products they love.",
    },
    {
      name: "Kwame Boateng",
      role: "Head of Support",
      image: "/assets/images/team/support-head.png",
      bio: "Kwame leads our customer experience team with a focus on empathy, ensuring every user feels supported.",
    },
    {
      name: "Esther Uwase",
      role: "Communication Officer",
      image: "/assets/images/team/comm-officer.png",
      bio: "Esther leads our corporate storytelling and partner communications, ensuring the Plas message resonates across the continent.",
    },
  ];

  return (
    <section id="team" className="overflow-hidden bg-gray-50 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-6 text-4xl font-black tracking-tight text-[#1A1A1A] md:text-5xl">
            The minds behind <span className="text-[#00D9A5]">Plas</span>
          </h2>
          <p className="text-xl leading-relaxed text-gray-600">
            Our leadership team combines global expertise with deep local roots
            to build the future of commerce in Africa.
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-8 aspect-square w-full overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:rounded-[60px]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20"></div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-wide text-[#1A1A1A]">
                  {member.name}
                </h3>
                <p className="text-sm font-bold uppercase tracking-widest text-[#00D9A5]">
                  {member.role}
                </p>
                <p className="mx-auto mt-4 max-w-xs leading-relaxed text-gray-500">
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
