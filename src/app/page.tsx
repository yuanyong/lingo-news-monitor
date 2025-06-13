import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
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
      <Header />
      <div className="max-w-4xl mx-auto py-4">
        <WebsetNav websets={websets} selectedWebsetId={selectedWebsetId} />
      </div>
      <div className="max-w-4xl mx-auto pb-4">
        {selectedWebsetId && <WebsetItems websetId={selectedWebsetId} />}
      </div>
    </div>
  );
}