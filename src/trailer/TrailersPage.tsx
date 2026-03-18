import { Link } from "@/lib/router";
import { trailers } from "@/trailer/trailerData";

export function TrailersPage() {
  return (
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900">
            Trailers
          </h1>
          <p className="text-slate-600 mt-2 max-w-3xl">
            Explore heavy-equipment transport trailers with detailed
            specifications, gallery views, and 3D model options.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {trailers.map((trailer) => (
            <article
              key={trailer.slug}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={trailer.heroImage}
                alt={trailer.title}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <h2 className="text-2xl font-black text-[#bf1e2e]">
                  {trailer.title}
                </h2>
                <p className="mt-3 text-slate-700">
                  {trailer.shortDescription}
                </p>
                <div className="mt-5">
                  <Link
                    to={`/trailers/${trailer.slug}`}
                    className="inline-flex items-center justify-center bg-slate-900 text-white font-bold px-5 py-2.5 rounded hover:bg-slate-800 transition-colors"
                  >
                    View Product Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
