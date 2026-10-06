// Six related, original event identities. No background composition is scheduled.
// The supplied recordings exclusively score the two performances.
export const FLOWERS = {
  Lotus: { instrument:'glass', notes:[74,81,78,76], register:0 },
  Rose: { instrument:'celesta', notes:[78,81,83,81], register:0 },
  Jasmine: { instrument:'bell', notes:[81,83,86,81], register:0 },
  Daisy: { instrument:'crystal', notes:[86,83,81,78], register:0 },
  Tulip: { instrument:'harp', notes:[62,69,71,66], register:0 },
  Lily: { instrument:'wood', notes:[66,69,74,71], register:0 },
};
export const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
