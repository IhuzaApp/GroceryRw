import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

export default function AboutTopBar() {
  return (
    <div className="bg-[#2D5016] py-2">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-white/80 transition-colors hover:text-white"
            aria-label="Facebook"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="text-white/80 transition-colors hover:text-white"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="text-white/80 transition-colors hover:text-white"
            aria-label="YouTube"
          >
            <Youtube className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="text-white/80 transition-colors hover:text-white"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
        </div>
        <span className="text-sm text-white/80">Corporate Site</span>
      </div>
    </div>
  );
}

