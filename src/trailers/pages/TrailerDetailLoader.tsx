import { useParams } from "react-router-dom";
import { trailers } from "@/trailers/data/trailerData";
import { TrailerDetail } from "./TrailerDetail";
import NotFound from "@/pages/NotFound";

export function TrailerDetailLoader() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <NotFound />;

  const trailer = trailers.find((t) => t.slug === slug);

  if (!trailer) return <NotFound />;

  return <TrailerDetail trailer={trailer} />;
}
