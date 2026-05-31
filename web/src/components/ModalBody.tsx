export default function ModalBody({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        flex-col
        flex-1
        px-6
        py-4
        gap-3
        text-trooper-black
      "
    >
      {children}
    </div>
  );
}
