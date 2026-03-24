import { useParams } from "react-router-dom";
import { DirectionalDrillTiltTrailer3DPage } from "./DirectionalDrillTiltTrailer3DPage";
import { TubeTilt3DPage } from "./TubeTilt3DPage.tsx";
import { PaverTag3DPage } from "./PaverTag3DPage";
import NotFound from "@/pages/NotFound";

export function Trailer3DLoader() {
  const { slug } = useParams<{ slug: string }>();

  switch (slug) {
    case "directional-drill-tilt-trailer":
      return <DirectionalDrillTiltTrailer3DPage />;
    case "20k-hd-tube-tilt":
      return <TubeTilt3DPage />;
    case "paver-tag-trailer":
      return <PaverTag3DPage />;
    default:
      return <NotFound />;
  }
}
