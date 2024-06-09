import DevelopersRoutesTab from '@/components/developers/layout/developers-keys-routes-tab';

export default function Developers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full flex flex-col py-3 px-6 md:px-24 md:py-5">
      <div className="flex flex-row items-center">
        <DevelopersRoutesTab />
      </div>
      {children}
    </div>
  );
}
