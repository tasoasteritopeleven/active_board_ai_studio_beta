export const livekitUrl = import.meta.env.VITE_LIVEKIT_URL as string | undefined;

export const livekitEnabled = Boolean(
  livekitUrl && livekitUrl !== 'wss://REPLACE.livekit.cloud'
);

/** Use SFU when room has at least this many participants (default 6). */
export const telepresenceSfuMinPlayers = Number(
  import.meta.env.VITE_TELEPRESENCE_SFU_MIN_PLAYERS ?? 6
);
