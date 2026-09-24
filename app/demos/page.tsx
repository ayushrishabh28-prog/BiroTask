import type { Metadata } from 'next';
import { DemoGallery } from './demo-gallery';

export const metadata: Metadata = {
  title: 'Demo Gallery — BotFoundry',
  description: 'Explore fictional business websites and their working customer chatbots.',
};

export default function DemosPage() {
  return <DemoGallery />;
}
