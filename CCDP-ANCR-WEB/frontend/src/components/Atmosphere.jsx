// Smooths the seam between a light (cream) section and its dark neighbours by
// fading the section's top and bottom edges into the brand black.
export const LightSeam = () => (
  <>
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-gradient-to-b from-ccdp-black to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 bg-gradient-to-t from-ccdp-black to-transparent" />
  </>
);
