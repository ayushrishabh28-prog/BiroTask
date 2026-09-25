import type {Metadata} from 'next';
import {WebsiteBuilder} from './website-builder';

export const metadata:Metadata={
 title:'Website Builder — BotFoundry',
 description:'Turn a business brief into an editable website draft.',
};

export default function WebsiteBuilderPage(){return <WebsiteBuilder/>;}
