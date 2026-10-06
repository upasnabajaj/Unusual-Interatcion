// Source times in seconds. These are edits of the supplied 30-second clips,
// not replacement melodies. Low-energy boundaries were measured from decoded PCM.
export const SOURCES={opening:'12_dancing_princess.mp3',rounds:'barbie_12_princesses.mp3',ending:'derek_s_theme_barbie.mp3'};
export const CUES={
  breath1:{source:'opening',start:1.42,end:6.65,gain:1.7,fadeIn:.10,fadeOut:.32},
  breath2:{source:'opening',start:6.85,end:11.90,gain:1.7,fadeIn:.10,fadeOut:.32},
  breath3:{source:'opening',start:12.05,end:17.72,gain:1.7,fadeIn:.10,fadeOut:.42},
  passage:{source:'opening',start:22.95,end:25.58,gain:2.0,fadeIn:.045,fadeOut:.20},
  transition:{source:'opening',start:18.55,end:19.84,gain:2.0,fadeIn:.025,fadeOut:.16},
  rounds:{source:'rounds',start:2.60,end:22.025,gain:.36,fadeIn:.12,fadeOut:.40},
  ending:{source:'ending',start:.475,end:26.125,gain:.52,fadeIn:.12,fadeOut:.48},
};
// Excerpt-relative phrase breaks; round lengths remain near the existing 18.3s.
export const ROUND_BREAKS=[0,7.15-2.60,13.10-2.60,22.025-2.60];
export const ENDING_BREAKS=[0,4.625-.475,8.90-.475,13.20-.475,17.475-.475,26.125-.475];
