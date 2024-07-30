import LeftMenu from "@/components/LeftMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex">
        <LeftMenu />
        <div className="bg-grey-300 flex-1">{children}</div>
      </div>
    </>
  );
}
