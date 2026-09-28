import IllustrationFrame from "./IllustrationFrame";
import { SCENES, type SceneName } from "./scenes";

/** Used in article Markdown as <Illustration name="speed" caption="..." />. Unknown names render nothing. */
const Illustration = ({ name, caption }: { name: string; caption?: string }) => {
  const Scene = SCENES[name as SceneName];
  if (!Scene) return null;
  return (
    <IllustrationFrame caption={caption}>
      <Scene />
    </IllustrationFrame>
  );
};

export default Illustration;
