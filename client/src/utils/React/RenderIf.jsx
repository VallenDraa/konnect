export default function RenderIf({ conditionIs, children }) {
  return (
    <>
      {typeof conditionIs === "function"
        ? conditionIs()
        : conditionIs && children}
    </>
  );
}
