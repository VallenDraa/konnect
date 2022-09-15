import privatePic from "../../svg/defaultProfilePic/private_def.png";
import groupPic from "../../svg/defaultProfilePic/group_def.png";
import RenderIf from "../../utils/React/RenderIf";

export default function PP({
  style,
  className,
  src = null,
  type = "private",
  alt,
}) {
  return (
    <>
      <RenderIf conditionIs={src === null}>
        <img
          src={type === "private" ? privatePic : groupPic}
          alt={alt}
          style={style}
          className={className || "rounded-full absolute inset-0 z-10"}
        />
      </RenderIf>
      <RenderIf conditionIs={src !== null}>
        <img
          src={src}
          alt={alt}
          style={style}
          className={className || "rounded-full absolute inset-0 z-10"}
        />
      </RenderIf>
    </>
  );
}
