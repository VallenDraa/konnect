import { useState } from 'react';

export const OthersProfileModalContent = () => {
  return (
    <section
      aria-label="settings"
      className="w-screen md:w-[40rem] flex flex-col h-full"
    >
      <header className="text-center">
        <h1 className="font-semibold pb-3">Settings</h1>
      </header>
      <main className="flex grow shadow-inner">
        <aside className="bg-gray-100 basis-1/4 md:basis-1/3">
          <ul></ul>
        </aside>
        <main className="w-full max-h-[90vh] sm:h-[65vh] bg-white overflow-y-auto p-3"></main>
      </main>
    </section>
  );
};
