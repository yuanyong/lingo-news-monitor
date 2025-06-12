import { prisma } from '@/lib/prisma';
import WebsetNav from '@/components/WebsetNav';
import WebsetItems from '@/components/WebsetItems';

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ websetId?: string }>
}) {
  const params = await searchParams;
  const websets = await prisma.webset.findMany();
  const selectedWebsetId = params.websetId || websets[0]?.websetId;

  return (
    <div>
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto py-2">
          <h2 className="text-3xl">News Monitor</h2>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-4">
        <WebsetNav websets={websets} selectedWebsetId={selectedWebsetId} />
        {selectedWebsetId && <WebsetItems websetId={selectedWebsetId} />}
      </div>
    </div>
  );
}