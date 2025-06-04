"use client";

import { useEffect } from "react";
import Image from "next/image";
import splash from "../../public/images/splash.png";
import splashName from "../../public/images/splash_name.png";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative w-screen h-screen">
      <Image
        src={splash}
        alt="Splash"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
        <Image
          src={splashName}
          alt="Splash Name"
          width={1500}
          height={800}
          priority
        />
      </div>
    </div>
  );
}
