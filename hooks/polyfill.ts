// import { Buffer } from 'buffer';
// import 'react-native-get-random-values';
// const TextEncodingPolyfill = require('text-encoding');

// // Define global interface to avoid TS errors
// declare const global: any;

// if (typeof global.Buffer === 'undefined') {
//   global.Buffer = Buffer;
// }

// if (typeof global.TextEncoder === 'undefined') {
//   global.TextEncoder = TextEncodingPolyfill.TextEncoder;
// }

// if (typeof global.TextDecoder === 'undefined') {
//   global.TextDecoder = TextEncodingPolyfill.TextDecoder;
// }

// // Polyfill window/self for libraries that check those instead of global
// if (typeof window !== 'undefined') {
//   if (typeof window.Buffer === 'undefined') window.Buffer = global.Buffer;
//   if (typeof window.TextEncoder === 'undefined') window.TextEncoder = global.TextEncoder;
//   if (typeof window.TextDecoder === 'undefined') window.TextDecoder = global.TextDecoder;
// }

// if (typeof self !== 'undefined') {
//   if (typeof self.Buffer === 'undefined') self.Buffer = global.Buffer;
//   if (typeof self.TextEncoder === 'undefined') self.TextEncoder = global.TextEncoder;
//   if (typeof self.TextDecoder === 'undefined') self.TextDecoder = global.TextDecoder;
// }

// // Minimal crypto polyfill if needed
// if (typeof crypto === 'undefined') {
//   // @ts-ignore
//   global.crypto = {
//     getRandomValues: (buffer: any) => global.crypto.getRandomValues(buffer)
//   };
// }
