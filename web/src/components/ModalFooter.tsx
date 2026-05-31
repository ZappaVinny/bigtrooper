export default function ModalFooter({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        flex-row
        items-center
        justify-end
        gap-3
        px-6
        py-4
        border-t-[3px]
        border-trooper-black
      "
    >
      {children}
    </div>
  );
}
