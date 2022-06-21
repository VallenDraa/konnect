export default function RenderIf({ conditionIs, children }) {
  return <>{conditionIs && children}</>;
}
