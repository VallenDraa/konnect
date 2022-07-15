export default function checkInjectedClasses({
  injectedClasses,
  defClassGetter,
  defClassSetter,
}) {
  const toBeChecked = injectedClasses.split(" ");

  const result = toBeChecked.filter((cn) => !defClassGetter.includes(cn));

  if (result.includes("absolute")) {
    defClassSetter(defClassGetter.filter((cn) => cn !== "relative"));
  }

  injectedClasses = result.join(" ");

  return injectedClasses;
}
