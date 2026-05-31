export default function ModalHeader({
  children,
  onClose,
}: {
  children?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="
        relative
        flex
        items-center
        justify-center
        px-6
        py-4
        border-b-[3px]
        border-trooper-black
      "
    >
      <span className="text-[24px] font-bold text-trooper-black">
        {children}
      </span>
      <button
        onClick={onClose}
        className="
          absolute
          right-6
          flex
          items-center
          justify-center
          h-8
          w-8
          bg-none
          border-0
          text-[24px]
          text-trooper-black
          cursor-pointer
          transition-transform
          duration-100
          active:scale-95
        "
      >
        ✕
      </button>
    </div>
  );
}
