export default function Card({
  children,
  bgcolor = "bg-charcoal",
  length = "w-[300px]",
  height = "h-[300px]",
}: {
  children?: React.ReactNode;
  bgcolor?: string;
  length?: string;
  height?: string;
}) {
  return (
    <div className={`rounded-2xl ${bgcolor} ${length} ${height}`}>
      {children}
    </div>
  );
}
