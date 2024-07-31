import LeftMenu from "@/components/LeftMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex h-[calc(100vh-69.71px-61px)] overflow-y-auto bg-grey-300">
        <LeftMenu />
        <div className="bg-grey-300 flex-1">{children}</div>
      </div>
    </>
  );
}
