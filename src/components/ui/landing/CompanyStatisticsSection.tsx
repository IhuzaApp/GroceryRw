import { Globe, Package, Store, Briefcase } from "lucide-react";

export default function CompanyStatisticsSection() {
  return (
    <div className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* 23 Countries */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <div className="relative">
                <Globe className="h-10 w-10 text-gray-800" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-[#00D9A5] opacity-30"></div>
                </div>
              </div>
            </div>
            <div className="mb-2 text-5xl font-bold text-gray-800">4</div>
            <div className="text-lg text-gray-700">Countries</div>
          </div>

          {/* 120K Active Plasers */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <div className="relative">
                <Package className="h-10 w-10 text-gray-800" />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#00D9A5]"></div>
              </div>
            </div>
            <div className="mb-2 text-5xl font-bold text-gray-800">125</div>
            <div className="text-lg text-gray-700">Active Plasers</div>
          </div>

          {/* 150K Shops & Restaurants */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <div className="relative">
                <Store className="h-10 w-10 text-gray-800" />
                <div className="absolute -top-1 left-1/2 h-4 w-8 -translate-x-1/2 rounded-t-full bg-[#00D9A5]"></div>
              </div>
            </div>
            <div className="mb-2 text-5xl font-bold text-gray-800">98</div>
            <div className="text-lg text-gray-700">Shops & Restaurants</div>
          </div>

          {/* 3K Employees */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <div className="relative">
                <Briefcase className="h-10 w-10 text-gray-800" />
                <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#00D9A5]"></div>
              </div>
            </div>
            <div className="mb-2 text-5xl font-bold text-gray-800">37</div>
            <div className="text-lg text-gray-700">Employees</div>
          </div>
        </div>
      </div>
    </div>
  );
}
