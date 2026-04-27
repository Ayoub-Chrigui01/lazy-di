export const ensureReflectMetadataIsLoaded = () => {
  if (typeof Reflect.getMetadata !== "function")
    throw new Error(
      "reflect-metadata is not loaded. Import it at the entry point of your application before anything else.",
    );
};
