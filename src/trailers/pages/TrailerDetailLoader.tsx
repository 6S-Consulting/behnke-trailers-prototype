import { useParams } from "react-router-dom";
import { DirectionalDrillTiltTrailerDetails } from "./DirectionalDrillTiltTrailerDetails";
import { TubeTilt20KDetails } from "./TubeTilt20KDetails";
import NotFound from "@/pages/NotFound";

export function TrailerDetailLoader() {
  const { slug } = useParams<{ slug: string }>();

  switch (slug) {
    case "directional-drill-tilt-trailer":
      return <DirectionalDrillTiltTrailerDetails />;
    case "20k-hd-tube-tilt":
      return <TubeTilt20KDetails />;
    default:
      return <NotFound />;
  }
}
