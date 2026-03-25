import { useParams } from "react-router-dom";
import { DirectionalDrillTiltTrailer3DPage } from "./DirectionalDrillTiltTrailer3DPage";
import { TubeTilt3DPage } from "./TubeTilt3DPage.tsx";
import { PaverTag3DPage } from "./PaverTag3DPage";
import { SingleConeTrailer3DPage } from "./SingleConeTrailer3DPage";
import { Trailer3DUnavailable } from "./ Trailer3DUnavailable";
import NotFound from "@/pages/NotFound";

export function Trailer3DLoader() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <NotFound />;

  switch (slug) {
    case "directional-drill-tilt-trailer":
      return <DirectionalDrillTiltTrailer3DPage />;
    case "20k-hd-tube-tilt":
      return <TubeTilt3DPage />;
    case "paver-tag-trailer":
      return <PaverTag3DPage />;
    case "single-cone-trailer":
      return <SingleConeTrailer3DPage />;
    default:
      return <Trailer3DUnavailable slug={slug} />;
  }
}
