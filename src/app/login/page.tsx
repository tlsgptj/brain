'use client';

import React, { useState } from 'react';
import Image from "next/image";
import Logo from "../../../public/images/logo.png";
import { useRouter } from 'next/navigation';
import splash from "../../../public/images/splash.png";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const DUMMY_EMAIL = 'test@gmail.com';
    const DUMMY_PASSWORD = '1234';

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('이메일과 패스워드를 입력해주세요.');
      return;
    }

    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      alert('로그인 성공!');
      router.push('/main');
    } else {
      setError('로그인 실패. 이메일과 패스워드를 확인해주세요.');
    }
  };

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
          src={Logo}
          alt="Logo"
          width={1500}
          height={1200}
          priority
        />
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 bg-none bg-opacity-80 p-8 rounded-lg shadow-lg min-w-[350px]">
                <input
                type="text"
                placeholder="ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-semibold w-full h-50 px-4 py-3 border rounded-md focus:outline-none text-gray-900 text-7xl placeholder-teal-400 bg-white"
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-semibold mt-3 h-50 w-full px-4 py-3 border rounded-md focus:outline-none text-gray-900 text-7xl placeholder-teal-400 bg-white"
                />
                <button
                className="mt-8 w-full h-50 py-3 text-white bg-pink-600 rounded-md hover:bg-pink-700 transition text-7xl font-semibold"
                >
                Log In
                </button>
        </form>
      </div>
    </div>
    );
}