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
          <h2 className="text-3xl font-medium">Semantic <span className='text-brand-default'>Web Monitor</span></h2>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-4">
        <WebsetNav websets={websets} selectedWebsetId={selectedWebsetId} />
      </div>
      <div className="max-w-4xl mx-auto pb-4">
        {selectedWebsetId && <WebsetItems websetId={selectedWebsetId} />}
      </div>
    </div>
  );
}