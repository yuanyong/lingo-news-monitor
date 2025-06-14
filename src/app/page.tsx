import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import InfoCard from '@/components/InfoCard';
import WebsetNav from '@/components/WebsetNav';
import WebsetItems from '@/components/WebsetItems';

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ websetId?: string, page?: string }>
}) {
  const params = await searchParams;
  const websets = await prisma.webset.findMany();
  const selectedWebsetId = params.websetId || websets[0]?.websetId;
  const selectedWebset = websets.find(w => w.websetId === selectedWebsetId);
  const page = parseInt(params.page || '1', 10);

  return (
    <div className='px-4'>
      <Header />
      <WebsetNav websets={websets} selectedWebsetId={selectedWebsetId} />
      {selectedWebset && <InfoCard webset={selectedWebset} />}
      {selectedWebsetId && <WebsetItems websetId={selectedWebsetId} page={page} />}
    </div>
  );
}