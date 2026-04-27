import Image from "next/image";

export default function FeaturesSection() {
  const features = [
    {
      title: "Make money by delivering",
      description:
        "Join our fleet and earn on your own schedule by delivering orders across the city.",
      image: "/images/features/feature_delivery.png",
      reverse: false,
    },
    {
      title: "Sell your pet or rent cars you own",
      description:
        "Turn your assets into income. Easily list your car for rent or find a new home for your pet.",
      image: "/images/features/feature_rent_sell.png",
      reverse: true,
    },
    {
      title: "List a service or bid",
      description:
        "Offer your professional services or bid on tasks to a large crowd of active users.",
      image: "/images/features/feature_service_bid.png",
      reverse: false,
    },
    {
      title: "Add your own recipes",
      description:
        "Share your culinary creations with your fans and monetize your passion for food.",
      image: "/images/features/feature_recipes.png",
      reverse: true,
    },
  ];

  return (
    <section className=" py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            More than just delivery
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover the endless possibilities with Plas. Earn, share, and grow.
          </p>
        </div>

        <div className="mx-auto max-w-6xl space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-center gap-12 lg:flex-row ${
                feature.reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-xl transition-transform hover:scale-[1.02]">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-full text-center lg:w-1/2 lg:text-left">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 md:text-xl">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
