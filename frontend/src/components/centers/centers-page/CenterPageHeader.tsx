export default function CentersPageHeader() {
  return (
    <section className="relative bg-white ">
      <div className="container mx-auto pt-16 pb-10">
        <div className="relative rounded-lg flex items-center gap-4">
          <img
            src="/icons/center.png"
            alt=""
            className="w-20 h-20"
            draggable={false}
          />

          <div className="max-w-2xl space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 ">
              Vaccination Centers
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 ">
              Browse verified vaccination centers and explore available
              vaccines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
