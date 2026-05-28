import { createClient } from '@liveblocks/client';

const publicKey = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string | undefined;

export const liveblocksEnabled = Boolean(publicKey && publicKey !== 'pk_dev_REPLACE_ME');

export const liveblocksPublicKey = liveblocksEnabled ? publicKey! : undefined;
